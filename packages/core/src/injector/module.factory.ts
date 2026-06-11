import { Hono } from "hono";
import { registerControllerRoutes } from "../decorators/http/controller.decorator";
import { GLOBAL_MODULE_METADATA } from "../decorators/modules/global.decorator";
import { logger } from "../utils/logger.util";
import { collectModuleTree } from "./module-compiler";
import { resolveInstance } from "./injector";

export function createModule<B extends object = Record<string, unknown>>(
	moduleClass: any,
	{ middlewares = [] }: { middlewares?: any[] } = {}
): Hono<{ Bindings: B }> {
	const router = new Hono<{ Bindings: B }>();

	logger.info(`Creating module: ${moduleClass.name}`, "ModuleFactory");

	middlewares.forEach((middleware) => router.use("*", middleware));

	const controllers: any[] = [];
	const providers: any[] = [];
	const globalProviders: any[] = [];

	collectModuleTree(moduleClass, new Set(), new Set(), controllers, providers, globalProviders);

	logger.info(
		`Resolved ${providers.length} providers, ${controllers.length} controllers`,
		"ModuleFactory"
	);

	const instanceRegistry = new Map<any, any>();
	const inProgress = new Set<any>();

	// Global providers are resolved first so they're available to all modules
	for (const ProviderClass of globalProviders) {
		resolveInstance(ProviderClass, instanceRegistry, inProgress);
	}

	for (const ProviderClass of providers) {
		resolveInstance(ProviderClass, instanceRegistry, inProgress);
	}

	for (const ControllerClass of controllers) {
		try {
			resolveInstance(ControllerClass, instanceRegistry, inProgress);
			const controller = instanceRegistry.get(ControllerClass);
			const prefix = (controller.constructor as any).prototype.prefix || "";
			registerControllerRoutes(router, controller, prefix, instanceRegistry);
			logger.debug(
				`Registered controller: ${ControllerClass.name} at "${prefix}"`,
				"ModuleFactory"
			);
		} catch (error) {
			logger.error(
				`Failed to create controller "${ControllerClass.name}": ${error}`,
				"ModuleFactory"
			);
			throw error;
		}
	}

	// Call onModuleInit on all instances that implement it
	for (const instance of instanceRegistry.values()) {
		if (typeof instance?.onModuleInit === "function") {
			const result = instance.onModuleInit();
			if (result instanceof Promise) {
				result.catch((err) =>
					logger.error(`onModuleInit failed for ${instance.constructor?.name}: ${err}`, "ModuleFactory")
				);
			}
		}
	}

	logger.info(`Module "${moduleClass.name}" created successfully`, "ModuleFactory");
	return router;
}

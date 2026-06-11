import type { Context } from "hono";
import type { Hono } from "hono";
import { injectable } from "tsyringe";
import { createArgumentsHost, createExecutionContext } from "../../context/execution-context";
import { CATCH_METADATA, FILTERS_METADATA } from "../core/exception-filters.decorator";
import { GUARDS_METADATA } from "../core/use-guards.decorator";
import { INTERCEPTORS_METADATA } from "../core/use-interceptors.decorator";
import { HEADER_METADATA } from "./header.decorator";
import { HTTP_CODE_METADATA } from "./http-code.decorator";
import { REDIRECT_METADATA, type RedirectMetadata } from "./redirect.decorator";
import { ROUTE_PARAMS_METADATA, TOTAL_PARAMS_METADATA, type RouteParamMetadata } from "./route-params.decorator";
import { ForbiddenException } from "../../exceptions/http-exceptions";
import type { RouteMetadata } from "../../interfaces/modules/module.interface";

export function Controller(prefix: string = "") {
	return (target: any) => {
		injectable()(target);
		target.prototype.prefix = prefix;
		target.prototype.constructorParams = target.prototype.constructorParams || [];
		target.prototype.constructorClass = target;
	};
}

function resolveFromRegistry(
	ClassOrInstance: any,
	instanceRegistry?: Map<any, any>
): any {
	if (typeof ClassOrInstance !== "function") return ClassOrInstance;
	if (instanceRegistry?.has(ClassOrInstance)) return instanceRegistry.get(ClassOrInstance);
	return new ClassOrInstance();
}

async function resolveParamArgs(
	paramMeta: RouteParamMetadata[],
	c: Context,
	totalParams: number
): Promise<any[]> {
	const maxIndex = Math.max(totalParams - 1, ...paramMeta.map((p) => p.index));
	const args = new Array(maxIndex + 1).fill(undefined);
	const filledIndices = new Set(paramMeta.map((p) => p.index));

	let body: any;
	const needsBody = paramMeta.some((p) => p.type === "body");
	if (needsBody) {
		const ct = c.req.header("content-type") || "";
		if (ct.includes("multipart/form-data")) {
			const fd = await c.req.formData();
			body = {};
			fd.forEach((v, k) => { body[k] = v; });
		} else {
			body = await c.req.json().catch(() => ({}));
		}
	}

	for (const p of paramMeta) {
		switch (p.type) {
			case "body":
				args[p.index] = p.data ? body?.[p.data] : body;
				break;
			case "param":
				args[p.index] = p.data ? c.req.param(p.data) : c.req.param();
				break;
			case "query":
				args[p.index] = p.data ? c.req.query(p.data) : c.req.query();
				break;
			case "headers":
				args[p.index] = p.data
					? c.req.header(p.data)
					: Object.fromEntries((c.req.raw.headers as any).entries());
				break;
			case "ip":
				args[p.index] =
					c.req.header("cf-connecting-ip") ||
					c.req.header("x-forwarded-for") ||
					"";
				break;
			case "req":
				args[p.index] = c;
				break;
		}
	}

	// Any slot not covered by a decorator receives the raw Hono context
	for (let i = 0; i <= maxIndex; i++) {
		if (!filledIndices.has(i)) args[i] = c;
	}

	return args;
}

export function registerControllerRoutes(
	router: Hono<{ Bindings: any }>,
	controller: any,
	prefix: string = "",
	instanceRegistry?: Map<any, any>
) {
	const routes: RouteMetadata[] = (controller.constructor as any).prototype.routes || [];
	const controllerClass = controller.constructor;

	for (const route of routes) {
		const handlerFn = controller[route.handler as keyof typeof controller] as Function;
		const fullPath = prefix + route.path;
		const proto = controllerClass.prototype;

		const classGuards: any[] = Reflect.getMetadata(GUARDS_METADATA, controllerClass) || [];
		const methodGuards: any[] = Reflect.getMetadata(GUARDS_METADATA, handlerFn) || [];
		const guards = [...classGuards, ...methodGuards];

		const classInterceptors: any[] = Reflect.getMetadata(INTERCEPTORS_METADATA, controllerClass) || [];
		const methodInterceptors: any[] = Reflect.getMetadata(INTERCEPTORS_METADATA, handlerFn) || [];
		const interceptors = [...classInterceptors, ...methodInterceptors];

		const classFilters: any[] = Reflect.getMetadata(FILTERS_METADATA, controllerClass) || [];
		const methodFilters: any[] = Reflect.getMetadata(FILTERS_METADATA, handlerFn) || [];
		const filters = [...classFilters, ...methodFilters];

		const httpCode: number | undefined = Reflect.getMetadata(HTTP_CODE_METADATA, handlerFn);
		const headersToSet: { name: string; value: string }[] =
			Reflect.getMetadata(HEADER_METADATA, handlerFn) || [];
		const redirectMeta: RedirectMetadata | undefined = Reflect.getMetadata(REDIRECT_METADATA, handlerFn);
		const paramMeta: RouteParamMetadata[] =
			Reflect.getMetadata(ROUTE_PARAMS_METADATA, proto, route.handler) || [];
		const totalParams: number =
			Reflect.getMetadata(TOTAL_PARAMS_METADATA, proto, route.handler) ?? 0;
		const methodMiddlewares: any[] = (handlerFn as any).middlewares || [];

		const finalHandler = async (c: Context): Promise<Response> => {
			const execCtx = createExecutionContext(c, controllerClass, handlerFn);

			const runCore = async (): Promise<Response> => {
				// Guards
				for (const G of guards) {
					const guard = resolveFromRegistry(G, instanceRegistry);
					const ok = await guard.canActivate(execCtx);
					if (!ok) throw new ForbiddenException();
				}

				// Build the actual call
				const callHandler = async (): Promise<Response> => {
					let result: any;
					if (paramMeta.length > 0) {
						const args = await resolveParamArgs(paramMeta, c, totalParams);
						result = await handlerFn.call(controller, ...args);
					} else {
						result = await handlerFn.call(controller, c);
					}

					// Set response headers
					for (const { name, value } of headersToSet) {
						c.header(name, value);
					}

					// Redirect takes precedence
					if (redirectMeta) {
						const url =
							result && typeof result === "object" && "url" in result
								? (result as any).url
								: redirectMeta.url;
						const code =
							result && typeof result === "object" && "statusCode" in result
								? (result as any).statusCode
								: redirectMeta.statusCode;
						return c.redirect(url, code as any);
					}

					// Auto-serialize non-Response returns
					if (result instanceof Response) return result;
					if (result !== undefined && result !== null) {
						return c.json(result, (httpCode ?? 200) as any);
					}
					return new Response(null, { status: httpCode ?? 204 });
				};

				// Method-level legacy middlewares
				if (methodMiddlewares.length > 0) {
					let idx = 0;
					const next = async (): Promise<Response | void> => {
						if (idx < methodMiddlewares.length) {
							return await methodMiddlewares[idx++](c, next);
						}
						return callHandler();
					};
					return (await next()) as Response;
				}

				return callHandler();
			};

			// Interceptors wrap the core call
			const runWithInterceptors = async (): Promise<Response> => {
				if (interceptors.length === 0) return runCore();

				let chain = runCore;
				for (let i = interceptors.length - 1; i >= 0; i--) {
					const interceptor = resolveFromRegistry(interceptors[i], instanceRegistry);
					const inner = chain;
					chain = () => interceptor.intercept(execCtx, { handle: inner });
				}
				return chain();
			};

			// Exception filters wrap everything
			if (filters.length === 0) return runWithInterceptors();

			try {
				return await runWithInterceptors();
			} catch (err) {
				for (const F of filters) {
					const filter = resolveFromRegistry(F, instanceRegistry);
					const catchTypes: any[] =
						Reflect.getMetadata(CATCH_METADATA, filter.constructor ?? F) || [];
					if (catchTypes.length === 0 || catchTypes.some((T) => err instanceof T)) {
						const host = createArgumentsHost(c);
						const res = await filter.catch(err, host);
						if (res instanceof Response) return res;
					}
				}
				throw err;
			}
		};

		switch (route.method) {
			case "GET":    router.get(fullPath, finalHandler);    break;
			case "POST":   router.post(fullPath, finalHandler);   break;
			case "PUT":    router.put(fullPath, finalHandler);    break;
			case "DELETE": router.delete(fullPath, finalHandler); break;
			case "PATCH":  router.patch(fullPath, finalHandler);  break;
		}
	}
}

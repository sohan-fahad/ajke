import { INJECT_CUSTOM_TOKENS_KEY } from "../decorators/core/injectable.decorator";
import { OPTIONAL_METADATA } from "../decorators/core/optional.decorator";
import { isForwardRef } from "../utils/forward-ref.util";
import { logger } from "../utils/logger.util";

function createCircularProxy(registry: Map<any, any>, tokenClass: any): any {
	return new Proxy(
		{},
		{
			get(_target, prop) {
				const instance = registry.get(tokenClass);
				if (!instance) {
					throw new Error(
						`[Wilt DI] Circular dependency proxy for "${tokenClass.name}" ` +
							`was accessed before the real instance was created. ` +
							`Make sure both sides use @Inject(forwardRef(() => ...)).`
					);
				}
				const val = (instance as any)[prop];
				return typeof val === "function" ? val.bind(instance) : val;
			},
			set(_target, prop, value) {
				const instance = registry.get(tokenClass);
				if (instance) (instance as any)[prop] = value;
				return true;
			},
		}
	);
}

export function resolveInstance(
	ProviderClass: any,
	instanceRegistry: Map<any, any>,
	inProgress: Set<any>
): any {
	if (instanceRegistry.has(ProviderClass)) {
		return instanceRegistry.get(ProviderClass);
	}

	if (inProgress.has(ProviderClass)) {
		logger.warn(
			`Circular dependency detected for "${ProviderClass.name}". ` +
				`Injecting a lazy proxy — ensure forwardRef() is used on both sides.`,
			"ModuleFactory"
		);
		return createCircularProxy(instanceRegistry, ProviderClass);
	}

	inProgress.add(ProviderClass);

	const paramTypes: any[] =
		Reflect.getMetadata("design:paramtypes", ProviderClass) || [];
	const customTokens: Record<number, any> =
		Reflect.getMetadata(INJECT_CUSTOM_TOKENS_KEY, ProviderClass) || {};
	const optionalIndices: number[] =
		Reflect.getMetadata(OPTIONAL_METADATA, ProviderClass) || [];

	const customIndices = Object.keys(customTokens).map(Number);
	const paramCount = Math.max(
		paramTypes.length,
		customIndices.length > 0 ? Math.max(...customIndices) + 1 : 0
	);

	const deps = Array.from({ length: paramCount }, (_, i) => {
		const customToken = customTokens[i];
		const paramType = paramTypes[i];
		const isOptional = optionalIndices.includes(i);

		let actualClass: any;
		if (customToken) {
			actualClass = isForwardRef(customToken)
				? customToken.forwardRef()
				: customToken;
		} else {
			actualClass = paramType;
		}

		if (!actualClass || actualClass === Object || actualClass === Function) {
			if (!isOptional) {
				logger.warn(
					`Cannot resolve param[${i}] for "${ProviderClass.name}": ` +
						`no type info. Use @Inject(TheClass) to specify it explicitly.`,
					"ModuleFactory"
				);
			}
			return undefined;
		}

		try {
			return resolveInstance(actualClass, instanceRegistry, inProgress);
		} catch (err) {
			if (isOptional) return undefined;
			throw err;
		}
	});

	const instance = new ProviderClass(...deps);
	instanceRegistry.set(ProviderClass, instance);
	inProgress.delete(ProviderClass);

	logger.debug(`Created instance: ${ProviderClass.name}`, "ModuleFactory");
	return instance;
}

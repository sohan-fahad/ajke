import { GLOBAL_MODULE_METADATA } from "../decorators/modules/global.decorator";
import { isForwardRef } from "../utils/forward-ref.util";

export function collectModuleTree(
	moduleClass: any,
	visiting: Set<any>,
	visited: Set<any>,
	controllers: any[],
	providers: any[],
	globalProviders: any[] = []
): void {
	if (visited.has(moduleClass)) return;

	visiting.add(moduleClass);

	const instance = new moduleClass();
	const config = instance.moduleConfig || {};
	const isGlobal = Reflect.getMetadata(GLOBAL_MODULE_METADATA, moduleClass) === true;

	for (const c of config.controllers ?? []) {
		if (!controllers.includes(c)) controllers.push(c);
	}
	for (const p of config.providers ?? []) {
		if (!providers.includes(p)) providers.push(p);
		if (isGlobal && !globalProviders.includes(p)) globalProviders.push(p);
	}

	for (const importRef of config.imports ?? []) {
		const isRef = isForwardRef(importRef);
		const ImportedClass = isRef ? importRef.forwardRef() : importRef;

		if (visiting.has(ImportedClass)) {
			if (!isRef) {
				throw new Error(
					`[Wilt DI] Circular module dependency detected: "${moduleClass.name}" imports "${ImportedClass.name}" ` +
						`without forwardRef. Wrap it with forwardRef(() => ${ImportedClass.name}) ` +
						`in "${moduleClass.name}" imports array, and do the same in "${ImportedClass.name}".`
				);
			}
			continue;
		}

		collectModuleTree(ImportedClass, visiting, visited, controllers, providers, globalProviders);
	}

	visiting.delete(moduleClass);
	visited.add(moduleClass);
}

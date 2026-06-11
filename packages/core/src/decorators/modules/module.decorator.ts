import { injectable } from "tsyringe";
import type { ModuleMetadata } from "../../interfaces/modules/module.interface";

export function Module(config: ModuleMetadata) {
	return (target: any) => {
		target.prototype.moduleConfig = config;

		if (config.providers) {
			config.providers.forEach((ProviderClass: any) => {
				if (ProviderClass && typeof ProviderClass === "function") {
					injectable()(ProviderClass);
				}
			});
		}
	};
}

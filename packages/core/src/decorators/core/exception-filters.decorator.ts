export const FILTERS_METADATA = "ajke:filters";
export const CATCH_METADATA = "ajke:catch";

export function Catch(...exceptions: (new (...args: any[]) => any)[]): ClassDecorator {
	return (target: any) => {
		Reflect.defineMetadata(CATCH_METADATA, exceptions, target);
		return target;
	};
}

export function UseFilters(
	...filters: (new (...args: any[]) => any)[]
): MethodDecorator & ClassDecorator {
	return (target: any, key?: any, descriptor?: PropertyDescriptor): any => {
		if (descriptor) {
			const existing: any[] = Reflect.getMetadata(FILTERS_METADATA, descriptor.value) || [];
			Reflect.defineMetadata(FILTERS_METADATA, [...existing, ...filters], descriptor.value);
			return descriptor;
		}
		const existing: any[] = Reflect.getMetadata(FILTERS_METADATA, target) || [];
		Reflect.defineMetadata(FILTERS_METADATA, [...existing, ...filters], target);
		return target;
	};
}

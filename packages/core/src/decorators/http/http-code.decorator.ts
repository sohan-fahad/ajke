export const HTTP_CODE_METADATA = "ajke:http-code";

export function HttpCode(statusCode: number): MethodDecorator {
	return (_target, _key, descriptor: PropertyDescriptor) => {
		Reflect.defineMetadata(HTTP_CODE_METADATA, statusCode, descriptor.value);
		return descriptor;
	};
}

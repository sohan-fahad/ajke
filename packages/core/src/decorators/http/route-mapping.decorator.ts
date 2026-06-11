function createMethodDecorator(
	method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
) {
	return (path: string = "") =>
		(target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
			if (!target.constructor.prototype.routes) {
				target.constructor.prototype.routes = [];
			}
			target.constructor.prototype.routes.push({
				method,
				path,
				handler: propertyKey,
			});
			return descriptor;
		};
}

export const Get = createMethodDecorator("GET");
export const Post = createMethodDecorator("POST");
export const Put = createMethodDecorator("PUT");
export const Delete = createMethodDecorator("DELETE");
export const Patch = createMethodDecorator("PATCH");

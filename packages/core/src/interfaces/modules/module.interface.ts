export interface ForwardReference<T = any> {
	forwardRef: () => T;
}

export interface ModuleMetadata {
	imports?: any[];
	controllers?: any[];
	providers?: any[];
	exports?: any[];
	entities?: any[];
}

export interface RouteMetadata {
	method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
	path: string;
	handler: string;
}

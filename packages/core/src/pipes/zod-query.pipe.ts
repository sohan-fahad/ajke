import type { Context } from "hono";
import { z } from "zod";
import { QUERY_SCHEMA_METADATA } from "../constants";


export function QueryValidate(schema: z.ZodSchema) {
	return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
		const originalMethod = descriptor.value;

		descriptor.value = async function (...args: any[]) {
			const c: Context = args.find((a: any) => a != null && typeof a.json === "function" && a.req != null) ?? args[0];
			try {
				const queryParams = c.req.query();
				const validatedData = schema.parse(queryParams);
				c.set("validatedQuery", validatedData);
				return originalMethod.call(this, ...args);
			} catch (error) {
				if (error instanceof z.ZodError) {
					const errors = error.issues.map((err: z.ZodIssue) => ({
						field: err.path.join("."),
						message: err.message,
						code: err.code,
					}));
					return c.json(
						{
							success: false,
							error: {
								code: "VALIDATION_ERROR",
								message: "Query validation failed",
								details: errors,
							},
							message: errors[0].message ?? "Validation failed",
							timestamp: new Date().toISOString(),
						},
						400,
					);
				}
				throw error;
			}
		};

		Reflect.defineMetadata(QUERY_SCHEMA_METADATA, schema, descriptor.value);
		return descriptor;
	};
}

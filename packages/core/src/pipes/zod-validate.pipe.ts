import type { Context } from "hono";
import { z } from "zod";
import { BODY_SCHEMA_METADATA } from "../constants";


export function ZodValidate(schema: z.ZodSchema) {
	return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
		const originalMethod = descriptor.value;

		descriptor.value = async function (...args: any[]) {
			const c: Context = args.find((a: any) => a != null && typeof a.json === "function" && a.req != null) ?? args[0];
			try {
				const contentType = c.req.header("content-type") || "";
				let input: any = {};

				if (contentType.includes("multipart/form-data")) {
					const formData = await c.req.formData();
					formData.forEach((val, key) => {
						input[key] = val;
					});
				} else {
					input = await c.req.json().catch(() => ({}));
				}

				const validatedData = schema.parse(input);
				c.set("validatedData", validatedData);
				return originalMethod.call(this, ...args);
			} catch (error) {
				if (error instanceof z.ZodError) {
					const errors = error.issues.map((err) => ({
						field: err.path.join("."),
						message: err.message,
						code: err.code,
					}));
					return c.json(
						{
							success: false,
							error: { code: "VALIDATION_ERROR", message: "Validation failed", details: errors },
							message: errors[0].message ?? "Validation failed",
							timestamp: new Date().toISOString(),
						},
						400,
					);
				}
				throw error;
			}
		};

		Reflect.defineMetadata(BODY_SCHEMA_METADATA, schema, descriptor.value);
		return descriptor;
	};
}

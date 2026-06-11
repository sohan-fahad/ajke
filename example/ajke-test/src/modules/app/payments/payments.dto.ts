import { z } from "zod";

const boolQuery = z.preprocess(v => v === "true" ? true : v === "false" ? false : v, z.boolean().optional());

// PaymentMethod
export const CreatePaymentMethodDTO = z.object({
    title: z.string("Title is required"),
    icon: z.string().optional(),
    isActive: z.boolean().optional(),
    organizationId: z.string().optional(),
});

export const FilterPaymentMethodDTO = z.object({
    page: z.coerce.number().optional(),
    limit: z.coerce.number().optional(),
    searchTerm: z.string().optional(),
    isActive: boolQuery,
    organizationId: z.string().optional(),
});

export const UpdatePaymentMethodDTO = z.object({
    title: z.string().optional(),
    icon: z.string().optional(),
    isActive: z.boolean().optional(),
    organizationId: z.string().optional(),
});

// PaymentGateway
export const InitSSLCommerzDTO = z.object({
    orderCode: z.string("Order code is required"),
    amount: z.enum(["FULL", "DELIVERY_CHARGE"]),
});

// PaymentLogs
export const FilterPaymentLogDTO = z.object({
    page: z.coerce.number().optional(),
    limit: z.coerce.number().optional(),
    searchTerm: z.string().optional(),
    order: z.uuid("Order is required").optional(),
    organizationId: z.string().optional(),
});

export type CreatePaymentMethodDTOType = z.infer<typeof CreatePaymentMethodDTO>;
export type FilterPaymentMethodDTOType = z.infer<typeof FilterPaymentMethodDTO>;
export type UpdatePaymentMethodDTOType = z.infer<typeof UpdatePaymentMethodDTO>;
export type InitSSLCommerzDTOType = z.infer<typeof InitSSLCommerzDTO>;
export type FilterPaymentLogDTOType = z.infer<typeof FilterPaymentLogDTO>;

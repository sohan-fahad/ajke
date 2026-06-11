import { z } from "zod";

export const CreateBusinessConfigDTO = z.object({
    deliveryCharge: z.number(),
    isActive: z.boolean().optional(),
    organizationId: z.string().optional(),
});

export const FilterBusinessConfigDTO = z.object({
    page: z.coerce.number().optional(),
    limit: z.coerce.number().optional(),
    organizationId: z.string().optional(),
});

export const UpdateBusinessConfigDTO = z.object({
    deliveryCharge: z.number().optional(),
    isActive: z.boolean().optional(),
    organizationId: z.string().optional(),
});

export type CreateBusinessConfigDTOType = z.infer<typeof CreateBusinessConfigDTO>;
export type FilterBusinessConfigDTOType = z.infer<typeof FilterBusinessConfigDTO>;
export type UpdateBusinessConfigDTOType = z.infer<typeof UpdateBusinessConfigDTO>;

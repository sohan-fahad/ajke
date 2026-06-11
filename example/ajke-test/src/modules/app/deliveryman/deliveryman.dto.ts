import { z } from "zod";

export const CreateDeliveryManDTO = z.object({
    dutyStatus: z.enum(["OFFLINE", "ONLINE", "IN_TRANSIT"]).optional(),
    status: z.enum(["ACTIVE", "INACTIVE", "TEMPORARY_BLOCKED"]).optional(),
    licenseNumber: z.string().optional(),
    vehicleNumber: z.string().optional(),
    firstName: z.string(),
    lastName: z.string(),
    email: z.email(),
    phoneNumber: z.string().min(11).optional(),
    password: z.string().min(6).optional(),
    zone: z.uuid().optional(),
    workspaceId: z.string().optional(),
});

export const FilterDeliveryManDTO = z.object({
    page: z.coerce.number().int().optional(),
    limit: z.coerce.number().int().optional(),
    searchTerm: z.string().optional(),
    status: z.enum(["ACTIVE", "INACTIVE", "TEMPORARY_BLOCKED"]).optional(),
    dutyStatus: z.enum(["OFFLINE", "ONLINE", "IN_TRANSIT"]).optional(),
    workspaceId: z.string().optional(),
});

export const UpdateDeliveryManDTO = z.object({
    dutyStatus: z.enum(["OFFLINE", "ONLINE", "IN_TRANSIT"]).optional(),
    status: z.enum(["ACTIVE", "INACTIVE", "TEMPORARY_BLOCKED"]).optional(),
    licenseNumber: z.string().optional(),
    vehicleNumber: z.string().optional(),
    zone: z.uuid().optional(),
    workspaceId: z.string().optional(),
});

export type CreateDeliveryManDTOType = z.infer<typeof CreateDeliveryManDTO>;
export type FilterDeliveryManDTOType = z.infer<typeof FilterDeliveryManDTO>;
export type UpdateDeliveryManDTOType = z.infer<typeof UpdateDeliveryManDTO>;

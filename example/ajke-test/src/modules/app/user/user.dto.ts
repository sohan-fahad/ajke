import { z } from "zod";

const boolQuery = z.preprocess(v => v === "true" ? true : v === "false" ? false : v, z.boolean().optional());

export const CreateRolesDTO = z.object({
    role: z.uuid(),
});

export const CreateUserDTO = z.object({
    firstName: z.string(),
    lastName: z.string(),
    email: z.email(),
    phoneNumber: z.string().min(11).optional(),
    password: z.string().min(6).optional(),
    isActive: z.boolean().optional(),
    roles: z.array(z.object({ role: z.uuid() })).optional(),
    workspaceId: z.string().optional(),
});

export const CreateCustomerDTO = z.object({
    firstName: z.string(),
    lastName: z.string(),
    email: z.email().optional(),
    phoneNumber: z.string().min(11),
    workspaceId: z.string().optional(),
});

export const FilterUserDTO = z.object({
    page: z.coerce.number().int().optional(),
    limit: z.coerce.number().int().optional(),
    searchTerm: z.string().optional(),
    email: z.email().optional(),
    isActive: boolQuery,
    roles: z.string().optional(),
    workspaceId: z.string().optional(),
});

export const UpdateRolesDTO = z.object({
    role: z.uuid(),
    isDeleted: z.boolean().optional(),
});

export const UpdateUserDTO = z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    phoneNumber: z.string().min(11).optional(),
    isActive: z.boolean().optional(),
    password: z.string().min(6).optional(),
    roles: z.array(z.object({ role: z.uuid(), isDeleted: z.boolean().optional() })).optional(),
    workspaceId: z.string().optional(),
});

export const CreateUserConfigDTO = z.object({
    deviceToken: z.string(),
    appType: z.enum(["dm_app", "customer_app"]).optional(),
    user: z.uuid().optional(),
    workspaceId: z.string().optional(),
});

export const UpdateUserConfigDTO = z.object({
    deviceToken: z.string().optional(),
    appType: z.enum(["dm_app", "customer_app"]).optional(),
    user: z.uuid().optional(),
});

export const UpdateUserWebDTO = z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    email: z.email().optional(),
    isActive: z.boolean().optional(),
    password: z.string().min(6).optional(),
    roles: z.array(z.object({ role: z.uuid(), isDeleted: z.boolean().optional() })).optional(),
    workspaceId: z.string().optional(),
});

export type CreateRolesDTOType = z.infer<typeof CreateRolesDTO>;
export type CreateUserDTOType = z.infer<typeof CreateUserDTO>;
export type CreateCustomerDTOType = z.infer<typeof CreateCustomerDTO>;
export type FilterUserDTOType = z.infer<typeof FilterUserDTO>;
export type UpdateRolesDTOType = z.infer<typeof UpdateRolesDTO>;
export type UpdateUserDTOType = z.infer<typeof UpdateUserDTO>;
export type CreateUserConfigDTOType = z.infer<typeof CreateUserConfigDTO>;
export type UpdateUserConfigDTOType = z.infer<typeof UpdateUserConfigDTO>;
export type UpdateUserWebDTOType = z.infer<typeof UpdateUserWebDTO>;

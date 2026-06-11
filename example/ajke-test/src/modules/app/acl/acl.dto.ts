import { z } from "zod";

export const CreateRoleDTO = z.object({
    title: z.string("Title is required"),
    isActive: z.boolean().optional(),
    workspaceId: z.string().optional(),
});

export const FilterRoleDTO = z.object({
    page: z.coerce.number().optional(),
    limit: z.coerce.number().optional(),
    searchTerm: z.string().optional(),
    workspaceId: z.string().optional(),
});

export const UpdateRoleDTO = z.object({
    title: z.string().optional(),
    isActive: z.boolean().optional(),
    workspaceId: z.string().optional(),
});

export const AddPermissionsDTO = z.object({
    permissions: z.array(z.uuid("Permission is required")),
    workspaceId: z.string().optional(),
});

export const RemovePermissionsDTO = z.object({
    permissions: z.array(z.uuid("Permission is required")),
    workspaceId: z.string().optional(),
});

export const CreatePermissionDTO = z.object({
    title: z.string("Title is required"),
    permissionType: z.uuid("Permission type is required"),
    isActive: z.boolean().optional(),
    workspaceId: z.string().optional(),
});

export const FilterPermissionDTO = z.object({
    page: z.coerce.number().optional(),
    limit: z.coerce.number().optional(),
    searchTerm: z.string().optional(),
    permissionType: z.uuid().optional(),
    workspaceId: z.string().optional(),
});

export const UpdatePermissionDTO = z.object({
    title: z.string().optional(),
    permissionType: z.uuid().optional(),
    isActive: z.boolean().optional(),
});

export const CreatePermissionTypeDTO = z.object({
    title: z.string("Title is required"),
    isActive: z.boolean().optional(),
    workspaceId: z.string().optional(),
});

export const FilterPermissionTypeDTO = z.object({
    page: z.coerce.number().optional(),
    limit: z.coerce.number().optional(),
    searchTerm: z.string().optional(),
    workspaceId: z.string().optional(),
});

export const UpdatePermissionTypeDTO = z.object({
    title: z.string().optional(),
    isActive: z.boolean().optional(),
});

export type CreateRoleDTOType = z.infer<typeof CreateRoleDTO>;
export type FilterRoleDTOType = z.infer<typeof FilterRoleDTO>;
export type UpdateRoleDTOType = z.infer<typeof UpdateRoleDTO>;
export type AddPermissionsDTOType = z.infer<typeof AddPermissionsDTO>;
export type RemovePermissionsDTOType = z.infer<typeof RemovePermissionsDTO>;
export type CreatePermissionDTOType = z.infer<typeof CreatePermissionDTO>;
export type FilterPermissionDTOType = z.infer<typeof FilterPermissionDTO>;
export type UpdatePermissionDTOType = z.infer<typeof UpdatePermissionDTO>;
export type CreatePermissionTypeDTOType = z.infer<typeof CreatePermissionTypeDTO>;
export type FilterPermissionTypeDTOType = z.infer<typeof FilterPermissionTypeDTO>;
export type UpdatePermissionTypeDTOType = z.infer<typeof UpdatePermissionTypeDTO>;

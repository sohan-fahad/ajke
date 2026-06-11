import { z } from "zod";

const boolQuery = z.preprocess(v => v === "true" ? true : v === "false" ? false : v, z.boolean().optional());

// City
export const CreateCityDTO = z.object({
    title: z.string(),
    isActive: z.boolean().optional(),
    workspaceId: z.string().optional(),
});

export const FilterCityDTO = z.object({
    page: z.coerce.number().int().optional(),
    limit: z.coerce.number().int().optional(),
    searchTerm: z.string().optional(),
    isActive: boolQuery,
    workspaceId: z.string().optional(),
});

export const UpdateCityDTO = z.object({
    title: z.string().optional(),
    isActive: z.boolean().optional(),
    workspaceId: z.string().optional(),
});

// Area
export const CreateAreaDTO = z.object({
    title: z.string(),
    city: z.uuid(),
    zone: z.uuid().optional(),
    isActive: z.boolean().optional(),
    workspaceId: z.string().optional(),
});

export const FilterAreaDTO = z.object({
    page: z.coerce.number().int().optional(),
    limit: z.coerce.number().int().optional(),
    searchTerm: z.string().optional(),
    city: z.uuid().optional(),
    isActive: boolQuery,
    workspaceId: z.string().optional(),
});

export const UpdateAreaDTO = z.object({
    title: z.string().optional(),
    city: z.uuid().optional(),
    isActive: z.boolean().optional(),
    workspaceId: z.string().optional(),
});

// Zone
export const CreateZoneDTO = z.object({
    title: z.string(),
    city: z.uuid(),
    isActive: z.boolean().optional(),
    workspaceId: z.string().optional(),
});

export const FilterZoneDTO = z.object({
    page: z.coerce.number().int().optional(),
    limit: z.coerce.number().int().optional(),
    searchTerm: z.string().optional(),
    workspaceId: z.string().optional(),
});

export const UpdateZoneDTO = z.object({
    title: z.string().optional(),
    city: z.uuid().optional(),
    isActive: z.boolean().optional(),
    workspaceId: z.string().optional(),
});

// Address
export const CreateAddressDTO = z.object({
    customerName: z.string(),
    customerEmail: z.email().optional(),
    phoneNumber: z.string(),
    fullAddress: z.string(),
    city: z.uuid(),
    area: z.uuid(),
    user: z.uuid().optional(),
    workspaceId: z.string().optional(),
});

export const FilterAddressDTO = z.object({
    page: z.coerce.number().int().optional(),
    limit: z.coerce.number().int().optional(),
    searchTerm: z.string().optional(),
    phoneNumber: z.string().optional(),
    customerEmail: z.email().optional(),
    city: z.uuid().optional(),
    area: z.uuid().optional(),
    user: z.uuid().optional(),
    workspaceId: z.string().optional(),
});

export const FindMyAddressDTO = z.object({
    page: z.coerce.number().int().optional(),
    limit: z.coerce.number().int().optional(),
    searchTerm: z.string().optional(),
    isActive: boolQuery,
    workspaceId: z.string().optional(),
});

export const UpdateAddressDTO = z.object({
    customerName: z.string().optional(),
    customerEmail: z.email().optional(),
    phoneNumber: z.string().optional(),
    fullAddress: z.string().optional(),
    city: z.uuid().optional(),
    area: z.uuid().optional(),
    user: z.uuid().optional(),
    workspaceId: z.string().optional(),
});

// Warehouse
export const CreateWarehouseDTO = z.object({
    name: z.string(),
    emails: z.string(),
    city: z.uuid(),
    isActive: z.boolean().optional(),
    workspaceId: z.string().optional(),
});

export const FilterWarehouseDTO = z.object({
    page: z.coerce.number().int().optional(),
    limit: z.coerce.number().int().optional(),
    searchTerm: z.string().optional(),
    city: z.uuid().optional(),
    workspaceId: z.string().optional(),
});

export const UpdateWarehouseDTO = z.object({
    name: z.string().optional(),
    emails: z.string().optional(),
    city: z.uuid().optional(),
    isActive: z.boolean().optional(),
    workspaceId: z.string().optional(),
});

export type CreateCityDTOType = z.infer<typeof CreateCityDTO>;
export type FilterCityDTOType = z.infer<typeof FilterCityDTO>;
export type UpdateCityDTOType = z.infer<typeof UpdateCityDTO>;
export type CreateAreaDTOType = z.infer<typeof CreateAreaDTO>;
export type FilterAreaDTOType = z.infer<typeof FilterAreaDTO>;
export type UpdateAreaDTOType = z.infer<typeof UpdateAreaDTO>;
export type CreateZoneDTOType = z.infer<typeof CreateZoneDTO>;
export type FilterZoneDTOType = z.infer<typeof FilterZoneDTO>;
export type UpdateZoneDTOType = z.infer<typeof UpdateZoneDTO>;
export type CreateAddressDTOType = z.infer<typeof CreateAddressDTO>;
export type FilterAddressDTOType = z.infer<typeof FilterAddressDTO>;
export type FindMyAddressDTOType = z.infer<typeof FindMyAddressDTO>;
export type UpdateAddressDTOType = z.infer<typeof UpdateAddressDTO>;
export type CreateWarehouseDTOType = z.infer<typeof CreateWarehouseDTO>;
export type FilterWarehouseDTOType = z.infer<typeof FilterWarehouseDTO>;
export type UpdateWarehouseDTOType = z.infer<typeof UpdateWarehouseDTO>;

import { z } from "zod";

const boolQuery = z.preprocess(v => v === "true" ? true : v === "false" ? false : v, z.boolean().optional());

// Category
export const CreateCategoryDTO = z.object({
    title: z.string("Title is required"),
    icon: z.string().optional(),
    image: z.string().optional(),
    description: z.string().optional(),
    isFeatured: z.boolean().optional(),
    isAgeRestricted: z.boolean().optional(),
    department: z.uuid(),
    isActive: z.boolean().optional(),
    workspaceId: z.string().optional(),
});

export const FilterCategoryDTO = z.object({
    page: z.coerce.number().optional(),
    limit: z.coerce.number().optional(),
    searchTerm: z.string().optional(),
    slug: z.string().optional(),
    department: z.uuid().optional(),
    isActive: boolQuery,
    isFeatured: boolQuery,
    workspaceId: z.string().optional(),
});

export const FilterFeaturedCategoryDTO = z.object({
    page: z.coerce.number().optional(),
    limit: z.coerce.number().optional(),
    searchTerm: z.string().optional(),
    slug: z.string().optional(),
    zone: z.uuid().optional(),
    department: z.uuid().optional(),
    isActive: boolQuery,
    workspaceId: z.string().optional(),
});

export const UpdateCategoryDTO = z.object({
    title: z.string().optional(),
    icon: z.string().optional(),
    image: z.string().optional(),
    description: z.string().optional(),
    isFeatured: z.boolean().optional(),
    isAgeRestricted: z.boolean().optional(),
    department: z.uuid().optional(),
    isActive: z.boolean().optional(),
    workspaceId: z.string().optional(),
});

// SubCategory
export const CreateSubCategoryDTO = z.object({
    title: z.string("Title is required"),
    icon: z.string().optional(),
    image: z.string().optional(),
    description: z.string().optional(),
    isFeatured: z.boolean().optional(),
    isAgeRestricted: z.boolean().optional(),
    category: z.uuid("Category is required"),
    isActive: z.boolean().optional(),
    workspaceId: z.string().optional(),
});

export const FilterSubCategoryDTO = z.object({
    page: z.coerce.number().optional(),
    limit: z.coerce.number().optional(),
    searchTerm: z.string().optional(),
    slug: z.string().optional(),
    category: z.uuid().optional(),
    isFeatured: boolQuery,
    isActive: boolQuery,
    workspaceId: z.string().optional(),
});

export const UpdateSubCategoryDTO = z.object({
    title: z.string().optional(),
    icon: z.string().optional(),
    image: z.string().optional(),
    description: z.string().optional(),
    isFeatured: z.boolean().optional(),
    isAgeRestricted: z.boolean().optional(),
    category: z.uuid().optional(),
    isActive: z.boolean().optional(),
    workspaceId: z.string().optional(),
});

// Brand
export const CreateBrandDTO = z.object({
    title: z.string("Title is required"),
    icon: z.string().optional(),
    image: z.string().optional(),
    description: z.string().optional(),
    isFeatured: z.boolean().optional(),
    isActive: z.boolean().optional(),
    workspaceId: z.string().optional(),
});

export const FilterBrandDTO = z.object({
    page: z.coerce.number().optional(),
    limit: z.coerce.number().optional(),
    searchTerm: z.string().optional(),
    slug: z.string().optional(),
    isFeatured: boolQuery,
    isActive: boolQuery,
    workspaceId: z.string().optional(),
});

export const UpdateBrandDTO = z.object({
    title: z.string().optional(),
    icon: z.string().optional(),
    image: z.string().optional(),
    description: z.string().optional(),
    isFeatured: z.boolean().optional(),
    isActive: z.boolean().optional(),
    workspaceId: z.string().optional(),
});

// Department
export const CreateDepartmentDTO = z.object({
    title: z.string("Title is required"),
    icon: z.string().optional(),
    image: z.string().optional(),
    description: z.string().optional(),
    isFeatured: z.boolean().optional(),
    isActive: z.boolean().optional(),
    workspaceId: z.string().optional(),
});

export const FilterDepartmentDTO = z.object({
    page: z.coerce.number().optional(),
    limit: z.coerce.number().optional(),
    searchTerm: z.string().optional(),
    slug: z.string().optional(),
    isFeatured: boolQuery,
    workspaceId: z.string().optional(),
});

export const UpdateDepartmentDTO = z.object({
    title: z.string().optional(),
    icon: z.string().optional(),
    image: z.string().optional(),
    description: z.string().optional(),
    isFeatured: z.boolean().optional(),
    isActive: z.boolean().optional(),
    workspaceId: z.string().optional(),
});

// SpecialCategory
export const CreateSpecialCategoryDTO = z.object({
    title: z.string("Title is required"),
    icon: z.string().optional(),
    image: z.string().optional(),
    description: z.string().optional(),
    orderPriority: z.number().optional(),
    isActive: z.boolean().optional(),
    workspaceId: z.string().optional(),
});

export const FilterSpecialCategoryDTO = z.object({
    page: z.coerce.number().optional(),
    limit: z.coerce.number().optional(),
    searchTerm: z.string().optional(),
    slug: z.string().optional(),
    isActive: boolQuery,
    workspaceId: z.string().optional(),
});

export const UpdateSpecialCategoryDTO = z.object({
    title: z.string().optional(),
    icon: z.string().optional(),
    image: z.string().optional(),
    description: z.string().optional(),
    orderPriority: z.number().optional(),
    isActive: z.boolean().optional(),
    workspaceId: z.string().optional(),
});

export const ReOrderSpecialCategoryDTO = z.object({
    items: z.array(z.object({
        id: z.uuid("ID is required"),
        orderPriority: z.number("Order priority is required"),
    })),
    workspaceId: z.string().optional(),
});

export type CreateCategoryDTOType = z.infer<typeof CreateCategoryDTO>;
export type FilterCategoryDTOType = z.infer<typeof FilterCategoryDTO>;
export type FilterFeaturedCategoryDTOType = z.infer<typeof FilterFeaturedCategoryDTO>;
export type UpdateCategoryDTOType = z.infer<typeof UpdateCategoryDTO>;
export type CreateSubCategoryDTOType = z.infer<typeof CreateSubCategoryDTO>;
export type FilterSubCategoryDTOType = z.infer<typeof FilterSubCategoryDTO>;
export type UpdateSubCategoryDTOType = z.infer<typeof UpdateSubCategoryDTO>;
export type CreateBrandDTOType = z.infer<typeof CreateBrandDTO>;
export type FilterBrandDTOType = z.infer<typeof FilterBrandDTO>;
export type UpdateBrandDTOType = z.infer<typeof UpdateBrandDTO>;
export type CreateDepartmentDTOType = z.infer<typeof CreateDepartmentDTO>;
export type FilterDepartmentDTOType = z.infer<typeof FilterDepartmentDTO>;
export type UpdateDepartmentDTOType = z.infer<typeof UpdateDepartmentDTO>;
export type CreateSpecialCategoryDTOType = z.infer<typeof CreateSpecialCategoryDTO>;
export type FilterSpecialCategoryDTOType = z.infer<typeof FilterSpecialCategoryDTO>;
export type UpdateSpecialCategoryDTOType = z.infer<typeof UpdateSpecialCategoryDTO>;
export type ReOrderSpecialCategoryDTOType = z.infer<typeof ReOrderSpecialCategoryDTO>;

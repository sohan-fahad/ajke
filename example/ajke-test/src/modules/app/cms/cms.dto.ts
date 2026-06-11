import { z } from "zod";

const boolQuery = z.preprocess(v => v === "true" ? true : v === "false" ? false : v, z.boolean().optional());
const ReOrderItemSchema = z.object({
    id: z.uuid("ID is required"),
    orderPriority: z.number(),
});

// Banner CRUD
export const CreateBannerDTO = z.object({
    title: z.string("Title is required"),
    description: z.string().optional(),
    link: z.string().optional(),
    image: z.string().optional(),
    isActive: z.boolean().optional(),
    workspaceId: z.string().optional(),
});

export const FilterBannerDTO = z.object({
    page: z.coerce.number().optional(),
    limit: z.coerce.number().optional(),
    searchTerm: z.string().optional(),
    workspaceId: z.string().optional(),
});

export const UpdateBannerDTO = z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    link: z.string().optional(),
    image: z.string().optional(),
    isActive: z.boolean().optional(),
    workspaceId: z.string().optional(),
});

export const ReOrderBannerDTO = z.object({
    items: z.array(ReOrderItemSchema),
    workspaceId: z.string().optional(),
});

// CMS homepage queries
export const AllProductsHomePageDTO = z.object({
    page: z.coerce.number().optional(),
    limit: z.coerce.number().optional(),
    isActive: boolQuery,
    workspaceId: z.string().optional(),
});

export const BannerHomePageDTO = z.object({
    page: z.coerce.number().optional(),
    limit: z.coerce.number().optional(),
    isActive: boolQuery,
    workspaceId: z.string().optional(),
});

export const BestSellingProductsHomePageDTO = z.object({
    page: z.coerce.number().optional(),
    limit: z.coerce.number().optional(),
    isActive: boolQuery,
    workspaceId: z.string().optional(),
});

export const CategoriesHomePageDTO = z.object({
    page: z.coerce.number().optional(),
    limit: z.coerce.number().optional(),
    isActive: boolQuery,
    workspaceId: z.string().optional(),
});

export const PopularSaleProductsHomePageDTO = z.object({
    page: z.coerce.number().optional(),
    limit: z.coerce.number().optional(),
    isActive: boolQuery,
    workspaceId: z.string().optional(),
});

export type CreateBannerDTOType = z.infer<typeof CreateBannerDTO>;
export type FilterBannerDTOType = z.infer<typeof FilterBannerDTO>;
export type UpdateBannerDTOType = z.infer<typeof UpdateBannerDTO>;
export type ReOrderBannerDTOType = z.infer<typeof ReOrderBannerDTO>;
export type AllProductsHomePageDTOType = z.infer<typeof AllProductsHomePageDTO>;
export type BannerHomePageDTOType = z.infer<typeof BannerHomePageDTO>;
export type BestSellingProductsHomePageDTOType = z.infer<typeof BestSellingProductsHomePageDTO>;
export type CategoriesHomePageDTOType = z.infer<typeof CategoriesHomePageDTO>;
export type PopularSaleProductsHomePageDTOType = z.infer<typeof PopularSaleProductsHomePageDTO>;

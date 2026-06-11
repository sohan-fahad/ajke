import { z } from "zod";

const boolQuery = z.preprocess(v => v === "true" ? true : v === "false" ? false : v, z.boolean().optional());

// Shared reorder item shape
const ReOrderItemSchema = z.object({
    id: z.uuid(),
    orderPriority: z.number(),
});

// Product
export const ProductImageDTO = z.object({
    link: z.string(),
    isThumb: z.boolean().optional(),
});

export const ProductVariantOptionDTO = z.object({
    sku: z.string().optional(),
    liftingPrice: z.number().optional(),
    liftingPriceVat: z.number().optional(),
    mrp: z.number().optional(),
    mrpVat: z.number().optional(),
    stock: z.number().optional(),
    variantOption: z.uuid(),
});

export const CreateProductDTO = z.object({
    title: z.string(),
    description: z.string().optional(),
    specification: z.string().optional(),
    unit: z.string().optional(),
    liftingPrice: z.number().optional(),
    liftingPriceVat: z.number().optional(),
    mrp: z.number().optional(),
    mrpVat: z.number().optional(),
    stock: z.number().optional(),
    manageCustomInventory: z.boolean(),
    tags: z.string().optional(),
    brand: z.uuid().optional(),
    department: z.uuid().optional(),
    category: z.uuid().optional(),
    subCategory: z.uuid().optional(),
    images: z.array(ProductImageDTO).optional(),
    variants: z.array(ProductVariantOptionDTO).optional(),
    workspaceId: z.string().optional(),
});

export const FilterProductDTO = z.object({
    page: z.coerce.number().int().optional(),
    limit: z.coerce.number().int().optional(),
    sort: z.enum(["new", "price_asc", "price_desc", "rating"]).optional(),
    minPrice: z.coerce.number().optional(),
    maxPrice: z.coerce.number().optional(),
    searchTerm: z.string().optional(),
    brand: z.uuid().optional(),
    department: z.uuid().optional(),
    category: z.uuid().optional(),
    subCategory: z.uuid().optional(),
    brandSlug: z.string().optional(),
    departmentSlug: z.string().optional(),
    categorySlug: z.string().optional(),
    subCategorySlug: z.string().optional(),
    isNewArrival: boolQuery,
    isForceStockout: boolQuery,
    isFeatured: boolQuery,
    catalogSlug: z.string().optional(),
    zone: z.string().optional(),
    currentTime: z.string().optional(),
    isActive: boolQuery,
    workspaceId: z.string().optional(),
});

export const UpdateProductSpecialCategoryDTO = z.object({
    specialCategory: z.uuid(),
    isDeleted: z.boolean().optional(),
});

export const UpdateProductImageDTO = z.object({
    link: z.string(),
    isThumb: z.boolean().optional(),
    isDeleted: z.boolean().optional(),
});

export const UpdateProductVariantOptionDTO = z.object({
    sku: z.string().optional(),
    liftingPrice: z.number().optional(),
    liftingPriceVat: z.number().optional(),
    mrp: z.number().optional(),
    mrpVat: z.number().optional(),
    stock: z.number().optional(),
    variantOption: z.uuid(),
    isDeleted: z.boolean().optional(),
});

export const UpdateProductDTO = z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    specification: z.string().optional(),
    unit: z.string().optional(),
    tags: z.string().optional(),
    brand: z.uuid().optional(),
    department: z.uuid().optional(),
    category: z.uuid().optional(),
    subCategory: z.uuid().optional(),
    isForceStockout: z.boolean().optional(),
    isNewArrival: z.boolean().optional(),
    isFeatured: z.boolean().optional(),
    isActive: z.boolean().optional(),
    images: z.array(UpdateProductImageDTO).optional(),
    variants: z.array(UpdateProductVariantOptionDTO).optional(),
    specialCategories: z.array(UpdateProductSpecialCategoryDTO).optional(),
    workspaceId: z.string().optional(),
});

export const FilterCatalogDTO = z.object({
    slug: z.string().optional(),
    id: z.uuid().optional(),
    type: z.enum(["department", "category", "subCategory"]).optional(),
    isActive: boolQuery,
    workspaceId: z.string().optional(),
});

export const FindByCodeDTO = z.object({
    isActive: boolQuery,
    workspaceId: z.string().optional(),
});

export const FindBySlugDTO = z.object({
    isActive: boolQuery,
    workspaceId: z.string().optional(),
});

export const GetProductsByIdsDTO = z.object({
    products: z.string(),
    isActive: boolQuery,
    workspaceId: z.string().optional(),
});

export const GlobalSearchDTO = z.object({
    searchTerm: z.string(),
    isActive: boolQuery,
    workspaceId: z.string().optional(),
});

export const GetBreadcrumbDTO = z.object({
    productSlug: z.string().optional(),
    catalogSlug: z.string().optional(),
    workspaceId: z.string().optional(),
});

export const BulkUpdateProductDataDTO = UpdateProductDTO.extend({
    id: z.uuid(),
});

export const BulkUpdateProductDTO = z.object({
    bulk: z.array(BulkUpdateProductDataDTO),
    workspaceId: z.string().optional(),
});

export const ReOrderProductImageDTO = z.object({
    items: z.array(ReOrderItemSchema),
    workspaceId: z.string().optional(),
});

export const AddProductsToSpecialCategoriesDTO = z.object({
    products: z.array(z.uuid()),
    specialCategories: z.array(z.uuid()),
});

export const RemoveProductsFromSpecialCategoriesDTO = z.object({
    products: z.array(z.uuid()),
    specialCategories: z.array(z.uuid()),
});

// Variant
export const CreateVariantDTO = z.object({
    title: z.string(),
    isActive: z.boolean().optional(),
    workspaceId: z.string().optional(),
});

export const FilterVariantDTO = z.object({
    page: z.coerce.number().int().optional(),
    limit: z.coerce.number().int().optional(),
    searchTerm: z.string().optional(),
    workspaceId: z.string().optional(),
});

export const UpdateVariantDTO = z.object({
    title: z.string().optional(),
    isActive: z.boolean().optional(),
    workspaceId: z.string().optional(),
});

export const ReOrderVariantsDTO = z.object({
    items: z.array(ReOrderItemSchema),
    workspaceId: z.string().optional(),
});

// VariantOption
export const CreateVariantOptionDTO = z.object({
    title: z.string(),
    variant: z.uuid(),
    isActive: z.boolean().optional(),
    workspaceId: z.string().optional(),
});

export const FilterVariantOptionDTO = z.object({
    page: z.coerce.number().int().optional(),
    limit: z.coerce.number().int().optional(),
    searchTerm: z.string().optional(),
    variant: z.uuid().optional(),
    workspaceId: z.string().optional(),
});

export const UpdateVariantOptionDTO = z.object({
    title: z.string().optional(),
    variant: z.uuid().optional(),
    isActive: z.boolean().optional(),
    workspaceId: z.string().optional(),
});

export const ReOrderVariantOptionsDTO = z.object({
    items: z.array(ReOrderItemSchema),
    workspaceId: z.string().optional(),
});

// Discount
export const CreateDiscountProductsDTO = z.object({
    product: z.uuid(),
    value: z.number().optional(),
    discountType: z.enum(["FIXED_AMOUNT", "PERCENTAGE"]).optional(),
});

export const CreateDiscountDTO = z.object({
    title: z.string(),
    discountType: z.enum(["FIXED_AMOUNT", "PERCENTAGE"]),
    value: z.number(),
    validFrom: z.string(),
    validTill: z.string(),
    products: z.array(CreateDiscountProductsDTO).optional(),
    workspaceId: z.string().optional(),
});

export const FilterDiscountDTO = z.object({
    page: z.coerce.number().int().optional(),
    limit: z.coerce.number().int().optional(),
    searchTerm: z.string().optional(),
    workspaceId: z.string().optional(),
});

export const FilterOneDiscountDTO = z.object({
    page: z.coerce.number().int().optional(),
    limit: z.coerce.number().int().optional(),
});

export const UpdateDiscountProductsDTO = z.object({
    product: z.uuid(),
    value: z.number().optional(),
    discountType: z.enum(["FIXED_AMOUNT", "PERCENTAGE"]).optional(),
    isDeleted: z.boolean().optional(),
});

export const UpdateDiscountDTO = z.object({
    title: z.string().optional(),
    discountType: z.enum(["FIXED_AMOUNT", "PERCENTAGE"]).optional(),
    status: z.enum(["canceled", "closed"]).optional(),
    value: z.number().optional(),
    validFrom: z.string().optional(),
    validTill: z.string().optional(),
    products: z.array(UpdateDiscountProductsDTO).optional(),
    workspaceId: z.string().optional(),
});

// ProductStockCircular
export const CreateProductStockCircularItemsDTO = z.object({
    product: z.uuid(),
    newStock: z.number(),
});

export const CreateProductStockCircularDTO = z.object({
    title: z.string(),
    reason: z.string().optional(),
    items: z.array(CreateProductStockCircularItemsDTO).optional(),
    workspaceId: z.string().optional(),
});

export const FilterProductStockCircularDTO = z.object({
    page: z.coerce.number().int().optional(),
    limit: z.coerce.number().int().optional(),
    searchTerm: z.string().optional(),
    workspaceId: z.string().optional(),
});

export const FilterOneStockCircularDTO = z.object({
    page: z.coerce.number().int().optional(),
    limit: z.coerce.number().int().optional(),
});

export const UpdateProductStockCircularItemsDTO = z.object({
    product: z.uuid(),
    newStock: z.number().optional(),
    isDeleted: z.boolean().optional(),
});

export const UpdateProductStockCircularDTO = z.object({
    title: z.string().optional(),
    reason: z.string().optional(),
    status: z.enum(["canceled"]).optional(),
    items: z.array(UpdateProductStockCircularItemsDTO).optional(),
    workspaceId: z.string().optional(),
});

// ProductPriceCircular
export const CreateProductPriceCircularItemsDTO = z.object({
    product: z.uuid(),
    newMrp: z.number(),
    newMrpVat: z.number(),
    newLiftingPrice: z.number(),
    newLiftingPriceVat: z.number(),
});

export const CreateProductPriceCircularDTO = z.object({
    title: z.string(),
    reason: z.string().optional(),
    zone: z.uuid().optional(),
    items: z.array(CreateProductPriceCircularItemsDTO).optional(),
    workspaceId: z.string().optional(),
});

export const FilterProductPriceCircularDTO = z.object({
    page: z.coerce.number().int().optional(),
    limit: z.coerce.number().int().optional(),
    searchTerm: z.string().optional(),
    zone: z.uuid().optional(),
    workspaceId: z.string().optional(),
});

export const FilterOnePriceCircularDTO = z.object({
    page: z.coerce.number().int().optional(),
    limit: z.coerce.number().int().optional(),
});

export const UpdateProductPriceCircularItemsDTO = z.object({
    product: z.uuid(),
    newMrp: z.number().optional(),
    newMrpVat: z.number().optional(),
    newliftingPrice: z.number().optional(),
    newliftingPriceVat: z.number().optional(),
    isDeleted: z.boolean().optional(),
});

export const UpdateProductPriceCircularDTO = z.object({
    title: z.string().optional(),
    reason: z.string().optional(),
    zone: z.uuid().optional(),
    status: z.enum(["canceled"]).optional(),
    items: z.array(UpdateProductPriceCircularItemsDTO).optional(),
    workspaceId: z.string().optional(),
});

// ProductRating
export const CreateProductRatingDTO = z.object({
    product: z.uuid(),
    comment: z.string().optional(),
    rating: z.number().optional(),
    workspaceId: z.string().optional(),
});

export const FilterProductRatingDTO = z.object({
    page: z.coerce.number().int().optional(),
    limit: z.coerce.number().int().optional(),
    searchTerm: z.string().optional(),
    product: z.uuid().optional(),
    isActive: boolQuery,
    workspaceId: z.string().optional(),
});

export const UpdateProductRatingDTO = z.object({
    product: z.uuid().optional(),
    comment: z.string().optional(),
    rating: z.number().optional(),
    isActive: z.boolean().optional(),
    workspaceId: z.string().optional(),
});

// ProductZoneMapping
export const CreateProductZoneMappingDTO = z.object({
    product: z.uuid(),
    zone: z.uuid(),
    zoneMrp: z.number(),
    zoneMrpVat: z.number(),
    zoneLiftingPriceVat: z.number(),
    zoneLiftingPrice: z.number(),
    isActive: z.boolean().optional(),
    isNewArrival: z.boolean().optional(),
    isStockout: z.boolean().optional(),
    isForceStockout: z.boolean().optional(),
    isFeatured: z.boolean().optional(),
    availableFromTime: z.string(),
    availableToTime: z.string().optional(),
    estimatedDeliveryMinutes: z.number().optional(),
    workspaceId: z.string().optional(),
});

export type ProductImageDTOType = z.infer<typeof ProductImageDTO>;
export type ProductVariantOptionDTOType = z.infer<typeof ProductVariantOptionDTO>;
export type CreateProductDTOType = z.infer<typeof CreateProductDTO>;
export type FilterProductDTOType = z.infer<typeof FilterProductDTO>;
export type UpdateProductDTOType = z.infer<typeof UpdateProductDTO>;
export type FilterCatalogDTOType = z.infer<typeof FilterCatalogDTO>;
export type FindByCodeDTOType = z.infer<typeof FindByCodeDTO>;
export type FindBySlugDTOType = z.infer<typeof FindBySlugDTO>;
export type GetProductsByIdsDTOType = z.infer<typeof GetProductsByIdsDTO>;
export type GlobalSearchDTOType = z.infer<typeof GlobalSearchDTO>;
export type GetBreadcrumbDTOType = z.infer<typeof GetBreadcrumbDTO>;
export type BulkUpdateProductDTOType = z.infer<typeof BulkUpdateProductDTO>;
export type ReOrderProductImageDTOType = z.infer<typeof ReOrderProductImageDTO>;
export type AddProductsToSpecialCategoriesDTOType = z.infer<typeof AddProductsToSpecialCategoriesDTO>;
export type RemoveProductsFromSpecialCategoriesDTOType = z.infer<typeof RemoveProductsFromSpecialCategoriesDTO>;
export type CreateVariantDTOType = z.infer<typeof CreateVariantDTO>;
export type FilterVariantDTOType = z.infer<typeof FilterVariantDTO>;
export type UpdateVariantDTOType = z.infer<typeof UpdateVariantDTO>;
export type ReOrderVariantsDTOType = z.infer<typeof ReOrderVariantsDTO>;
export type CreateVariantOptionDTOType = z.infer<typeof CreateVariantOptionDTO>;
export type FilterVariantOptionDTOType = z.infer<typeof FilterVariantOptionDTO>;
export type UpdateVariantOptionDTOType = z.infer<typeof UpdateVariantOptionDTO>;
export type ReOrderVariantOptionsDTOType = z.infer<typeof ReOrderVariantOptionsDTO>;
export type CreateDiscountDTOType = z.infer<typeof CreateDiscountDTO>;
export type FilterDiscountDTOType = z.infer<typeof FilterDiscountDTO>;
export type FilterOneDiscountDTOType = z.infer<typeof FilterOneDiscountDTO>;
export type UpdateDiscountDTOType = z.infer<typeof UpdateDiscountDTO>;
export type CreateProductStockCircularDTOType = z.infer<typeof CreateProductStockCircularDTO>;
export type FilterProductStockCircularDTOType = z.infer<typeof FilterProductStockCircularDTO>;
export type FilterOneStockCircularDTOType = z.infer<typeof FilterOneStockCircularDTO>;
export type UpdateProductStockCircularDTOType = z.infer<typeof UpdateProductStockCircularDTO>;
export type CreateProductPriceCircularDTOType = z.infer<typeof CreateProductPriceCircularDTO>;
export type FilterProductPriceCircularDTOType = z.infer<typeof FilterProductPriceCircularDTO>;
export type FilterOnePriceCircularDTOType = z.infer<typeof FilterOnePriceCircularDTO>;
export type UpdateProductPriceCircularDTOType = z.infer<typeof UpdateProductPriceCircularDTO>;
export type CreateProductRatingDTOType = z.infer<typeof CreateProductRatingDTO>;
export type FilterProductRatingDTOType = z.infer<typeof FilterProductRatingDTO>;
export type UpdateProductRatingDTOType = z.infer<typeof UpdateProductRatingDTO>;
export type CreateProductZoneMappingDTOType = z.infer<typeof CreateProductZoneMappingDTO>;

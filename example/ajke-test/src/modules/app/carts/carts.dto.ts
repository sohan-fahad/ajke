import { z } from "zod";

const ProductAddToCartSchema = z.object({
    product: z.uuid(),
    productVariantOptions: z.array(z.uuid()),
    quantity: z.number(),
});

const ProductUpdateToCartSchema = z.object({
    cartItem: z.uuid(),
    product: z.uuid(),
    productVariantOptions: z.array(z.uuid()),
    quantity: z.number(),
});

export const AddToCartDTO = z.object({
    newProducts: z.array(ProductAddToCartSchema).optional(),
    updatedProducts: z.array(ProductUpdateToCartSchema).optional(),
    deletedItems: z.array(z.uuid()).optional(),
    replaceAll: z.boolean().optional(),
    workspaceId: z.string().optional(),
});

export const UpdateToCartDTO = z.object({
    products: z.array(z.object({
        cartItem: z.uuid(),
        productVariantOptions: z.array(z.uuid()).optional(),
        quantity: z.number().optional(),
        isDeleted: z.boolean().optional(),
    })).optional(),
    workspaceId: z.string().optional(),
});

export type AddToCartDTOType = z.infer<typeof AddToCartDTO>;
export type UpdateToCartDTOType = z.infer<typeof UpdateToCartDTO>;

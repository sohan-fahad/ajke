import { z } from "zod";

export const CreateCouponDTO = z.object({
    code: z.string(),
    discountType: z.enum(["FIXED_AMOUNT", "PERCENTAGE"]),
    maxUsageLimit: z.number().optional(),
    perDayMaxUsageLimit: z.number().optional(),
    perUserMaxUsageLimit: z.number().optional(),
    perUserPerDayMaxUsageLimit: z.number().optional(),
    discount: z.number().optional(),
    discountPercentage: z.number().optional(),
    minOrderAmount: z.number().optional(),
    maxDiscountAmount: z.number().optional(),
    validFrom: z.string(),
    validTill: z.string(),
    isActive: z.boolean().optional(),
    workspaceId: z.string().optional(),
});

export const FilterCouponDTO = z.object({
    page: z.coerce.number().int().optional(),
    limit: z.coerce.number().int().optional(),
    searchTerm: z.string().optional(),
    workspaceId: z.string().optional(),
});

export const UpdateCouponDTO = z.object({
    code: z.string().optional(),
    discountType: z.enum(["FIXED_AMOUNT", "PERCENTAGE"]).optional(),
    maxUsageLimit: z.number().optional(),
    perDayMaxUsageLimit: z.number().optional(),
    perUserMaxUsageLimit: z.number().optional(),
    perUserPerDayMaxUsageLimit: z.number().optional(),
    discount: z.number().optional(),
    discountPercentage: z.number().optional(),
    minOrderAmount: z.number().optional(),
    maxDiscountAmount: z.number().optional(),
    validFrom: z.string().optional(),
    validTill: z.string().optional(),
    isActive: z.boolean().optional(),
    workspaceId: z.string().optional(),
});

export const CheckValidityDTO = z.object({
    code: z.string(),
    workspaceId: z.string().optional(),
});

export type CreateCouponDTOType = z.infer<typeof CreateCouponDTO>;
export type FilterCouponDTOType = z.infer<typeof FilterCouponDTO>;
export type UpdateCouponDTOType = z.infer<typeof UpdateCouponDTO>;
export type CheckValidityDTOType = z.infer<typeof CheckValidityDTO>;

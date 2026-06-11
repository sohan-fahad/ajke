import { z } from "zod";

const boolQuery = z.preprocess(v => v === "true" ? true : v === "false" ? false : v, z.boolean().optional());

const AddressSchema = z.object({
    customerName: z.string("Customer name is required"),
    customerEmail: z.email("Customer email is required").optional(),
    phoneNumber: z.string("Phone number is required"),
    fullAddress: z.string("Full address is required"),
    city: z.uuid("City is required"),
    zone: z.uuid("Zone is required"),
    area: z.uuid("Area is required"),
});

const CartItemSchema = z.object({
    product: z.uuid("Product is required"),
    variantOptions: z.array(z.uuid("Variant option is required")).optional(),
    quantity: z.number(),
});

export const CreateOrderDTO = z.object({
    user: z.uuid("User is required").optional(),
    couponCode: z.string().optional(),
    paymentMethod: z.uuid("Payment method is required"),
    orderSource: z.enum(["WEBSITE", "ADMIN_PANEL", "POS", "APP"]).optional(),
    shippingAddress: AddressSchema.optional(),
    products: z.array(CartItemSchema).optional(),
    workspaceId: z.string().optional(),
});

export const CreatePosOrderDTO = z.object({
    couponCode: z.string().optional(),
    paymentMethod: z.uuid("Payment method is required"),
    phoneNumber: z.string(),
    products: z.array(CartItemSchema).optional(),
    workspaceId: z.string().optional(),
});

export const FilterOrderDTO = z.object({
    page: z.coerce.number().optional(),
    limit: z.coerce.number().optional(),
    searchTerm: z.string().optional(),
    user: z.uuid("User is required").optional(),
    paymentStatus: z.enum(["PENDING", "PAID", "DELIVERY_CHARGE_PAID", "FAILED"]).optional(),
    orderStatus: z.enum(["PENDING", "CONFIRMED", "PROCESSING", "OUT_FOR_DELIVERY", "CANCELLED", "DELIVERED", "RETURNED", "REFUNDED"]).optional(),
    orderSource: z.enum(["WEBSITE", "ADMIN_PANEL", "POS", "APP"]).optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    zone: z.uuid().optional(),
    workspaceId: z.string().optional(),
});

export const FindMyOrderDTO = z.object({
    page: z.coerce.number().optional(),
    limit: z.coerce.number().optional(),
    searchTerm: z.string().optional(),
    orderStatus: z.enum(["PENDING", "CONFIRMED", "PROCESSING", "OUT_FOR_DELIVERY", "CANCELLED", "DELIVERED", "RETURNED", "REFUNDED"]).optional(),
    paymentStatus: z.enum(["PENDING", "PAID", "DELIVERY_CHARGE_PAID", "FAILED"]).optional(),
    isActive: boolQuery,
    workspaceId: z.string().optional(),
});

export const ModifyOrderQuantityDTO = z.object({
    quantity: z.number(),
    product: z.uuid("Product is required"),
});

export const ModifyOrderCouponDTO = z.object({
    couponCode: z.string("Coupon code is required"),
});

export const NewOrderItemDTO = z.object({
    product: z.uuid("Product is required"),
    productVariantOptions: z.array(z.uuid("Variant option is required")),
    quantity: z.number(),
});

export const UpdatedOrderItemDTO = z.object({
    product: z.uuid("Product is required"),
    productVariantOptions: z.array(z.uuid("Variant option is required")),
    quantity: z.number(),
});

export const UpdatedOrderAddressDTO = z.object({
    id: z.uuid("Address is required"),
    customerName: z.string().optional(),
    customerEmail: z.email().optional(),
    phoneNumber: z.string().optional(),
    fullAddress: z.string().optional(),
    city: z.uuid().optional(),
    area: z.uuid().optional(),
});

export const ModifyOrderDTO = z.object({
    quantities: z.array(ModifyOrderQuantityDTO).optional(),
    deletedItems: z.array(z.uuid("Deleted item is required")).optional(),
    newOrderItems: z.array(NewOrderItemDTO).optional(),
    updatedOrderItems: z.array(UpdatedOrderItemDTO).optional(),
    shippingAddress: UpdatedOrderAddressDTO.optional(),
    coupon: ModifyOrderCouponDTO.optional(),
});

export const OrderCountByStatusFilterDTO = z.object({
    user: z.uuid("User is required").optional(),
    paymentStatus: z.enum(["PENDING", "PAID", "DELIVERY_CHARGE_PAID", "FAILED"]).optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    workspaceId: z.string().optional(),
});

export const OrderSummaryDTO = z.object({
    cart: z.uuid("Cart is required").optional(),
    couponCode: z.string().optional(),
    products: z.array(CartItemSchema).optional(),
    zone: z.uuid("Zone is required"),
    workspaceId: z.string().optional(),
});

export const OrderPayNowDTO = z.object({
    order: z.uuid("Order is required"),
    amount: z.enum(["FULL", "DELIVERY_CHARGE"]),
    workspaceId: z.string().optional(),
});

export const UpdateOrderAddressDTO = z.object({
    id: z.uuid("Address is required"),
    customerName: z.string().optional(),
    customerEmail: z.email().optional(),
    phoneNumber: z.string().optional(),
    fullAddress: z.string().optional(),
    city: z.uuid().optional(),
    area: z.uuid().optional(),
});

export const UpdateOrderCartDTO = z.object({
    product: z.uuid("Product is required"),
    productVariantOptions: z.array(z.uuid("Variant option is required")).optional(),
    quantity: z.number().optional(),
    isDeleted: z.boolean().optional(),
});

export const UpdateOrderDTO = z.object({
    paymentStatus: z.enum(["PENDING", "PAID", "DELIVERY_CHARGE_PAID", "FAILED"]).optional(),
    paymentMethod: z.uuid().optional(),
    deliveryman: z.uuid().optional(),
    shippingAddress: UpdateOrderAddressDTO.optional(),
    products: z.array(UpdateOrderCartDTO).optional(),
    workspaceId: z.string().optional(),
});

export const UpdateOrderStatusDTO = z.object({
    orderStatus: z.enum(["PENDING", "CONFIRMED", "PROCESSING", "OUT_FOR_DELIVERY", "CANCELLED", "DELIVERED", "RETURNED", "REFUNDED"]),
    comments: z.string().optional(),
    workspaceId: z.string().optional(),
});

export const DMAcceptOrderDTO = z.object({
    comments: z.string().optional(),
    workspaceId: z.string().optional(),
});

export type CreateOrderDTOType = z.infer<typeof CreateOrderDTO>;
export type CreatePosOrderDTOType = z.infer<typeof CreatePosOrderDTO>;
export type FilterOrderDTOType = z.infer<typeof FilterOrderDTO>;
export type FindMyOrderDTOType = z.infer<typeof FindMyOrderDTO>;
export type ModifyOrderDTOType = z.infer<typeof ModifyOrderDTO>;
export type OrderCountByStatusFilterDTOType = z.infer<typeof OrderCountByStatusFilterDTO>;
export type OrderSummaryDTOType = z.infer<typeof OrderSummaryDTO>;
export type OrderPayNowDTOType = z.infer<typeof OrderPayNowDTO>;
export type UpdateOrderDTOType = z.infer<typeof UpdateOrderDTO>;
export type UpdateOrderStatusDTOType = z.infer<typeof UpdateOrderStatusDTO>;
export type DMAcceptOrderDTOType = z.infer<typeof DMAcceptOrderDTO>;

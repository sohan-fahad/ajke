import { z } from "zod";

export const CreateTransactionDTO = z.object({
    type: z.enum(["DELIVERY_EARNING", "ORDER_PAYMENT", "DELIVERY_MAN_PAYMENT", "REFUND", "OTHER"]),
    status: z.enum(["PENDING", "COMPLETED", "CANCELLED"]),
    amount: z.number(),
    description: z.string().optional(),
    reference: z.string().optional(),
    deliveryManId: z.uuid().optional(),
    orderId: z.uuid().optional(),
    userId: z.uuid().optional(),
});

export const UpdateTransactionDTO = z.object({
    type: z.enum(["DELIVERY_EARNING", "ORDER_PAYMENT", "DELIVERY_MAN_PAYMENT", "REFUND", "OTHER"]).optional(),
    status: z.enum(["PENDING", "COMPLETED", "CANCELLED"]).optional(),
    amount: z.number().optional(),
    description: z.string().optional(),
    reference: z.string().optional(),
    deliveryManId: z.uuid().optional(),
    orderId: z.uuid().optional(),
    userId: z.uuid().optional(),
    workspaceId: z.string().optional(),
});

export type CreateTransactionDTOType = z.infer<typeof CreateTransactionDTO>;
export type UpdateTransactionDTOType = z.infer<typeof UpdateTransactionDTO>;

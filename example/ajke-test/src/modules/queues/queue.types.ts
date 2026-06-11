export interface OrderQueuePayload {
  orderId: string;
  userId: string;
  workspaceId?: string;
  totalAmount: number;
  customerPhone?: string;
  customerEmail?: string;
}

export interface OrderEventPayload {
  event: string;
  orderId: string;
  userId?: string;
  deliverymanId?: string;
  workspaceId?: string;
  status?: string;
  previousStatus?: string;
  metadata?: Record<string, unknown>;
}

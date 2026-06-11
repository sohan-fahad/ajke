import type { OrderEventPayload } from "../queue.types";

export async function processOrderEventsBatch(
  batch: MessageBatch<OrderEventPayload>,
  env: CloudflareBindings,
): Promise<void> {
  for (const msg of batch.messages) {
    try {
      const payload = msg.body;
      await handleOrderEvent(payload, env);
      msg.ack();
    } catch {
      msg.retry();
    }
  }
}

async function handleOrderEvent(
  payload: OrderEventPayload,
  env: CloudflareBindings,
): Promise<void> {
  const { event, orderId, status } = payload;

  if (!env.SLACK_WEBHOOK_URL) return;

  const eventMessages: Record<string, string> = {
    ORDER_STATUS_CHANGED: `*Order Status Updated* :package:\n*Order ID:* ${orderId}\n*New Status:* ${status}`,
    ORDER_ASSIGNED_TO_DM: `*Order Assigned* :motorcycle:\n*Order ID:* ${orderId}\n*Deliveryman:* ${payload.deliverymanId}`,
    ORDER_DELIVERED: `*Order Delivered* :white_check_mark:\n*Order ID:* ${orderId}`,
    ORDER_CANCELLED: `*Order Cancelled* :x:\n*Order ID:* ${orderId}`,
  };

  const text = eventMessages[event] ?? `*Order Event:* ${event}\n*Order ID:* ${orderId}`;

  await fetch(env.SLACK_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  }).catch(() => {});
}

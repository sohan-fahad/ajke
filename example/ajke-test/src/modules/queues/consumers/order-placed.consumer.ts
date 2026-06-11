import type { OrderQueuePayload } from "../queue.types";

export async function processOrderPlacedBatch(
  batch: MessageBatch<OrderQueuePayload>,
  env: CloudflareBindings,
): Promise<void> {
  for (const msg of batch.messages) {
    try {
      const payload = msg.body;
      await notifyOrderPlaced(payload, env);
      msg.ack();
    } catch {
      msg.retry();
    }
  }
}

async function notifyOrderPlaced(
  payload: OrderQueuePayload,
  env: CloudflareBindings,
): Promise<void> {
  const { orderId, customerEmail, customerPhone, totalAmount } = payload;
  const trackingUrl = `${env.WEB_ORDER_TRACKING_BASE_URL ?? ""}/${orderId}`;

  const promises: Promise<unknown>[] = [];

  if (customerEmail && env.MAIL_FROM) {
    promises.push(
      fetch("https://api.mailchannels.net/tx/v1/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: customerEmail }] }],
          from: { email: env.MAIL_FROM },
          subject: "Order Confirmation",
          content: [
            {
              type: "text/html",
              value: `<p>Your order <strong>${orderId}</strong> has been placed for <strong>${totalAmount}</strong>.</p><p><a href="${trackingUrl}">Track your order</a></p>`,
            },
          ],
        }),
      }).catch(() => {}),
    );
  }

  if (env.SLACK_WEBHOOK_URL) {
    promises.push(
      fetch(env.SLACK_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: `*New Order Placed* :shopping_cart:\n*Order ID:* ${orderId}\n*Amount:* ${totalAmount}\n*Track:* ${trackingUrl}`,
        }),
      }).catch(() => {}),
    );
  }

  if (customerPhone && env.SMS_API_KEY) {
    promises.push(
      fetch("https://api.sms.net.bd/sendsms", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          api_key: env.SMS_API_KEY,
          msg: `Your order ${orderId} has been placed. Thank you!`,
          to: customerPhone,
        }).toString(),
      }).catch(() => {}),
    );
  }

  await Promise.all(promises);
}

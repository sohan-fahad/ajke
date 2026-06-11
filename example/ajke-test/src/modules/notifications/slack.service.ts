import { Injectable } from "@ajke/core";
import type { Context } from "hono";

@Injectable()
export class SlackService {
  async sendMessage(text: string, c: Context): Promise<boolean> {
    const webhookUrl = c.env.SLACK_WEBHOOK_URL;
    if (!webhookUrl) return false;

    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    return res.ok;
  }

  async sendOrderNotification(
    orderId: string,
    customerName: string,
    amount: number,
    trackingUrl: string,
    c: Context,
  ): Promise<boolean> {
    const text = `*New Order Placed* :shopping_cart:\n*Order ID:* ${orderId}\n*Customer:* ${customerName}\n*Amount:* ${amount}\n*Track:* ${trackingUrl}`;
    return this.sendMessage(text, c);
  }

  async sendOrderStatusUpdate(
    orderId: string,
    status: string,
    c: Context,
  ): Promise<boolean> {
    const text = `*Order Status Update* :package:\n*Order ID:* ${orderId}\n*New Status:* ${status}`;
    return this.sendMessage(text, c);
  }
}

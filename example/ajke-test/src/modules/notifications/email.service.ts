import { Injectable } from "@ajke/core";
import type { Context } from "hono";

@Injectable()
export class EmailService {
  async send(
    to: string | string[],
    subject: string,
    html: string,
    c: Context,
  ): Promise<boolean> {
    const recipients = Array.isArray(to) ? to : [to];
    const from = c.env.MAIL_FROM ?? "noreply@example.com";

    const res = await fetch("https://api.mailchannels.net/tx/v1/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        personalizations: [{ to: recipients.map((email) => ({ email })) }],
        from: { email: from },
        subject,
        content: [{ type: "text/html", value: html }],
      }),
    });

    return res.ok;
  }

  async sendOtp(to: string, otp: number, c: Context): Promise<boolean> {
    const html = `<p>Your OTP is: <strong>${otp}</strong>. It expires in 5 minutes.</p>`;
    return this.send(to, "Your OTP Code", html, c);
  }

  async sendPasswordReset(to: string, otp: number, c: Context): Promise<boolean> {
    const html = `<p>Your password reset OTP is: <strong>${otp}</strong>. It expires in 5 minutes.</p>`;
    return this.send(to, "Password Reset OTP", html, c);
  }

  async sendOrderConfirmation(to: string, orderId: string, trackingUrl: string, c: Context): Promise<boolean> {
    const html = `<p>Your order <strong>${orderId}</strong> has been placed successfully.</p><p><a href="${trackingUrl}">Track your order</a></p>`;
    return this.send(to, "Order Confirmation", html, c);
  }
}

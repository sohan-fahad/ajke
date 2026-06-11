import { Injectable } from "@ajke/core";
import type { Context } from "hono";

@Injectable()
export class SmsService {
  async send(to: string, message: string, c: Context): Promise<boolean> {
    const apiKey = c.env.SMS_API_KEY;
    if (!apiKey) return false;

    const res = await fetch("https://api.sms.net.bd/sendsms", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        api_key: apiKey,
        msg: message,
        to,
      }).toString(),
    });

    return res.ok;
  }

  async sendOtp(to: string, otp: number, c: Context): Promise<boolean> {
    return this.send(to, `Your OTP is: ${otp}. Valid for 5 minutes.`, c);
  }

  async sendOrderConfirmation(to: string, orderId: string, c: Context): Promise<boolean> {
    return this.send(to, `Your order ${orderId} has been placed. Thank you!`, c);
  }
}

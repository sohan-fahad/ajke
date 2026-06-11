import { Injectable } from "@ajke/core";
import type { Context } from "hono";

interface FcmMessage {
  token?: string;
  topic?: string;
  title: string;
  body: string;
  data?: Record<string, string>;
  imageUrl?: string;
}

@Injectable()
export class FcmService {
  private async getAccessToken(serviceAccountJson: string): Promise<string> {
    const sa = JSON.parse(serviceAccountJson);
    const now = Math.floor(Date.now() / 1000);
    const header = { alg: "RS256", typ: "JWT" };
    const payload = {
      iss: sa.client_email,
      scope: "https://www.googleapis.com/auth/firebase.messaging",
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    };

    const enc = (obj: object) =>
      btoa(JSON.stringify(obj)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

    const headerB64 = enc(header);
    const payloadB64 = enc(payload);
    const unsigned = `${headerB64}.${payloadB64}`;

    const keyData = sa.private_key
      .replace(/-----BEGIN PRIVATE KEY-----/g, "")
      .replace(/-----END PRIVATE KEY-----/g, "")
      .replace(/\s+/g, "");

    const binaryKey = Uint8Array.from(atob(keyData), (c) => c.charCodeAt(0));
    const cryptoKey = await crypto.subtle.importKey(
      "pkcs8",
      binaryKey,
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      false,
      ["sign"],
    );

    const signatureBuffer = await crypto.subtle.sign(
      "RSASSA-PKCS1-v1_5",
      cryptoKey,
      new TextEncoder().encode(unsigned),
    );
    const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signatureBuffer)))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    const jwt = `${unsigned}.${signatureB64}`;

    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
    });

    const tokenData = (await tokenRes.json()) as { access_token: string };
    return tokenData.access_token;
  }

  async send(msg: FcmMessage, c: Context): Promise<boolean> {
    const projectId = c.env.FCM_PROJECT_ID;
    const serviceAccount = c.env.FCM_SERVICE_ACCOUNT;
    if (!projectId || !serviceAccount) return false;

    const accessToken = await this.getAccessToken(serviceAccount);
    const notification: Record<string, unknown> = { title: msg.title, body: msg.body };
    if (msg.imageUrl) notification.image = msg.imageUrl;

    const message: Record<string, unknown> = { notification, data: msg.data ?? {} };
    if (msg.token) message.token = msg.token;
    if (msg.topic) message.topic = msg.topic;

    const res = await fetch(
      `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ message }),
      },
    );

    return res.ok;
  }

  async sendToTopic(topic: string, title: string, body: string, data?: Record<string, string>, c?: Context): Promise<boolean> {
    if (!c) return false;
    return this.send({ topic, title, body, data }, c);
  }

  async sendToDevice(token: string, title: string, body: string, data?: Record<string, string>, c?: Context): Promise<boolean> {
    if (!c) return false;
    return this.send({ token, title, body, data }, c);
  }
}

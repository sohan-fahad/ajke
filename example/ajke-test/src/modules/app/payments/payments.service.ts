import { Injectable, NotFoundException } from "@ajke/core";
import type { Context } from "hono";
import { eq, and, desc, like } from "drizzle-orm";
import { getDb } from "@app/database/connection";
import { paymentMethods, paymentLogs } from "./payments.entity";
import { FilterPaymentMethodDTOType } from "./payments.dto";

type DB = ReturnType<typeof getDb>;
type BatchItem = Parameters<DB["batch"]>[0][0];

@Injectable()
export class PaymentsService {
  async findAllMethods(c: Context, query: FilterPaymentMethodDTOType) {
    const db = getDb(c);

    const { page, limit, searchTerm, isActive, organizationId } = query;

    const conds = [];
    if (organizationId) conds.push(eq(paymentMethods.organizationId, organizationId));
    if (searchTerm) conds.push(like(paymentMethods.title, `%${searchTerm}%`));
    if (isActive !== undefined) conds.push(eq(paymentMethods.isActive, isActive));

    let q = db.select().from(paymentMethods).$dynamic();
    if (conds.length) q = q.where(and(...conds));
    return q.orderBy(desc(paymentMethods.createdAt));
  }

  async createMethod(payload: typeof paymentMethods.$inferInsert, c: Context) {
    const db = getDb(c);
    const [pm] = await db.insert(paymentMethods).values(payload).returning();
    return pm!;
  }

  async createMethods(payloads: typeof paymentMethods.$inferInsert[], c: Context) {
    if (!payloads.length) return [];
    const db = getDb(c);
    const batchItems = payloads.map(
      (p) => db.insert(paymentMethods).values(p).returning() as unknown as BatchItem,
    );
    const results = await db.batch(batchItems as [BatchItem, ...BatchItem[]]);
    return (results as unknown as (typeof paymentMethods.$inferSelect)[][]).map((r) => r[0]!);
  }

  async updateMethod(id: string, payload: Partial<typeof paymentMethods.$inferInsert>, c: Context) {
    const db = getDb(c);
    const [updated] = await db
      .update(paymentMethods)
      .set({ ...payload, updatedAt: new Date().toISOString() })
      .where(eq(paymentMethods.id, id))
      .returning();
    if (!updated) throw new NotFoundException("Payment method not found");
    return updated;
  }

  async deleteMethod(id: string, c: Context) {
    const db = getDb(c);
    await db.delete(paymentMethods).where(eq(paymentMethods.id, id));
    return { message: "Payment method deleted" };
  }

  async findAllLogs(query: { organizationId?: string; orderId?: string }, c: Context) {
    const db = getDb(c);
    let q = db.select().from(paymentLogs).$dynamic();
    const conds = [];
    if (query.organizationId) conds.push(eq(paymentLogs.organizationId, query.organizationId));
    if (query.orderId) conds.push(eq(paymentLogs.orderId, query.orderId));
    if (conds.length) q = q.where(and(...conds));
    return q.orderBy(desc(paymentLogs.createdAt));
  }

  async createLog(payload: typeof paymentLogs.$inferInsert, c: Context) {
    const db = getDb(c);
    const [log] = await db.insert(paymentLogs).values(payload).returning();
    return log!;
  }

  async createLogs(payloads: typeof paymentLogs.$inferInsert[], c: Context) {
    if (!payloads.length) return [];
    const db = getDb(c);
    const batchItems = payloads.map(
      (p) => db.insert(paymentLogs).values(p).returning() as unknown as BatchItem,
    );
    const results = await db.batch(batchItems as [BatchItem, ...BatchItem[]]);
    return (results as unknown as (typeof paymentLogs.$inferSelect)[][]).map((r) => r[0]!);
  }

  async initiateSSLPayment(orderId: string, amount: number, c: Context) {
    const storeId = c.env.SSL_STORE_ID;
    const storePassword = c.env.SSL_STORE_PASSWORD;
    if (!storeId || !storePassword) throw new NotFoundException("Payment gateway not configured");

    const params = new URLSearchParams({
      store_id: storeId,
      store_passwd: storePassword,
      total_amount: amount.toString(),
      currency: "BDT",
      tran_id: `${orderId}-${Date.now()}`,
      success_url: `${c.req.url.split("/v1")[0]}/v1/payments/ssl/success`,
      fail_url: `${c.req.url.split("/v1")[0]}/v1/payments/ssl/fail`,
      cancel_url: `${c.req.url.split("/v1")[0]}/v1/payments/ssl/cancel`,
      ipn_url: `${c.req.url.split("/v1")[0]}/v1/payments/ssl/ipn`,
    });

    const res = await fetch("https://sandbox.sslcommerz.com/gwprocess/v4/api.php", {
      method: "POST",
      body: params,
    });

    return res.json();
  }
}

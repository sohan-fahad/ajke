import { Injectable, NotFoundException } from "@ajke/core";
import type { Context } from "hono";
import { eq, and, desc } from "drizzle-orm";
import { getDb } from "@app/database/connection";
import { transactions } from "./transactions.entity";

@Injectable()
export class TransactionsService {
  async findAll(query: { workspaceId?: string; deliverymanId?: string; orderId?: string; userId?: string }, c: Context) {
    const db = getDb(c);
    let q = db.select().from(transactions).$dynamic();
    const conds = [];
    if (query.workspaceId) conds.push(eq(transactions.workspaceId, query.workspaceId));
    if (query.deliverymanId) conds.push(eq(transactions.deliverymanId, query.deliverymanId));
    if (query.orderId) conds.push(eq(transactions.orderId, query.orderId));
    if (query.userId) conds.push(eq(transactions.userId, query.userId));
    if (conds.length) q = q.where(and(...conds));
    return q.orderBy(desc(transactions.createdAt));
  }

  async findOne(id: string, c: Context) {
    const db = getDb(c);
    const [t] = await db.select().from(transactions).where(eq(transactions.id, id)).limit(1);
    if (!t) throw new NotFoundException("Transaction not found");
    return t;
  }

  async create(payload: typeof transactions.$inferInsert, c: Context) {
    const db = getDb(c);
    const [t] = await db.insert(transactions).values(payload).returning();
    return t;
  }

  async updateStatus(id: string, status: string, c: Context) {
    const db = getDb(c);
    const [updated] = await db.update(transactions).set({ status, updatedAt: new Date().toISOString() }).where(eq(transactions.id, id)).returning();
    if (!updated) throw new NotFoundException("Transaction not found");
    return updated;
  }
}

import { Injectable, NotFoundException } from "@ajke/core";
import type { Context } from "hono";
import { eq, and, desc } from "drizzle-orm";
import { getDb } from "@app/database/connection";
import { cms } from "./cms.entity";
import { ENUM_CMS_TYPE } from "../../../shared";

type DB = ReturnType<typeof getDb>;
type BatchItem = Parameters<DB["batch"]>[0][0];

@Injectable()
export class CmsService {
  async findAll(query: { type?: string; organizationId?: string; isActive?: string }, c: Context) {
    const db = getDb(c);
    let q = db.select().from(cms).$dynamic();
    const conds = [];
    if (query.type) conds.push(eq(cms.type, query.type));
    if (query.organizationId) conds.push(eq(cms.organizationId, query.organizationId));
    if (query.isActive !== undefined) conds.push(eq(cms.isActive, query.isActive === "true"));
    if (conds.length) q = q.where(and(...conds));
    return q.orderBy(desc(cms.createdAt));
  }

  async findOne(id: string, c: Context) {
    const db = getDb(c);
    const [item] = await db.select().from(cms).where(eq(cms.id, id)).limit(1);
    if (!item) throw new NotFoundException("CMS item not found");
    return item;
  }

  async create(payload: Omit<typeof cms.$inferInsert, "type"> & { type?: string }, c: Context) {
    const db = getDb(c);
    const [item] = await db
      .insert(cms)
      .values({ ...payload, type: payload.type ?? ENUM_CMS_TYPE.BANNER })
      .returning();
    return item;
  }

  async createMany(payloads: typeof cms.$inferInsert[], c: Context) {
    if (!payloads.length) return [];
    const db = getDb(c);
    const batchItems = payloads.map(
      (p) => db.insert(cms).values(p).returning() as unknown as BatchItem,
    );
    const results = await db.batch(batchItems as [BatchItem, ...BatchItem[]]);
    return (results as unknown as (typeof cms.$inferSelect)[][]).map((r) => r[0]!);
  }

  async update(id: string, payload: Partial<typeof cms.$inferInsert>, c: Context) {
    const db = getDb(c);
    const [updated] = await db
      .update(cms)
      .set({ ...payload, updatedAt: new Date().toISOString() })
      .where(eq(cms.id, id))
      .returning();
    if (!updated) throw new NotFoundException("CMS item not found");
    return updated;
  }

  async remove(id: string, c: Context) {
    const db = getDb(c);
    await db.delete(cms).where(eq(cms.id, id));
    return { message: "Deleted" };
  }
}

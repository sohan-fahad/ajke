import { Injectable, NotFoundException } from "@ajke/core";
import type { Context } from "hono";
import { eq } from "drizzle-orm";
import { getDb } from "@app/database/connection";
import { businessConfigs } from "./business.entity";
import type { CreateBusinessConfigDTOType, UpdateBusinessConfigDTOType } from "./business.dto";

@Injectable()
export class BusinessService {
  async findAll(c: Context) {
    const db = getDb(c);
    return db.select().from(businessConfigs);
  }

  async findOne(id: string, c: Context) {
    const db = getDb(c);
    const [config] = await db
      .select()
      .from(businessConfigs)
      .where(eq(businessConfigs.id, id))
      .limit(1);
    if (!config) throw new NotFoundException("Business config not found");
    return config;
  }

  async findByOrganizationId(organizationId: string, c: Context) {
    const db = getDb(c);
    const [config] = await db
      .select()
      .from(businessConfigs)
      .where(eq(businessConfigs.organizationId, organizationId))
      .limit(1);
    return config ?? null;
  }

  async create(payload: CreateBusinessConfigDTOType, c: Context) {
    const db = getDb(c);
    const [created] = await db.insert(businessConfigs).values(payload).returning();
    return created;
  }

  async update(id: string, payload: UpdateBusinessConfigDTOType, c: Context) {
    const db = getDb(c);
    const [updated] = await db
      .update(businessConfigs)
      .set({ ...payload, updatedAt: new Date().toISOString() })
      .where(eq(businessConfigs.id, id))
      .returning();
    if (!updated) throw new NotFoundException("Business config not found");
    return updated;
  }

  async remove(id: string, c: Context) {
    const db = getDb(c);
    const [deleted] = await db
      .delete(businessConfigs)
      .where(eq(businessConfigs.id, id))
      .returning();
    if (!deleted) throw new NotFoundException("Business config not found");
    return { message: "Deleted" };
  }

  async upsert(payload: { deliveryCharge?: number; organizationId?: string }, c: Context) {
    const db = getDb(c);
    const existing = payload.organizationId
      ? (await db.select().from(businessConfigs).where(eq(businessConfigs.organizationId, payload.organizationId)).limit(1))[0]
      : (await db.select().from(businessConfigs).limit(1))[0];

    if (existing) {
      const [updated] = await db
        .update(businessConfigs)
        .set({ ...payload, updatedAt: new Date().toISOString() })
        .where(eq(businessConfigs.id, existing.id))
        .returning();
      return updated;
    }

    const [created] = await db.insert(businessConfigs).values(payload).returning();
    return created;
  }
}

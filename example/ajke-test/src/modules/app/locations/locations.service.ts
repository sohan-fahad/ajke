import { Injectable, NotFoundException } from "@ajke/core";
import type { Context } from "hono";
import { eq, and, desc } from "drizzle-orm";
import { getDb } from "@app/database/connection";
import { cities, zones, areas, warehouses, addresses } from "./locations.entity";

type DB = ReturnType<typeof getDb>;
type BatchItem = Parameters<DB["batch"]>[0][0];

@Injectable()
export class LocationsService {
  async findAllCities(query: { organizationId?: string }, c: Context) {
    const db = getDb(c);
    let q = db.select().from(cities).$dynamic();
    if (query.organizationId) q = q.where(eq(cities.organizationId, query.organizationId));
    return q.orderBy(desc(cities.createdAt));
  }

  async createCity(payload: typeof cities.$inferInsert, c: Context) {
    const db = getDb(c);
    const [city] = await db.insert(cities).values(payload).returning();
    return city!;
  }

  async createCities(payloads: typeof cities.$inferInsert[], c: Context) {
    if (!payloads.length) return [];
    const db = getDb(c);
    const batchItems = payloads.map(
      (p) => db.insert(cities).values(p).returning() as unknown as BatchItem,
    );
    const results = await db.batch(batchItems as [BatchItem, ...BatchItem[]]);
    return (results as unknown as (typeof cities.$inferSelect)[][]).map((r) => r[0]!);
  }

  async updateCity(id: string, payload: Partial<typeof cities.$inferInsert>, c: Context) {
    const db = getDb(c);
    const [updated] = await db
      .update(cities)
      .set({ ...payload, updatedAt: new Date().toISOString() })
      .where(eq(cities.id, id))
      .returning();
    if (!updated) throw new NotFoundException("City not found");
    return updated;
  }

  async deleteCity(id: string, c: Context) {
    const db = getDb(c);
    await db.delete(cities).where(eq(cities.id, id));
    return { message: "City deleted" };
  }

  async findAllZones(query: { organizationId?: string; cityId?: string }, c: Context) {
    const db = getDb(c);
    let q = db.select().from(zones).$dynamic();
    const conds = [];
    if (query.organizationId) conds.push(eq(zones.organizationId, query.organizationId));
    if (query.cityId) conds.push(eq(zones.cityId, query.cityId));
    if (conds.length) q = q.where(and(...conds));
    return q.orderBy(desc(zones.createdAt));
  }

  async createZone(payload: typeof zones.$inferInsert, c: Context) {
    const db = getDb(c);
    const [zone] = await db.insert(zones).values(payload).returning();
    return zone!;
  }

  async createZones(payloads: typeof zones.$inferInsert[], c: Context) {
    if (!payloads.length) return [];
    const db = getDb(c);
    const batchItems = payloads.map(
      (p) => db.insert(zones).values(p).returning() as unknown as BatchItem,
    );
    const results = await db.batch(batchItems as [BatchItem, ...BatchItem[]]);
    return (results as unknown as (typeof zones.$inferSelect)[][]).map((r) => r[0]!);
  }

  async updateZone(id: string, payload: Partial<typeof zones.$inferInsert>, c: Context) {
    const db = getDb(c);
    const [updated] = await db
      .update(zones)
      .set({ ...payload, updatedAt: new Date().toISOString() })
      .where(eq(zones.id, id))
      .returning();
    if (!updated) throw new NotFoundException("Zone not found");
    return updated;
  }

  async deleteZone(id: string, c: Context) {
    const db = getDb(c);
    await db.delete(zones).where(eq(zones.id, id));
    return { message: "Zone deleted" };
  }

  async findAllAreas(query: { organizationId?: string; cityId?: string; zoneId?: string }, c: Context) {
    const db = getDb(c);
    let q = db.select().from(areas).$dynamic();
    const conds = [];
    if (query.organizationId) conds.push(eq(areas.organizationId, query.organizationId));
    if (query.cityId) conds.push(eq(areas.cityId, query.cityId));
    if (query.zoneId) conds.push(eq(areas.zoneId, query.zoneId));
    if (conds.length) q = q.where(and(...conds));
    return q.orderBy(desc(areas.createdAt));
  }

  async createArea(payload: typeof areas.$inferInsert, c: Context) {
    const db = getDb(c);
    const [area] = await db.insert(areas).values(payload).returning();
    return area!;
  }

  async createAreas(payloads: typeof areas.$inferInsert[], c: Context) {
    if (!payloads.length) return [];
    const db = getDb(c);
    const batchItems = payloads.map(
      (p) => db.insert(areas).values(p).returning() as unknown as BatchItem,
    );
    const results = await db.batch(batchItems as [BatchItem, ...BatchItem[]]);
    return (results as unknown as (typeof areas.$inferSelect)[][]).map((r) => r[0]!);
  }

  async updateArea(id: string, payload: Partial<typeof areas.$inferInsert>, c: Context) {
    const db = getDb(c);
    const [updated] = await db
      .update(areas)
      .set({ ...payload, updatedAt: new Date().toISOString() })
      .where(eq(areas.id, id))
      .returning();
    if (!updated) throw new NotFoundException("Area not found");
    return updated;
  }

  async deleteArea(id: string, c: Context) {
    const db = getDb(c);
    await db.delete(areas).where(eq(areas.id, id));
    return { message: "Area deleted" };
  }

  async findAllWarehouses(query: { organizationId?: string }, c: Context) {
    const db = getDb(c);
    let q = db.select().from(warehouses).$dynamic();
    if (query.organizationId) q = q.where(eq(warehouses.organizationId, query.organizationId));
    return q.orderBy(desc(warehouses.createdAt));
  }

  async createWarehouse(payload: typeof warehouses.$inferInsert, c: Context) {
    const db = getDb(c);
    const [wh] = await db.insert(warehouses).values(payload).returning();
    return wh!;
  }

  async findMyAddresses(userId: string, organizationId: string | undefined, c: Context) {
    const db = getDb(c);
    const conds = [eq(addresses.userId, userId)];
    if (organizationId) conds.push(eq(addresses.organizationId, organizationId));
    return db.select().from(addresses).where(and(...conds)).orderBy(desc(addresses.createdAt));
  }

  async createAddress(payload: typeof addresses.$inferInsert, c: Context) {
    const db = getDb(c);
    const [addr] = await db.insert(addresses).values(payload).returning();
    return addr!;
  }

  async createAddresses(payloads: typeof addresses.$inferInsert[], c: Context) {
    if (!payloads.length) return [];
    const db = getDb(c);
    const batchItems = payloads.map(
      (p) => db.insert(addresses).values(p).returning() as unknown as BatchItem,
    );
    const results = await db.batch(batchItems as [BatchItem, ...BatchItem[]]);
    return (results as unknown as (typeof addresses.$inferSelect)[][]).map((r) => r[0]!);
  }

  async updateAddress(id: string, payload: Partial<typeof addresses.$inferInsert>, c: Context) {
    const db = getDb(c);
    const [updated] = await db
      .update(addresses)
      .set({ ...payload, updatedAt: new Date().toISOString() })
      .where(eq(addresses.id, id))
      .returning();
    if (!updated) throw new NotFoundException("Address not found");
    return updated;
  }

  async deleteAddress(id: string, c: Context) {
    const db = getDb(c);
    await db.delete(addresses).where(eq(addresses.id, id));
    return { message: "Address deleted" };
  }
}

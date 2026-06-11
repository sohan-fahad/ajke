import { Injectable, NotFoundException } from "@ajke/core";
import type { Context } from "hono";
import { eq, and, desc } from "drizzle-orm";
import { getDb } from "@app/database/connection";
import { discounts, coupons } from "./offers.entity";

type DB = ReturnType<typeof getDb>;
type BatchItem = Parameters<DB["batch"]>[0][0];

@Injectable()
export class OffersService {
  async findAllDiscounts(query: { organizationId?: string }, c: Context) {
    const db = getDb(c);
    let q = db.select().from(discounts).$dynamic();
    if (query.organizationId) q = q.where(eq(discounts.organizationId, query.organizationId));
    return q.orderBy(desc(discounts.createdAt));
  }

  async createDiscount(payload: typeof discounts.$inferInsert, c: Context) {
    const db = getDb(c);
    const [d] = await db.insert(discounts).values(payload).returning();
    return d!;
  }

  async createDiscounts(payloads: typeof discounts.$inferInsert[], c: Context) {
    if (!payloads.length) return [];
    const db = getDb(c);
    const batchItems = payloads.map(
      (p) => db.insert(discounts).values(p).returning() as unknown as BatchItem,
    );
    const results = await db.batch(batchItems as [BatchItem, ...BatchItem[]]);
    return (results as unknown as (typeof discounts.$inferSelect)[][]).map((r) => r[0]!);
  }

  async updateDiscount(id: string, payload: Partial<typeof discounts.$inferInsert>, c: Context) {
    const db = getDb(c);
    const [updated] = await db
      .update(discounts)
      .set({ ...payload, updatedAt: new Date().toISOString() })
      .where(eq(discounts.id, id))
      .returning();
    if (!updated) throw new NotFoundException("Discount not found");
    return updated;
  }

  async deleteDiscount(id: string, c: Context) {
    const db = getDb(c);
    await db.delete(discounts).where(eq(discounts.id, id));
    return { message: "Discount deleted" };
  }

  async findAllCoupons(query: { organizationId?: string }, c: Context) {
    const db = getDb(c);
    let q = db.select().from(coupons).$dynamic();
    if (query.organizationId) q = q.where(eq(coupons.organizationId, query.organizationId));
    return q.orderBy(desc(coupons.createdAt));
  }

  async createCoupon(payload: typeof coupons.$inferInsert, c: Context) {
    const db = getDb(c);
    const [coupon] = await db.insert(coupons).values(payload).returning();
    return coupon!;
  }

  async createCoupons(payloads: typeof coupons.$inferInsert[], c: Context) {
    if (!payloads.length) return [];
    const db = getDb(c);
    const batchItems = payloads.map(
      (p) => db.insert(coupons).values(p).returning() as unknown as BatchItem,
    );
    const results = await db.batch(batchItems as [BatchItem, ...BatchItem[]]);
    return (results as unknown as (typeof coupons.$inferSelect)[][]).map((r) => r[0]!);
  }

  async updateCoupon(id: string, payload: Partial<typeof coupons.$inferInsert>, c: Context) {
    const db = getDb(c);
    const [updated] = await db
      .update(coupons)
      .set({ ...payload, updatedAt: new Date().toISOString() })
      .where(eq(coupons.id, id))
      .returning();
    if (!updated) throw new NotFoundException("Coupon not found");
    return updated;
  }

  async deleteCoupon(id: string, c: Context) {
    const db = getDb(c);
    await db.delete(coupons).where(eq(coupons.id, id));
    return { message: "Coupon deleted" };
  }

  async validateCoupon(code: string, organizationId: string | undefined, orderTotal: number, c: Context) {
    const db = getDb(c);
    const now = new Date().toISOString();
    const conds = [eq(coupons.code, code)];
    if (organizationId) conds.push(eq(coupons.organizationId, organizationId));
    const [coupon] = await db.select().from(coupons).where(and(...conds)).limit(1);

    if (!coupon) throw new NotFoundException("Coupon not found");
    if (!coupon.isActive) throw new NotFoundException("Coupon is not active");
    if (coupon.validFrom && coupon.validFrom > now) throw new NotFoundException("Coupon not yet valid");
    if (coupon.validTill && coupon.validTill < now) throw new NotFoundException("Coupon has expired");
    if (coupon.minOrderAmount && orderTotal < coupon.minOrderAmount) {
      throw new NotFoundException(`Minimum order amount is ${coupon.minOrderAmount}`);
    }

    let discountAmount = 0;
    if (coupon.discountType === "FIXED_AMOUNT") {
      discountAmount = coupon.discount || 0;
    } else {
      discountAmount = (orderTotal * (coupon.discountPercentage || 0)) / 100;
      if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
        discountAmount = coupon.maxDiscountAmount;
      }
    }

    return { coupon, discountAmount };
  }
}

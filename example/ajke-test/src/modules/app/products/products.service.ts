import { Injectable, NotFoundException } from "@ajke/core";
import type { Context } from "hono";
import { eq, and, desc, like, or } from "drizzle-orm";
import { getDb } from "@app/database/connection";
import {
  products,
  variants,
  variantOptions,
  productVariantOptions,
  productImages,
  productStats,
  productRatings,
  productZoneMappings,
} from "./products.entity";
import { ulid } from "ulid";

type DB = ReturnType<typeof getDb>;
type BatchItem = Parameters<DB["batch"]>[0][0];

@Injectable()
export class ProductsService {
  async findAll(
    query: {
      organizationId?: string;
      search?: string;
      status?: string;
      categoryId?: string;
      brandId?: string;
      page?: number;
      limit?: number;
    },
    c: Context,
  ) {
    const db = getDb(c);
    const page = query.page || 1;
    const limit = query.limit || 20;
    const offset = (page - 1) * limit;

    let q = db.select().from(products).$dynamic();
    const conds = [];
    if (query.organizationId) conds.push(eq(products.organizationId, query.organizationId));
    if (query.status) conds.push(eq(products.status, query.status));
    if (query.categoryId) conds.push(eq(products.categoryId, query.categoryId));
    if (query.brandId) conds.push(eq(products.brandId, query.brandId));
    if (query.search) {
      conds.push(or(like(products.title, `%${query.search}%`), like(products.code, `%${query.search}%`))!);
    }
    if (conds.length) q = q.where(and(...conds));
    return q.orderBy(desc(products.createdAt)).limit(limit).offset(offset);
  }

  async findOne(id: string, c: Context) {
    const db = getDb(c);
    const [product] = await db.select().from(products).where(eq(products.id, id)).limit(1);
    if (!product) throw new NotFoundException("Product not found");

    const [images, stats, productVariants] = await Promise.all([
      db.select().from(productImages).where(eq(productImages.productId, id)),
      db.select().from(productStats).where(eq(productStats.productId, id)).limit(1),
      db.select().from(productVariantOptions).where(eq(productVariantOptions.productId, id)),
    ]);

    return { ...product, images, stats: stats[0] || null, variants: productVariants };
  }

  async create(payload: typeof products.$inferInsert, c: Context) {
    const db = getDb(c);
    const productId = ulid();

    await db.batch([
      db.insert(products).values({ id: productId, ...payload }) as unknown as BatchItem,
      db.insert(productStats).values({ productId, organizationId: payload.organizationId }) as unknown as BatchItem,
    ]);

    return this.findOne(productId, c);
  }

  async createMany(payloads: typeof products.$inferInsert[], c: Context) {
    if (!payloads.length) return [];
    const db = getDb(c);

    const rows = payloads.map((p) => ({ id: ulid(), ...p }));
    const statsRows = rows.map((r) => ({ productId: r.id, organizationId: r.organizationId }));

    const batchItems: BatchItem[] = [
      ...rows.map((r) => db.insert(products).values(r) as unknown as BatchItem),
      ...statsRows.map((s) => db.insert(productStats).values(s) as unknown as BatchItem),
    ];

    await db.batch(batchItems as [BatchItem, ...BatchItem[]]);

    return rows;
  }

  async update(id: string, payload: Partial<typeof products.$inferInsert>, c: Context) {
    const db = getDb(c);
    const [updated] = await db
      .update(products)
      .set({ ...payload, updatedAt: new Date().toISOString() })
      .where(eq(products.id, id))
      .returning();
    if (!updated) throw new NotFoundException("Product not found");
    return updated;
  }

  async delete(id: string, c: Context) {
    const db = getDb(c);
    await db
      .update(products)
      .set({ deletedAt: new Date().toISOString(), isActive: false })
      .where(eq(products.id, id));
    return { message: "Product deleted" };
  }

  async addImage(
    productId: string,
    payload: { link: string; isThumb?: boolean; orderPriority?: number; organizationId?: string },
    c: Context,
  ) {
    const db = getDb(c);
    const [img] = await db.insert(productImages).values({ ...payload, productId }).returning();
    return img!;
  }

  async deleteImage(imageId: string, c: Context) {
    const db = getDb(c);
    await db.delete(productImages).where(eq(productImages.id, imageId));
    return { message: "Image deleted" };
  }

  async findAllVariants(c: Context) {
    const db = getDb(c);
    return db.select().from(variants).orderBy(variants.orderPriority);
  }

  async createVariant(payload: typeof variants.$inferInsert, c: Context) {
    const db = getDb(c);
    const [v] = await db.insert(variants).values(payload).returning();
    return v!;
  }

  async findAllVariantOptions(variantId: string, c: Context) {
    const db = getDb(c);
    return db
      .select()
      .from(variantOptions)
      .where(eq(variantOptions.variantId, variantId))
      .orderBy(variantOptions.orderPriority);
  }

  async createVariantOption(payload: typeof variantOptions.$inferInsert, c: Context) {
    const db = getDb(c);
    const [vo] = await db.insert(variantOptions).values(payload).returning();
    return vo!;
  }

  async addProductVariantOption(payload: typeof productVariantOptions.$inferInsert, c: Context) {
    const db = getDb(c);
    const [pvo] = await db.insert(productVariantOptions).values(payload).returning();
    return pvo!;
  }

  async createRating(payload: typeof productRatings.$inferInsert, c: Context) {
    const db = getDb(c);
    const [rating] = await db.insert(productRatings).values(payload).returning();
    return rating!;
  }

  async findProductZoneMappings(
    query: { organizationId?: string; productId?: string; zoneId?: string },
    c: Context,
  ) {
    const db = getDb(c);
    let q = db.select().from(productZoneMappings).$dynamic();
    const conds = [];
    if (query.organizationId) conds.push(eq(productZoneMappings.organizationId, query.organizationId));
    if (query.productId) conds.push(eq(productZoneMappings.productId, query.productId));
    if (query.zoneId) conds.push(eq(productZoneMappings.zoneId, query.zoneId));
    if (conds.length) q = q.where(and(...conds));
    return q;
  }

  async createProductZoneMapping(payload: typeof productZoneMappings.$inferInsert, c: Context) {
    const db = getDb(c);
    const [pzm] = await db.insert(productZoneMappings).values(payload).returning();
    return pzm!;
  }

  async updateProductZoneMapping(
    id: string,
    payload: Partial<typeof productZoneMappings.$inferInsert>,
    c: Context,
  ) {
    const db = getDb(c);
    const [updated] = await db
      .update(productZoneMappings)
      .set({ ...payload, updatedAt: new Date().toISOString() })
      .where(eq(productZoneMappings.id, id))
      .returning();
    if (!updated) throw new NotFoundException("Product zone mapping not found");
    return updated;
  }
}

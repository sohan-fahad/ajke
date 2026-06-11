import { Injectable, NotFoundException } from "@ajke/core";
import type { Context } from "hono";
import { eq, and, desc } from "drizzle-orm";
import { getDb } from "@app/database/connection";
import { notifications, testimonials, feedbacks, newsLetterSubscriptions } from "./commons.entity";

type DB = ReturnType<typeof getDb>;
type BatchItem = Parameters<DB["batch"]>[0][0];

@Injectable()
export class CommonsService {
  // --- Notifications ---
  async findAllNotifications(query: { organizationId?: string }, c: Context) {
    const db = getDb(c);
    let q = db.select().from(notifications).$dynamic();
    if (query.organizationId) q = q.where(eq(notifications.organizationId, query.organizationId));
    return q.orderBy(desc(notifications.createdAt));
  }

  async createNotification(payload: typeof notifications.$inferInsert, c: Context) {
    const db = getDb(c);
    const [item] = await db.insert(notifications).values(payload).returning();
    return item;
  }

  async createNotifications(payloads: typeof notifications.$inferInsert[], c: Context) {
    if (!payloads.length) return [];
    const db = getDb(c);
    const batchItems = payloads.map(
      (p) => db.insert(notifications).values(p).returning() as unknown as BatchItem,
    );
    const results = await db.batch(batchItems as [BatchItem, ...BatchItem[]]);
    return (results as unknown as (typeof notifications.$inferSelect)[][]).map((r) => r[0]!);
  }

  async updateNotification(id: string, payload: Partial<typeof notifications.$inferInsert>, c: Context) {
    const db = getDb(c);
    const [updated] = await db
      .update(notifications)
      .set({ ...payload, updatedAt: new Date().toISOString() })
      .where(eq(notifications.id, id))
      .returning();
    if (!updated) throw new NotFoundException("Notification not found");
    return updated;
  }

  async removeNotification(id: string, c: Context) {
    const db = getDb(c);
    await db.delete(notifications).where(eq(notifications.id, id));
    return { message: "Deleted" };
  }

  // --- Testimonials ---
  async findAllTestimonials(query: { organizationId?: string; isActive?: string }, c: Context) {
    const db = getDb(c);
    let q = db.select().from(testimonials).$dynamic();
    const conds = [];
    if (query.organizationId) conds.push(eq(testimonials.organizationId, query.organizationId));
    if (query.isActive !== undefined) conds.push(eq(testimonials.isActive, query.isActive === "true"));
    if (conds.length) q = q.where(and(...conds));
    return q.orderBy(desc(testimonials.createdAt));
  }

  async createTestimonial(payload: typeof testimonials.$inferInsert, c: Context) {
    const db = getDb(c);
    const [item] = await db.insert(testimonials).values(payload).returning();
    return item;
  }

  async createTestimonials(payloads: typeof testimonials.$inferInsert[], c: Context) {
    if (!payloads.length) return [];
    const db = getDb(c);
    const batchItems = payloads.map(
      (p) => db.insert(testimonials).values(p).returning() as unknown as BatchItem,
    );
    const results = await db.batch(batchItems as [BatchItem, ...BatchItem[]]);
    return (results as unknown as (typeof testimonials.$inferSelect)[][]).map((r) => r[0]!);
  }

  async updateTestimonial(id: string, payload: Partial<typeof testimonials.$inferInsert>, c: Context) {
    const db = getDb(c);
    const [updated] = await db
      .update(testimonials)
      .set({ ...payload, updatedAt: new Date().toISOString() })
      .where(eq(testimonials.id, id))
      .returning();
    if (!updated) throw new NotFoundException("Testimonial not found");
    return updated;
  }

  async removeTestimonial(id: string, c: Context) {
    const db = getDb(c);
    await db.delete(testimonials).where(eq(testimonials.id, id));
    return { message: "Deleted" };
  }

  // --- Feedbacks ---
  async findAllFeedbacks(query: { organizationId?: string; tag?: string; status?: string }, c: Context) {
    const db = getDb(c);
    let q = db.select().from(feedbacks).$dynamic();
    const conds = [];
    if (query.organizationId) conds.push(eq(feedbacks.organizationId, query.organizationId));
    if (query.tag) conds.push(eq(feedbacks.tag, query.tag));
    if (query.status) conds.push(eq(feedbacks.status, query.status));
    if (conds.length) q = q.where(and(...conds));
    return q.orderBy(desc(feedbacks.createdAt));
  }

  async submitFeedback(payload: typeof feedbacks.$inferInsert, c: Context) {
    const db = getDb(c);
    const [item] = await db.insert(feedbacks).values(payload).returning();
    return item;
  }

  async submitFeedbacks(payloads: typeof feedbacks.$inferInsert[], c: Context) {
    if (!payloads.length) return [];
    const db = getDb(c);
    const batchItems = payloads.map(
      (p) => db.insert(feedbacks).values(p).returning() as unknown as BatchItem,
    );
    const results = await db.batch(batchItems as [BatchItem, ...BatchItem[]]);
    return (results as unknown as (typeof feedbacks.$inferSelect)[][]).map((r) => r[0]!);
  }

  async updateFeedback(id: string, payload: Partial<typeof feedbacks.$inferInsert>, c: Context) {
    const db = getDb(c);
    const [updated] = await db
      .update(feedbacks)
      .set({ ...payload, updatedAt: new Date().toISOString() })
      .where(eq(feedbacks.id, id))
      .returning();
    if (!updated) throw new NotFoundException("Feedback not found");
    return updated;
  }

  // --- Newsletter ---
  async subscribe(email: string, organizationId: string | undefined, c: Context) {
    const db = getDb(c);
    const conds = [eq(newsLetterSubscriptions.email, email)];
    if (organizationId) conds.push(eq(newsLetterSubscriptions.organizationId, organizationId));
    const [existing] = await db.select().from(newsLetterSubscriptions).where(and(...conds)).limit(1);
    if (existing) return existing;
    const [item] = await db.insert(newsLetterSubscriptions).values({ email, organizationId }).returning();
    return item;
  }

  async findAllSubscribers(query: { organizationId?: string }, c: Context) {
    const db = getDb(c);
    let q = db.select().from(newsLetterSubscriptions).$dynamic();
    if (query.organizationId) q = q.where(eq(newsLetterSubscriptions.organizationId, query.organizationId));
    return q.orderBy(desc(newsLetterSubscriptions.createdAt));
  }
}

import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { ulid } from "ulid";
import { organizations } from "../organizations/organization.entity";

export const notifications = sqliteTable("notifications", {
  id: text("id").primaryKey().$defaultFn(() => ulid()),
  text: text("text").notNull(),
  navigateTo: text("navigate_to"),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  organizationId: text("organization_id").references(() => organizations.id),
  createdBy: text("created_by"),
  updatedBy: text("updated_by"),
  deletedBy: text("deleted_by"),
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at"),
  deletedAt: text("deleted_at"),
});

export const testimonials = sqliteTable("testimonials", {
  id: text("id").primaryKey().$defaultFn(() => ulid()),
  customerName: text("customer_name").notNull(),
  customerDesignation: text("customer_designation"),
  customerImage: text("customer_image"),
  testimonial: text("testimonial").notNull(),
  rating: real("rating").default(0),
  orderPriority: integer("order_priority").default(0),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  organizationId: text("organization_id").references(() => organizations.id),
  createdBy: text("created_by"),
  updatedBy: text("updated_by"),
  deletedBy: text("deleted_by"),
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at"),
  deletedAt: text("deleted_at"),
});

export const feedbacks = sqliteTable("feedbacks", {
  id: text("id").primaryKey().$defaultFn(() => ulid()),
  name: text("name"),
  email: text("email"),
  phoneNumber: text("phone_number"),
  feedback: text("feedback").notNull(),
  tag: text("tag").default("OTHER"),
  status: text("status").default("PENDING"),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  organizationId: text("organization_id").references(() => organizations.id),
  createdBy: text("created_by"),
  updatedBy: text("updated_by"),
  deletedBy: text("deleted_by"),
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at"),
  deletedAt: text("deleted_at"),
});

export const newsLetterSubscriptions = sqliteTable("news_letter_subscribers", {
  id: text("id").primaryKey().$defaultFn(() => ulid()),
  email: text("email").notNull(),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  organizationId: text("organization_id").references(() => organizations.id),
  createdBy: text("created_by"),
  updatedBy: text("updated_by"),
  deletedBy: text("deleted_by"),
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at"),
  deletedAt: text("deleted_at"),
});

export const slackNotifications = sqliteTable("slack_notifications", {
  id: text("id").primaryKey().$defaultFn(() => ulid()),
  content: text("content").notNull(),
  threadTs: text("thread_ts"),
  isParent: integer("is_parent", { mode: "boolean" }).default(false),
  channel: text("channel"),
  messageType: text("message_type").default("CUSTOM"),
  referenceId: text("reference_id"),
  referenceType: text("reference_type").default("PRODUCT"),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  organizationId: text("organization_id").references(() => organizations.id),
  createdBy: text("created_by"),
  updatedBy: text("updated_by"),
  deletedBy: text("deleted_by"),
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at"),
  deletedAt: text("deleted_at"),
});

export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;
export type Testimonial = typeof testimonials.$inferSelect;
export type NewTestimonial = typeof testimonials.$inferInsert;
export type Feedback = typeof feedbacks.$inferSelect;
export type NewFeedback = typeof feedbacks.$inferInsert;
export type NewsLetterSubscription = typeof newsLetterSubscriptions.$inferSelect;
export type NewNewsLetterSubscription = typeof newsLetterSubscriptions.$inferInsert;
export type SlackNotification = typeof slackNotifications.$inferSelect;
export type NewSlackNotification = typeof slackNotifications.$inferInsert;

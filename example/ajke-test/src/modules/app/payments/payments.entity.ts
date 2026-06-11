import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { ulid } from "ulid";
import { organizations } from "../organizations/organization.entity";

export const paymentMethods = sqliteTable("payment_methods", {
  id: text("id").primaryKey().$defaultFn(() => ulid()),
  title: text("title").notNull(),
  icon: text("icon"),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  organizationId: text("organization_id").references(() => organizations.id),
  createdBy: text("created_by"),
  updatedBy: text("updated_by"),
  deletedBy: text("deleted_by"),
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at"),
  deletedAt: text("deleted_at"),
});

export const paymentLogs = sqliteTable("payment_logs", {
  id: text("id").primaryKey().$defaultFn(() => ulid()),
  transactionId: text("transaction_id").notNull(),
  amount: real("amount").default(0),
  paymentStatus: text("payment_status").notNull(),
  paymentInitiatedAt: text("payment_initiated_at"),
  paymentCompletedAt: text("payment_completed_at"),
  paymentRequestData: text("payment_request_data"),
  paymentWebhookData: text("payment_webhook_data"),
  paymentValidationData: text("payment_validation_data"),
  orderId: text("order_id"),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  organizationId: text("organization_id").references(() => organizations.id),
  createdBy: text("created_by"),
  updatedBy: text("updated_by"),
  deletedBy: text("deleted_by"),
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at"),
  deletedAt: text("deleted_at"),
});

export type PaymentMethod = typeof paymentMethods.$inferSelect;
export type NewPaymentMethod = typeof paymentMethods.$inferInsert;
export type PaymentLog = typeof paymentLogs.$inferSelect;
export type NewPaymentLog = typeof paymentLogs.$inferInsert;

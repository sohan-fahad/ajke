import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { ulid } from "ulid";
import { organizations } from "../organizations/organization.entity";
import { users } from "../user/user.entity";
import { deliverymen } from "../deliveryman/deliveryman.entity";
import { orders } from "../orders/orders.entity";

export const transactions = sqliteTable("transactions", {
  id: text("id").primaryKey().$defaultFn(() => ulid()),
  type: text("type").notNull(),
  status: text("status").default("PENDING"),
  amount: real("amount").default(0),
  description: text("description"),
  reference: text("reference"),
  deliverymanId: text("deliveryman_id").references(() => deliverymen.id),
  orderId: text("order_id").references(() => orders.id),
  userId: text("user_id").references(() => users.id),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  organizationId: text("organization_id").references(() => organizations.id),
  createdBy: text("created_by"),
  updatedBy: text("updated_by"),
  deletedBy: text("deleted_by"),
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at"),
  deletedAt: text("deleted_at"),
});

export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;

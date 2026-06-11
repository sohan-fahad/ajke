import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { ulid } from "ulid";
import { organizations } from "../organizations/organization.entity";

export const businessConfigs = sqliteTable("business_configs", {
  id: text("id").primaryKey().$defaultFn(() => ulid()),
  deliveryCharge: real("delivery_charge").default(0),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  organizationId: text("organization_id").references(() => organizations.id),
  createdBy: text("created_by"),
  updatedBy: text("updated_by"),
  deletedBy: text("deleted_by"),
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at"),
  deletedAt: text("deleted_at"),
});

export type BusinessConfig = typeof businessConfigs.$inferSelect;
export type NewBusinessConfig = typeof businessConfigs.$inferInsert;

import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { ulid } from "ulid";
import { organizations } from "../organizations/organization.entity";

export const cms = sqliteTable("cms", {
  id: text("id").primaryKey().$defaultFn(() => ulid()),
  title: text("title").notNull(),
  description: text("description"),
  link: text("link"),
  image: text("image"),
  thumb: text("thumb"),
  type: text("type").notNull(),
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

export type Cms = typeof cms.$inferSelect;
export type NewCms = typeof cms.$inferInsert;

import { sqliteTable, text, integer, uniqueIndex } from "drizzle-orm/sqlite-core";
import { ulid } from "ulid";

export const organizations = sqliteTable("organizations", {
  id: text("id").primaryKey().$defaultFn(() => ulid()),
  name: text("name").notNull(),
  slug: text("slug").unique().notNull(),
  domain: text("domain").unique().notNull(),
  subDomain: text("sub_domain").unique().notNull(),
  logo: text("logo"),
  description: text("description"),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  createdBy: text("created_by"),
  updatedBy: text("updated_by"),
  deletedBy: text("deleted_by"),
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at"),
  deletedAt: text("deleted_at"),
}, (t) => [
  uniqueIndex("organizations_slug_idx").on(t.slug),
  uniqueIndex("organizations_domain_idx").on(t.domain),
  uniqueIndex("organizations_sub_domain_idx").on(t.subDomain),
]);

export type Organization = typeof organizations.$inferSelect;
export type NewOrganization = typeof organizations.$inferInsert;

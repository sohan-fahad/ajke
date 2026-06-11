import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { ulid } from "ulid";
import { organizations } from "../organizations/organization.entity";

export const departments = sqliteTable("departments", {
  id: text("id").primaryKey().$defaultFn(() => ulid()),
  title: text("title").notNull(),
  slug: text("slug").notNull(),
  icon: text("icon"),
  image: text("image"),
  description: text("description"),
  isFeatured: integer("is_featured", { mode: "boolean" }).default(false),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  organizationId: text("organization_id").references(() => organizations.id),
  createdBy: text("created_by"),
  updatedBy: text("updated_by"),
  deletedBy: text("deleted_by"),
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at"),
  deletedAt: text("deleted_at"),
});

export const categories = sqliteTable("categories", {
  id: text("id").primaryKey().$defaultFn(() => ulid()),
  title: text("title").notNull(),
  slug: text("slug").notNull(),
  icon: text("icon"),
  image: text("image"),
  description: text("description"),
  isFeatured: integer("is_featured", { mode: "boolean" }).default(false),
  isAgeRestricted: integer("is_age_restricted", { mode: "boolean" }).default(false),
  orderPriority: integer("order_priority").default(0),
  departmentId: text("department_id").references(() => departments.id),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  organizationId: text("organization_id").references(() => organizations.id),
  createdBy: text("created_by"),
  updatedBy: text("updated_by"),
  deletedBy: text("deleted_by"),
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at"),
  deletedAt: text("deleted_at"),
});

export const subCategories = sqliteTable("sub_categories", {
  id: text("id").primaryKey().$defaultFn(() => ulid()),
  title: text("title").notNull(),
  slug: text("slug").notNull(),
  icon: text("icon"),
  image: text("image"),
  description: text("description"),
  isFeatured: integer("is_featured", { mode: "boolean" }).default(false),
  isAgeRestricted: integer("is_age_restricted", { mode: "boolean" }).default(false),
  orderPriority: integer("order_priority").default(0),
  categoryId: text("category_id").references(() => categories.id),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  organizationId: text("organization_id").references(() => organizations.id),
  createdBy: text("created_by"),
  updatedBy: text("updated_by"),
  deletedBy: text("deleted_by"),
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at"),
  deletedAt: text("deleted_at"),
});

export const brands = sqliteTable("brands", {
  id: text("id").primaryKey().$defaultFn(() => ulid()),
  title: text("title").notNull(),
  slug: text("slug").notNull(),
  icon: text("icon"),
  image: text("image"),
  description: text("description"),
  isFeatured: integer("is_featured", { mode: "boolean" }).default(false),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  organizationId: text("organization_id").references(() => organizations.id),
  createdBy: text("created_by"),
  updatedBy: text("updated_by"),
  deletedBy: text("deleted_by"),
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at"),
  deletedAt: text("deleted_at"),
});

export const specialCategories = sqliteTable("special_categories", {
  id: text("id").primaryKey().$defaultFn(() => ulid()),
  title: text("title").notNull(),
  slug: text("slug").notNull(),
  icon: text("icon"),
  image: text("image"),
  description: text("description"),
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

export type Department = typeof departments.$inferSelect;
export type NewDepartment = typeof departments.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type SubCategory = typeof subCategories.$inferSelect;
export type NewSubCategory = typeof subCategories.$inferInsert;
export type Brand = typeof brands.$inferSelect;
export type NewBrand = typeof brands.$inferInsert;
export type SpecialCategory = typeof specialCategories.$inferSelect;
export type NewSpecialCategory = typeof specialCategories.$inferInsert;

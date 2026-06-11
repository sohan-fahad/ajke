import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { ulid } from "ulid";
import { organizations } from "../organizations/organization.entity";
import { users } from "../user/user.entity";

export const cities = sqliteTable("cities", {
  id: text("id").primaryKey().$defaultFn(() => ulid()),
  title: text("title").notNull(),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  organizationId: text("organization_id").references(() => organizations.id),
  createdBy: text("created_by"),
  updatedBy: text("updated_by"),
  deletedBy: text("deleted_by"),
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at"),
  deletedAt: text("deleted_at"),
});

export const zones = sqliteTable("zones", {
  id: text("id").primaryKey().$defaultFn(() => ulid()),
  name: text("name").notNull().unique(),
  title: text("title"),
  cityId: text("city_id").references(() => cities.id, { onDelete: "cascade" }),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  organizationId: text("organization_id").references(() => organizations.id),
  createdBy: text("created_by"),
  updatedBy: text("updated_by"),
  deletedBy: text("deleted_by"),
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at"),
  deletedAt: text("deleted_at"),
});

export const areas = sqliteTable("areas", {
  id: text("id").primaryKey().$defaultFn(() => ulid()),
  title: text("title").notNull(),
  cityId: text("city_id").references(() => cities.id, { onDelete: "cascade" }),
  zoneId: text("zone_id").references(() => zones.id, { onDelete: "cascade" }),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  organizationId: text("organization_id").references(() => organizations.id),
  createdBy: text("created_by"),
  updatedBy: text("updated_by"),
  deletedBy: text("deleted_by"),
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at"),
  deletedAt: text("deleted_at"),
});

export const warehouses = sqliteTable("warehouses", {
  id: text("id").primaryKey().$defaultFn(() => ulid()),
  name: text("name").notNull(),
  emails: text("emails").notNull(),
  cityId: text("city_id").references(() => cities.id),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  organizationId: text("organization_id").references(() => organizations.id),
  createdBy: text("created_by"),
  updatedBy: text("updated_by"),
  deletedBy: text("deleted_by"),
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at"),
  deletedAt: text("deleted_at"),
});

export const addresses = sqliteTable("addresses", {
  id: text("id").primaryKey().$defaultFn(() => ulid()),
  customerEmail: text("customer_email"),
  customerName: text("customer_name").notNull(),
  phoneNumber: text("phone_number").notNull(),
  fullAddress: text("full_address").notNull(),
  cityId: text("city_id").references(() => cities.id),
  zoneId: text("zone_id").references(() => zones.id),
  areaId: text("area_id").references(() => areas.id),
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

export type City = typeof cities.$inferSelect;
export type NewCity = typeof cities.$inferInsert;
export type Zone = typeof zones.$inferSelect;
export type NewZone = typeof zones.$inferInsert;
export type Area = typeof areas.$inferSelect;
export type NewArea = typeof areas.$inferInsert;
export type Warehouse = typeof warehouses.$inferSelect;
export type NewWarehouse = typeof warehouses.$inferInsert;
export type Address = typeof addresses.$inferSelect;
export type NewAddress = typeof addresses.$inferInsert;

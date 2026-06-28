import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { ulid } from "ulid";
import { organizations } from "../organizations/organization.entity";
import { roles } from "../acl/acl.entity";

export const users = sqliteTable("users", {
  id: text("id").primaryKey().$defaultFn(() => ulid()),
  firstName: text("first_name"),
  lastName: text("last_name"),
  fullName: text("full_name"),
  avatar: text("avatar"),
  phoneNumber: text("phone_number"),
  username: text("username"),
  email: text("email"),
  password: text("password"),
  accessToken: text("access_token"),
  permissionToken: text("permission_token"),
  refreshToken: text("refresh_token"),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  organizationId: text("organization_id").references(() => organizations.id),
  workspaceId: text("workspace_id"),
  createdBy: text("created_by"),
  updatedBy: text("updated_by"),
  deletedBy: text("deleted_by"),
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at"),
  deletedAt: text("deleted_at"),
});

export const userRoles = sqliteTable("user_roles", {
  id: text("id").primaryKey().$defaultFn(() => ulid()),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
  roleId: text("role_id").references(() => roles.id, { onDelete: "cascade" }),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  organizationId: text("organization_id").references(() => organizations.id),
  workspaceId: text("workspace_id"),
  createdBy: text("created_by"),
  updatedBy: text("updated_by"),
  deletedBy: text("deleted_by"),
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at"),
  deletedAt: text("deleted_at"),
});

export const userConfigs = sqliteTable("user_configs", {
  id: text("id").primaryKey().$defaultFn(() => ulid()),
  userId: text("user_id").references(() => users.id, { onDelete: "no action" }),
  deviceToken: text("device_token"),
  appType: text("app_type").default("customer_app"),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  organizationId: text("organization_id").references(() => organizations.id),
  createdBy: text("created_by"),
  updatedBy: text("updated_by"),
  deletedBy: text("deleted_by"),
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at"),
  deletedAt: text("deleted_at"),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type UserRole = typeof userRoles.$inferSelect;
export type NewUserRole = typeof userRoles.$inferInsert;
export type UserConfig = typeof userConfigs.$inferSelect;
export type NewUserConfig = typeof userConfigs.$inferInsert;

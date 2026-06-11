import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { ulid } from "ulid";
import { organizations } from "../workspaces/workspace.entity";

export const authStats = sqliteTable("auth_stats", {
  id: text("id").primaryKey().$defaultFn(() => ulid()),
  phoneNumber: text("phone_number").unique(),
  otp: integer("otp"),
  otpExpiryAt: text("otp_expiry_at"),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  organizationId: text("organization_id").references(() => organizations.id),
  createdBy: text("created_by"),
  updatedBy: text("updated_by"),
  deletedBy: text("deleted_by"),
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at"),
  deletedAt: text("deleted_at"),
});

export type AuthStat = typeof authStats.$inferSelect;
export type NewAuthStat = typeof authStats.$inferInsert;

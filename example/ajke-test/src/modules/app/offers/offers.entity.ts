import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { ulid } from "ulid";
import { organizations } from "../organizations/organization.entity";

export const discounts = sqliteTable("discounts", {
  id: text("id").primaryKey().$defaultFn(() => ulid()),
  title: text("title").notNull(),
  status: text("status").default("drafted"),
  discountType: text("discount_type").default("FIXED_AMOUNT"),
  discount: real("discount").default(0),
  discountPercentage: real("discount_percentage").default(0),
  validFrom: text("valid_from").notNull(),
  validTill: text("valid_till").notNull(),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  organizationId: text("organization_id").references(() => organizations.id),
  createdBy: text("created_by"),
  updatedBy: text("updated_by"),
  deletedBy: text("deleted_by"),
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at"),
  deletedAt: text("deleted_at"),
});

export const coupons = sqliteTable("coupons", {
  id: text("id").primaryKey().$defaultFn(() => ulid()),
  code: text("code").notNull(),
  discountType: text("discount_type").default("FIXED_AMOUNT"),
  maxUsageLimit: integer("max_usage_limit").default(0),
  perDayMaxUsageLimit: integer("per_day_max_usage_limit").default(0),
  perUserMaxUsageLimit: integer("per_user_max_usage_limit").default(0),
  perUserPerDayMaxUsageLimit: integer("per_user_per_day_max_usage_limit").default(0),
  discount: real("discount").default(0),
  discountPercentage: real("discount_percentage").default(0),
  minOrderAmount: real("min_order_amount").default(0),
  maxDiscountAmount: real("max_discount_amount").default(0),
  validFrom: text("valid_from").notNull(),
  validTill: text("valid_till").notNull(),
  usageCount: integer("usage_count").default(0),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  organizationId: text("organization_id").references(() => organizations.id),
  createdBy: text("created_by"),
  updatedBy: text("updated_by"),
  deletedBy: text("deleted_by"),
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at"),
  deletedAt: text("deleted_at"),
});

export type Discount = typeof discounts.$inferSelect;
export type NewDiscount = typeof discounts.$inferInsert;
export type Coupon = typeof coupons.$inferSelect;
export type NewCoupon = typeof coupons.$inferInsert;

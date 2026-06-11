import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { ulid } from "ulid";
import { organizations } from "../organizations/organization.entity";
import { users } from "../user/user.entity";
import { addresses } from "../locations/locations.entity";
import { coupons } from "../offers/offers.entity";
import { paymentMethods } from "../payments/payments.entity";
import { deliverymen } from "../deliveryman/deliveryman.entity";
import { products } from "../products/products.entity";
import { variants, variantOptions } from "../products/products.entity";

export const orders = sqliteTable("orders", {
  id: text("id").primaryKey().$defaultFn(() => ulid()),
  code: text("code").notNull(),
  orderStatus: text("order_status").default("PENDING"),
  paymentStatus: text("payment_status").default("PENDING"),
  orderSource: text("order_source").default("WEBSITE"),
  total: real("total").default(0),
  subTotal: real("sub_total").default(0),
  discount: real("discount").default(0),
  couponDiscount: real("coupon_discount").default(0),
  vat: real("vat").default(0),
  deliveryCharge: real("delivery_charge").default(0),
  dueAmount: real("due_amount").default(0),
  paidAmount: real("paid_amount").default(0),
  paidAmountType: text("paid_amount_type"),
  addressId: text("address_id").references(() => addresses.id),
  couponId: text("coupon_id").references(() => coupons.id),
  customerId: text("customer_id").references(() => users.id),
  paymentMethodId: text("payment_method_id").references(() => paymentMethods.id),
  deliverymanId: text("deliveryman_id").references(() => deliverymen.id),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  organizationId: text("organization_id").references(() => organizations.id),
  createdBy: text("created_by"),
  updatedBy: text("updated_by"),
  deletedBy: text("deleted_by"),
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at"),
  deletedAt: text("deleted_at"),
});

export const orderItems = sqliteTable("order_items", {
  id: text("id").primaryKey().$defaultFn(() => ulid()),
  mrp: real("mrp").default(0),
  mrpVat: real("mrp_vat").default(0),
  liftingPrice: real("lifting_price").default(0),
  liftingPriceVat: real("lifting_price_vat").default(0),
  discount: real("discount").default(0),
  couponDiscount: real("coupon_discount").default(0),
  quantity: integer("quantity").default(0),
  productId: text("product_id").references(() => products.id),
  orderId: text("order_id").references(() => orders.id, { onDelete: "cascade" }),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  organizationId: text("organization_id").references(() => organizations.id),
  createdBy: text("created_by"),
  updatedBy: text("updated_by"),
  deletedBy: text("deleted_by"),
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at"),
  deletedAt: text("deleted_at"),
});

export const orderItemVariants = sqliteTable("order_item_variants", {
  id: text("id").primaryKey().$defaultFn(() => ulid()),
  orderItemId: text("order_item_id").references(() => orderItems.id, { onDelete: "cascade" }),
  variantId: text("variant_id").references(() => variants.id),
  variantOptionId: text("variant_option_id").references(() => variantOptions.id),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  organizationId: text("organization_id").references(() => organizations.id),
  createdBy: text("created_by"),
  updatedBy: text("updated_by"),
  deletedBy: text("deleted_by"),
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at"),
  deletedAt: text("deleted_at"),
});

export const orderLifeCycles = sqliteTable("order_life_cycles", {
  id: text("id").primaryKey().$defaultFn(() => ulid()),
  orderStatus: text("order_status").notNull(),
  comments: text("comments"),
  orderId: text("order_id").references(() => orders.id, { onDelete: "cascade" }),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  organizationId: text("organization_id").references(() => organizations.id),
  createdBy: text("created_by"),
  updatedBy: text("updated_by"),
  deletedBy: text("deleted_by"),
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at"),
  deletedAt: text("deleted_at"),
});

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
export type OrderItem = typeof orderItems.$inferSelect;
export type NewOrderItem = typeof orderItems.$inferInsert;
export type OrderItemVariant = typeof orderItemVariants.$inferSelect;
export type NewOrderItemVariant = typeof orderItemVariants.$inferInsert;
export type OrderLifeCycle = typeof orderLifeCycles.$inferSelect;
export type NewOrderLifeCycle = typeof orderLifeCycles.$inferInsert;

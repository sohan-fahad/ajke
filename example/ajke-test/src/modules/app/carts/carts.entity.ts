import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { ulid } from "ulid";
import { organizations } from "../organizations/organization.entity";
import { users } from "../user/user.entity";
import { products } from "../products/products.entity";
import { variants, variantOptions } from "../products/products.entity";

export const carts = sqliteTable("carts", {
  id: text("id").primaryKey().$defaultFn(() => ulid()),
  userId: text("user_id").references(() => users.id),
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

export const cartItems = sqliteTable("cart_items", {
  id: text("id").primaryKey().$defaultFn(() => ulid()),
  quantity: integer("quantity").default(0),
  productId: text("product_id").references(() => products.id, { onDelete: "cascade" }),
  cartId: text("cart_id").references(() => carts.id, { onDelete: "cascade" }),
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

export const cartItemVariants = sqliteTable("cart_item_variants", {
  id: text("id").primaryKey().$defaultFn(() => ulid()),
  cartItemId: text("cart_item_id").references(() => cartItems.id, { onDelete: "cascade" }),
  variantId: text("variant_id").references(() => variants.id, { onDelete: "cascade" }),
  variantOptionId: text("variant_option_id").references(() => variantOptions.id, { onDelete: "cascade" }),
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

export type Cart = typeof carts.$inferSelect;
export type NewCart = typeof carts.$inferInsert;
export type CartItem = typeof cartItems.$inferSelect;
export type NewCartItem = typeof cartItems.$inferInsert;
export type CartItemVariant = typeof cartItemVariants.$inferSelect;
export type NewCartItemVariant = typeof cartItemVariants.$inferInsert;

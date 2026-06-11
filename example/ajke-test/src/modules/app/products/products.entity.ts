import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { ulid } from "ulid";
import { organizations } from "../organizations/organization.entity";
import { departments, categories, subCategories, brands, specialCategories } from "../catalogs/catalogs.entity";
import { zones } from "../locations/locations.entity";
import { discounts } from "../offers/offers.entity";

export const variants = sqliteTable("variants", {
  id: text("id").primaryKey().$defaultFn(() => ulid()),
  title: text("title").notNull(),
  slug: text("slug").notNull(),
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

export const variantOptions = sqliteTable("variant_options", {
  id: text("id").primaryKey().$defaultFn(() => ulid()),
  title: text("title").notNull(),
  slug: text("slug").notNull(),
  variantId: text("variant_id").references(() => variants.id, { onDelete: "cascade" }),
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

export const products = sqliteTable("products", {
  id: text("id").primaryKey().$defaultFn(() => ulid()),
  title: text("title").notNull(),
  slug: text("slug"),
  code: text("code").notNull(),
  status: text("status").default("drafted"),
  description: text("description"),
  specification: text("specification"),
  unit: text("unit"),
  liftingPrice: real("lifting_price").default(0),
  liftingPriceVat: real("lifting_price_vat").default(0),
  mrp: real("mrp").default(0),
  mrpVat: real("mrp_vat").default(0),
  stock: integer("stock").default(0),
  remainingStock: integer("remaining_stock").default(0),
  oldPrice: real("old_price").default(0),
  newPrice: real("new_price").default(0),
  minPrice: real("min_price").default(0),
  maxPrice: real("max_price").default(0),
  totalRating: real("total_rating").default(0),
  isNewArrival: integer("is_new_arrival", { mode: "boolean" }).default(false),
  isStockout: integer("is_stockout", { mode: "boolean" }).default(false),
  isForceStockout: integer("is_force_stockout", { mode: "boolean" }).default(false),
  isFeatured: integer("is_featured", { mode: "boolean" }).default(false),
  tags: text("tags"),
  brandId: text("brand_id").references(() => brands.id),
  departmentId: text("department_id").references(() => departments.id),
  categoryId: text("category_id").references(() => categories.id),
  subCategoryId: text("sub_category_id").references(() => subCategories.id),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  organizationId: text("organization_id").references(() => organizations.id),
  createdBy: text("created_by"),
  updatedBy: text("updated_by"),
  deletedBy: text("deleted_by"),
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at"),
  deletedAt: text("deleted_at"),
});

export const productVariantOptions = sqliteTable("product_variant_options", {
  id: text("id").primaryKey().$defaultFn(() => ulid()),
  sku: text("sku"),
  liftingPrice: real("lifting_price").default(0),
  liftingPriceVat: real("lifting_price_vat").default(0),
  mrp: real("mrp").default(0),
  mrpVat: real("mrp_vat").default(0),
  stock: integer("stock").default(0),
  remainingStock: integer("remaining_stock").default(0),
  productId: text("product_id").references(() => products.id, { onDelete: "cascade" }),
  variantId: text("variant_id").references(() => variants.id, { onDelete: "cascade" }),
  variantOptionId: text("variant_option_id").references(() => variantOptions.id, { onDelete: "cascade" }),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  organizationId: text("organization_id").references(() => organizations.id),
  createdBy: text("created_by"),
  updatedBy: text("updated_by"),
  deletedBy: text("deleted_by"),
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at"),
  deletedAt: text("deleted_at"),
});

export const productImages = sqliteTable("product_images", {
  id: text("id").primaryKey().$defaultFn(() => ulid()),
  link: text("link").notNull(),
  isThumb: integer("is_thumb", { mode: "boolean" }).default(false),
  orderPriority: integer("order_priority").default(0),
  productId: text("product_id").references(() => products.id, { onDelete: "cascade" }),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  organizationId: text("organization_id").references(() => organizations.id),
  createdBy: text("created_by"),
  updatedBy: text("updated_by"),
  deletedBy: text("deleted_by"),
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at"),
  deletedAt: text("deleted_at"),
});

export const productStats = sqliteTable("product_stats", {
  id: text("id").primaryKey().$defaultFn(() => ulid()),
  totalViewed: integer("total_viewed").default(0),
  totalOrdered: integer("total_ordered").default(0),
  totalPeopleRated: integer("total_people_rated").default(0),
  totalPeopleRatingCount: real("total_people_rating_count").default(0),
  totalRating: real("total_rating").default(0),
  ratingStarCounts: text("rating_star_counts").default('{"1":0,"2":0,"3":0,"4":0,"5":0}'),
  productId: text("product_id").references(() => products.id, { onDelete: "cascade" }),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  organizationId: text("organization_id").references(() => organizations.id),
  createdBy: text("created_by"),
  updatedBy: text("updated_by"),
  deletedBy: text("deleted_by"),
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at"),
  deletedAt: text("deleted_at"),
});

export const productDiscounts = sqliteTable("product_discounts", {
  id: text("id").primaryKey().$defaultFn(() => ulid()),
  status: text("status").default("drafted"),
  discountedPrice: real("discounted_price").default(0),
  discountValue: real("discount_value").default(0),
  discountType: text("discount_type").default("FIXED_AMOUNT"),
  productId: text("product_id").references(() => products.id, { onDelete: "cascade" }),
  discountId: text("discount_id").references(() => discounts.id, { onDelete: "cascade" }),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  organizationId: text("organization_id").references(() => organizations.id),
  createdBy: text("created_by"),
  updatedBy: text("updated_by"),
  deletedBy: text("deleted_by"),
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at"),
  deletedAt: text("deleted_at"),
});

export const productRatings = sqliteTable("product_ratings", {
  id: text("id").primaryKey().$defaultFn(() => ulid()),
  rating: real("rating").default(0),
  comment: text("comment"),
  customerId: text("customer_id"),
  productId: text("product_id").references(() => products.id),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  organizationId: text("organization_id").references(() => organizations.id),
  createdBy: text("created_by"),
  updatedBy: text("updated_by"),
  deletedBy: text("deleted_by"),
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at"),
  deletedAt: text("deleted_at"),
});

export const productZoneMappings = sqliteTable("product_zone_mappings", {
  id: text("id").primaryKey().$defaultFn(() => ulid()),
  productId: text("product_id").references(() => products.id, { onDelete: "cascade" }),
  zoneId: text("zone_id").references(() => zones.id, { onDelete: "cascade" }),
  zoneMrp: real("zone_mrp").default(0),
  zoneMrpVat: real("zone_mrp_vat").default(0),
  zoneLiftingPrice: real("zone_lifting_price").default(0),
  zoneLiftingPriceVat: real("zone_lifting_price_vat").default(0),
  zoneOldPrice: real("zone_old_price").default(0),
  zoneNewPrice: real("zone_new_price").default(0),
  isNewArrival: integer("is_new_arrival", { mode: "boolean" }).default(false),
  isStockout: integer("is_stockout", { mode: "boolean" }).default(false),
  isForceStockout: integer("is_force_stockout", { mode: "boolean" }).default(false),
  isFeatured: integer("is_featured", { mode: "boolean" }).default(false),
  availableFromTime: text("available_from_time"),
  availableToTime: text("available_to_time"),
  estimatedDeliveryMinutes: integer("estimated_delivery_minutes").default(0),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  organizationId: text("organization_id").references(() => organizations.id),
  createdBy: text("created_by"),
  updatedBy: text("updated_by"),
  deletedBy: text("deleted_by"),
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at"),
  deletedAt: text("deleted_at"),
});

export const specialCategoryProducts = sqliteTable("special_category_products", {
  id: text("id").primaryKey().$defaultFn(() => ulid()),
  orderPriority: integer("order_priority").default(0),
  productId: text("product_id").references(() => products.id, { onDelete: "cascade" }),
  specialCategoryId: text("special_category_id").references(() => specialCategories.id, { onDelete: "cascade" }),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  organizationId: text("organization_id").references(() => organizations.id),
  createdBy: text("created_by"),
  updatedBy: text("updated_by"),
  deletedBy: text("deleted_by"),
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at"),
  deletedAt: text("deleted_at"),
});

export const productPriceCirculars = sqliteTable("product_price_circulars", {
  id: text("id").primaryKey().$defaultFn(() => ulid()),
  title: text("title").notNull(),
  reason: text("reason"),
  status: text("status").default("drafted"),
  zoneId: text("zone_id").references(() => zones.id),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  organizationId: text("organization_id").references(() => organizations.id),
  createdBy: text("created_by"),
  updatedBy: text("updated_by"),
  deletedBy: text("deleted_by"),
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at"),
  deletedAt: text("deleted_at"),
});

export const productPriceCircularItems = sqliteTable("product_price_circular_items", {
  id: text("id").primaryKey().$defaultFn(() => ulid()),
  newMrp: real("new_mrp").default(0),
  newMrpVat: real("new_mrp_vat").default(0),
  newLiftingPrice: real("new_lifting_price").default(0),
  newLiftingPriceVat: real("new_lifting_price_vat").default(0),
  circularId: text("circular_id").references(() => productPriceCirculars.id, { onDelete: "cascade" }),
  productId: text("product_id").references(() => products.id),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  organizationId: text("organization_id").references(() => organizations.id),
  createdBy: text("created_by"),
  updatedBy: text("updated_by"),
  deletedBy: text("deleted_by"),
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at"),
  deletedAt: text("deleted_at"),
});

export const productStockCirculars = sqliteTable("product_stock_circulars", {
  id: text("id").primaryKey().$defaultFn(() => ulid()),
  title: text("title").notNull(),
  reason: text("reason"),
  status: text("status").default("drafted"),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  organizationId: text("organization_id").references(() => organizations.id),
  createdBy: text("created_by"),
  updatedBy: text("updated_by"),
  deletedBy: text("deleted_by"),
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at"),
  deletedAt: text("deleted_at"),
});

export const productStockCircularItems = sqliteTable("product_stock_circular_items", {
  id: text("id").primaryKey().$defaultFn(() => ulid()),
  newStock: integer("new_stock").default(0),
  circularId: text("circular_id").references(() => productStockCirculars.id, { onDelete: "cascade" }),
  productId: text("product_id").references(() => products.id),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  organizationId: text("organization_id").references(() => organizations.id),
  createdBy: text("created_by"),
  updatedBy: text("updated_by"),
  deletedBy: text("deleted_by"),
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at"),
  deletedAt: text("deleted_at"),
});

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type Variant = typeof variants.$inferSelect;
export type NewVariant = typeof variants.$inferInsert;
export type VariantOption = typeof variantOptions.$inferSelect;
export type NewVariantOption = typeof variantOptions.$inferInsert;
export type ProductVariantOption = typeof productVariantOptions.$inferSelect;
export type NewProductVariantOption = typeof productVariantOptions.$inferInsert;
export type ProductImage = typeof productImages.$inferSelect;
export type NewProductImage = typeof productImages.$inferInsert;
export type ProductStat = typeof productStats.$inferSelect;
export type NewProductStat = typeof productStats.$inferInsert;
export type ProductDiscount = typeof productDiscounts.$inferSelect;
export type NewProductDiscount = typeof productDiscounts.$inferInsert;
export type ProductRating = typeof productRatings.$inferSelect;
export type NewProductRating = typeof productRatings.$inferInsert;
export type ProductZoneMapping = typeof productZoneMappings.$inferSelect;
export type NewProductZoneMapping = typeof productZoneMappings.$inferInsert;
export type SpecialCategoryProduct = typeof specialCategoryProducts.$inferSelect;
export type NewSpecialCategoryProduct = typeof specialCategoryProducts.$inferInsert;
export type ProductPriceCircular = typeof productPriceCirculars.$inferSelect;
export type NewProductPriceCircular = typeof productPriceCirculars.$inferInsert;
export type ProductPriceCircularItem = typeof productPriceCircularItems.$inferSelect;
export type NewProductPriceCircularItem = typeof productPriceCircularItems.$inferInsert;
export type ProductStockCircular = typeof productStockCirculars.$inferSelect;
export type NewProductStockCircular = typeof productStockCirculars.$inferInsert;
export type ProductStockCircularItem = typeof productStockCircularItems.$inferSelect;
export type NewProductStockCircularItem = typeof productStockCircularItems.$inferInsert;

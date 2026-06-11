import { roles, permissionTypes, permissions, rolePermissions } from "@app/modules/app/acl/acl.entity";
import { businessConfigs } from "@app/modules/app/business/business.entity";
import { carts, cartItems, cartItemVariants } from "@app/modules/app/carts/carts.entity";
import { brands, categories, departments, specialCategories, subCategories } from "@app/modules/app/catalogs/catalogs.entity";
import { cms } from "@app/modules/app/cms/cms.entity";
import { notifications, testimonials, feedbacks, newsLetterSubscriptions, slackNotifications } from "@app/modules/app/commons/commons.entity";
import { deliverymen } from "@app/modules/app/deliveryman/deliveryman.entity";
import { fileStorages } from "@app/modules/app/galleries/galleries.entity";
import { cities, zones, areas, warehouses, addresses } from "@app/modules/app/locations/locations.entity";
import { discounts, coupons } from "@app/modules/app/offers/offers.entity";
import { orders, orderItems, orderItemVariants, orderLifeCycles } from "@app/modules/app/orders/orders.entity";
import { paymentMethods, paymentLogs } from "@app/modules/app/payments/payments.entity";
import { productDiscounts, productImages, productPriceCircularItems, productPriceCirculars, productRatings, products, productStats, productStockCircularItems, productStockCirculars, productVariantOptions, productZoneMappings, specialCategoryProducts, variantOptions, variants } from "@app/modules/app/products/products.entity";
import { transactions } from "@app/modules/app/transactions/transactions.entity";
import { users, userRoles, userConfigs } from "@app/modules/app/user/user.entity";
import { organizations } from "@app/modules/app/organizations/organization.entity";

export const schema = {
    organizations,
    roles,
    permissionTypes,
    permissions,
    rolePermissions,
    businessConfigs,
    carts,
    cartItems,
    cartItemVariants,
    departments,
    categories,
    subCategories,
    brands,
    specialCategories,
    cms,
    notifications,
    testimonials,
    feedbacks,
    newsLetterSubscriptions,
    slackNotifications,
    deliverymen,
    fileStorages,
    cities,
    zones,
    areas,
    warehouses,
    addresses,
    discounts,
    coupons,
    orders,
    orderItems,
    orderItemVariants,
    orderLifeCycles,
    paymentMethods,
    paymentLogs,
    variants,
    variantOptions,
    products,
    productImages,
    productPrices: productPriceCirculars,
    productPriceCircularItems,
    productStockCirculars,
    productStockCircularItems,
    productRatings,
    productStats,
    productZoneMappings,
    productDiscounts,
    productVariantOptions,
    specialCategoryProducts,
    transactions,
    users,
    userRoles,
    userConfigs,
};

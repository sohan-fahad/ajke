CREATE TABLE `permission_types` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`is_active` integer DEFAULT true,
	`organization_id` text,
	`created_by` text,
	`updated_by` text,
	`deleted_by` text,
	`created_at` text,
	`updated_at` text,
	`deleted_at` text,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `permission_types_title_unique` ON `permission_types` (`title`);--> statement-breakpoint
CREATE TABLE `permissions` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`permission_type_id` text,
	`is_active` integer DEFAULT true,
	`organization_id` text,
	`created_by` text,
	`updated_by` text,
	`deleted_by` text,
	`created_at` text,
	`updated_at` text,
	`deleted_at` text,
	FOREIGN KEY (`permission_type_id`) REFERENCES `permission_types`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `role_permissions` (
	`id` text PRIMARY KEY NOT NULL,
	`role_id` text NOT NULL,
	`permission_id` text NOT NULL,
	`is_active` integer DEFAULT true,
	`organization_id` text,
	`created_by` text,
	`updated_by` text,
	`deleted_by` text,
	`created_at` text,
	`updated_at` text,
	`deleted_at` text,
	FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`permission_id`) REFERENCES `permissions`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `roles` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`is_active` integer DEFAULT true,
	`organization_id` text,
	`created_by` text,
	`updated_by` text,
	`deleted_by` text,
	`created_at` text,
	`updated_at` text,
	`deleted_at` text,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `auth_stats` (
	`id` text PRIMARY KEY NOT NULL,
	`phone_number` text,
	`otp` integer,
	`otp_expiry_at` text,
	`is_active` integer DEFAULT true,
	`organization_id` text,
	`created_by` text,
	`updated_by` text,
	`deleted_by` text,
	`created_at` text,
	`updated_at` text,
	`deleted_at` text,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `auth_stats_phone_number_unique` ON `auth_stats` (`phone_number`);--> statement-breakpoint
CREATE TABLE `business_configs` (
	`id` text PRIMARY KEY NOT NULL,
	`delivery_charge` real DEFAULT 0,
	`is_active` integer DEFAULT true,
	`organization_id` text,
	`created_by` text,
	`updated_by` text,
	`deleted_by` text,
	`created_at` text,
	`updated_at` text,
	`deleted_at` text,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `cart_item_variants` (
	`id` text PRIMARY KEY NOT NULL,
	`cart_item_id` text,
	`variant_id` text,
	`variant_option_id` text,
	`is_active` integer DEFAULT true,
	`organization_id` text,
	`created_by` text,
	`updated_by` text,
	`deleted_by` text,
	`created_at` text,
	`updated_at` text,
	`deleted_at` text,
	FOREIGN KEY (`cart_item_id`) REFERENCES `cart_items`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`variant_id`) REFERENCES `variants`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`variant_option_id`) REFERENCES `variant_options`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `cart_items` (
	`id` text PRIMARY KEY NOT NULL,
	`quantity` integer DEFAULT 0,
	`product_id` text,
	`cart_id` text,
	`is_active` integer DEFAULT true,
	`organization_id` text,
	`created_by` text,
	`updated_by` text,
	`deleted_by` text,
	`created_at` text,
	`updated_at` text,
	`deleted_at` text,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`cart_id`) REFERENCES `carts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `carts` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`is_active` integer DEFAULT true,
	`organization_id` text,
	`created_by` text,
	`updated_by` text,
	`deleted_by` text,
	`created_at` text,
	`updated_at` text,
	`deleted_at` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `brands` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`slug` text NOT NULL,
	`icon` text,
	`image` text,
	`description` text,
	`is_featured` integer DEFAULT false,
	`is_active` integer DEFAULT true,
	`organization_id` text,
	`created_by` text,
	`updated_by` text,
	`deleted_by` text,
	`created_at` text,
	`updated_at` text,
	`deleted_at` text,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `categories` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`slug` text NOT NULL,
	`icon` text,
	`image` text,
	`description` text,
	`is_featured` integer DEFAULT false,
	`is_age_restricted` integer DEFAULT false,
	`order_priority` integer DEFAULT 0,
	`department_id` text,
	`is_active` integer DEFAULT true,
	`organization_id` text,
	`created_by` text,
	`updated_by` text,
	`deleted_by` text,
	`created_at` text,
	`updated_at` text,
	`deleted_at` text,
	FOREIGN KEY (`department_id`) REFERENCES `departments`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `departments` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`slug` text NOT NULL,
	`icon` text,
	`image` text,
	`description` text,
	`is_featured` integer DEFAULT false,
	`is_active` integer DEFAULT true,
	`organization_id` text,
	`created_by` text,
	`updated_by` text,
	`deleted_by` text,
	`created_at` text,
	`updated_at` text,
	`deleted_at` text,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `special_categories` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`slug` text NOT NULL,
	`icon` text,
	`image` text,
	`description` text,
	`order_priority` integer DEFAULT 0,
	`is_active` integer DEFAULT true,
	`organization_id` text,
	`created_by` text,
	`updated_by` text,
	`deleted_by` text,
	`created_at` text,
	`updated_at` text,
	`deleted_at` text,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `sub_categories` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`slug` text NOT NULL,
	`icon` text,
	`image` text,
	`description` text,
	`is_featured` integer DEFAULT false,
	`is_age_restricted` integer DEFAULT false,
	`order_priority` integer DEFAULT 0,
	`category_id` text,
	`is_active` integer DEFAULT true,
	`organization_id` text,
	`created_by` text,
	`updated_by` text,
	`deleted_by` text,
	`created_at` text,
	`updated_at` text,
	`deleted_at` text,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `cms` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`link` text,
	`image` text,
	`thumb` text,
	`type` text NOT NULL,
	`order_priority` integer DEFAULT 0,
	`is_active` integer DEFAULT true,
	`organization_id` text,
	`created_by` text,
	`updated_by` text,
	`deleted_by` text,
	`created_at` text,
	`updated_at` text,
	`deleted_at` text,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `feedbacks` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text,
	`email` text,
	`phone_number` text,
	`feedback` text NOT NULL,
	`tag` text DEFAULT 'OTHER',
	`status` text DEFAULT 'PENDING',
	`is_active` integer DEFAULT true,
	`organization_id` text,
	`created_by` text,
	`updated_by` text,
	`deleted_by` text,
	`created_at` text,
	`updated_at` text,
	`deleted_at` text,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `news_letter_subscribers` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`is_active` integer DEFAULT true,
	`organization_id` text,
	`created_by` text,
	`updated_by` text,
	`deleted_by` text,
	`created_at` text,
	`updated_at` text,
	`deleted_at` text,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` text PRIMARY KEY NOT NULL,
	`text` text NOT NULL,
	`navigate_to` text,
	`is_active` integer DEFAULT true,
	`organization_id` text,
	`created_by` text,
	`updated_by` text,
	`deleted_by` text,
	`created_at` text,
	`updated_at` text,
	`deleted_at` text,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `slack_notifications` (
	`id` text PRIMARY KEY NOT NULL,
	`content` text NOT NULL,
	`thread_ts` text,
	`is_parent` integer DEFAULT false,
	`channel` text,
	`message_type` text DEFAULT 'CUSTOM',
	`reference_id` text,
	`reference_type` text DEFAULT 'PRODUCT',
	`is_active` integer DEFAULT true,
	`organization_id` text,
	`created_by` text,
	`updated_by` text,
	`deleted_by` text,
	`created_at` text,
	`updated_at` text,
	`deleted_at` text,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `testimonials` (
	`id` text PRIMARY KEY NOT NULL,
	`customer_name` text NOT NULL,
	`customer_designation` text,
	`customer_image` text,
	`testimonial` text NOT NULL,
	`rating` real DEFAULT 0,
	`order_priority` integer DEFAULT 0,
	`is_active` integer DEFAULT true,
	`organization_id` text,
	`created_by` text,
	`updated_by` text,
	`deleted_by` text,
	`created_at` text,
	`updated_at` text,
	`deleted_at` text,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `deliverymen` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`duty_status` text DEFAULT 'OFFLINE',
	`status` text DEFAULT 'INACTIVE',
	`license_number` text,
	`vehicle_number` text,
	`zone_id` text,
	`is_active` integer DEFAULT true,
	`organization_id` text,
	`created_by` text,
	`updated_by` text,
	`deleted_by` text,
	`created_at` text,
	`updated_at` text,
	`deleted_at` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`zone_id`) REFERENCES `zones`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `deliverymen_user_id_unique` ON `deliverymen` (`user_id`);--> statement-breakpoint
CREATE TABLE `file_storages` (
	`id` text PRIMARY KEY NOT NULL,
	`storage_type` text NOT NULL,
	`file_type` text NOT NULL,
	`folder` text NOT NULL,
	`file_name` text NOT NULL,
	`link` text,
	`is_active` integer DEFAULT true,
	`organization_id` text,
	`created_by` text,
	`updated_by` text,
	`deleted_by` text,
	`created_at` text,
	`updated_at` text,
	`deleted_at` text,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `addresses` (
	`id` text PRIMARY KEY NOT NULL,
	`customer_email` text,
	`customer_name` text NOT NULL,
	`phone_number` text NOT NULL,
	`full_address` text NOT NULL,
	`city_id` text,
	`zone_id` text,
	`area_id` text,
	`user_id` text,
	`is_active` integer DEFAULT true,
	`organization_id` text,
	`created_by` text,
	`updated_by` text,
	`deleted_by` text,
	`created_at` text,
	`updated_at` text,
	`deleted_at` text,
	FOREIGN KEY (`city_id`) REFERENCES `cities`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`zone_id`) REFERENCES `zones`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`area_id`) REFERENCES `areas`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `areas` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`city_id` text,
	`zone_id` text,
	`is_active` integer DEFAULT true,
	`organization_id` text,
	`created_by` text,
	`updated_by` text,
	`deleted_by` text,
	`created_at` text,
	`updated_at` text,
	`deleted_at` text,
	FOREIGN KEY (`city_id`) REFERENCES `cities`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`zone_id`) REFERENCES `zones`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `cities` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`is_active` integer DEFAULT true,
	`organization_id` text,
	`created_by` text,
	`updated_by` text,
	`deleted_by` text,
	`created_at` text,
	`updated_at` text,
	`deleted_at` text,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `warehouses` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`emails` text NOT NULL,
	`city_id` text,
	`is_active` integer DEFAULT true,
	`organization_id` text,
	`created_by` text,
	`updated_by` text,
	`deleted_by` text,
	`created_at` text,
	`updated_at` text,
	`deleted_at` text,
	FOREIGN KEY (`city_id`) REFERENCES `cities`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `zones` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`title` text,
	`city_id` text,
	`is_active` integer DEFAULT true,
	`organization_id` text,
	`created_by` text,
	`updated_by` text,
	`deleted_by` text,
	`created_at` text,
	`updated_at` text,
	`deleted_at` text,
	FOREIGN KEY (`city_id`) REFERENCES `cities`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `zones_name_unique` ON `zones` (`name`);--> statement-breakpoint
CREATE TABLE `coupons` (
	`id` text PRIMARY KEY NOT NULL,
	`code` text NOT NULL,
	`discount_type` text DEFAULT 'FIXED_AMOUNT',
	`max_usage_limit` integer DEFAULT 0,
	`per_day_max_usage_limit` integer DEFAULT 0,
	`per_user_max_usage_limit` integer DEFAULT 0,
	`per_user_per_day_max_usage_limit` integer DEFAULT 0,
	`discount` real DEFAULT 0,
	`discount_percentage` real DEFAULT 0,
	`min_order_amount` real DEFAULT 0,
	`max_discount_amount` real DEFAULT 0,
	`valid_from` text NOT NULL,
	`valid_till` text NOT NULL,
	`usage_count` integer DEFAULT 0,
	`is_active` integer DEFAULT true,
	`organization_id` text,
	`created_by` text,
	`updated_by` text,
	`deleted_by` text,
	`created_at` text,
	`updated_at` text,
	`deleted_at` text,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `discounts` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`status` text DEFAULT 'drafted',
	`discount_type` text DEFAULT 'FIXED_AMOUNT',
	`discount` real DEFAULT 0,
	`discount_percentage` real DEFAULT 0,
	`valid_from` text NOT NULL,
	`valid_till` text NOT NULL,
	`is_active` integer DEFAULT true,
	`organization_id` text,
	`created_by` text,
	`updated_by` text,
	`deleted_by` text,
	`created_at` text,
	`updated_at` text,
	`deleted_at` text,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `order_item_variants` (
	`id` text PRIMARY KEY NOT NULL,
	`order_item_id` text,
	`variant_id` text,
	`variant_option_id` text,
	`is_active` integer DEFAULT true,
	`organization_id` text,
	`created_by` text,
	`updated_by` text,
	`deleted_by` text,
	`created_at` text,
	`updated_at` text,
	`deleted_at` text,
	FOREIGN KEY (`order_item_id`) REFERENCES `order_items`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`variant_id`) REFERENCES `variants`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`variant_option_id`) REFERENCES `variant_options`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `order_items` (
	`id` text PRIMARY KEY NOT NULL,
	`mrp` real DEFAULT 0,
	`mrp_vat` real DEFAULT 0,
	`lifting_price` real DEFAULT 0,
	`lifting_price_vat` real DEFAULT 0,
	`discount` real DEFAULT 0,
	`coupon_discount` real DEFAULT 0,
	`quantity` integer DEFAULT 0,
	`product_id` text,
	`order_id` text,
	`is_active` integer DEFAULT true,
	`organization_id` text,
	`created_by` text,
	`updated_by` text,
	`deleted_by` text,
	`created_at` text,
	`updated_at` text,
	`deleted_at` text,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `order_life_cycles` (
	`id` text PRIMARY KEY NOT NULL,
	`order_status` text NOT NULL,
	`comments` text,
	`order_id` text,
	`is_active` integer DEFAULT true,
	`organization_id` text,
	`created_by` text,
	`updated_by` text,
	`deleted_by` text,
	`created_at` text,
	`updated_at` text,
	`deleted_at` text,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` text PRIMARY KEY NOT NULL,
	`code` text NOT NULL,
	`order_status` text DEFAULT 'PENDING',
	`payment_status` text DEFAULT 'PENDING',
	`order_source` text DEFAULT 'WEBSITE',
	`total` real DEFAULT 0,
	`sub_total` real DEFAULT 0,
	`discount` real DEFAULT 0,
	`coupon_discount` real DEFAULT 0,
	`vat` real DEFAULT 0,
	`delivery_charge` real DEFAULT 0,
	`due_amount` real DEFAULT 0,
	`paid_amount` real DEFAULT 0,
	`paid_amount_type` text,
	`address_id` text,
	`coupon_id` text,
	`customer_id` text,
	`payment_method_id` text,
	`deliveryman_id` text,
	`is_active` integer DEFAULT true,
	`organization_id` text,
	`created_by` text,
	`updated_by` text,
	`deleted_by` text,
	`created_at` text,
	`updated_at` text,
	`deleted_at` text,
	FOREIGN KEY (`address_id`) REFERENCES `addresses`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`coupon_id`) REFERENCES `coupons`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`customer_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`payment_method_id`) REFERENCES `payment_methods`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`deliveryman_id`) REFERENCES `deliverymen`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `payment_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`transaction_id` text NOT NULL,
	`amount` real DEFAULT 0,
	`payment_status` text NOT NULL,
	`payment_initiated_at` text,
	`payment_completed_at` text,
	`payment_request_data` text,
	`payment_webhook_data` text,
	`payment_validation_data` text,
	`order_id` text,
	`is_active` integer DEFAULT true,
	`organization_id` text,
	`created_by` text,
	`updated_by` text,
	`deleted_by` text,
	`created_at` text,
	`updated_at` text,
	`deleted_at` text,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `payment_methods` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`icon` text,
	`is_active` integer DEFAULT true,
	`organization_id` text,
	`created_by` text,
	`updated_by` text,
	`deleted_by` text,
	`created_at` text,
	`updated_at` text,
	`deleted_at` text,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `product_discounts` (
	`id` text PRIMARY KEY NOT NULL,
	`status` text DEFAULT 'drafted',
	`discounted_price` real DEFAULT 0,
	`discount_value` real DEFAULT 0,
	`discount_type` text DEFAULT 'FIXED_AMOUNT',
	`product_id` text,
	`discount_id` text,
	`is_active` integer DEFAULT true,
	`organization_id` text,
	`created_by` text,
	`updated_by` text,
	`deleted_by` text,
	`created_at` text,
	`updated_at` text,
	`deleted_at` text,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`discount_id`) REFERENCES `discounts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `product_images` (
	`id` text PRIMARY KEY NOT NULL,
	`link` text NOT NULL,
	`is_thumb` integer DEFAULT false,
	`order_priority` integer DEFAULT 0,
	`product_id` text,
	`is_active` integer DEFAULT true,
	`organization_id` text,
	`created_by` text,
	`updated_by` text,
	`deleted_by` text,
	`created_at` text,
	`updated_at` text,
	`deleted_at` text,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `product_price_circular_items` (
	`id` text PRIMARY KEY NOT NULL,
	`new_mrp` real DEFAULT 0,
	`new_mrp_vat` real DEFAULT 0,
	`new_lifting_price` real DEFAULT 0,
	`new_lifting_price_vat` real DEFAULT 0,
	`circular_id` text,
	`product_id` text,
	`is_active` integer DEFAULT true,
	`organization_id` text,
	`created_by` text,
	`updated_by` text,
	`deleted_by` text,
	`created_at` text,
	`updated_at` text,
	`deleted_at` text,
	FOREIGN KEY (`circular_id`) REFERENCES `product_price_circulars`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `product_price_circulars` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`reason` text,
	`status` text DEFAULT 'drafted',
	`zone_id` text,
	`is_active` integer DEFAULT true,
	`organization_id` text,
	`created_by` text,
	`updated_by` text,
	`deleted_by` text,
	`created_at` text,
	`updated_at` text,
	`deleted_at` text,
	FOREIGN KEY (`zone_id`) REFERENCES `zones`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `product_ratings` (
	`id` text PRIMARY KEY NOT NULL,
	`rating` real DEFAULT 0,
	`comment` text,
	`customer_id` text,
	`product_id` text,
	`is_active` integer DEFAULT true,
	`organization_id` text,
	`created_by` text,
	`updated_by` text,
	`deleted_by` text,
	`created_at` text,
	`updated_at` text,
	`deleted_at` text,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `product_stats` (
	`id` text PRIMARY KEY NOT NULL,
	`total_viewed` integer DEFAULT 0,
	`total_ordered` integer DEFAULT 0,
	`total_people_rated` integer DEFAULT 0,
	`total_people_rating_count` real DEFAULT 0,
	`total_rating` real DEFAULT 0,
	`rating_star_counts` text DEFAULT '{"1":0,"2":0,"3":0,"4":0,"5":0}',
	`product_id` text,
	`is_active` integer DEFAULT true,
	`organization_id` text,
	`created_by` text,
	`updated_by` text,
	`deleted_by` text,
	`created_at` text,
	`updated_at` text,
	`deleted_at` text,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `product_stock_circular_items` (
	`id` text PRIMARY KEY NOT NULL,
	`new_stock` integer DEFAULT 0,
	`circular_id` text,
	`product_id` text,
	`is_active` integer DEFAULT true,
	`organization_id` text,
	`created_by` text,
	`updated_by` text,
	`deleted_by` text,
	`created_at` text,
	`updated_at` text,
	`deleted_at` text,
	FOREIGN KEY (`circular_id`) REFERENCES `product_stock_circulars`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `product_stock_circulars` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`reason` text,
	`status` text DEFAULT 'drafted',
	`is_active` integer DEFAULT true,
	`organization_id` text,
	`created_by` text,
	`updated_by` text,
	`deleted_by` text,
	`created_at` text,
	`updated_at` text,
	`deleted_at` text,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `product_variant_options` (
	`id` text PRIMARY KEY NOT NULL,
	`sku` text,
	`lifting_price` real DEFAULT 0,
	`lifting_price_vat` real DEFAULT 0,
	`mrp` real DEFAULT 0,
	`mrp_vat` real DEFAULT 0,
	`stock` integer DEFAULT 0,
	`remaining_stock` integer DEFAULT 0,
	`product_id` text,
	`variant_id` text,
	`variant_option_id` text,
	`is_active` integer DEFAULT true,
	`organization_id` text,
	`created_by` text,
	`updated_by` text,
	`deleted_by` text,
	`created_at` text,
	`updated_at` text,
	`deleted_at` text,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`variant_id`) REFERENCES `variants`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`variant_option_id`) REFERENCES `variant_options`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `product_zone_mappings` (
	`id` text PRIMARY KEY NOT NULL,
	`product_id` text,
	`zone_id` text,
	`zone_mrp` real DEFAULT 0,
	`zone_mrp_vat` real DEFAULT 0,
	`zone_lifting_price` real DEFAULT 0,
	`zone_lifting_price_vat` real DEFAULT 0,
	`zone_old_price` real DEFAULT 0,
	`zone_new_price` real DEFAULT 0,
	`is_new_arrival` integer DEFAULT false,
	`is_stockout` integer DEFAULT false,
	`is_force_stockout` integer DEFAULT false,
	`is_featured` integer DEFAULT false,
	`available_from_time` text,
	`available_to_time` text,
	`estimated_delivery_minutes` integer DEFAULT 0,
	`is_active` integer DEFAULT true,
	`organization_id` text,
	`created_by` text,
	`updated_by` text,
	`deleted_by` text,
	`created_at` text,
	`updated_at` text,
	`deleted_at` text,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`zone_id`) REFERENCES `zones`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`slug` text,
	`code` text NOT NULL,
	`status` text DEFAULT 'drafted',
	`description` text,
	`specification` text,
	`unit` text,
	`lifting_price` real DEFAULT 0,
	`lifting_price_vat` real DEFAULT 0,
	`mrp` real DEFAULT 0,
	`mrp_vat` real DEFAULT 0,
	`stock` integer DEFAULT 0,
	`remaining_stock` integer DEFAULT 0,
	`old_price` real DEFAULT 0,
	`new_price` real DEFAULT 0,
	`min_price` real DEFAULT 0,
	`max_price` real DEFAULT 0,
	`total_rating` real DEFAULT 0,
	`is_new_arrival` integer DEFAULT false,
	`is_stockout` integer DEFAULT false,
	`is_force_stockout` integer DEFAULT false,
	`is_featured` integer DEFAULT false,
	`tags` text,
	`brand_id` text,
	`department_id` text,
	`category_id` text,
	`sub_category_id` text,
	`is_active` integer DEFAULT true,
	`organization_id` text,
	`created_by` text,
	`updated_by` text,
	`deleted_by` text,
	`created_at` text,
	`updated_at` text,
	`deleted_at` text,
	FOREIGN KEY (`brand_id`) REFERENCES `brands`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`department_id`) REFERENCES `departments`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`sub_category_id`) REFERENCES `sub_categories`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `special_category_products` (
	`id` text PRIMARY KEY NOT NULL,
	`order_priority` integer DEFAULT 0,
	`product_id` text,
	`special_category_id` text,
	`is_active` integer DEFAULT true,
	`organization_id` text,
	`created_by` text,
	`updated_by` text,
	`deleted_by` text,
	`created_at` text,
	`updated_at` text,
	`deleted_at` text,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`special_category_id`) REFERENCES `special_categories`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `variant_options` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`slug` text NOT NULL,
	`variant_id` text,
	`order_priority` integer DEFAULT 0,
	`is_active` integer DEFAULT true,
	`organization_id` text,
	`created_by` text,
	`updated_by` text,
	`deleted_by` text,
	`created_at` text,
	`updated_at` text,
	`deleted_at` text,
	FOREIGN KEY (`variant_id`) REFERENCES `variants`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `variants` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`slug` text NOT NULL,
	`order_priority` integer DEFAULT 0,
	`is_active` integer DEFAULT true,
	`organization_id` text,
	`created_by` text,
	`updated_by` text,
	`deleted_by` text,
	`created_at` text,
	`updated_at` text,
	`deleted_at` text,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`status` text DEFAULT 'PENDING',
	`amount` real DEFAULT 0,
	`description` text,
	`reference` text,
	`deliveryman_id` text,
	`order_id` text,
	`user_id` text,
	`is_active` integer DEFAULT true,
	`organization_id` text,
	`created_by` text,
	`updated_by` text,
	`deleted_by` text,
	`created_at` text,
	`updated_at` text,
	`deleted_at` text,
	FOREIGN KEY (`deliveryman_id`) REFERENCES `deliverymen`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `user_configs` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`device_token` text,
	`app_type` text DEFAULT 'customer_app',
	`is_active` integer DEFAULT true,
	`organization_id` text,
	`created_by` text,
	`updated_by` text,
	`deleted_by` text,
	`created_at` text,
	`updated_at` text,
	`deleted_at` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `user_roles` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`role_id` text,
	`is_active` integer DEFAULT true,
	`organization_id` text,
	`created_by` text,
	`updated_by` text,
	`deleted_by` text,
	`created_at` text,
	`updated_at` text,
	`deleted_at` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`first_name` text,
	`last_name` text,
	`full_name` text,
	`avatar` text,
	`phone_number` text,
	`username` text,
	`email` text,
	`password` text,
	`access_token` text,
	`permission_token` text,
	`refresh_token` text,
	`is_active` integer DEFAULT true,
	`organization_id` text,
	`created_by` text,
	`updated_by` text,
	`deleted_by` text,
	`created_at` text,
	`updated_at` text,
	`deleted_at` text,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `organizations` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`domain` text,
	`sub_domain` text,
	`logo` text,
	`description` text,
	`is_active` integer DEFAULT true,
	`created_by` text,
	`updated_by` text,
	`deleted_by` text,
	`created_at` text,
	`updated_at` text,
	`deleted_at` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `organizations_domain_unique` ON `organizations` (`domain`);--> statement-breakpoint
CREATE UNIQUE INDEX `organizations_sub_domain_unique` ON `organizations` (`sub_domain`);
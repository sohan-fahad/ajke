CREATE TABLE `workspaces` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`slug` text NOT NULL,
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
CREATE UNIQUE INDEX `workspaces_slug_unique` ON `workspaces` (`slug`);--> statement-breakpoint
ALTER TABLE `users` ADD `workspace_id` text;--> statement-breakpoint
ALTER TABLE `user_roles` ADD `workspace_id` text;--> statement-breakpoint
ALTER TABLE `roles` ADD `workspace_id` text;--> statement-breakpoint
ALTER TABLE `carts` ADD `workspace_id` text;--> statement-breakpoint
ALTER TABLE `cart_items` ADD `workspace_id` text;--> statement-breakpoint
ALTER TABLE `cart_item_variants` ADD `workspace_id` text;--> statement-breakpoint
ALTER TABLE `transactions` ADD `workspace_id` text;

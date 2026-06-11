PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_organizations` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`domain` text NOT NULL,
	`sub_domain` text NOT NULL,
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
INSERT INTO `__new_organizations`("id", "name", "slug", "domain", "sub_domain", "logo", "description", "is_active", "created_by", "updated_by", "deleted_by", "created_at", "updated_at", "deleted_at") SELECT "id", "name", "slug", "domain", "sub_domain", "logo", "description", "is_active", "created_by", "updated_by", "deleted_by", "created_at", "updated_at", "deleted_at" FROM `organizations`;--> statement-breakpoint
DROP TABLE `organizations`;--> statement-breakpoint
ALTER TABLE `__new_organizations` RENAME TO `organizations`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `organizations_slug_unique` ON `organizations` (`slug`);--> statement-breakpoint
CREATE UNIQUE INDEX `organizations_domain_unique` ON `organizations` (`domain`);--> statement-breakpoint
CREATE UNIQUE INDEX `organizations_sub_domain_unique` ON `organizations` (`sub_domain`);
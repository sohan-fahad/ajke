import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { ulid } from "ulid";
import { organizations } from "../organizations/organization.entity";

export const fileStorages = sqliteTable("file_storages", {
  id: text("id").primaryKey().$defaultFn(() => ulid()),
  storageType: text("storage_type").notNull(),
  fileType: text("file_type").notNull(),
  folder: text("folder").notNull(),
  fileName: text("file_name").notNull(),
  link: text("link"),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  organizationId: text("organization_id").references(() => organizations.id),
  createdBy: text("created_by"),
  updatedBy: text("updated_by"),
  deletedBy: text("deleted_by"),
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at"),
  deletedAt: text("deleted_at"),
});

export type FileStorage = typeof fileStorages.$inferSelect;
export type NewFileStorage = typeof fileStorages.$inferInsert;

import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { ulid } from "ulid";

export const workspaces = sqliteTable("workspaces", {
  id: text("id").primaryKey().$defaultFn(() => ulid()),
  title: text("title").notNull(),
  slug: text("slug").unique().notNull(),
  description: text("description"),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  createdBy: text("created_by"),
  updatedBy: text("updated_by"),
  deletedBy: text("deleted_by"),
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at"),
  deletedAt: text("deleted_at"),
});

export type Workspace = typeof workspaces.$inferSelect;
export type NewWorkspace = typeof workspaces.$inferInsert;

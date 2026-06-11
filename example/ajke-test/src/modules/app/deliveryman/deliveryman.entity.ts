import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { ulid } from "ulid";
import { organizations } from "../organizations/organization.entity";
import { users } from "../user/user.entity";
import { zones } from "../locations/locations.entity";

export const deliverymen = sqliteTable("deliverymen", {
  id: text("id").primaryKey().$defaultFn(() => ulid()),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }).unique(),
  dutyStatus: text("duty_status").default("OFFLINE"),
  status: text("status").default("INACTIVE"),
  licenseNumber: text("license_number"),
  vehicleNumber: text("vehicle_number"),
  zoneId: text("zone_id").references(() => zones.id, { onDelete: "cascade" }),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  organizationId: text("organization_id").references(() => organizations.id),
  createdBy: text("created_by"),
  updatedBy: text("updated_by"),
  deletedBy: text("deleted_by"),
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at"),
  deletedAt: text("deleted_at"),
});

export type DeliveryMan = typeof deliverymen.$inferSelect;
export type NewDeliveryMan = typeof deliverymen.$inferInsert;

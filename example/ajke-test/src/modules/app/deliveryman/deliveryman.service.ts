import { Injectable, NotFoundException } from "@ajke/core";
import type { Context } from "hono";
import { eq, and, desc } from "drizzle-orm";
import { getDb } from "@app/database/connection";
import { deliverymen } from "./deliveryman.entity";
import { users, userRoles } from "../user/user.entity";
import { roles } from "../acl/acl.entity";
import { ENUM_ACL_DEFAULT_ROLES } from "../../../shared";
import { hashPassword } from "../user/bcrypt.helper";
import { ulid } from "ulid";

type DB = ReturnType<typeof getDb>;
type BatchItem = Parameters<DB["batch"]>[0][0];

@Injectable()
export class DeliveryManService {
  async findAll(query: { organizationId?: string; status?: string; zoneId?: string }, c: Context) {
    const db = getDb(c);
    let q = db.select().from(deliverymen).$dynamic();
    const conds = [];
    if (query.organizationId) conds.push(eq(deliverymen.organizationId, query.organizationId));
    if (query.status) conds.push(eq(deliverymen.status, query.status));
    if (query.zoneId) conds.push(eq(deliverymen.zoneId, query.zoneId));
    if (conds.length) q = q.where(and(...conds));
    return q.orderBy(desc(deliverymen.createdAt));
  }

  async findOne(id: string, c: Context) {
    const db = getDb(c);
    const [dm] = await db.select().from(deliverymen).where(eq(deliverymen.id, id)).limit(1);
    if (!dm) throw new NotFoundException("Delivery man not found");
    return dm;
  }

  async register(
    payload: {
      phoneNumber: string;
      password: string;
      firstName?: string;
      lastName?: string;
      licenseNumber?: string;
      vehicleNumber?: string;
      zoneId?: string;
      organizationId?: string;
    },
    c: Context,
  ) {
    const db = getDb(c);
    const hashed = await hashPassword(payload.password);
    const fullName = [payload.firstName, payload.lastName].filter(Boolean).join(" ") || undefined;
    const userId = ulid();
    const dmId = ulid();

    const [dmRole] = await db
      .select()
      .from(roles)
      .where(
        and(
          eq(roles.title, ENUM_ACL_DEFAULT_ROLES.DELIVERY_MAN),
          payload.organizationId ? eq(roles.organizationId, payload.organizationId) : undefined,
        ),
      )
      .limit(1);

    const batchItems: BatchItem[] = [
      db.insert(users).values({
        id: userId,
        phoneNumber: payload.phoneNumber,
        password: hashed,
        firstName: payload.firstName,
        lastName: payload.lastName,
        fullName,
        organizationId: payload.organizationId,
        isActive: true,
      }) as unknown as BatchItem,
      db.insert(deliverymen).values({
        id: dmId,
        userId,
        licenseNumber: payload.licenseNumber,
        vehicleNumber: payload.vehicleNumber,
        zoneId: payload.zoneId,
        organizationId: payload.organizationId,
      }) as unknown as BatchItem,
    ];

    if (dmRole) {
      batchItems.push(
        db.insert(userRoles).values({
          userId,
          roleId: dmRole.id,
          organizationId: payload.organizationId,
        }) as unknown as BatchItem,
      );
    }

    await db.batch(batchItems as [BatchItem, ...BatchItem[]]);

    const [dm] = await db.select().from(deliverymen).where(eq(deliverymen.id, dmId)).limit(1);
    return dm!;
  }

  async updateStatus(id: string, status: string, c: Context) {
    const db = getDb(c);
    const [updated] = await db
      .update(deliverymen)
      .set({ status: status as any, updatedAt: new Date().toISOString() })
      .where(eq(deliverymen.id, id))
      .returning();
    if (!updated) throw new NotFoundException("Delivery man not found");
    return updated;
  }

  async updateDutyStatus(id: string, dutyStatus: string, c: Context) {
    const db = getDb(c);
    const [updated] = await db
      .update(deliverymen)
      .set({ dutyStatus: dutyStatus as any, updatedAt: new Date().toISOString() })
      .where(eq(deliverymen.id, id))
      .returning();
    if (!updated) throw new NotFoundException("Delivery man not found");
    return updated;
  }

  async update(id: string, payload: Partial<typeof deliverymen.$inferInsert>, c: Context) {
    const db = getDb(c);
    const [updated] = await db
      .update(deliverymen)
      .set({ ...payload, updatedAt: new Date().toISOString() })
      .where(eq(deliverymen.id, id))
      .returning();
    if (!updated) throw new NotFoundException("Delivery man not found");
    return updated;
  }
}

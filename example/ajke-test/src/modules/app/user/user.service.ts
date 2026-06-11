import { Injectable, BadRequestException, NotFoundException, ConflictException } from "@ajke/core";
import type { Context } from "hono";
import { eq, and, like, or, desc, inArray } from "drizzle-orm";
import { getDb } from "@app/database/connection";
import { users, userRoles } from "./user.entity";
import { roles } from "@app/modules/app/acl/acl.entity";
import { hashPassword } from "./bcrypt.helper";

type DB = ReturnType<typeof getDb>;
type BatchItem = Parameters<DB["batch"]>[0][0];

@Injectable()
export class UserService {
  async findAll(
    query: { organizationId?: string; search?: string; page?: number; limit?: number },
    c: Context,
  ) {
    const db = getDb(c);
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const offset = (page - 1) * limit;

    const conditions = [];
    if (query.organizationId) conditions.push(eq(users.organizationId, query.organizationId));
    if (query.search) {
      conditions.push(
        or(
          like(users.email, `%${query.search}%`),
          like(users.fullName, `%${query.search}%`),
          like(users.phoneNumber, `%${query.search}%`),
        )!,
      );
    }

    const result = await db
      .select()
      .from(users)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(users.createdAt))
      .limit(limit)
      .offset(offset);

    return result.map(({ password, accessToken, refreshToken, permissionToken, ...u }) => u);
  }

  async findOne(id: string, c: Context) {
    const db = getDb(c);
    const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
    if (!user) throw new NotFoundException("User not found");
    const { password, accessToken, refreshToken, permissionToken, ...safe } = user;
    return safe;
  }

  async createUser(
    payload: {
      email?: string;
      username?: string;
      password: string;
      firstName?: string;
      lastName?: string;
      phoneNumber?: string;
      organizationId?: string;
      roles?: string[];
    },
    c: Context,
  ) {
    const db = getDb(c);
    const { roles: roleIds, password, ...rest } = payload;

    const hashed = await hashPassword(password);
    const fullName = [rest.firstName, rest.lastName].filter(Boolean).join(" ") || undefined;

    const lookupCondition = rest.email
      ? eq(users.email, rest.email)
      : rest.phoneNumber
        ? eq(users.phoneNumber, rest.phoneNumber)
        : eq(users.username, rest.username!);

    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(
        and(
          lookupCondition,
          rest.organizationId ? eq(users.organizationId, rest.organizationId) : undefined,
        ),
      )
      .limit(1);

    if (existing) throw new ConflictException("User already exists");

    const [newUser] = await db
      .insert(users)
      .values({ ...rest, password: hashed, fullName })
      .returning();
    if (!newUser) throw new BadRequestException("User not created");

    if (roleIds?.length) {
      const batchItems = roleIds.map((roleId) =>
        db.insert(userRoles).values({ userId: newUser.id, roleId, organizationId: rest.organizationId }) as unknown as BatchItem,
      );
      await db.batch(
        batchItems as [BatchItem, ...BatchItem[]],
      );
    }

    const { password: _, ...safe } = newUser;
    return safe;
  }

  async updateUser(
    id: string,
    payload: Partial<{
      firstName: string;
      lastName: string;
      fullName: string;
      avatar: string;
      email: string;
      phoneNumber: string;
      username: string;
      isActive: boolean;
    }>,
    c: Context,
  ) {
    const db = getDb(c);
    const [user] = await db.select({ id: users.id }).from(users).where(eq(users.id, id)).limit(1);
    if (!user) throw new NotFoundException("User not found");

    const fullName =
      payload.firstName || payload.lastName
        ? [payload.firstName, payload.lastName].filter(Boolean).join(" ")
        : payload.fullName;

    await db
      .update(users)
      .set({ ...payload, ...(fullName && { fullName }), updatedAt: new Date().toISOString() })
      .where(eq(users.id, id));

    return this.findOne(id, c);
  }

  async deleteUser(id: string, c: Context) {
    const db = getDb(c);
    const [user] = await db.select({ id: users.id }).from(users).where(eq(users.id, id)).limit(1);
    if (!user) throw new NotFoundException("User not found");

    await db
      .update(users)
      .set({ deletedAt: new Date().toISOString(), isActive: false })
      .where(eq(users.id, id));

    return { message: "User deleted successfully" };
  }

  async getUserRoles(userId: string, c: Context) {
    const db = getDb(c);
    return db
      .select({ role: roles })
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .where(eq(userRoles.userId, userId));
  }

  async addRoles(userId: string, roleIds: string[], organizationId: string | undefined, c: Context) {
    const db = getDb(c);

    const existing = await db
      .select({ roleId: userRoles.roleId })
      .from(userRoles)
      .where(and(eq(userRoles.userId, userId), inArray(userRoles.roleId, roleIds)));

    const existingSet = new Set(existing.map((r) => r.roleId));
    const toInsert = roleIds.filter((id) => !existingSet.has(id));

    if (toInsert.length) {
      const batchItems = toInsert.map((roleId) =>
        db.insert(userRoles).values({ userId, roleId, organizationId }) as unknown as BatchItem,
      );
      await db.batch(
        batchItems as [BatchItem, ...BatchItem[]],
      );
    }

    return this.getUserRoles(userId, c);
  }

  async removeRole(userId: string, roleId: string, c: Context) {
    const db = getDb(c);
    await db
      .delete(userRoles)
      .where(and(eq(userRoles.userId, userId), eq(userRoles.roleId, roleId)));
    return { message: "Role removed" };
  }
}

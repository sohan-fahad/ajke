import { Injectable, NotFoundException, ConflictException } from "@ajke/core";
import type { Context } from "hono";
import { eq, and, desc, inArray } from "drizzle-orm";
import { getDb } from "@app/database/connection";
import { roles, permissions, permissionTypes, rolePermissions } from "./acl.entity";

@Injectable()
export class AclService {

  async findAllRoles(query: { organizationId?: string; search?: string }, c: Context) {
    const db = getDb(c);
    let q = db.select().from(roles).$dynamic();
    if (query.organizationId) q = q.where(eq(roles.organizationId, query.organizationId));
    return q.orderBy(desc(roles.createdAt));
  }

  async createRole(payload: { title: string; organizationId?: string }, c: Context) {
    const db = getDb(c);
    const [existing] = await db
      .select({ id: roles.id })
      .from(roles)
      .where(
        and(
          eq(roles.title, payload.title),
          payload.organizationId ? eq(roles.organizationId, payload.organizationId) : undefined,
        ),
      )
      .limit(1);
    if (existing) throw new ConflictException("Role already exists");

    const [role] = await db.insert(roles).values(payload).returning();
    return role;
  }

  async updateRole(id: string, payload: Partial<{ title: string; isActive: boolean }>, c: Context) {
    const db = getDb(c);
    const [updated] = await db
      .update(roles)
      .set({ ...payload, updatedAt: new Date().toISOString() })
      .where(eq(roles.id, id))
      .returning();
    if (!updated) throw new NotFoundException("Role not found");
    return updated;
  }

  async deleteRole(id: string, c: Context) {
    const db = getDb(c);
    await db.delete(roles).where(eq(roles.id, id));
    return { message: "Role deleted" };
  }

  async findAllPermissions(query: { organizationId?: string }, c: Context) {
    const db = getDb(c);
    let q = db.select().from(permissions).$dynamic();
    if (query.organizationId) q = q.where(eq(permissions.organizationId, query.organizationId));
    return q.orderBy(desc(permissions.createdAt));
  }

  async createPermission(
    payload: { title: string; permissionTypeId?: string; organizationId?: string },
    c: Context,
  ) {
    const db = getDb(c);
    const [perm] = await db.insert(permissions).values(payload).returning();
    return perm;
  }

  async findAllPermissionTypes(c: Context) {
    const db = getDb(c);
    return db.select().from(permissionTypes).orderBy(desc(permissionTypes.createdAt));
  }

  async createPermissionType(payload: { title: string }, c: Context) {
    const db = getDb(c);
    const [existing] = await db
      .select({ id: permissionTypes.id })
      .from(permissionTypes)
      .where(eq(permissionTypes.title, payload.title))
      .limit(1);
    if (existing) throw new ConflictException("Permission type already exists");

    const [pt] = await db.insert(permissionTypes).values(payload).returning();
    return pt;
  }

  async getRolePermissions(roleId: string, c: Context) {
    const db = getDb(c);
    return db
      .select({ permission: permissions })
      .from(rolePermissions)
      .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
      .where(eq(rolePermissions.roleId, roleId));
  }

  async addPermissionsToRole(
    roleId: string,
    permissionIds: string[],
    organizationId: string | undefined,
    c: Context,
  ) {
    const db = getDb(c);

    const existing = await db
      .select({ permissionId: rolePermissions.permissionId })
      .from(rolePermissions)
      .where(
        and(
          eq(rolePermissions.roleId, roleId),
          inArray(rolePermissions.permissionId, permissionIds),
        ),
      );

    const existingSet = new Set(existing.map((r) => r.permissionId));
    const toInsert = permissionIds.filter((id) => !existingSet.has(id));

    if (toInsert.length > 0) {
      await db
        .insert(rolePermissions)
        .values(toInsert.map((permissionId) => ({ roleId, permissionId, organizationId })));
    }

    return this.getRolePermissions(roleId, c);
  }

  async setRolePermissions(
    roleId: string,
    permissionIds: string[],
    organizationId: string | undefined,
    c: Context,
  ) {
    const db = getDb(c);

    if (permissionIds.length > 0) {
      await db.batch([
        db.delete(rolePermissions).where(eq(rolePermissions.roleId, roleId)),
        db
          .insert(rolePermissions)
          .values(permissionIds.map((permissionId) => ({ roleId, permissionId, organizationId }))),
      ]);
    } else {
      await db.delete(rolePermissions).where(eq(rolePermissions.roleId, roleId));
    }

    return this.getRolePermissions(roleId, c);
  }

  async removePermissionFromRole(roleId: string, permissionId: string, c: Context) {
    const db = getDb(c);
    await db
      .delete(rolePermissions)
      .where(and(eq(rolePermissions.roleId, roleId), eq(rolePermissions.permissionId, permissionId)));
    return { message: "Permission removed from role" };
  }
}

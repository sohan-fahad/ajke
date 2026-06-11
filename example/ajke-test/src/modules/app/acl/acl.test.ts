import { describe, it, expect, beforeAll, afterEach } from "vitest";
import { env, applyD1Migrations } from "cloudflare:test";
import type { Context } from "hono";
import { AclService } from "./acl.service";
import { OrganizationService } from "../organizations/organization.service";

const service = new AclService();
const orgService = new OrganizationService();

function makeContext(): Context {
  return { env } as unknown as Context;
}

beforeAll(async () => {
  await applyD1Migrations(env.DB, JSON.parse(env.TEST_MIGRATIONS));
});

afterEach(async () => {
  await env.DB.prepare("DELETE FROM role_permissions").run();
  await env.DB.prepare("DELETE FROM permissions").run();
  await env.DB.prepare("DELETE FROM roles").run();
  await env.DB.prepare("DELETE FROM permission_types").run();
  await env.DB.prepare("DELETE FROM organizations").run();
});

describe("AclService", () => {
  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});

describe("AclService.createRole", () => {
  it("creates a role", async () => {
    const role = await service.createRole({ title: "Admin" }, makeContext());

    expect(role.id).toBeDefined();
    expect(role.title).toBe("Admin");
    expect(role.isActive).toBe(true);

    const row = await env.DB.prepare("SELECT title, is_active FROM roles WHERE id = ?")
      .bind(role.id)
      .first<{ title: string; is_active: number }>();

    expect(row).not.toBeNull();
    expect(row?.title).toBe("Admin");
    expect(row?.is_active).toBe(1);
  });

  it("throws when role with same title and organization already exists", async () => {
    const org = await orgService.create({ name: "Acme", domain: "acme.com" }, makeContext());
    await service.createRole({ title: "Admin", organizationId: org.id }, makeContext());

    await expect(
      service.createRole({ title: "Admin", organizationId: org.id }, makeContext()),
    ).rejects.toThrow("Role already exists");
  });

  it("allows same title in different organizations", async () => {
    const org1 = await orgService.create({ name: "Acme", domain: "acme.com" }, makeContext());
    const org2 = await orgService.create({ name: "Beta", domain: "beta.com" }, makeContext());
    const r1 = await service.createRole({ title: "Admin", organizationId: org1.id }, makeContext());
    const r2 = await service.createRole({ title: "Admin", organizationId: org2.id }, makeContext());

    expect(r1.id).not.toBe(r2.id);
  });
});

describe("AclService.findAllRoles", () => {
  it("returns empty array when no roles exist", async () => {
    const result = await service.findAllRoles({}, makeContext());
    expect(result).toHaveLength(0);
  });

  it("returns all roles", async () => {
    await service.createRole({ title: "Admin" }, makeContext());
    await service.createRole({ title: "Editor" }, makeContext());

    const result = await service.findAllRoles({}, makeContext());
    expect(result).toHaveLength(2);
  });

  it("filters by organizationId", async () => {
    const org1 = await orgService.create({ name: "Acme", domain: "acme.com" }, makeContext());
    const org2 = await orgService.create({ name: "Beta", domain: "beta.com" }, makeContext());
    await service.createRole({ title: "Admin", organizationId: org1.id }, makeContext());
    await service.createRole({ title: "Editor", organizationId: org2.id }, makeContext());

    const result = await service.findAllRoles({ organizationId: org1.id }, makeContext());
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("Admin");
  });
});

describe("AclService.updateRole", () => {
  it("updates role title", async () => {
    const role = await service.createRole({ title: "Admin" }, makeContext());
    const updated = await service.updateRole(role.id, { title: "Super Admin" }, makeContext());

    expect(updated.id).toBe(role.id);
    expect(updated.title).toBe("Super Admin");
    expect(updated.updatedAt).toBeDefined();
  });

  it("updates isActive", async () => {
    const role = await service.createRole({ title: "Admin" }, makeContext());
    const updated = await service.updateRole(role.id, { isActive: false }, makeContext());

    expect(updated.isActive).toBe(false);
  });

  it("throws when role does not exist", async () => {
    await expect(
      service.updateRole("nonexistent-role-id", { title: "Ghost" }, makeContext()),
    ).rejects.toThrow("Role not found");
  });
});

describe("AclService.deleteRole", () => {
  it("deletes a role by id", async () => {
    const role = await service.createRole({ title: "Admin" }, makeContext());

    const result = await service.deleteRole(role.id, makeContext());
    expect(result.message).toBe("Role deleted");

    const row = await env.DB.prepare("SELECT id FROM roles WHERE id = ?")
      .bind(role.id)
      .first();
    expect(row).toBeNull();
  });
});

describe("AclService.createPermissionType", () => {
  it("creates a permission type", async () => {
    const pt = await service.createPermissionType({ title: "Read" }, makeContext());

    expect(pt.id).toBeDefined();
    expect(pt.title).toBe("Read");
    expect(pt.isActive).toBe(true);
  });

  it("throws when permission type with same title already exists", async () => {
    await service.createPermissionType({ title: "Read" }, makeContext());

    await expect(
      service.createPermissionType({ title: "Read" }, makeContext()),
    ).rejects.toThrow("Permission type already exists");
  });
});

describe("AclService.findAllPermissionTypes", () => {
  it("returns empty array when no permission types exist", async () => {
    const result = await service.findAllPermissionTypes(makeContext());
    expect(result).toHaveLength(0);
  });

  it("returns all permission types", async () => {
    await service.createPermissionType({ title: "Read" }, makeContext());
    await service.createPermissionType({ title: "Write" }, makeContext());

    const result = await service.findAllPermissionTypes(makeContext());
    expect(result).toHaveLength(2);
  });
});

describe("AclService.createPermission", () => {
  it("creates a permission", async () => {
    const perm = await service.createPermission({ title: "view:products" }, makeContext());

    expect(perm.id).toBeDefined();
    expect(perm.title).toBe("view:products");
    expect(perm.isActive).toBe(true);
  });

  it("creates a permission linked to a permission type", async () => {
    const pt = await service.createPermissionType({ title: "Read" }, makeContext());
    const perm = await service.createPermission(
      { title: "view:products", permissionTypeId: pt.id },
      makeContext(),
    );

    expect(perm.permissionTypeId).toBe(pt.id);
  });
});

describe("AclService.findAllPermissions", () => {
  it("returns empty array when no permissions exist", async () => {
    const result = await service.findAllPermissions({}, makeContext());
    expect(result).toHaveLength(0);
  });

  it("returns all permissions", async () => {
    await service.createPermission({ title: "view:products" }, makeContext());
    await service.createPermission({ title: "edit:products" }, makeContext());

    const result = await service.findAllPermissions({}, makeContext());
    expect(result).toHaveLength(2);
  });

  it("filters by organizationId", async () => {
    const org1 = await orgService.create({ name: "Acme", domain: "acme.com" }, makeContext());
    const org2 = await orgService.create({ name: "Beta", domain: "beta.com" }, makeContext());
    await service.createPermission({ title: "view:products", organizationId: org1.id }, makeContext());
    await service.createPermission({ title: "edit:products", organizationId: org2.id }, makeContext());

    const result = await service.findAllPermissions({ organizationId: org1.id }, makeContext());
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("view:products");
  });
});

describe("AclService.addPermissionsToRole (batch insert)", () => {
  it("batch adds multiple permissions to a role in one round-trip", async () => {
    const role = await service.createRole({ title: "Admin" }, makeContext());
    const p1 = await service.createPermission({ title: "view:products" }, makeContext());
    const p2 = await service.createPermission({ title: "edit:products" }, makeContext());

    const result = await service.addPermissionsToRole(role.id, [p1.id, p2.id], undefined, makeContext());

    expect(result).toHaveLength(2);
    const titles = result.map((r) => r.permission.title).sort();
    expect(titles).toEqual(["edit:products", "view:products"]);
  });

  it("does not create duplicates when adding an already-assigned permission", async () => {
    const role = await service.createRole({ title: "Admin" }, makeContext());
    const p1 = await service.createPermission({ title: "view:products" }, makeContext());

    await service.addPermissionsToRole(role.id, [p1.id], undefined, makeContext());
    await service.addPermissionsToRole(role.id, [p1.id], undefined, makeContext());

    const result = await service.getRolePermissions(role.id, makeContext());
    expect(result).toHaveLength(1);
  });

  it("only inserts new permissions in a mixed batch", async () => {
    const role = await service.createRole({ title: "Admin" }, makeContext());
    const p1 = await service.createPermission({ title: "view:products" }, makeContext());
    const p2 = await service.createPermission({ title: "edit:products" }, makeContext());

    await service.addPermissionsToRole(role.id, [p1.id], undefined, makeContext());
    const result = await service.addPermissionsToRole(role.id, [p1.id, p2.id], undefined, makeContext());

    expect(result).toHaveLength(2);
  });
});

describe("AclService.setRolePermissions (batch replace)", () => {
  it("sets permissions, replacing all existing ones atomically", async () => {
    const role = await service.createRole({ title: "Admin" }, makeContext());
    const p1 = await service.createPermission({ title: "view:products" }, makeContext());
    const p2 = await service.createPermission({ title: "edit:products" }, makeContext());
    const p3 = await service.createPermission({ title: "delete:products" }, makeContext());

    await service.setRolePermissions(role.id, [p1.id, p2.id], undefined, makeContext());
    const result = await service.setRolePermissions(role.id, [p3.id], undefined, makeContext());

    expect(result).toHaveLength(1);
    expect(result[0].permission.title).toBe("delete:products");
  });

  it("clears all permissions when empty array is passed", async () => {
    const role = await service.createRole({ title: "Admin" }, makeContext());
    const p1 = await service.createPermission({ title: "view:products" }, makeContext());

    await service.setRolePermissions(role.id, [p1.id], undefined, makeContext());
    const result = await service.setRolePermissions(role.id, [], undefined, makeContext());

    expect(result).toHaveLength(0);
  });
});

describe("AclService.getRolePermissions", () => {
  it("returns empty array when role has no permissions", async () => {
    const role = await service.createRole({ title: "Viewer" }, makeContext());
    const result = await service.getRolePermissions(role.id, makeContext());
    expect(result).toHaveLength(0);
  });
});

describe("AclService.removePermissionFromRole", () => {
  it("removes a specific permission from a role", async () => {
    const role = await service.createRole({ title: "Admin" }, makeContext());
    const p1 = await service.createPermission({ title: "view:products" }, makeContext());
    const p2 = await service.createPermission({ title: "edit:products" }, makeContext());

    await service.addPermissionsToRole(role.id, [p1.id, p2.id], undefined, makeContext());

    const result = await service.removePermissionFromRole(role.id, p1.id, makeContext());
    expect(result.message).toBe("Permission removed from role");

    const remaining = await service.getRolePermissions(role.id, makeContext());
    expect(remaining).toHaveLength(1);
    expect(remaining[0].permission.title).toBe("edit:products");
  });
});

import { describe, it, expect, beforeAll, afterEach } from "vitest";
import { env, applyD1Migrations } from "cloudflare:test";
import type { Context } from "hono";
import { UserService } from "./user.service";

const USER_PAYLOAD = {
  firstName: "John",
  lastName: "Doe",
  email: "john.doe@example.com",
  password: "secret123",
};

const service = new UserService();
let seededRoleId: string;

function makeContext(): Context {
  return { env } as unknown as Context;
}

beforeAll(async () => {
  await applyD1Migrations(env.DB, JSON.parse(env.TEST_MIGRATIONS));

  const row = await env.DB.prepare(
    "INSERT INTO roles (id, title) VALUES (lower(hex(randomblob(10))), 'admin') RETURNING id",
  ).first<{ id: string }>();
  seededRoleId = row!.id;
});

afterEach(async () => {
  await env.DB.prepare("DELETE FROM users").run();
});

describe("UserService", () => {
  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});

describe("UserService.createUser", () => {
  it("creates a user and omits sensitive fields from result", async () => {
    console.log("[createUser] payload:", USER_PAYLOAD);
    const created = await service.createUser(USER_PAYLOAD, makeContext());
    console.log("[createUser] result:", created);

    expect(created.id).toBeDefined();
    expect(created.email).toBe("john.doe@example.com");
    expect(created.fullName).toBe("John Doe");

    const row = await env.DB.prepare(
      "SELECT email, full_name, password FROM users WHERE id = ?",
    )
      .bind(created.id)
      .first<{ email: string; full_name: string; password: string }>();

    console.log("[createUser] DB row:", row);
    expect(row).not.toBeNull();
    expect(row?.email).toBe("john.doe@example.com");
    expect(row?.full_name).toBe("John Doe");
    expect(row?.password).not.toBe("secret123");
  });

  it("batch-inserts roles when roleIds are provided", async () => {
    const created = await service.createUser(
      { ...USER_PAYLOAD, roles: [seededRoleId] },
      makeContext(),
    );
    console.log("[createUser] with roles - userId:", created.id);

    const roleRows = await env.DB.prepare(
      "SELECT role_id FROM user_roles WHERE user_id = ?",
    )
      .bind(created.id)
      .all<{ role_id: string }>();

    console.log("[createUser] user_roles rows:", roleRows.results);
    expect(roleRows.results).toHaveLength(1);
    expect(roleRows.results[0]?.role_id).toBe(seededRoleId);
  });

  it("throws ConflictException when user already exists", async () => {
    await service.createUser(USER_PAYLOAD, makeContext());
    console.log("[createUser] conflict - attempting duplicate insert");
    await expect(service.createUser(USER_PAYLOAD, makeContext())).rejects.toThrow(
      "User already exists",
    );
  });
});

describe("UserService.findOne", () => {
  it("returns user by id without sensitive fields", async () => {
    const created = await service.createUser(USER_PAYLOAD, makeContext());
    console.log("[findOne] created id:", created.id);

    const found = await service.findOne(created.id, makeContext());
    console.log("[findOne] result:", found);

    expect(found.id).toBe(created.id);
    expect(found.email).toBe("john.doe@example.com");
    expect((found as Record<string, unknown>).password).toBeUndefined();
  });

  it("throws NotFoundException when user does not exist", async () => {
    console.log("[findOne] looking up nonexistent id");
    await expect(service.findOne("nonexistent-user-id", makeContext())).rejects.toThrow(
      "User not found",
    );
  });
});

describe("UserService.findAll", () => {
  it("returns paginated list without sensitive fields", async () => {
    await service.createUser(USER_PAYLOAD, makeContext());
    await service.createUser(
      { ...USER_PAYLOAD, email: "jane.doe@example.com" },
      makeContext(),
    );
    console.log("[findAll] seeded 2 users");

    const result = await service.findAll({}, makeContext());
    console.log("[findAll] result count:", result.length);

    expect(result.length).toBe(2);
    expect((result[0] as Record<string, unknown>).password).toBeUndefined();
  });

  it("filters by search term", async () => {
    await service.createUser(USER_PAYLOAD, makeContext());
    await service.createUser(
      { firstName: "Alice", lastName: "Smith", email: "alice@example.com", password: "pass123" },
      makeContext(),
    );

    const result = await service.findAll({ search: "alice" }, makeContext());
    console.log("[findAll] search=alice result:", result);

    expect(result.length).toBe(1);
    expect(result[0]?.email).toBe("alice@example.com");
  });
});

describe("UserService.updateUser", () => {
  it("updates user fields and returns fresh record", async () => {
    const created = await service.createUser(USER_PAYLOAD, makeContext());
    console.log("[updateUser] updating id:", created.id);

    const updated = await service.updateUser(
      created.id,
      { firstName: "Johnny", lastName: "Doe" },
      makeContext(),
    );
    console.log("[updateUser] result:", updated);

    expect(updated.fullName).toBe("Johnny Doe");
  });

  it("throws NotFoundException for unknown id", async () => {
    await expect(
      service.updateUser("nonexistent-id", { firstName: "X" }, makeContext()),
    ).rejects.toThrow("User not found");
  });
});

describe("UserService.deleteUser", () => {
  it("soft-deletes user by setting isActive=false and deletedAt", async () => {
    const created = await service.createUser(USER_PAYLOAD, makeContext());
    console.log("[deleteUser] deleting id:", created.id);

    const result = await service.deleteUser(created.id, makeContext());
    console.log("[deleteUser] result:", result);

    expect(result.message).toBe("User deleted successfully");

    const row = await env.DB.prepare(
      "SELECT is_active, deleted_at FROM users WHERE id = ?",
    )
      .bind(created.id)
      .first<{ is_active: number; deleted_at: string }>();

    expect(row?.is_active).toBe(0);
    expect(row?.deleted_at).not.toBeNull();
  });

  it("throws NotFoundException for unknown id", async () => {
    await expect(service.deleteUser("nonexistent-id", makeContext())).rejects.toThrow(
      "User not found",
    );
  });
});

describe("UserService.addRoles", () => {
  it("batch-inserts new roles and skips existing ones", async () => {
    const created = await service.createUser(USER_PAYLOAD, makeContext());
    console.log("[addRoles] userId:", created.id, "roleId:", seededRoleId);

    await service.addRoles(created.id, [seededRoleId], undefined, makeContext());
    const result = await service.addRoles(created.id, [seededRoleId], undefined, makeContext());
    console.log("[addRoles] result after duplicate call:", result);

    const rows = await env.DB.prepare("SELECT id FROM user_roles WHERE user_id = ?")
      .bind(created.id)
      .all<{ id: string }>();

    expect(rows.results).toHaveLength(1);
    expect(result).toHaveLength(1);
    expect(result[0]?.role.id).toBe(seededRoleId);
  });
});

describe("UserService.getUserRoles", () => {
  it("returns roles assigned to a user", async () => {
    const created = await service.createUser(
      { ...USER_PAYLOAD, roles: [seededRoleId] },
      makeContext(),
    );
    console.log("[getUserRoles] userId:", created.id);

    const result = await service.getUserRoles(created.id, makeContext());
    console.log("[getUserRoles] result:", result);

    expect(result).toHaveLength(1);
    expect(result[0]?.role.id).toBe(seededRoleId);
    expect(result[0]?.role.title).toBe("admin");
  });
});

describe("UserService.removeRole", () => {
  it("removes a role from a user", async () => {
    const created = await service.createUser(
      { ...USER_PAYLOAD, roles: [seededRoleId] },
      makeContext(),
    );
    console.log("[removeRole] userId:", created.id, "roleId:", seededRoleId);

    const result = await service.removeRole(created.id, seededRoleId, makeContext());
    console.log("[removeRole] result:", result);

    expect(result.message).toBe("Role removed");

    const rows = await env.DB.prepare("SELECT id FROM user_roles WHERE user_id = ?")
      .bind(created.id)
      .all<{ id: string }>();

    expect(rows.results).toHaveLength(0);
  });
});

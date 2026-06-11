import { describe, it, expect, beforeAll, afterEach } from "vitest";
import { env, applyD1Migrations } from "cloudflare:test";
import type { Context } from "hono";
import { OrganizationService } from "./organization.service";

const ORG_PAYLOAD = { name: "Acme Corp", domain: "acme.com" };
const service = new OrganizationService();

function makeContext(): Context {
  return { env } as unknown as Context;
}

beforeAll(async () => {
  await applyD1Migrations(env.DB, JSON.parse(env.TEST_MIGRATIONS));
});

afterEach(async () => {
  await env.DB.prepare("DELETE FROM organizations").run();
});

describe("OrganizationService", () => {
  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});

describe("OrganizationService.create", () => {
  it("creates an organization and auto-generates slug and subDomain", async () => {
    console.log("[create] payload:", ORG_PAYLOAD);
    const created = await service.create(ORG_PAYLOAD, makeContext());
    console.log("[create] result:", created);

    expect(created.id).toBeDefined();
    expect(created.name).toBe("Acme Corp");
    expect(created.slug).toBe("acme-corp");
    //  expect(created.slug).toBe("totally-wrong-slug");
    expect(created.domain).toBe("acme.com");
    expect(created.subDomain).toBe("acme-corp.acme.com");

    const row = await env.DB.prepare(
      "SELECT name, slug, domain, sub_domain FROM organizations WHERE id = ?",
    )
      .bind(created.id)
      .first<{ name: string; slug: string; domain: string; sub_domain: string }>();

    console.log("[create] DB row:", row);
    expect(row).not.toBeNull();
    expect(row?.name).toBe("Acme Corp");
    expect(row?.slug).toBe("acme-corp");
    expect(row?.domain).toBe("acme.com");
    expect(row?.sub_domain).toBe("acme-corp.acme.com");
  });
});

describe("OrganizationService.findOne", () => {
  it("returns organization by id", async () => {
    const created = await service.create(ORG_PAYLOAD, makeContext());
    console.log("[findOne] created:", created);

    const found = await service.findOne(created.id, makeContext());
    console.log("[findOne] result:", found);

    expect(found.id).toBe(created.id);
    expect(found.name).toBe("Acme Corp");
    expect(found.slug).toBe("acme-corp");
    expect(found.domain).toBe("acme.com");
    expect(found.subDomain).toBe("acme-corp.acme.com");
  });

  it("throws when organization does not exist", async () => {
    console.log("[findOne] looking up nonexistent id");
    await expect(
      service.findOne("nonexistent-org-id", makeContext()),
    ).rejects.toThrow("Organization not found");
  });
});

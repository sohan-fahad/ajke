import { BadRequestException, Injectable, NotFoundException } from "@ajke/core";
import type { Context } from "hono";
import { eq, desc, like, and } from "drizzle-orm";
import { getDb } from "@app/database/connection";
import { organizations } from "./organization.entity";
import type { CreateOrganizationDTOType, FilterOrganizationDTOType, UpdateOrganizationDTOType } from "./organization.dto";


@Injectable()
export class OrganizationService {
  async findAll(c: Context, filters: FilterOrganizationDTOType = {}) {
    const { searchTerm, domain, isActive } = filters;
    const db = getDb(c);

    const conditions = [];
    if (searchTerm) conditions.push(like(organizations.name, `%${searchTerm}%`));
    if (domain) conditions.push(eq(organizations.domain, domain));
    if (isActive !== undefined) conditions.push(eq(organizations.isActive, isActive));

    return db
      .select()
      .from(organizations)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(organizations.createdAt));
  }

  async findOne(id: string, c: Context) {
    const db = getDb(c);
    const org = await db.query.organizations.findFirst({
      where: eq(organizations.id, id),
    });
    if (!org) throw new NotFoundException("Organization not found");
    return org;
  }

  async findBySlug(slug: string, c: Context) {
    const db = getDb(c);
    const org = await db.query.organizations.findFirst({
      where: eq(organizations.slug, slug),
    });
    return org ?? null;
  }

  async findByDomain(domain: string, c: Context) {
    const db = getDb(c);
    const org = await db.query.organizations.findFirst({
      where: eq(organizations.domain, domain),
    });
    return org ?? null;
  }

  async create(payload: CreateOrganizationDTOType, c: Context) {
    const db = getDb(c);

    const baseSlug = this.slugify(payload.name);

    const existing = await db
      .select({ slug: organizations.slug })
      .from(organizations)
      .where(like(organizations.slug, `${baseSlug}%`));

    let slug = baseSlug;
    if (existing.length > 0) {
      const slugSet = new Set(existing.map((r) => r.slug));
      if (slugSet.has(baseSlug)) {
        let count = 1;
        while (slugSet.has(`${baseSlug}-${count}`)) count++;
        slug = `${baseSlug}-${count}`;
      }
    }

    const subDomain = `${slug}.${payload.domain}`;

    const [org] = await db
      .insert(organizations)
      .values({ ...payload, slug, subDomain })
      .returning();
    if (!org) throw new BadRequestException("Organization not created");
    return org;
  }

  async update(id: string, payload: UpdateOrganizationDTOType, c: Context) {
    const db = getDb(c);
    const [updated] = await db
      .update(organizations)
      .set({ ...payload, updatedAt: new Date().toISOString() })
      .where(eq(organizations.id, id))
      .returning();
    if (!updated) throw new NotFoundException("Organization not found");
    return updated;
  }

  async remove(id: string, c: Context) {
    const db = getDb(c);
    const [deleted] = await db.delete(organizations).where(eq(organizations.id, id)).returning();
    if (!deleted) throw new NotFoundException("Organization not found");
    return { message: "Deleted" };
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }
}

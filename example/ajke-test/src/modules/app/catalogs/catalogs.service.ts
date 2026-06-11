import { Injectable, NotFoundException } from "@ajke/core";
import type { Context } from "hono";
import { eq, and, desc, like } from "drizzle-orm";
import { getDb } from "@app/database/connection";
import { departments, categories, subCategories, brands, specialCategories } from "./catalogs.entity";
import type {
  CreateDepartmentDTOType, FilterDepartmentDTOType, UpdateDepartmentDTOType,
  CreateCategoryDTOType, FilterCategoryDTOType, UpdateCategoryDTOType,
  CreateSubCategoryDTOType, FilterSubCategoryDTOType, UpdateSubCategoryDTOType,
  CreateBrandDTOType, FilterBrandDTOType, UpdateBrandDTOType,
  CreateSpecialCategoryDTOType, FilterSpecialCategoryDTOType, UpdateSpecialCategoryDTOType,
  ReOrderSpecialCategoryDTOType,
} from "./catalogs.dto";

@Injectable()
export class CatalogsService {
  // ─── Departments ───────────────────────────────────────────────────────────

  async findAllDepartments(query: FilterDepartmentDTOType, c: Context) {
    const db = getDb(c);
    const conds = [];
    if (query.searchTerm) conds.push(like(departments.title, `%${query.searchTerm}%`));
    if (query.workspaceId) conds.push(eq(departments.organizationId, query.workspaceId));
    return db
      .select()
      .from(departments)
      .where(conds.length ? and(...conds) : undefined)
      .orderBy(desc(departments.createdAt));
  }

  async createDepartment(payload: CreateDepartmentDTOType, c: Context) {
    const db = getDb(c);
    const { workspaceId, ...rest } = payload;
    const slug = this.slugify(rest.title);
    const [dept] = await db
      .insert(departments)
      .values({ ...rest, slug, organizationId: workspaceId })
      .returning();
    return dept!;
  }

  async bulkCreateDepartments(items: CreateDepartmentDTOType[], c: Context) {
    const db = getDb(c);
    const rows = items.map(({ workspaceId, ...rest }) => ({
      ...rest,
      slug: this.slugify(rest.title),
      organizationId: workspaceId,
    }));
    return db.insert(departments).values(rows).returning();
  }

  async updateDepartment(id: string, payload: UpdateDepartmentDTOType, c: Context) {
    const db = getDb(c);
    const { workspaceId, ...rest } = payload;
    const [updated] = await db
      .update(departments)
      .set({ ...rest, organizationId: workspaceId, updatedAt: new Date().toISOString() })
      .where(eq(departments.id, id))
      .returning();
    if (!updated) throw new NotFoundException("Department not found");
    return updated;
  }

  async bulkUpdateDepartments(items: Array<{ id: string } & UpdateDepartmentDTOType>, c: Context) {
    const db = getDb(c);
    const now = new Date().toISOString();
    const results = await db.batch(
      items.map(({ id, workspaceId, ...rest }) =>
        db
          .update(departments)
          .set({ ...rest, organizationId: workspaceId, updatedAt: now })
          .where(eq(departments.id, id))
          .returning(),
      ) as unknown as Parameters<typeof db.batch>[0],
    );
    return results.flat();
  }

  async deleteDepartment(id: string, c: Context) {
    const db = getDb(c);
    await db.delete(departments).where(eq(departments.id, id));
    return { message: "Department deleted" };
  }

  // ─── Categories ────────────────────────────────────────────────────────────

  async findAllCategories(query: FilterCategoryDTOType, c: Context) {
    const db = getDb(c);
    const conds = [];
    if (query.searchTerm) conds.push(like(categories.title, `%${query.searchTerm}%`));
    if (query.department) conds.push(eq(categories.departmentId, query.department));
    if (query.workspaceId) conds.push(eq(categories.organizationId, query.workspaceId));
    return db
      .select()
      .from(categories)
      .where(conds.length ? and(...conds) : undefined)
      .orderBy(desc(categories.createdAt));
  }

  async createCategory(payload: CreateCategoryDTOType, c: Context) {
    const db = getDb(c);
    const { workspaceId, department, ...rest } = payload;
    const slug = this.slugify(rest.title);
    const [cat] = await db
      .insert(categories)
      .values({ ...rest, slug, departmentId: department, organizationId: workspaceId })
      .returning();
    return cat!;
  }

  async bulkCreateCategories(items: CreateCategoryDTOType[], c: Context) {
    const db = getDb(c);
    const rows = items.map(({ workspaceId, department, ...rest }) => ({
      ...rest,
      slug: this.slugify(rest.title),
      departmentId: department,
      organizationId: workspaceId,
    }));
    return db.insert(categories).values(rows).returning();
  }

  async updateCategory(id: string, payload: UpdateCategoryDTOType, c: Context) {
    const db = getDb(c);
    const { workspaceId, department, ...rest } = payload;
    const [updated] = await db
      .update(categories)
      .set({ ...rest, departmentId: department, organizationId: workspaceId, updatedAt: new Date().toISOString() })
      .where(eq(categories.id, id))
      .returning();
    if (!updated) throw new NotFoundException("Category not found");
    return updated;
  }

  async bulkUpdateCategories(items: Array<{ id: string } & UpdateCategoryDTOType>, c: Context) {
    const db = getDb(c);
    const now = new Date().toISOString();
    const results = await db.batch(
      items.map(({ id, workspaceId, department, ...rest }) =>
        db
          .update(categories)
          .set({ ...rest, departmentId: department, organizationId: workspaceId, updatedAt: now })
          .where(eq(categories.id, id))
          .returning(),
      ) as unknown as Parameters<typeof db.batch>[0],
    );
    return results.flat();
  }

  async deleteCategory(id: string, c: Context) {
    const db = getDb(c);
    await db.delete(categories).where(eq(categories.id, id));
    return { message: "Category deleted" };
  }

  // ─── SubCategories ─────────────────────────────────────────────────────────

  async findAllSubCategories(query: FilterSubCategoryDTOType, c: Context) {
    const db = getDb(c);
    const conds = [];
    if (query.searchTerm) conds.push(like(subCategories.title, `%${query.searchTerm}%`));
    if (query.category) conds.push(eq(subCategories.categoryId, query.category));
    if (query.workspaceId) conds.push(eq(subCategories.organizationId, query.workspaceId));
    return db
      .select()
      .from(subCategories)
      .where(conds.length ? and(...conds) : undefined)
      .orderBy(desc(subCategories.createdAt));
  }

  async createSubCategory(payload: CreateSubCategoryDTOType, c: Context) {
    const db = getDb(c);
    const { workspaceId, category, ...rest } = payload;
    const slug = this.slugify(rest.title);
    const [sc] = await db
      .insert(subCategories)
      .values({ ...rest, slug, categoryId: category, organizationId: workspaceId })
      .returning();
    return sc!;
  }

  async bulkCreateSubCategories(items: CreateSubCategoryDTOType[], c: Context) {
    const db = getDb(c);
    const rows = items.map(({ workspaceId, category, ...rest }) => ({
      ...rest,
      slug: this.slugify(rest.title),
      categoryId: category,
      organizationId: workspaceId,
    }));
    return db.insert(subCategories).values(rows).returning();
  }

  async updateSubCategory(id: string, payload: UpdateSubCategoryDTOType, c: Context) {
    const db = getDb(c);
    const { workspaceId, category, ...rest } = payload;
    const [updated] = await db
      .update(subCategories)
      .set({ ...rest, categoryId: category, organizationId: workspaceId, updatedAt: new Date().toISOString() })
      .where(eq(subCategories.id, id))
      .returning();
    if (!updated) throw new NotFoundException("SubCategory not found");
    return updated;
  }

  async bulkUpdateSubCategories(items: Array<{ id: string } & UpdateSubCategoryDTOType>, c: Context) {
    const db = getDb(c);
    const now = new Date().toISOString();
    const results = await db.batch(
      items.map(({ id, workspaceId, category, ...rest }) =>
        db
          .update(subCategories)
          .set({ ...rest, categoryId: category, organizationId: workspaceId, updatedAt: now })
          .where(eq(subCategories.id, id))
          .returning(),
      ) as unknown as Parameters<typeof db.batch>[0],
    );
    return results.flat();
  }

  async deleteSubCategory(id: string, c: Context) {
    const db = getDb(c);
    await db.delete(subCategories).where(eq(subCategories.id, id));
    return { message: "SubCategory deleted" };
  }

  // ─── Brands ────────────────────────────────────────────────────────────────

  async findAllBrands(query: FilterBrandDTOType, c: Context) {
    const db = getDb(c);
    const conds = [];
    if (query.searchTerm) conds.push(like(brands.title, `%${query.searchTerm}%`));
    if (query.workspaceId) conds.push(eq(brands.organizationId, query.workspaceId));
    return db
      .select()
      .from(brands)
      .where(conds.length ? and(...conds) : undefined)
      .orderBy(desc(brands.createdAt));
  }

  async createBrand(payload: CreateBrandDTOType, c: Context) {
    const db = getDb(c);
    const { workspaceId, ...rest } = payload;
    const slug = this.slugify(rest.title);
    const [brand] = await db
      .insert(brands)
      .values({ ...rest, slug, organizationId: workspaceId })
      .returning();
    return brand!;
  }

  async bulkCreateBrands(items: CreateBrandDTOType[], c: Context) {
    const db = getDb(c);
    const rows = items.map(({ workspaceId, ...rest }) => ({
      ...rest,
      slug: this.slugify(rest.title),
      organizationId: workspaceId,
    }));
    return db.insert(brands).values(rows).returning();
  }

  async updateBrand(id: string, payload: UpdateBrandDTOType, c: Context) {
    const db = getDb(c);
    const { workspaceId, ...rest } = payload;
    const [updated] = await db
      .update(brands)
      .set({ ...rest, organizationId: workspaceId, updatedAt: new Date().toISOString() })
      .where(eq(brands.id, id))
      .returning();
    if (!updated) throw new NotFoundException("Brand not found");
    return updated;
  }

  async bulkUpdateBrands(items: Array<{ id: string } & UpdateBrandDTOType>, c: Context) {
    const db = getDb(c);
    const now = new Date().toISOString();
    const results = await db.batch(
      items.map(({ id, workspaceId, ...rest }) =>
        db
          .update(brands)
          .set({ ...rest, organizationId: workspaceId, updatedAt: now })
          .where(eq(brands.id, id))
          .returning(),
      ) as unknown as Parameters<typeof db.batch>[0],
    );
    return results.flat();
  }

  async deleteBrand(id: string, c: Context) {
    const db = getDb(c);
    await db.delete(brands).where(eq(brands.id, id));
    return { message: "Brand deleted" };
  }

  // ─── Special Categories ────────────────────────────────────────────────────

  async findAllSpecialCategories(query: FilterSpecialCategoryDTOType, c: Context) {
    const db = getDb(c);
    const conds = [];
    if (query.searchTerm) conds.push(like(specialCategories.title, `%${query.searchTerm}%`));
    if (query.workspaceId) conds.push(eq(specialCategories.organizationId, query.workspaceId));
    return db
      .select()
      .from(specialCategories)
      .where(conds.length ? and(...conds) : undefined)
      .orderBy(specialCategories.orderPriority);
  }

  async createSpecialCategory(payload: CreateSpecialCategoryDTOType, c: Context) {
    const db = getDb(c);
    const { workspaceId, ...rest } = payload;
    const slug = this.slugify(rest.title);
    const [sc] = await db
      .insert(specialCategories)
      .values({ ...rest, slug, organizationId: workspaceId })
      .returning();
    return sc!;
  }

  async bulkCreateSpecialCategories(items: CreateSpecialCategoryDTOType[], c: Context) {
    const db = getDb(c);
    const rows = items.map(({ workspaceId, ...rest }) => ({
      ...rest,
      slug: this.slugify(rest.title),
      organizationId: workspaceId,
    }));
    return db.insert(specialCategories).values(rows).returning();
  }

  async updateSpecialCategory(id: string, payload: UpdateSpecialCategoryDTOType, c: Context) {
    const db = getDb(c);
    const { workspaceId, ...rest } = payload;
    const [updated] = await db
      .update(specialCategories)
      .set({ ...rest, organizationId: workspaceId, updatedAt: new Date().toISOString() })
      .where(eq(specialCategories.id, id))
      .returning();
    if (!updated) throw new NotFoundException("Special category not found");
    return updated;
  }

  async reorderSpecialCategories(items: ReOrderSpecialCategoryDTOType["items"], c: Context) {
    const db = getDb(c);
    const now = new Date().toISOString();
    await db.batch(
      items.map(({ id, orderPriority }) =>
        db.update(specialCategories).set({ orderPriority, updatedAt: now }).where(eq(specialCategories.id, id)),
      ) as unknown as Parameters<typeof db.batch>[0],
    );
    return { message: "Reordered" };
  }

  async deleteSpecialCategory(id: string, c: Context) {
    const db = getDb(c);
    await db.delete(specialCategories).where(eq(specialCategories.id, id));
    return { message: "Special category deleted" };
  }

  // ─── Utils ─────────────────────────────────────────────────────────────────

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }
}

import { Injectable, NotFoundException } from "@ajke/core";
import type { Context } from "hono";
import { eq, desc, inArray } from "drizzle-orm";
import { getDb } from "@app/database/connection";
import { fileStorages } from "./galleries.entity";

type DB = ReturnType<typeof getDb>;
type BatchItem = Parameters<DB["batch"]>[0][0];

@Injectable()
export class GalleriesService {
  async uploadFile(
    file: File | ArrayBuffer,
    fileName: string,
    folder: string,
    fileType: string,
    organizationId: string | undefined,
    c: Context,
  ): Promise<typeof fileStorages.$inferSelect> {
    const key = `${folder}/${Date.now()}-${fileName}`;
    await c.env.STORAGE.put(key, file);
    const link = `https://<your-r2-public-domain>/${key}`;

    const db = getDb(c);
    const [record] = await db
      .insert(fileStorages)
      .values({ storageType: "R2", fileType, folder, fileName, link, organizationId })
      .returning();
    return record!;
  }

  async uploadFiles(
    uploads: { file: File | ArrayBuffer; fileName: string; folder: string; fileType: string }[],
    organizationId: string | undefined,
    c: Context,
  ): Promise<typeof fileStorages.$inferSelect[]> {
    if (!uploads.length) return [];

    const uploaded = await Promise.all(
      uploads.map(async ({ file, fileName, folder, fileType }) => {
        const key = `${folder}/${Date.now()}-${fileName}`;
        await c.env.STORAGE.put(key, file);
        return {
          storageType: "R2" as const,
          fileType,
          folder,
          fileName,
          link: `https://<your-r2-public-domain>/${key}`,
          organizationId,
        };
      }),
    );

    const db = getDb(c);
    const batchItems = uploaded.map(
      (row) => db.insert(fileStorages).values(row).returning() as unknown as BatchItem,
    );
    const results = await db.batch(batchItems as [BatchItem, ...BatchItem[]]);
    return (results as unknown as (typeof fileStorages.$inferSelect)[][]).map((r) => r[0]!);
  }

  async findAll(query: { organizationId?: string }, c: Context) {
    const db = getDb(c);
    let q = db.select().from(fileStorages).$dynamic();
    if (query.organizationId) q = q.where(eq(fileStorages.organizationId, query.organizationId));
    return q.orderBy(desc(fileStorages.createdAt));
  }

  async deleteFile(id: string, c: Context) {
    const db = getDb(c);
    const [file] = await db.select().from(fileStorages).where(eq(fileStorages.id, id)).limit(1);
    if (!file) throw new NotFoundException("File not found");
    if (file.fileName && file.folder) {
      const key = `${file.folder}/${file.fileName}`;
      await c.env.STORAGE.delete(key).catch(() => {});
    }
    await db.delete(fileStorages).where(eq(fileStorages.id, id));
    return { message: "File deleted" };
  }

  async deleteFiles(ids: string[], c: Context) {
    if (!ids.length) return { message: "No files to delete" };
    const db = getDb(c);
    const files = await db.select().from(fileStorages).where(inArray(fileStorages.id, ids));
    await Promise.all(
      files
        .filter((f) => f.fileName && f.folder)
        .map(({ folder, fileName }) =>
          c.env.STORAGE.delete(`${folder}/${fileName}`).catch(() => {}),
        ),
    );
    const batchItems = ids.map(
      (id) => db.delete(fileStorages).where(eq(fileStorages.id, id)) as unknown as BatchItem,
    );
    await db.batch(batchItems as [BatchItem, ...BatchItem[]]);
    return { message: `${ids.length} file(s) deleted` };
  }
}

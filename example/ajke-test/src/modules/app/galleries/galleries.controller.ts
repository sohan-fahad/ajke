import type { Context } from "hono";
import { Controller, Get, Post, Delete, Param, UseGuards, Inject, QueryValidate } from "@ajke/core";
import { ResponseUtil } from "@ajke/core";
import { GalleriesService } from "./galleries.service";
import { AuthGuard } from "../auth/auth.guard";
import { FilterFileDTO, FilterFileDTOType } from "./galleries.dto";

@Controller("/v1/panel/galleries")
@UseGuards(AuthGuard)
export class GalleryController {
  constructor(@Inject(GalleriesService) private readonly svc: GalleriesService) {}

  @Get()
  @QueryValidate(FilterFileDTO)
  async findAll(c: Context) {
    const q = c.get("validatedQuery") as FilterFileDTOType;
    return ResponseUtil.success(c, await this.svc.findAll(q as any, c));
  }

  @Post("/upload")
  async upload(c: Context) {
    const formData = await c.req.formData();
    const file = formData.get("file") as File;
    const folder = formData.get("folder") as string || "uploads";
    const workspaceId = formData.get("workspaceId") as string | undefined;

    if (!file) return c.json({ error: "No file provided" }, 400);

    const fileType = file.type || "application/octet-stream";
    const buffer = await file.arrayBuffer();
    const record = await this.svc.uploadFile(buffer, file.name, folder, fileType, workspaceId, c);
    return ResponseUtil.success(c, record, "File uploaded");
  }

  @Delete("/:id")
  async remove(@Param("id") id: string, c: Context) {
    return ResponseUtil.success(c, await this.svc.deleteFile(id, c));
  }
}

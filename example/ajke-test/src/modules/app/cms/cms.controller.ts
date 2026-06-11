import type { Context } from "hono";
import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Inject, ZodValidate, QueryValidate } from "@ajke/core";
import { ResponseUtil } from "@ajke/core";
import { CmsService } from "./cms.service";
import { AuthGuard } from "../auth/auth.guard";
import { CreateBannerDTO, CreateBannerDTOType, FilterBannerDTO, FilterBannerDTOType, UpdateBannerDTO, UpdateBannerDTOType } from "./cms.dto";

@Controller("/v1/panel/cms")
@UseGuards(AuthGuard)
export class CmsPanelController {
  constructor(@Inject(CmsService) private readonly svc: CmsService) {}

  @Get()
  @QueryValidate(FilterBannerDTO)
  async findAll(c: Context) {
    const q = c.get("validatedQuery") as FilterBannerDTOType;
    return ResponseUtil.success(c, await this.svc.findAll(q as any, c));
  }

  @Get("/:id")
  async findOne(@Param("id") id: string, c: Context) {
    return ResponseUtil.success(c, await this.svc.findOne(id, c));
  }

  @Post()
  @ZodValidate(CreateBannerDTO)
  async create(@Body() body: CreateBannerDTOType, c: Context) {
    return ResponseUtil.success(c, await this.svc.create(body, c), "Created");
  }

  @Patch("/:id")
  @ZodValidate(UpdateBannerDTO)
  async update(@Param("id") id: string, @Body() body: UpdateBannerDTOType, c: Context) {
    return ResponseUtil.success(c, await this.svc.update(id, body, c), "Updated");
  }

  @Delete("/:id")
  async remove(@Param("id") id: string, c: Context) {
    return ResponseUtil.success(c, await this.svc.remove(id, c));
  }
}

@Controller("/v1/web/cms")
export class CmsPublicController {
  constructor(@Inject(CmsService) private readonly svc: CmsService) {}

  @Get()
  @QueryValidate(FilterBannerDTO)
  async findAll(c: Context) {
    const q = c.get("validatedQuery") as FilterBannerDTOType;
    return ResponseUtil.success(c, await this.svc.findAll({ ...q, isActive: true } as any, c));
  }

  @Get("/:id")
  async findOne(@Param("id") id: string, c: Context) {
    return ResponseUtil.success(c, await this.svc.findOne(id, c));
  }
}

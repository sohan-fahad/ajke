import type { Context } from "hono";
import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Inject, ZodValidate, QueryValidate } from "@ajke/core";
import { ResponseUtil } from "@ajke/core";
import { OrganizationService } from "./organization.service";
import { AuthGuard } from "../auth/auth.guard";
import {
  CreateOrganizationDTO, CreateOrganizationDTOType,
  FilterOrganizationDTO,
  UpdateOrganizationDTO, UpdateOrganizationDTOType,
  FilterOrganizationDTOType,
} from "./organization.dto";

@Controller("/v1/panel/organizations")
@UseGuards(AuthGuard)
export class OrganizationController {
  constructor(@Inject(OrganizationService) private readonly svc: OrganizationService) { }

  @Get()
  @QueryValidate(FilterOrganizationDTO)
  async findAll(c: Context, @Query() q: FilterOrganizationDTOType) {
    return ResponseUtil.success(c, await this.svc.findAll(c, q));
  }

  @Get("/:id")
  async findOne(@Param("id") id: string, c: Context) {
    return ResponseUtil.success(c, await this.svc.findOne(id, c));
  }

  @Post()
  @ZodValidate(CreateOrganizationDTO)
  async create(@Body() body: CreateOrganizationDTOType, c: Context) {
    return ResponseUtil.success(c, await this.svc.create(body, c), "Organization created");
  }

  @Patch("/:id")
  @ZodValidate(UpdateOrganizationDTO)
  async update(@Param("id") id: string, @Body() body: UpdateOrganizationDTOType, c: Context) {
    return ResponseUtil.success(c, await this.svc.update(id, body, c), "Organization updated");
  }

  @Delete("/:id")
  async remove(@Param("id") id: string, c: Context) {
    return ResponseUtil.success(c, await this.svc.remove(id, c));
  }
}

@Controller("/v1/web/organizations")
export class OrganizationPublicController {
  constructor(@Inject(OrganizationService) private readonly svc: OrganizationService) { }

  @Get("/by-domain/:domain")
  async findByDomain(@Param("domain") domain: string, c: Context) {
    return ResponseUtil.success(c, await this.svc.findByDomain(domain, c));
  }

  @Get("/by-slug/:slug")
  async findBySlug(@Param("slug") slug: string, c: Context) {
    return ResponseUtil.success(c, await this.svc.findBySlug(slug, c));
  }
}

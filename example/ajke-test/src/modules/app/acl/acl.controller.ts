import type { Context } from "hono";
import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Inject, ZodValidate, QueryValidate } from "@ajke/core";
import { ResponseUtil } from "@ajke/core";
import { AclService } from "./acl.service";
import { AuthGuard } from "../auth/auth.guard";
import {
  CreateRoleDTO, CreateRoleDTOType,
  UpdateRoleDTO, UpdateRoleDTOType,
  FilterRoleDTO, FilterRoleDTOType,
  AddPermissionsDTO, AddPermissionsDTOType,
  CreatePermissionDTO, CreatePermissionDTOType,
  FilterPermissionDTO, FilterPermissionDTOType,
  CreatePermissionTypeDTO, CreatePermissionTypeDTOType,
} from "./acl.dto";

@Controller("/v1/panel/roles")
@UseGuards(AuthGuard)
export class RoleController {
  constructor(@Inject(AclService) private readonly aclService: AclService) { }

  @Get()
  @QueryValidate(FilterRoleDTO)
  async findAll(c: Context) {
    const q = c.get("validatedQuery") as FilterRoleDTOType;
    const data = await this.aclService.findAllRoles(q, c);
    return ResponseUtil.success(c, data);
  }

  @Post()
  @ZodValidate(CreateRoleDTO)
  async create(@Body() body: CreateRoleDTOType, c: Context) {
    const data = await this.aclService.createRole(body, c);
    return ResponseUtil.success(c, data, "Role created");
  }

  @Patch("/:id")
  @ZodValidate(UpdateRoleDTO)
  async update(@Param("id") id: string, @Body() body: UpdateRoleDTOType, c: Context) {
    const data = await this.aclService.updateRole(id, body, c);
    return ResponseUtil.success(c, data, "Role updated");
  }

  @Delete("/:id")
  async remove(@Param("id") id: string, c: Context) {
    const data = await this.aclService.deleteRole(id, c);
    return ResponseUtil.success(c, data);
  }

  @Get("/:id/permissions")
  async getPermissions(@Param("id") id: string, c: Context) {
    const data = await this.aclService.getRolePermissions(id, c);
    return ResponseUtil.success(c, data);
  }

  @Post("/:id/permissions")
  @ZodValidate(AddPermissionsDTO)
  async addPermissions(@Param("id") id: string, @Body() body: AddPermissionsDTOType, c: Context) {
    const data = await this.aclService.addPermissionsToRole(id, body.permissions, body.workspaceId, c);
    return ResponseUtil.success(c, data, "Permissions added");
  }

  @Delete("/:id/permissions/:permissionId")
  async removePermission(@Param("id") id: string, @Param("permissionId") permissionId: string, c: Context) {
    const data = await this.aclService.removePermissionFromRole(id, permissionId, c);
    return ResponseUtil.success(c, data);
  }
}

@Controller("/v1/panel/permissions")
@UseGuards(AuthGuard)
export class PermissionController {
  constructor(@Inject(AclService) private readonly aclService: AclService) { }

  @Get()
  @QueryValidate(FilterPermissionDTO)
  async findAll(c: Context) {
    const q = c.get("validatedQuery") as FilterPermissionDTOType;
    const data = await this.aclService.findAllPermissions(q as any, c);
    return ResponseUtil.success(c, data);
  }

  @Post()
  @ZodValidate(CreatePermissionDTO)
  async create(@Body() body: CreatePermissionDTOType, c: Context) {
    const data = await this.aclService.createPermission(body, c);
    return ResponseUtil.success(c, data, "Permission created");
  }
}

@Controller("/v1/panel/permission-types")
@UseGuards(AuthGuard)
export class PermissionTypeController {
  constructor(@Inject(AclService) private readonly aclService: AclService) { }

  @Get()
  async findAll(c: Context) {
    const data = await this.aclService.findAllPermissionTypes(c);
    return ResponseUtil.success(c, data);
  }

  @Post()
  @ZodValidate(CreatePermissionTypeDTO)
  async create(@Body() body: CreatePermissionTypeDTOType, c: Context) {
    const data = await this.aclService.createPermissionType(body, c);
    return ResponseUtil.success(c, data, "Permission type created");
  }
}

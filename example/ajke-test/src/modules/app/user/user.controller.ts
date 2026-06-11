import type { Context } from "hono";
import { Controller, Get, Post, Delete, Patch, Body, Param, UseGuards, Inject, ZodValidate, QueryValidate } from "@ajke/core";
import { ResponseUtil } from "@ajke/core";
import { UserService } from "./user.service";
import { AuthGuard } from "../auth/auth.guard";
import { CreateUserDTO, CreateUserDTOType, FilterUserDTO, FilterUserDTOType, UpdateUserDTO, UpdateUserDTOType } from "./user.dto";

@Controller("/v1/panel/users")
@UseGuards(AuthGuard)
export class UserPanelController {
  constructor(@Inject(UserService) private readonly userService: UserService) {}

  @Get()
  @QueryValidate(FilterUserDTO)
  async findAll(c: Context) {
    const q = c.get("validatedQuery") as FilterUserDTOType;
    const data = await this.userService.findAll(q as any, c);
    return ResponseUtil.success(c, data);
  }

  @Get("/:id")
  async findOne(@Param("id") id: string, c: Context) {
    const data = await this.userService.findOne(id, c);
    return ResponseUtil.success(c, data);
  }

  @Post()
  @ZodValidate(CreateUserDTO)
  async create(@Body() body: CreateUserDTOType, c: Context) {
    const data = await this.userService.createUser(body as any, c);
    return ResponseUtil.success(c, data, "User created successfully");
  }

  @Patch("/:id")
  @ZodValidate(UpdateUserDTO)
  async update(@Param("id") id: string, @Body() body: UpdateUserDTOType, c: Context) {
    const data = await this.userService.updateUser(id, body, c);
    return ResponseUtil.success(c, data, "User updated successfully");
  }

  @Delete("/:id")
  async remove(@Param("id") id: string, c: Context) {
    const data = await this.userService.deleteUser(id, c);
    return ResponseUtil.success(c, data);
  }

  @Get("/:id/roles")
  async getUserRoles(@Param("id") id: string, c: Context) {
    const data = await this.userService.getUserRoles(id, c);
    return ResponseUtil.success(c, data);
  }

  @Post("/:id/roles")
  async addRoles(@Param("id") id: string, @Body() body: { roleIds: string[]; workspaceId?: string }, c: Context) {
    const data = await this.userService.addRoles(id, body.roleIds, body.workspaceId, c);
    return ResponseUtil.success(c, data, "Roles added");
  }

  @Delete("/:id/roles/:roleId")
  async removeRole(@Param("id") id: string, @Param("roleId") roleId: string, c: Context) {
    const data = await this.userService.removeRole(id, roleId, c);
    return ResponseUtil.success(c, data);
  }
}

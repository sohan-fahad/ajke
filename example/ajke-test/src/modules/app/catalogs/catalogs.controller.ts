import type { Context } from "hono";
import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Inject, ZodValidate, QueryValidate } from "@ajke/core";
import { ResponseUtil } from "@ajke/core";
import { CatalogsService } from "./catalogs.service";
import { AuthGuard } from "../auth/auth.guard";
import {
  CreateDepartmentDTO, CreateDepartmentDTOType,
  FilterDepartmentDTO, FilterDepartmentDTOType,
  UpdateDepartmentDTO, UpdateDepartmentDTOType,
  CreateCategoryDTO, CreateCategoryDTOType,
  FilterCategoryDTO, FilterCategoryDTOType,
  UpdateCategoryDTO, UpdateCategoryDTOType,
  CreateSubCategoryDTO, CreateSubCategoryDTOType,
  FilterSubCategoryDTO, FilterSubCategoryDTOType,
  UpdateSubCategoryDTO, UpdateSubCategoryDTOType,
  CreateBrandDTO, CreateBrandDTOType,
  FilterBrandDTO, FilterBrandDTOType,
  UpdateBrandDTO, UpdateBrandDTOType,
  CreateSpecialCategoryDTO, CreateSpecialCategoryDTOType,
  FilterSpecialCategoryDTO, FilterSpecialCategoryDTOType,
  UpdateSpecialCategoryDTO, UpdateSpecialCategoryDTOType,
} from "./catalogs.dto";

@Controller("/v1/panel/departments")
@UseGuards(AuthGuard)
export class DepartmentPanelController {
  constructor(@Inject(CatalogsService) private readonly svc: CatalogsService) {}

  @Get()
  @QueryValidate(FilterDepartmentDTO)
  async findAll(c: Context) {
    const q = c.get("validatedQuery") as FilterDepartmentDTOType;
    return ResponseUtil.success(c, await this.svc.findAllDepartments(q as any, c));
  }

  @Post()
  @ZodValidate(CreateDepartmentDTO)
  async create(@Body() body: CreateDepartmentDTOType, c: Context) {
    return ResponseUtil.success(c, await this.svc.createDepartment(body, c), "Department created");
  }

  @Patch("/:id")
  @ZodValidate(UpdateDepartmentDTO)
  async update(@Param("id") id: string, @Body() body: UpdateDepartmentDTOType, c: Context) {
    return ResponseUtil.success(c, await this.svc.updateDepartment(id, body, c), "Department updated");
  }

  @Delete("/:id")
  async remove(@Param("id") id: string, c: Context) {
    return ResponseUtil.success(c, await this.svc.deleteDepartment(id, c));
  }
}

@Controller("/v1/departments")
export class DepartmentPublicController {
  constructor(@Inject(CatalogsService) private readonly svc: CatalogsService) {}

  @Get()
  @QueryValidate(FilterDepartmentDTO)
  async findAll(c: Context) {
    const q = c.get("validatedQuery") as FilterDepartmentDTOType;
    return ResponseUtil.success(c, await this.svc.findAllDepartments(q as any, c));
  }
}

@Controller("/v1/panel/categories")
@UseGuards(AuthGuard)
export class CategoryPanelController {
  constructor(@Inject(CatalogsService) private readonly svc: CatalogsService) {}

  @Get()
  @QueryValidate(FilterCategoryDTO)
  async findAll(c: Context) {
    const q = c.get("validatedQuery") as FilterCategoryDTOType;
    return ResponseUtil.success(c, await this.svc.findAllCategories(q as any, c));
  }

  @Post()
  @ZodValidate(CreateCategoryDTO)
  async create(@Body() body: CreateCategoryDTOType, c: Context) {
    return ResponseUtil.success(c, await this.svc.createCategory(body, c), "Category created");
  }

  @Patch("/:id")
  @ZodValidate(UpdateCategoryDTO)
  async update(@Param("id") id: string, @Body() body: UpdateCategoryDTOType, c: Context) {
    return ResponseUtil.success(c, await this.svc.updateCategory(id, body, c), "Category updated");
  }

  @Delete("/:id")
  async remove(@Param("id") id: string, c: Context) {
    return ResponseUtil.success(c, await this.svc.deleteCategory(id, c));
  }
}

@Controller("/v1/categories")
export class CategoryPublicController {
  constructor(@Inject(CatalogsService) private readonly svc: CatalogsService) {}

  @Get()
  @QueryValidate(FilterCategoryDTO)
  async findAll(c: Context) {
    const q = c.get("validatedQuery") as FilterCategoryDTOType;
    return ResponseUtil.success(c, await this.svc.findAllCategories(q as any, c));
  }
}

@Controller("/v1/panel/sub-categories")
@UseGuards(AuthGuard)
export class SubCategoryPanelController {
  constructor(@Inject(CatalogsService) private readonly svc: CatalogsService) {}

  @Get()
  @QueryValidate(FilterSubCategoryDTO)
  async findAll(c: Context) {
    const q = c.get("validatedQuery") as FilterSubCategoryDTOType;
    return ResponseUtil.success(c, await this.svc.findAllSubCategories(q as any, c));
  }

  @Post()
  @ZodValidate(CreateSubCategoryDTO)
  async create(@Body() body: CreateSubCategoryDTOType, c: Context) {
    return ResponseUtil.success(c, await this.svc.createSubCategory(body, c), "SubCategory created");
  }

  @Patch("/:id")
  @ZodValidate(UpdateSubCategoryDTO)
  async update(@Param("id") id: string, @Body() body: UpdateSubCategoryDTOType, c: Context) {
    return ResponseUtil.success(c, await this.svc.updateSubCategory(id, body, c), "SubCategory updated");
  }

  @Delete("/:id")
  async remove(@Param("id") id: string, c: Context) {
    return ResponseUtil.success(c, await this.svc.deleteSubCategory(id, c));
  }
}

@Controller("/v1/panel/brands")
@UseGuards(AuthGuard)
export class BrandPanelController {
  constructor(@Inject(CatalogsService) private readonly svc: CatalogsService) {}

  @Get()
  @QueryValidate(FilterBrandDTO)
  async findAll(c: Context) {
    const q = c.get("validatedQuery") as FilterBrandDTOType;
    return ResponseUtil.success(c, await this.svc.findAllBrands(q as any, c));
  }

  @Post()
  @ZodValidate(CreateBrandDTO)
  async create(@Body() body: CreateBrandDTOType, c: Context) {
    return ResponseUtil.success(c, await this.svc.createBrand(body, c), "Brand created");
  }

  @Patch("/:id")
  @ZodValidate(UpdateBrandDTO)
  async update(@Param("id") id: string, @Body() body: UpdateBrandDTOType, c: Context) {
    return ResponseUtil.success(c, await this.svc.updateBrand(id, body, c), "Brand updated");
  }

  @Delete("/:id")
  async remove(@Param("id") id: string, c: Context) {
    return ResponseUtil.success(c, await this.svc.deleteBrand(id, c));
  }
}

@Controller("/v1/panel/special-categories")
@UseGuards(AuthGuard)
export class SpecialCategoryPanelController {
  constructor(@Inject(CatalogsService) private readonly svc: CatalogsService) {}

  @Get()
  @QueryValidate(FilterSpecialCategoryDTO)
  async findAll(c: Context) {
    const q = c.get("validatedQuery") as FilterSpecialCategoryDTOType;
    return ResponseUtil.success(c, await this.svc.findAllSpecialCategories(q as any, c));
  }

  @Post()
  @ZodValidate(CreateSpecialCategoryDTO)
  async create(@Body() body: CreateSpecialCategoryDTOType, c: Context) {
    return ResponseUtil.success(c, await this.svc.createSpecialCategory(body, c), "Special category created");
  }

  @Patch("/:id")
  @ZodValidate(UpdateSpecialCategoryDTO)
  async update(@Param("id") id: string, @Body() body: UpdateSpecialCategoryDTOType, c: Context) {
    return ResponseUtil.success(c, await this.svc.updateSpecialCategory(id, body, c), "Special category updated");
  }

  @Delete("/:id")
  async remove(@Param("id") id: string, c: Context) {
    return ResponseUtil.success(c, await this.svc.deleteSpecialCategory(id, c));
  }
}

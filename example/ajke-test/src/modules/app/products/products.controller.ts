import type { Context } from "hono";
import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Inject, ZodValidate } from "@ajke/core";
import { ResponseUtil } from "@ajke/core";
import { ProductsService } from "./products.service";
import { AuthGuard } from "../auth/auth.guard";
import {
  CreateProductDTO, CreateProductDTOType,
  UpdateProductDTO, UpdateProductDTOType,
  ProductImageDTO, ProductImageDTOType,
  CreateVariantDTO, CreateVariantDTOType,
  CreateVariantOptionDTO, CreateVariantOptionDTOType,
  CreateProductZoneMappingDTO, CreateProductZoneMappingDTOType,
  CreateProductRatingDTO, CreateProductRatingDTOType,
} from "./products.dto";

@Controller("/v1/panel/products")
@UseGuards(AuthGuard)
export class ProductPanelController {
  constructor(@Inject(ProductsService) private readonly svc: ProductsService) {}

  @Get()
  async findAll(@Query() q: Record<string, string>, c: Context) {
    return ResponseUtil.success(c, await this.svc.findAll(q as any, c));
  }

  @Get("/:id")
  async findOne(@Param("id") id: string, c: Context) {
    return ResponseUtil.success(c, await this.svc.findOne(id, c));
  }

  @Post()
  @ZodValidate(CreateProductDTO)
  async create(@Body() body: CreateProductDTOType, c: Context) {
    return ResponseUtil.success(c, await this.svc.create(body, c), "Product created");
  }

  @Patch("/:id")
  @ZodValidate(UpdateProductDTO)
  async update(@Param("id") id: string, @Body() body: UpdateProductDTOType, c: Context) {
    return ResponseUtil.success(c, await this.svc.update(id, body, c), "Product updated");
  }

  @Delete("/:id")
  async remove(@Param("id") id: string, c: Context) {
    return ResponseUtil.success(c, await this.svc.delete(id, c));
  }

  @Post("/:id/images")
  @ZodValidate(ProductImageDTO)
  async addImage(@Param("id") id: string, @Body() body: ProductImageDTOType, c: Context) {
    return ResponseUtil.success(c, await this.svc.addImage(id, body, c), "Image added");
  }

  @Delete("/images/:imageId")
  async deleteImage(@Param("imageId") imageId: string, c: Context) {
    return ResponseUtil.success(c, await this.svc.deleteImage(imageId, c));
  }
}

@Controller("/v1/products")
export class ProductPublicController {
  constructor(@Inject(ProductsService) private readonly svc: ProductsService) {}

  @Get()
  async findAll(@Query() q: Record<string, string>, c: Context) {
    return ResponseUtil.success(c, await this.svc.findAll({ ...q, status: "published" } as any, c));
  }

  @Get("/:id")
  async findOne(@Param("id") id: string, c: Context) {
    return ResponseUtil.success(c, await this.svc.findOne(id, c));
  }
}

@Controller("/v1/panel/variants")
@UseGuards(AuthGuard)
export class VariantController {
  constructor(@Inject(ProductsService) private readonly svc: ProductsService) {}

  @Get()
  async findAll(c: Context) {
    return ResponseUtil.success(c, await this.svc.findAllVariants(c));
  }

  @Post()
  @ZodValidate(CreateVariantDTO)
  async create(@Body() body: CreateVariantDTOType, c: Context) {
    return ResponseUtil.success(c, await this.svc.createVariant(body, c), "Variant created");
  }

  @Get("/:id/options")
  async findOptions(@Param("id") id: string, c: Context) {
    return ResponseUtil.success(c, await this.svc.findAllVariantOptions(id, c));
  }

  @Post("/options")
  @ZodValidate(CreateVariantOptionDTO)
  async createOption(@Body() body: CreateVariantOptionDTOType, c: Context) {
    return ResponseUtil.success(c, await this.svc.createVariantOption(body, c), "Variant option created");
  }
}

@Controller("/v1/panel/product-zone-mappings")
@UseGuards(AuthGuard)
export class ProductZoneMappingController {
  constructor(@Inject(ProductsService) private readonly svc: ProductsService) {}

  @Get()
  async findAll(@Query() q: Record<string, string>, c: Context) {
    return ResponseUtil.success(c, await this.svc.findProductZoneMappings(q, c));
  }

  @Post()
  @ZodValidate(CreateProductZoneMappingDTO)
  async create(@Body() body: CreateProductZoneMappingDTOType, c: Context) {
    return ResponseUtil.success(c, await this.svc.createProductZoneMapping(body, c), "Mapping created");
  }

  @Patch("/:id")
  async update(@Param("id") id: string, @Body() body: Record<string, unknown>, c: Context) {
    return ResponseUtil.success(c, await this.svc.updateProductZoneMapping(id, body as any, c), "Mapping updated");
  }
}

@Controller("/v1/product-ratings")
@UseGuards(AuthGuard)
export class ProductRatingController {
  constructor(@Inject(ProductsService) private readonly svc: ProductsService) {}

  @Post()
  @ZodValidate(CreateProductRatingDTO)
  async create(@Body() body: CreateProductRatingDTOType, c: Context) {
    const authUser = c.get("authUser" as never) as { id: string };
    return ResponseUtil.success(c, await this.svc.createRating({ ...body, customerId: authUser.id }, c), "Rating submitted");
  }
}

import type { Context } from "hono";
import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Inject, ZodValidate, QueryValidate } from "@ajke/core";
import { ResponseUtil } from "@ajke/core";
import { LocationsService } from "./locations.service";
import { AuthGuard } from "../auth/auth.guard";
import {
  CreateCityDTO, CreateCityDTOType,
  FilterCityDTO, FilterCityDTOType,
  UpdateCityDTO, UpdateCityDTOType,
  CreateZoneDTO, CreateZoneDTOType,
  FilterZoneDTO, FilterZoneDTOType,
  UpdateZoneDTO, UpdateZoneDTOType,
  CreateAreaDTO, CreateAreaDTOType,
  FilterAreaDTO, FilterAreaDTOType,
  UpdateAreaDTO, UpdateAreaDTOType,
  CreateWarehouseDTO, CreateWarehouseDTOType,
  FilterWarehouseDTO, FilterWarehouseDTOType,
  CreateAddressDTO, CreateAddressDTOType,
  UpdateAddressDTO, UpdateAddressDTOType,
} from "./locations.dto";

@Controller("/v1/panel/cities")
@UseGuards(AuthGuard)
export class CityPanelController {
  constructor(@Inject(LocationsService) private readonly svc: LocationsService) {}

  @Get()
  @QueryValidate(FilterCityDTO)
  async findAll(c: Context) {
    const q = c.get("validatedQuery") as FilterCityDTOType;
    return ResponseUtil.success(c, await this.svc.findAllCities(q as any, c));
  }

  @Post()
  @ZodValidate(CreateCityDTO)
  async create(@Body() body: CreateCityDTOType, c: Context) {
    return ResponseUtil.success(c, await this.svc.createCity(body, c), "City created");
  }

  @Patch("/:id")
  @ZodValidate(UpdateCityDTO)
  async update(@Param("id") id: string, @Body() body: UpdateCityDTOType, c: Context) {
    return ResponseUtil.success(c, await this.svc.updateCity(id, body, c), "City updated");
  }

  @Delete("/:id")
  async remove(@Param("id") id: string, c: Context) {
    return ResponseUtil.success(c, await this.svc.deleteCity(id, c));
  }
}

@Controller("/v1/cities")
export class CityPublicController {
  constructor(@Inject(LocationsService) private readonly svc: LocationsService) {}

  @Get()
  @QueryValidate(FilterCityDTO)
  async findAll(c: Context) {
    const q = c.get("validatedQuery") as FilterCityDTOType;
    return ResponseUtil.success(c, await this.svc.findAllCities(q as any, c));
  }
}

@Controller("/v1/panel/zones")
@UseGuards(AuthGuard)
export class ZonePanelController {
  constructor(@Inject(LocationsService) private readonly svc: LocationsService) {}

  @Get()
  @QueryValidate(FilterZoneDTO)
  async findAll(c: Context) {
    const q = c.get("validatedQuery") as FilterZoneDTOType;
    return ResponseUtil.success(c, await this.svc.findAllZones(q as any, c));
  }

  @Post()
  @ZodValidate(CreateZoneDTO)
  async create(@Body() body: CreateZoneDTOType, c: Context) {
    return ResponseUtil.success(c, await this.svc.createZone(body, c), "Zone created");
  }

  @Patch("/:id")
  @ZodValidate(UpdateZoneDTO)
  async update(@Param("id") id: string, @Body() body: UpdateZoneDTOType, c: Context) {
    return ResponseUtil.success(c, await this.svc.updateZone(id, body, c), "Zone updated");
  }

  @Delete("/:id")
  async remove(@Param("id") id: string, c: Context) {
    return ResponseUtil.success(c, await this.svc.deleteZone(id, c));
  }
}

@Controller("/v1/zones")
export class ZonePublicController {
  constructor(@Inject(LocationsService) private readonly svc: LocationsService) {}

  @Get()
  @QueryValidate(FilterZoneDTO)
  async findAll(c: Context) {
    const q = c.get("validatedQuery") as FilterZoneDTOType;
    return ResponseUtil.success(c, await this.svc.findAllZones(q as any, c));
  }
}

@Controller("/v1/panel/areas")
@UseGuards(AuthGuard)
export class AreaPanelController {
  constructor(@Inject(LocationsService) private readonly svc: LocationsService) {}

  @Get()
  @QueryValidate(FilterAreaDTO)
  async findAll(c: Context) {
    const q = c.get("validatedQuery") as FilterAreaDTOType;
    return ResponseUtil.success(c, await this.svc.findAllAreas(q as any, c));
  }

  @Post()
  @ZodValidate(CreateAreaDTO)
  async create(@Body() body: CreateAreaDTOType, c: Context) {
    return ResponseUtil.success(c, await this.svc.createArea(body, c), "Area created");
  }

  @Patch("/:id")
  @ZodValidate(UpdateAreaDTO)
  async update(@Param("id") id: string, @Body() body: UpdateAreaDTOType, c: Context) {
    return ResponseUtil.success(c, await this.svc.updateArea(id, body, c), "Area updated");
  }

  @Delete("/:id")
  async remove(@Param("id") id: string, c: Context) {
    return ResponseUtil.success(c, await this.svc.deleteArea(id, c));
  }
}

@Controller("/v1/areas")
export class AreaPublicController {
  constructor(@Inject(LocationsService) private readonly svc: LocationsService) {}

  @Get()
  @QueryValidate(FilterAreaDTO)
  async findAll(c: Context) {
    const q = c.get("validatedQuery") as FilterAreaDTOType;
    return ResponseUtil.success(c, await this.svc.findAllAreas(q as any, c));
  }
}

@Controller("/v1/panel/warehouses")
@UseGuards(AuthGuard)
export class WarehouseController {
  constructor(@Inject(LocationsService) private readonly svc: LocationsService) {}

  @Get()
  @QueryValidate(FilterWarehouseDTO)
  async findAll(c: Context) {
    const q = c.get("validatedQuery") as FilterWarehouseDTOType;
    return ResponseUtil.success(c, await this.svc.findAllWarehouses(q as any, c));
  }

  @Post()
  @ZodValidate(CreateWarehouseDTO)
  async create(@Body() body: CreateWarehouseDTOType, c: Context) {
    return ResponseUtil.success(c, await this.svc.createWarehouse(body, c), "Warehouse created");
  }
}

@Controller("/v1/addresses")
@UseGuards(AuthGuard)
export class AddressController {
  constructor(@Inject(LocationsService) private readonly svc: LocationsService) {}

  @Get("/my-addresses")
  async myAddresses(c: Context) {
    const authUser = c.get("authUser" as never) as { id: string };
    const workspaceId = c.req.query("workspaceId");
    return ResponseUtil.success(c, await this.svc.findMyAddresses(authUser.id, workspaceId, c));
  }

  @Post()
  @ZodValidate(CreateAddressDTO)
  async create(@Body() body: CreateAddressDTOType, c: Context) {
    return ResponseUtil.success(c, await this.svc.createAddress(body, c), "Address created");
  }

  @Patch("/:id")
  @ZodValidate(UpdateAddressDTO)
  async update(@Param("id") id: string, @Body() body: UpdateAddressDTOType, c: Context) {
    return ResponseUtil.success(c, await this.svc.updateAddress(id, body, c), "Address updated");
  }

  @Delete("/:id")
  async remove(@Param("id") id: string, c: Context) {
    return ResponseUtil.success(c, await this.svc.deleteAddress(id, c));
  }
}

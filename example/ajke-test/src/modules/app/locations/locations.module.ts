import { Module } from "@ajke/core";
import { CityPanelController, CityPublicController, ZonePanelController, ZonePublicController, AreaPanelController, AreaPublicController, WarehouseController, AddressController } from "./locations.controller";
import { LocationsService } from "./locations.service";

@Module({
  controllers: [CityPanelController, CityPublicController, ZonePanelController, ZonePublicController, AreaPanelController, AreaPublicController, WarehouseController, AddressController],
  providers: [LocationsService],
  exports: [LocationsService],
})
export class LocationsModule {}

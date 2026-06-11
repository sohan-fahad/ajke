import { Module } from "@ajke/core";
import { ProductPanelController, ProductPublicController, VariantController, ProductZoneMappingController, ProductRatingController } from "./products.controller";
import { ProductsService } from "./products.service";

@Module({
  controllers: [ProductPanelController, ProductPublicController, VariantController, ProductZoneMappingController, ProductRatingController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}

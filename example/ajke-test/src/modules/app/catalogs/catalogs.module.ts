import { Module } from "@ajke/core";
import { DepartmentPanelController, DepartmentPublicController, CategoryPanelController, CategoryPublicController, SubCategoryPanelController, BrandPanelController, SpecialCategoryPanelController } from "./catalogs.controller";
import { CatalogsService } from "./catalogs.service";

@Module({
  controllers: [
    DepartmentPanelController,
    DepartmentPublicController,
    CategoryPanelController,
    CategoryPublicController,
    SubCategoryPanelController,
    BrandPanelController,
    SpecialCategoryPanelController,
  ],
  providers: [CatalogsService],
  exports: [CatalogsService],
})
export class CatalogsModule {}

import { Module } from "@ajke/core";
import { OrganizationController, OrganizationPublicController } from "./organization.controller";
import { OrganizationService } from "./organization.service";

@Module({
  controllers: [OrganizationController, OrganizationPublicController],
  providers: [OrganizationService],
  exports: [OrganizationService],
})
export class OrganizationModule {}

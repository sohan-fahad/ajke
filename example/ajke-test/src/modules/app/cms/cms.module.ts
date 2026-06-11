import { Module } from "@ajke/core";
import { CmsPanelController, CmsPublicController } from "./cms.controller";
import { CmsService } from "./cms.service";

@Module({
  controllers: [CmsPanelController, CmsPublicController],
  providers: [CmsService],
  exports: [CmsService],
})
export class CmsModule {}

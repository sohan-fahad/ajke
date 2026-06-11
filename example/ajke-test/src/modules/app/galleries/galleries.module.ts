import { Module } from "@ajke/core";
import { GalleryController } from "./galleries.controller";
import { GalleriesService } from "./galleries.service";

@Module({
  controllers: [GalleryController],
  providers: [GalleriesService],
  exports: [GalleriesService],
})
export class GalleriesModule {}

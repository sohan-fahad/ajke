import { Module } from "@ajke/core";
import {
  NotificationController,
  TestimonialController,
  TestimonialPublicController,
  FeedbackPanelController,
  FeedbackPublicController,
  NewsletterController,
} from "./commons.controller";
import { CommonsService } from "./commons.service";

@Module({
  controllers: [
    NotificationController,
    TestimonialController,
    TestimonialPublicController,
    FeedbackPanelController,
    FeedbackPublicController,
    NewsletterController,
  ],
  providers: [CommonsService],
  exports: [CommonsService],
})
export class CommonsModule {}

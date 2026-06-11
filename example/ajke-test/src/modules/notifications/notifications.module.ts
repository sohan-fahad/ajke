import { Global, Module } from "@ajke/core";
import { EmailService } from "./email.service";
import { FcmService } from "./fcm.service";
import { SlackService } from "./slack.service";
import { SmsService } from "./sms.service";

@Global()
@Module({
  providers: [EmailService, FcmService, SlackService, SmsService],
  exports: [EmailService, FcmService, SlackService, SmsService],
})
export class NotificationsModule {}

import { Global, Module } from "@ajke/core";
import { QueueService } from "./queue.service";

@Global()
@Module({
  providers: [QueueService],
  exports: [QueueService],
})
export class QueueModule {}

import "reflect-metadata";
import { app } from "./app.module";
import { processOrderPlacedBatch } from "./modules/queues/consumers/order-placed.consumer";
import { processOrderEventsBatch } from "./modules/queues/consumers/order-events.consumer";
import type { OrderQueuePayload } from "./modules/queues/queue.types";
import type { OrderEventPayload } from "./modules/queues/queue.types";

export default {
  async fetch(request: Request, env: CloudflareBindings, ctx: ExecutionContext): Promise<Response> {
    return app.fetch(request, env, ctx);
  },

  async queue(batch: MessageBatch<unknown>, env: CloudflareBindings, ctx: ExecutionContext): Promise<void> {
    if (batch.queue === "order-placed-queue") {
      await processOrderPlacedBatch(batch as MessageBatch<OrderQueuePayload>, env);
    } else if (batch.queue === "order-events-queue") {
      await processOrderEventsBatch(batch as MessageBatch<OrderEventPayload>, env);
    }
  },
};

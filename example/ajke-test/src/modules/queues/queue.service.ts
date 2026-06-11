import { Injectable } from "@ajke/core";
import type { Context } from "hono";
import type { OrderQueuePayload, OrderEventPayload } from "./queue.types";

@Injectable()
export class QueueService {
  async addToOrderPlacedQueue(payload: OrderQueuePayload, c: Context): Promise<void> {
    await c.env.ORDER_QUEUE.send(payload);
  }

  async addToOrderEventsQueue(payload: OrderEventPayload, c: Context): Promise<void> {
    await c.env.ORDER_EVENTS_QUEUE.send(payload);
  }
}

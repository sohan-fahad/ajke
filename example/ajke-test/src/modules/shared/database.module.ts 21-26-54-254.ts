import { Global, Module } from "wilt";
import type { Context } from "hono";
import { drizzle } from "drizzle-orm/d1";
import { schema } from "../../database/schema";

@Global()
@Module({})
export class DatabaseModule { }

export function getDb(c: Context) {
  return drizzle(c.env.DB, { schema });
}

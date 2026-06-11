import { drizzle } from "drizzle-orm/d1";
import { schema } from "./schema";
import { AppContext } from "@ajke/core";

export function getDb(c: AppContext) {
  return drizzle(c.env.DB, { schema: schema });
}

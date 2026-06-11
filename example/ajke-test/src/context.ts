import type { AppContext } from "@ajke/core";

declare module "@ajke/core" {
  interface AjkeBindings extends CloudflareBindings {}
}

export type Ctx = AppContext;

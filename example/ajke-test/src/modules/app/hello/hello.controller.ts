import type { Context } from "hono";
import { Controller, Get, Inject } from "@ajke/core";
import { ResponseUtil } from "@ajke/core";
import { HelloService } from "./hello.service";

@Controller("/hello")
export class HelloController {
  constructor(@Inject(HelloService) private helloService: HelloService) {}

  @Get()
  async greet(c: Context) {
    const message = this.helloService.greet();
    return ResponseUtil.success(c, { message });
  }
}

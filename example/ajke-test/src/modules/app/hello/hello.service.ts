import { Injectable } from "@ajke/core";

@Injectable()
export class HelloService {
  greet() {
    return "Hello from Wilt!";
  }
}

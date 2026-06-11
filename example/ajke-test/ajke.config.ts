import { defineConfig } from "@ajke/core/config";

export default defineConfig({
  // Directory where generated modules are placed (relative to project root)
  modulesDir: "src/modules/app",

  // Default files scaffolded by `ajke generate module <name>`
  generate: {
    files: ["module", "controller", "service", "dto", "entity"],
  },
});

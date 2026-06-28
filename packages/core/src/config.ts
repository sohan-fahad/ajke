export interface AjkeConfig {
  /** Directory where generated modules are placed. Default: "src/modules/app" */
  modulesDir?: string;
  /** Source directory. Default: "src" */
  srcDir?: string;
  /** Defaults applied when running `ajke generate module` */
  generate?: {
    files?: Array<"module" | "controller" | "service" | "dto" | "entity" | "test">;
  };
}

export function defineConfig(config: AjkeConfig): AjkeConfig {
  return config;
}

import { defineConfig } from "tsup";
import esbuildPluginTsc from "esbuild-plugin-tsc";

export default defineConfig({
  tsconfig: "tsconfig.build.json",
  esbuildPlugins: [esbuildPluginTsc()],
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  outDir: "dist",
  dts: true,
  clean: true,
});

import { defineConfig, externalizeDepsPlugin } from "electron-vite";
import { codeInspectorPlugin } from "code-inspector-plugin";
import path, { resolve } from "node:path";
import tailwindcss from "@tailwindcss/vite";
import injectProcessEnvPlugin from "rollup-plugin-inject-process-env";
import tsconfigPathsPlugin from "vite-tsconfig-paths";
import reactPlugin from "@vitejs/plugin-react";

export default defineConfig({
  main: {
    plugins: [tsconfigPathsPlugin(), externalizeDepsPlugin()],
    build: {
      outDir: "dist/main",
      rollupOptions: {
        input: resolve("src/main/index.ts"),
        output: {
          format: "cjs",
        },
      },
    },
  },

  preload: {
    plugins: [tsconfigPathsPlugin(), externalizeDepsPlugin()],
    build: {
      outDir: "dist/preload",
    },
  },

  renderer: {
    base: "./",

    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },

    plugins: [
      tsconfigPathsPlugin(),
      tailwindcss(),

      // ⚠ plugin order warning fix
      codeInspectorPlugin({
        bundler: "vite",
        hotKeys: ["altKey"],
        hideConsole: true,
      }),

      reactPlugin(),
    ],

    build: {
      outDir: "dist/renderer",
      rollupOptions: {
        input: resolve("src/renderer/index.html"),
        plugins: [
          injectProcessEnvPlugin({
            NODE_ENV: "production",
          }),
        ],
      },
    },
  },
});
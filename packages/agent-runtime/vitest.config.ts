import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@pi-desktop/shared": resolve(__dirname, "../shared/src/index.ts"),
    },
  },
  test: {
    exclude: [
      "**/node_modules/**",
      "**/.git/**",
      "**/dist/**",
      "**/cypress/**",
      "**/.{idea,cache,output,temp}/**",
    ],
  },
});


import { defineConfig } from "@vscode/test-cli";

export default defineConfig({
  files: "out/test/**/*.test.js",
  // 2026/06/09 기준
  // - Cursor:           1.105.1
  // - Antigravity IDE:  1.107.0
  version: "1.105.1",
});

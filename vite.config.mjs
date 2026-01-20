import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  base: "/trienlamkhoanhkhacthauhieu/",
  root: "src",

  assetsInclude: ["**/*.mp3", "**/*.m4a"],

  build: {
    outDir: "../dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve("src/index.html"),
        chuyen: resolve("src/chuyen.html"),
        hoiam: resolve("src/hoiam.html"),
        thanham: resolve("src/thanham.html"),
      }
    }
  }
});

export default defineConfig({
  base: "/",       // ← QUAN TRỌNG
  root: "src",

  build: {
    outDir: "../dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve("src/index.html"),
        chuyen: resolve("src/chuyen.html"),
        thanham: resolve("src/thanham.html"),
        hoiam: resolve("src/hoiam.html"),
      }
    }
  },

  plugins: [
    viteStaticCopy({
      targets: [{ src: "assets/**/*", dest: "assets" }]
    })
  ]
});

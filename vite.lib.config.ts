import path from "path"
import { defineConfig } from "vite"
import { createVuePlugin } from "vite-plugin-vue2"

export default defineConfig({
  plugins: [createVuePlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, "index.ts"),
      name: "ResourceScheduler",
      formats: ["es", "umd"],
      fileName: format => `resource-scheduler.${format}.js`,
    },
    rollupOptions: {
      external: ["vue", "vuedraggable", "element-ui", "vue-router"],
      output: {
        globals: {
          vue: "Vue",
          vuedraggable: "vuedraggable",
          "element-ui": "ELEMENT",
          "vue-router": "VueRouter",
        },
      },
    },
  },
})

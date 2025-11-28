import path from "path"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig({
  plugins: [react()],
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
      fileName: (format) => `resource-scheduler.${format}.js`,
    },
    rollupOptions: {
      external: ["react", "react-dom", "lucide-react"],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
          "lucide-react": "lucideReact",
        },
      },
    },
  },
})

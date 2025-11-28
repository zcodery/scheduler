import path from "path"
import { defineConfig, loadEnv } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "")
  return {
    // Base path for assets; handle GitHub Pages automatically
    base: (() => {
      const repo = process.env.GITHUB_REPOSITORY?.split("/")?.[1]
      const fromEnv = env.BASE_PATH
      return fromEnv ? fromEnv : repo ? `/${repo}/` : "/"
    })(),
    server: {
      port: 3000,
      host: "0.0.0.0",
    },
    plugins: [react()],
    define: {
      "process.env.API_KEY": JSON.stringify(env.GEMINI_API_KEY),
      "process.env.GEMINI_API_KEY": JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "."),
      },
    },
    build: env.BUILD_LIB === "true"
      ? {
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
        }
      : undefined,
  }
})

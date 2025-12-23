import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
	plugins: [react(), tailwindcss()],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
			"@auth": path.resolve(__dirname, "../../packages/auth/src"),
			"@shared": path.resolve(__dirname, "../../packages/shared/src"),
		},
	},
	optimizeDeps: {
		include: ["@chat-thing/ui"],
	},
}) 



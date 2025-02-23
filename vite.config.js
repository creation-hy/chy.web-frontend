import {defineConfig} from "vite"
import react from "@vitejs/plugin-react"
import * as path from "path"
import {resolve} from "path"

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react()],
	server: {
		host: "0.0.0.0",
		proxy: {
			"/api": {
				target: "https://localhost:8080/",
				secure: false,
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/api/, ""),
			},
			"/avatars": {
				target: "https://localhost:8080/avatars/",
				secure: false,
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/avatars/, ""),
			},
			"/api/websocket": {
				target: "wss://localhost:8080/websocket",
				secure: false,
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/api\/websocket/, ""),
			}
		},
	},
	resolve: {
		alias: {
			"src": resolve(path.resolve(), "src"),
		},
	},
	build: {
		rollupOptions: {
			output: {
				manualChunks(id) {
					const match = id.match(/node_modules\/([^/]*)/);
					
					if (match) {
						if (id.includes("node_modules/@mui/")) {
							return "mui";
						}
						
						if (match[1] === "highlight.js" || match[1] === "react-syntax-highlighter") {
							return match[1];
						}
						
						return "vendor";
					}
				},
			},
		},
	},
});

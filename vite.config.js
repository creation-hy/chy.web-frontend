import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import * as path from 'path'
import {resolve} from 'path'

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react()],
	server: {
		host: '0.0.0.0',
		proxy: {
			"/api": {
				target: 'https://localhost',
				secure: false,
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/api/, ""),
			},
		},
	},
	resolve: {
		alias: {
			'src': resolve(path.resolve(), 'src'),
		},
	},
})

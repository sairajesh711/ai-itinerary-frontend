import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite'; // ✅ default import
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), '');
	const devApiTarget = env.VITE_API_BASE || 'http://127.0.0.1:8000';

	return {
		plugins: [sveltekit(), tailwindcss()],
		server: {
			proxy: {
				'/api': {
					target: devApiTarget,
					changeOrigin: true,
					rewrite: (path) => path.replace(/^\/api/, '')
				}
			}
		}
	};
});

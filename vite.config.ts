import { sveltekit } from '@sveltejs/kit/vite';
import { threlteStudio } from '@threlte/studio/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit(), threlteStudio()],
	ssr: {
		noExternal: ['camera-controls', 'postprocessing']
	}
});

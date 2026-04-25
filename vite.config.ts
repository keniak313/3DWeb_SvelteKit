import { sveltekit } from '@sveltejs/kit/vite';
import { threlteStudio } from '@threlte/studio/vite';
import { defineConfig } from 'vite';
import { enhancedImages } from '@sveltejs/enhanced-img';

export default defineConfig({
	plugins: [sveltekit(), threlteStudio(), enhancedImages()],
	resolve: {
		alias: {
			three: 'three'
		}
	},
	ssr: {
		noExternal: ['camera-controls', 'postprocessing', 'gsap', 'three']
	}
});

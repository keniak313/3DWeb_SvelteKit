import { sveltekit } from '@sveltejs/kit/vite';
import { threlteStudio } from '@threlte/studio/vite';
import { defineConfig } from 'vite';
import { enhancedImages } from '@sveltejs/enhanced-img';
import path from 'path';

export default defineConfig({
	plugins: [sveltekit(), threlteStudio(), enhancedImages()],
	resolve: {
		alias: {
			three: path.resolve('./node_modules/three')
		}
	},
	ssr: {
		noExternal: ['camera-controls', 'postprocessing', 'three', '@threlte/core', '@threlte/extras']
	}
});

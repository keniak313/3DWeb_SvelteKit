import { eq } from 'drizzle-orm';
import { config } from '../db/schema';

export async function updateConfig({ formData, locals }) {
	const sceneConfig = {
		camera: {
			position: [
				Number(formData.get('config-pos-x')),
				Number(formData.get('config-pos-y')),
				Number(formData.get('config-pos-z'))
			],
			target: [
				Number(formData.get('config-target-x')),
				Number(formData.get('config-target-y')),
				Number(formData.get('config-target-z'))
			]
		},
		bloom: {
			luminanceThreshold: Number(formData.get('config-bloom-threshold')),
			luminanceSmoothing: Number(formData.get('config-bloom-smoothing')),
			intensity: Number(formData.get('config-bloom-intensity')),
			radius: Number(formData.get('config-bloom-radius'))
		}
	};

	await locals.db
		.update(config)
		.set({ settings: sceneConfig.camera })
		.where(eq(config.name, 'camera'));
	await locals.db
		.update(config)
		.set({ settings: sceneConfig.bloom })
		.where(eq(config.name, 'bloom'));
}

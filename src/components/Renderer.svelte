<script>
	import { useThrelte, useTask } from '@threlte/core';
	import {
		EffectComposer,
		EffectPass,
		RenderPass,
		SMAAEffect,
		SMAAPreset,
		BloomEffect,
		KernelSize,
		ToneMappingEffect,
		ToneMappingMode,
		SSAOEffect
	} from 'postprocessing';
	import { SSAARenderPass } from 'three/examples/jsm/Addons.js';

	const { scene, renderer, camera, size } = useThrelte();

	// Adapt the default WebGLRenderer: https://github.com/pmndrs/postprocessing#usage
	const composer = new EffectComposer(renderer);

	const setupEffectComposer = (camera) => {
		composer.removeAllPasses();
		composer.addPass(new RenderPass(scene, camera));
		// composer.addPass(new EffectPass(camera, new SSAOEffect()));
		composer.addPass(
			new EffectPass(
				camera,
				new BloomEffect({
					intensity: 1,
					luminanceThreshold: 0.98,
					height: 512,
					width: 512,
					luminanceSmoothing: 0.08,
					mipmapBlur: true,
					kernelSize: KernelSize.LARGE
				})
			)
		);
		composer.addPass(
			new EffectPass(
				camera,
				new SMAAEffect({
					preset: SMAAPreset.ULTRA
				})
			)
		);
		composer.addPass(
			new EffectPass(
				camera,
				new ToneMappingEffect({
					mode: ToneMappingMode.ACES_FILMIC
				})
			)
		);
	};

	// We need to set up the passes according to the camera in use
	$effect(() => {
		setupEffectComposer($camera);
	});

	$effect(() => {
		composer.setSize($size.width, $size.height);
	});

	const { renderStage, autoRender } = useThrelte();

	// We need to disable auto rendering as soon as this component is
	// mounted and restore the previous state when it is unmounted.
	$effect(() => {
		let before = autoRender.current;
		autoRender.set(false);
		return () => autoRender.set(before);
	});

	useTask(
		(delta) => {
			composer.render(delta);
		},
		{ stage: renderStage, autoInvalidate: false }
	);
</script>

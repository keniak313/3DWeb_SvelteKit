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
		SSAOEffect,
		VignetteEffect,
		DepthOfFieldEffect
	} from 'postprocessing';
	import { HalfFloatType } from 'three';
	import { SSAARenderPass } from 'three/examples/jsm/Addons.js';

	let { config } = $props();

	const { scene, renderer, camera, size } = useThrelte();

	// Adapt the default WebGLRenderer: https://github.com/pmndrs/postprocessing#usage
	const composer = new EffectComposer(renderer, {
		frameBufferType: HalfFloatType,
		multisampling: 8
	});

	const setupEffectComposer = (camera) => {
		composer.removeAllPasses();
		composer.addPass(new RenderPass(scene, camera));
		composer.addPass(
			new EffectPass(
				camera,
				// new DepthOfFieldEffect(camera, {
				// 	focusDistance: config.dof.focusDistance,
				// 	focalLength: config.dof.focalLength,
				// 	bokehScale: config.dof.bokehScale,
				// 	focusRange: config.dof.focusRange,
				// 	resolutionScale: 1
				// }),
				new BloomEffect({
					luminanceThreshold: config.bloom.luminanceThreshold,
					luminanceSmoothing: config.bloom.luminanceSmoothing,
					intensity: config.bloom.intensity,
					radius: config.bloom.radius,
					mipmapBlur: config.bloom.mipmapBlur,
					resolutionScale: 1
				}),
				new ToneMappingEffect({
					mode: ToneMappingMode.ACES_FILMIC
				}),
				new VignetteEffect({
					eskil: false,
					darkness: 0.2,
					offset: 0.3
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

<script lang="ts">
	import { onMount } from 'svelte';
	import { Pane } from 'tweakpane';

	let { controls, postProcessConfig } = $props();

	onMount(() => {
		const pane = new Pane();

		pane
			.addButton({
				title: 'Pobierz współrzędne (Konsola + Clipboard)'
			})
			.on('click', () => {
				if (!controls) return;

				// Pobieramy aktualne wektory z CameraControls
				const pos = controls?.getPosition();
				const tar = controls?.getTarget();

				// Formatujemy to jako gotowy fragment kodu
				const codeSnippet = `position: [${pos.x.toFixed(2)}, ${pos.y.toFixed(2)}, ${pos.z.toFixed(2)}], 
target: [${tar.x.toFixed(2)}, ${tar.y.toFixed(2)}, ${tar.z.toFixed(2)}]`;

				console.log('%c Nowe ustawienia kamery:', 'color: #00ff00; font-weight: bold;');
				console.log(codeSnippet);

				// Opcjonalne kopiowanie do schowka
				navigator.clipboard.writeText(codeSnippet);
				alert('Skopiowano do schowka!');
			});

		const postProcessPane = pane.addTab({
			pages: [{ title: 'Depth of Field' }, { title: 'Bloom' }]
		});

		postProcessPane.pages[0].addBinding(postProcessConfig.dof, 'focusDistance', {
			min: -2,
			max: 10,
			step: 0.01
		});
		postProcessPane.pages[0].addBinding(postProcessConfig.dof, 'focalLength', {
			min: 0,
			max: 10,
			step: 0.01
		});
		postProcessPane.pages[0].addBinding(postProcessConfig.dof, 'bokehScale', {
			min: 0,
			max: 10,
			step: 0.01
		});
		postProcessPane.pages[0].addBinding(postProcessConfig.dof, 'focusRange', {
			min: -2,
			max: 10,
			step: 0.01
		});
		postProcessPane.pages[1].addBinding(postProcessConfig.bloom, 'intensity', {
			min: 0,
			max: 10,
			step: 0.01
		});
		postProcessPane.pages[1].addBinding(postProcessConfig.bloom, 'mipmapBlur');
		postProcessPane.pages[1].addBinding(postProcessConfig.bloom, 'radius', {
			min: 0,
			max: 1,
			step: 0.01
		});
		postProcessPane.pages[1].addBinding(postProcessConfig.bloom, 'luminanceThreshold', {
			min: 0,
			max: 100,
			step: 0.01
		});
		postProcessPane.pages[1].addBinding(postProcessConfig.bloom, 'luminanceSmoothing', {
			min: 0,
			max: 1,
			step: 0.01
		});

		return () => pane.dispose();
	});
</script>

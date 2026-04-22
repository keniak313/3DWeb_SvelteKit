<script>
	import { getContext } from 'svelte';
	import Input from '../Input.svelte';
	import { enhance } from '$app/forms';

	const config = getContext('config');
	const sceneConfig = config.sceneConfig;
</script>

<div>
	<!-- <form
		method="POST"
		action="?/updateSceneConfig"
		use:enhance={() => {
			return async ({ update }) => {
				await update({ reset: false });
			};
		}}
	> -->
	<div>
		<p>Default Camera View</p>
		<p>Position</p>
		<div class="row">
			<Input
				id="config-pos-x"
				title="X"
				type="number"
				step="0.01"
				bind:value={sceneConfig.camera.position[0]}
			/>
			<Input
				id="config-pos-y"
				title="Y"
				type="number"
				step="0.01"
				bind:value={sceneConfig.camera.position[1]}
			/>
			<Input
				id="config-pos-z"
				title="Z"
				type="number"
				step="0.01"
				bind:value={sceneConfig.camera.position[2]}
			/>
		</div>
		<p>Target</p>
		<div class="row">
			<Input
				id="config-target-x"
				title="X"
				type="number"
				step="0.01"
				bind:value={sceneConfig.camera.target[0]}
			/>
			<Input
				id="config-target-y"
				title="Y"
				type="number"
				step="0.01"
				bind:value={sceneConfig.camera.target[1]}
			/>
			<Input
				id="config-target-z"
				title="Z"
				type="number"
				step="0.01"
				bind:value={sceneConfig.camera.target[2]}
			/>
		</div>

		<button
			type="button"
			onclick={() => {
				const position = sceneConfig.controls.getPosition();
				const target = sceneConfig.controls.getTarget();
				config.setSceneConfig({
					position: [
						Number(position.x.toFixed(2)),
						Number(position.y.toFixed(2)),
						Number(position.z.toFixed(2))
					],
					target: [
						Number(target.x.toFixed(2)),
						Number(target.y.toFixed(2)),
						Number(target.z.toFixed(2))
					]
				});
			}}>SET FROM CAMERA</button
		>
	</div>
	<div>
		<p>Bloom</p>
		<Input
			id="config-bloom-intensity"
			title="Intensity"
			type="number"
			step="0.01"
			bind:value={sceneConfig.bloom.intensity}
		/>
		<Input
			id="config-bloom-radius"
			title="Radius"
			type="number"
			step="0.01"
			bind:value={sceneConfig.bloom.radius}
		/>
		<Input
			id="config-bloom-threshold"
			title="Threshold"
			type="number"
			step="0.01"
			bind:value={sceneConfig.bloom.luminanceThreshold}
		/>
		<Input
			id="config-bloom-smoothing"
			title="Smoothing"
			type="number"
			step="0.01"
			bind:value={sceneConfig.bloom.luminanceSmoothing}
		/>
	</div>

	<!-- <button type="submit">Save Scene settings</button> -->
	<!-- </form> -->
</div>

<style>
	.row {
		display: flex;
	}
</style>

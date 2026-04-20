<script lang="ts">
	import { T } from '@threlte/core';
	import { useCursor } from '@threlte/extras';
	import Material from './Material.svelte';
	import { Color } from 'three';
	import { getContext } from 'svelte';
	import { getLoadedAssets } from './AssetPreloader.svelte';
	import { Spring } from 'svelte/motion';

	let { model } = $props();

	const config = getContext('config');

	const gltf = $derived(getLoadedAssets().models[model.name]);

	const { onPointerEnter, onPointerLeave } = useCursor('pointer');

	let hoveredPartName = $state();
</script>

{#if $gltf}
	<T.Group>
		{#each $gltf.nodes[model.name].children as mesh, index (mesh.uuid)}
			{@const part = model.parts[mesh.name]}
			<T.Mesh
				name={mesh.name}
				geometry={mesh.geometry}
				position={[mesh.position.x, mesh.position.y, mesh.position.z]}
				rotation={[mesh.rotation.x, mesh.rotation.y, mesh.rotation.z]}
				scale={[mesh.scale.x, mesh.scale.y, mesh.scale.z]}
				castShadow={true}
				receiveShadow={true}
				onpointerenter={(e) => {
					e.stopPropagation();
					if (!mesh.name.includes('use')) return;
					onPointerEnter();
					if (config.selectedAsset.part?.name !== part.name) {
						hoveredPartName = part.name;
					}
				}}
				onpointerleave={(e) => {
					e.stopPropagation();
					onPointerLeave();
					hoveredPartName = null;
				}}
				onclick={(e) => {
					e.stopPropagation();
					if (!mesh.name.includes('use')) return;
					config.setSelected({
						modelName: model.name,
						partName: part.name
					});
					hoveredPartName = null;
				}}
			>
				{#if part?.material}
					<Material
						material={part.material}
						modelName={model.name}
						setColor={part.color}
						isHovered={hoveredPartName === part.name}
					/>
				{:else}
					<T.MeshBasicMaterial color="magenta" />
				{/if}
				<!-- {#each mesh.children as child (child.uuid)}
					<HTML
						position={[child.position.x, child.position.y, child.position.z]}
						occlude
						pointerEvents="all"
						onvisibilitychange={(e) => {
							part.visible = e;
						}}
					>
						{#if part.visible}
							<div class="info" transition:fade>
								<button
									onclick={(e) => {
										setSelected({
											model: model,
											part: model.parts[mesh.name],
											mesh: mesh
										});
									}}
								>
								</button>
								{#if getSelected()?.part?.name === mesh.name}
									<div class="description" transition:slide>
										<p>{part.description}</p>
									</div>
								{/if}
							</div>
						{/if}
					</HTML>
				{/each} -->
			</T.Mesh>
		{/each}
	</T.Group>
{/if}

<style>
	.info {
		opacity: 0.5;
	}
	.description {
		display: flex;
		width: fit-content;
		background-color: rgb(212, 212, 212);
	}
	button {
		width: 20px;
		height: 20px;
		border-radius: 50%;
		outline: none;
		border: none;
		background-color: rgb(212, 212, 212);
		cursor: pointer;
	}
</style>

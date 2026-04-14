<script lang="ts">
	import { T } from '@threlte/core';
	import { Billboard, HTML, useCursor, useGltf, useTexture } from '@threlte/extras';
	import Material from './Material.svelte';
	import { getSelected, setSelected } from './Product.svelte';
	import { models } from '../utilities/data.svelte';
	import { Color, MeshBasicMaterial } from 'three';
	import { fade, scale, slide } from 'svelte/transition';
	import { onMount } from 'svelte';

	let { model, visible = false } = $props();

	const gltf = useGltf(`/3D/${model.name}/${model.name}.glb`);
	// const texture = useTexture('/3D/Watch01/Watch01_Body_BaseMap.png', {
	// 	transform: (texture) => {
	// 		texture.flipY = false;
	// 		return texture;
	// 	}
	// });
	const texture = ({ partName: partName }) => {
		return useTexture(`/3D/${model.name}/${model.name}_${partName}_AO.png`, {
			transform: (texture) => {
				texture.flipY = false;
				return texture;
			}
		});
	};

	const { onPointerEnter, onPointerLeave } = useCursor('pointer');

	const pointerEnter = (e) => {
		e.stopPropagation();
		onPointerEnter();

		e.object.material.emissiveIntensity = 1;
		e.object.material.emissive = new Color('white');
	};
	const pointerLeave = (e) => {
		e.stopPropagation();
		onPointerLeave();

		e.object.material.emissiveIntensity = 0;
	};
</script>

{#if $gltf}
	<T.Group {visible}>
		{#each $gltf.nodes[model.name].children as mesh, index (mesh.uuid)}
			<T.Mesh
				name={mesh.name}
				geometry={mesh.geometry}
				position={[mesh.position.x, mesh.position.y, mesh.position.z]}
				rotation={[mesh.rotation.x, mesh.rotation.y, mesh.rotation.z]}
				scale={[mesh.scale.x, mesh.scale.y, mesh.scale.z]}
				castShadow={mesh.name !== 'Glass' && true}
				receiveShadow
				onpointerenter={onPointerEnter}
				onpointerleave={onPointerLeave}
				onclick={(e) => {
					e.stopPropagation();
					setSelected({
						model: models[model.name],
						part: models[model.name].parts[mesh.name],
						mesh: mesh
					});
				}}
			>
				{@const part = models[model.name].parts[mesh.name]}
				{(part.visible = true)}
				<Material
					material={part.material}
					modelName={model.name}
					partName={mesh.name}
					aoMapEnabled={part.aoMap}
					setColor={part.color}
				/>
				{#each mesh.children as child (child.uuid)}
					<HTML
						position={[child.position.x, child.position.y, child.position.z]}
						occlude
						pointerEvents="all"
						onvisibilitychange={(e) => {
							part.visible = e;
						}}
					>
						{#if part.visible}
							<div class="info" in:scale={{ duration: 1000 }}>
								<button
									transition:fade
									onclick={(e) => {
										setSelected({
											model: models[model.name],
											part: models[model.name].parts[mesh.name],
											mesh: mesh
										});
									}}
								>
								</button>
								{#if getSelected()?.part.name === mesh.name}
									<div class="description" transition:slide>
										<p>{part.description}</p>
									</div>
								{/if}
							</div>
						{/if}
					</HTML>
				{/each}
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

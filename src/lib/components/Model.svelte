<script lang="ts">
	import { T, useThrelte } from '@threlte/core';
	import { GLTF, HTML, useCursor } from '@threlte/extras';
	import Material from './Material.svelte';
	import { Color, MeshStandardMaterial } from 'three';
	import { getContext, onMount } from 'svelte';
	import { getLoadedAssets } from './AssetPreloader.svelte';
	import { Spring, Tween } from 'svelte/motion';
	import { backOut, cubicInOut, cubicOut, elasticInOut, expoOut } from 'svelte/easing';
	import { getAppConfig, type AppConfig } from '$lib/state/config.svelte';
	import { checkName } from '$lib/utilities/helpers';
	import { get, writable } from 'svelte/store';
	import { fade, slide } from 'svelte/transition';

	const { renderer, camera } = useThrelte();

	let { model, isDragging, children = () => {} } = $props();

	const config = getAppConfig('previewConfig');

	const gltf = $derived(getLoadedAssets().models?.[model.name]);

	const sockets = $derived.by(() => {
		let attachments = {};

		if (model.sockets) {
			Object.values(model.sockets).forEach((m) => {
				if (!m.attachment) return;
				const gltf = getLoadedAssets().models?.[m.attachment.name];
				attachments = { ...attachments, [m.name]: gltf };
			});
			return attachments;
		}
		return null;
	});

	let { onPointerEnter, onPointerLeave } = useCursor('pointer');

	let hoveredPartName = $state();

	const scaleTween = new Tween(0, {
		duration: 400,
		easing: expoOut
	});

	let lastModelName = null;

	$effect(() => {
		const currentName = config.selected.modelName;
		const isSelected = currentName === model.name;

		if (isSelected) {
			// KLUCZOWY WARUNEK: tylko jeśli nazwa jest inna niż zapamiętana
			if (currentName !== lastModelName) {
				scaleTween.set(0, { duration: 0 });
				scaleTween.set(1);
				lastModelName = currentName;
			}
		} else {
			scaleTween.set(0, { duration: 0 });
			lastModelName = null;
		}
	});

	let partsVisible = $state(
		model.parts ? Object.fromEntries(Object.values(model.parts).map((p) => [p.name, true])) : []
	);
</script>

{#snippet renderMesh(part, mesh)}
	<T.Mesh
		name={mesh.name}
		geometry={mesh.geometry}
		position={[mesh.position.x, mesh.position.y, mesh.position.z]}
		rotation={[mesh.rotation.x, mesh.rotation.y, mesh.rotation.z]}
		scale={[mesh.scale.x, mesh.scale.y, mesh.scale.z]}
		castShadow={true}
		receiveShadow={true}
		onpointerenter={(e) => {
			if (isDragging) {
				hoveredPartName = null;
				// $hovering = false;
				return;
			}
			e.stopPropagation();
			if (!checkName(mesh.name).use().isUse) return;
			if (config.selectedAsset.part?.name !== part.name) {
				onPointerEnter();
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
			if (!checkName(mesh.name).use().isUse) return;
			console.log(part);
			config.setSelected({
				modelName: model.name,
				partName: part.name,
				partModelName: part.modelName
			});
			onPointerLeave();
			hoveredPartName = null;
			// $hovering = false;
		}}
		material={new MeshStandardMaterial({
			color: 'magenta'
		})}
	>
		{#if checkName(mesh.name).use().isUse}
			<Material
				material={part?.material}
				modelName={model.name}
				setColor={part?.color}
				aoMap={mesh.material.aoMap}
				isHovered={hoveredPartName === part?.name}
			/>
		{:else}
			{@const mat = mesh.material}
			<T.MeshStandardMaterial aoMap={mat.aoMap} aoMapIntensity={2} color={mat.color} />
		{/if}
		{#if mesh.children.length > 0}
			{#each mesh.children as child (child.uuid)}
				<HTML
					position={[child.position.x, child.position.y, child.position.z]}
					occlude
					pointerEvents="all"
					onvisibilitychange={(e) => {
						partsVisible[part.name] = e;
					}}
				>
					{#if partsVisible[part.name]}
						<div class="info" transition:fade>
							<button onclick={(e) => {}}></button>
							{#if config.selected.partName === mesh.name}
								<div class="description" transition:slide>
									<p>{part.description}</p>
								</div>
							{/if}
						</div>
					{/if}
				</HTML>
			{/each}
		{/if}
	</T.Mesh>
	<T.Group position={[mesh.position.x, mesh.position.y, mesh.position.z]}></T.Group>
{/snippet}

{#if model}
	<T.Group scale={scaleTween.current} oncreate={(e) => {}}>
		{#if $gltf}
			{#each $gltf.scene.children as mesh, index (mesh.uuid)}
				{@const socket = checkName(mesh.name).socket()}
				{#if !socket.isSocket}
					{@const part = model.parts ? model.parts[mesh.name] : null}
					{@render renderMesh(part, mesh)}
				{:else}
					<T.Group
						geometry={mesh.geometry}
						position={[mesh.position.x, mesh.position.y, mesh.position.z]}
						rotation={[mesh.rotation.x, mesh.rotation.y, mesh.rotation.z]}
						scale={[mesh.scale.x, mesh.scale.y, mesh.scale.z]}
					>
						{#await sockets[socket.name] then gltfSocket}
							{#each gltfSocket?.scene.children as attachment (attachment.uuid)}
								{@const part = model.parts ? model.parts[attachment.name] : null}
								<!-- {@const part = model.sockets[socket.name].attachment.parts[attachment.name]} -->
								{@render renderMesh(part, attachment)}
							{/each}
						{/await}
					</T.Group>
				{/if}
			{/each}
		{/if}
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

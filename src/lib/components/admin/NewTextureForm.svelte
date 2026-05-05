<script lang="ts">
	import { enhance } from '$app/forms';
	import { getAppConfig } from '$lib/state/config.svelte';
	import { nanoid } from '$lib/utilities/helpers';
	import Input from '../Input.svelte';
	import PopupWrapper from '../PopupWrapper.svelte';

	let formEl;
	let newTextures = $state([]);
	let isPreview = $state(false);

	const config = getAppConfig();
	const textures = $derived(config.data.textures);
	const materials = $derived(config.data.materials);
</script>

{#if isPreview}
	<PopupWrapper>
		<div class="wrapper">
			<p>Textures wille be assigned automaticaly to materials based on their names.</p>
			<p>If texture with same name already exists, it will be overwritten.</p>
			<div class="texture-list">
				{#each newTextures as texture, index (texture.id)}
					<div class="texture-item">
						<img src={texture.url} alt={texture.name} width={100} height={100} />
						<p>{texture.name}</p>
						{#if texture.existing}
							<p>
								WARNING - TEXTURE WITH THIS NAME ALREADY EXISTS, IT WILL BE OVERWRITTEN ON IMPORT
							</p>
						{/if}
						{#if texture.materialMatch}
							<p>MATCHING MATERIAL: {texture.materialMatch.name}</p>
						{/if}
						<button
							type="button"
							onclick={() => {
								textures.splice(index, 1);
							}}>REMOVE</button
						>
					</div>
				{/each}
			</div>
			<div>
				<button
					type="button"
					onclick={() => {
						formEl.requestSubmit();
					}}>IMPORT</button
				>
				<button
					type="button"
					onclick={() => {
						isPreview = false;
						newTextures = [];
					}}>DISCARD</button
				>
			</div>
		</div>
	</PopupWrapper>
{/if}

<form
	bind:this={formEl}
	method="POST"
	action="?/addTexture"
	enctype="multipart/form-data"
	use:enhance={({ formData }) => {
		if (newTextures.length > 0) {
			newTextures.forEach((t) => {
				formData.append('texture-id', t.id);
				formData.append(`texture-file-${t.id}`, t.file);
			});
		}
		return async ({ update }) => {
			await update({ reset: false });
			isPreview = false;
			newTextures = [];
			window.location.reload();
		};
	}}
>
	<Input
		id="texture"
		title="ADD TEXTURE"
		type="file"
		multiple
		accept=".png,.webp"
		required
		onchange={(e) => {
			isPreview = true;
			const files = e.target.files;
			newTextures = Array.from(files).map((tf) => {
				const existing = textures.find((t) => t.name === tf.name.split('.')[0]) || null;
				const materialMatch = materials.find((m) => m.name === tf.name.split('_')[0]) || null;

				return {
					id: existing?.id || nanoid(5),
					name: tf.name.split('.')[0],
					file: tf,
					url: URL.createObjectURL(tf),
					updatedAt: new Date().toISOString(),
					existing: existing,
					materialMatch: materialMatch
				};
			});
			console.log(newTextures);
		}}
	/>
</form>

<style>
	.wrapper {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		width: 100%;
		padding: 1rem;
	}
	.texture-list {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
	}

	.texture-item {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		align-items: center;
	}
</style>

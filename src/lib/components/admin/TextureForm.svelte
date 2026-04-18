<script>
	import { enhance } from '$app/forms';
	import Input from '../Input.svelte';
	import { Image } from '@unpic/svelte';

	let { textures = $bindable() } = $props();
</script>

<div>
	<h2>Textures</h2>
	<hr />
	{#if textures.length > 0}
		<div style="display: flex; flex-wrap:wrap; width: 100%; gap: 1rem;">
			{#each textures as texture (texture.id)}
				<div style="display:flex; flex-direction:column; align-items:center;">
					<Image src={texture.url} alt={texture.name} width={100} height={100} />
					<p>{texture.name}</p>
				</div>
			{/each}
		</div>
	{/if}

	<form
		method="POST"
		action="?/addTexture"
		enctype="multipart/form-data"
		use:enhance={() => {
			return async ({ update, result }) => {
				await update();
				textures = result.data.textures;
			};
		}}
	>
		<Input id="texture" type="file" multiple accept=".png,.webp" required />
		<button type="submit">Add Texture</button>
	</form>
</div>

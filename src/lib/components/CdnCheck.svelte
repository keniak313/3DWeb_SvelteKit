<script lang="ts">
	import { getContext, onMount } from 'svelte';

	let { children } = $props();

	const config = getContext('config');

	let isReady = $state(false);
	let error = $state('');

	async function checkCDN() {
		const assets = [
			...Object.values(config.data.models).map(
				(m) => m.url + '?v=' + new Date(m.updatedAt).getTime()
			),
			...config.data.textures.map((t) => t.url + '?v=' + new Date(t.updatedAt).getTime())
		].filter((url) => url && !url.startsWith('blob:'));

		if (assets.length === 0) {
			isReady = true;
			return;
		}

		// Prosty mechanizm sprawdzania (np. max 30 prób co 2 sekundy)

		try {
			const results = await Promise.all(assets.map((url) => fetch(url, { method: 'HEAD' })));

			if (results.every((res) => res.ok)) {
				isReady = true;
				return;
			}
		} catch (e) {
			console.log('Czekam na propagację CDN...');
		}
		await new Promise((r) => setTimeout(r, 2000));

		error = 'CDN is still synchronizing. Please try again later.';
	}

	onMount(() => {
		checkCDN();
	});
</script>

{#if error}
	<div class="wrapper error-screen">
		<p>{error}</p>
		<button onclick={() => window.location.reload()}>Refresh</button>
	</div>
{:else if isReady}
	{@render children?.()}
{:else}
	<div class="wrapper cdn-loader">
		<p>Synchronizing with the server...</p>
		<p class="sub">This may take up to a few minutes after uploading new files.</p>
		<div class="spinner"></div>
	</div>
{/if}

<style>
	.wrapper {
		display: flex;
		flex-direction: column;
		width: 100vw;
		height: 100vh;
		align-items: center;
		justify-content: center;
	}
</style>

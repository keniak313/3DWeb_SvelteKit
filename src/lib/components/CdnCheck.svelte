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
		for (let i = 0; i < 30; i++) {
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
		}
		error = 'Pliki nie pojawiły się na serwerze w odpowiednim czasie.';
	}

	onMount(() => {
		checkCDN();
	});
</script>

{#if error}
	<div class="error-screen">
		<p>{error}</p>
		<button onclick={() => window.location.reload()}>Odśwież</button>
	</div>
{:else if isReady}
	{@render children?.()}
{:else}
	<div class="cdn-loader">
		<p>SYNCHRONIZACJA Z SERWEREM...</p>
		<p class="sub">To może potrwać do minuty po wrzuceniu nowych plików.</p>
		<div class="spinner"></div>
	</div>
{/if}

<script lang="ts">
	import { dev } from '$app/environment';
	import { Image } from '@unpic/svelte';
	import { transform } from 'unpic/providers/vercel';

	let { src, isNew = false, updatedAt, size = 50 } = $props();

	let srcDate = $derived.by(() => {
		if (!src) return null;
		if (!isNew) return `${src}?v=${new Date(updatedAt).getTime()}`;
		else return src;
	});

	let optimizedSrc = $derived.by(() => {
		if (isNew || dev) return src;

		const timestamp = new Date(updatedAt).getTime();
		// Doklejamy timestamp WEWNĄTRZ encodeURIComponent
		const sourceWithVersion = `${src}?v=${timestamp}`;
		const encoded = encodeURIComponent(sourceWithVersion);

		return `/_vercel/image?url=${encoded}&w=${size}&q=75`;
	});
</script>

{#if src}
	<img
		src={optimizedSrc}
		width={size}
		height={size}
		alt="Preview"
		loading="lazy"
		style="object-fit: cover; aspect-ratio: 1/1;"
	/>
{:else}
	<div style={`width: ${size}px; height: ${size}px; background-color: magenta`}></div>
{/if}

<!-- {#if srcDate}

	{#if !dev}
		{#if isNew}
			<Image {src} width={size} height={size} />
		{:else}
			<Image
				{src}
				width={size}
				height={size}
				cdn="vercel"
				transformer={(params) => {
					const { src, ...options } = params;

					// 1. Generujemy standardowy zestaw parametrów (?url=...&w=...)
					const url = transform(src, options);

					// 2. Musimy upewnić się, że URL zaczyna się od /_vercel/image
					// Jeśli transform zwraca tylko "?url=...", dodajemy prefix ręcznie.
					const baseUrl = url.startsWith('http') ? url : `/_vercel/image${url}`;

					// 3. Doklejamy timestamp na końcu
					return `${baseUrl}&v=${new Date(updatedAt).getTime()}`;
				}}
			/>
		{/if}
	{:else}
		<Image {srcDate} width={size} height={size} />
	{/if}
{:else}
	<div style={`width: ${size}px; height: ${size}px; background-color: magenta`}></div>
{/if} -->

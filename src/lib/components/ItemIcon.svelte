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
</script>

{#if srcDate}
	{#if !dev}
		{#if isNew}
			<Image {src} width={size} height={size} />
		{:else}
			<Image
				{src}
				width={size}
				height={size}
				transformer={(params) => {
					const { src, ...options } = params;
					const url = transform(src, options);
					return `${url}&v=${new Date(updatedAt).getTime()}`;
				}}
			/>
		{/if}
	{:else}
		<Image {srcDate} width={size} height={size} />
	{/if}
{:else}
	<div style={`width: ${size}px; height: ${size}px; background-color: magenta`}></div>
{/if}

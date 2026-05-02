<script lang="ts">
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
	<Image
		src={srcDate}
		width={size}
		height={size}
		transformer={transform}
		options={{ vercel: { force: true, prefix: '_vercel' } }}
	/>
{:else}
	<div style={`width: ${size}px; height: ${size}px; background-color: magenta`}></div>
{/if}

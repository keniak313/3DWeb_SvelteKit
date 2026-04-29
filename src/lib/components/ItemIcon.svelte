<script lang="ts">
	import { Image } from '@unpic/svelte';

	let { src, isNew = false, updatedAt, width = 50, height = 50 } = $props();

	let srcDate = $derived.by(() => {
		if (!src) return null;
		if (!isNew) return `${src}?v=${new Date(updatedAt).getTime()}`;
		else return src;
	});
</script>

{#if srcDate}
	<Image src={srcDate} {width} {height} />
{:else}
	<div style={`width: ${width}px; height: ${height}px; background-color: magenta`}></div>
{/if}

<script lang="ts">
	import { fade } from 'svelte/transition';

	let { isUploading, uploadProgress } = $props();
</script>

{#if isUploading}
	<div class="wrapper" out:fade>
		<progress value={uploadProgress} max="100"></progress>
		<p>{uploadProgress}%</p>
	</div>
{/if}

<style>
	.loading-wrapper {
		position: absolute;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		flex: 1;
		background-color: white;
		width: 100%;
		height: 100%;
	}
</style>

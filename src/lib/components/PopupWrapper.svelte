<script lang="ts">
	let { children } = $props();
</script>

<div class="wrapper">
	<div class="content">
		{@render children?.()}
	</div>
</div>

<style>
	.wrapper {
		position: fixed;
		top: 0;
		right: 0;
		left: 0;
		bottom: 0;
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, 0.5);
		z-index: 1000;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.content {
		width: 90%;
		height: 90%;
		background-color: white;
		display: flex;
	}
</style>

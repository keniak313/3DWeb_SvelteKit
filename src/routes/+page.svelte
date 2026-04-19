<script lang="ts">
	import Product from '$lib/components/Product.svelte';

	let { data } = $props();
	let serverData = $state(data);
</script>

<Product />

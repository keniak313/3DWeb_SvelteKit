<script lang="ts">
	import Product from '$lib/components/Product.svelte';

	let { data } = $props();
</script>

<Product {data} />

<script lang="ts">
	import Product from '$lib/components/Product.svelte';

	let { data } = $props();
	console.log(data);
</script>

<Product {data} />

<script lang="ts">
	import { T } from '@threlte/core';

	let { aoMap = null } = $props();
</script>

<T.MeshStandardMaterial metalness={1} roughness={0.4239} opacity={1} {aoMap} color="#6f6f74" />

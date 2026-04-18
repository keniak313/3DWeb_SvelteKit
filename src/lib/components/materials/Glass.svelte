<script lang="ts">
	import { T } from '@threlte/core';

	let { map = null } = $props();
</script>

<T.MeshStandardMaterial
	metalness={1}
	roughness={0.1}
	transparent={true}
	opacity={0.5}
	color="#e0e0f3"
	refractionRatio={1.5}
	thickness={0.5}
	ior={1.5}
	{map}
/>

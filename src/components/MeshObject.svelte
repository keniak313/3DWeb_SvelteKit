<script>
	import { T } from '@threlte/core';
	import { setSelected } from './Product.svelte';
	import Material from './Material.svelte';

	let { mesh, aoMap, materialName } = $props();
</script>

<T.Mesh
	name={mesh.name}
	geometry={mesh.geometry}
	position={[mesh.position.x, mesh.position.y, mesh.position.z]}
	rotation={[mesh.rotation.x, mesh.rotation.y, mesh.rotation.z]}
	scale={[mesh.scale.x, mesh.scale.y, mesh.scale.z]}
	castShadow
	receiveShadow
	// material={materials().steel(map)}
	onclick={(e) => {
		e.stopPropagation();
		setSelected(e.object);
	}}
>
	<Material name={materialName} {aoMap} />
</T.Mesh>

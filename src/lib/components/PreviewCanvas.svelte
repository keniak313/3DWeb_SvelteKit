<script>
	import { Canvas, T } from '@threlte/core';
	import { CameraControls, GLTF, Grid, Suspense } from '@threlte/extras';
	import { onDestroy } from 'svelte';
	import { LineSegments, WireframeGeometry } from 'three';

	let { model = null } = $props();
	let controls = $state();

	const autofit = () => {};

	onDestroy(() => {
		if (model.url.startsWith('blob:')) {
			URL.revokeObjectURL(model.url);
			console.log('Zwolniono pamięć modelu:', model.name);
		}
	});
</script>

<Canvas>
	<Suspense>
		<T.PerspectiveCamera makeDefault visible fov={35} near={0.01} far={20}>
			<CameraControls
				bind:ref={controls}
				maxPolarAngle={Math.PI / 2}
				minPolarAngle={Math.PI / 5}
				polarAngle={Math.PI / 2.4}
				azimuthAngle={Math.PI / 5}
			/>
		</T.PerspectiveCamera>

		<T.DirectionalLight
			position={[-14.9, 10, 10]}
			visible
			intensity={2}
			castShadow={false}
			shadow.mapSize.width={1024}
			shadow.mapSize.height={1024}
			shadow.bias={0}
			shadow.radius={1}
		/>

		<T.AmbientLight intensity={1} />

		<T.Group>
			<GLTF
				url={model.url}
				onload={async (ref) => {
					await controls.fitToBox(ref.scene, false, {
						paddingTop: 0.5,
						paddingBottom: 0.5,
						paddingLeft: 0.5,
						paddingRight: 0.5
					});
					controls.azimuthAngle = Math.PI / 3.7;
					controls.polarAngle = Math.PI / 2.5;

					ref.scene.traverse((obj) => {
						if (obj.isMesh) {
							// Tworzymy geometrię krawędzi
							const wireframe = new WireframeGeometry(obj.geometry);
							const line = new LineSegments(wireframe);

							// Stylizacja linii
							line.material.color.set('#ffffff');
							line.material.transparent = true;
							line.material.opacity = 0.3;

							obj.add(line); // Dodajemy siatkę jako dziecko mesha
						}
					});
				}}
			/>
		</T.Group>

		<T.Group>
			<!-- Siatka (Grid) -->
			<Grid
				gridSize={[20, 20]}
				// Całkowity rozmiar siatki
				cellSize={0.5}
				// Rozmiar dużych kwadratów (1m)
				sectionSize={5}
				// Co ile komórek ma być grubsza linia
				sectionThickness={1.5}
				// Grubość głównych linii
				cellThickness={0.5}
				// Grubość mniejszych linii
				cellColor="#6f6f6f"
				// Kolor małych kwadratów
				sectionColor="#9d9d9d"
				// Kolor dużych sekcji
				fadeDistance={25}
				// Rozmycie siatki w oddali (bardzo ważne dla estetyki!)
				infiniteGrid // Sprawia, że siatka wydaje się nie kończyć
			/>
		</T.Group>
	</Suspense>
</Canvas>

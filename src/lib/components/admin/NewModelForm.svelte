<script>
	import { enhance } from '$app/forms';
	import { getContext } from 'svelte';
	import Input from '../Input.svelte';
	import { GLTFLoader } from 'three/examples/jsm/Addons.js';
	import { nanoid } from '$lib/utilities/helpers';

	let { models } = $props();

	const config = getContext('config');

	let modelExists = $state(false);

	let newModel = $state();

	let uploadProgress = $state(0);

	let isUploading = $state(false);

	function handleUpload(formData) {
		return new Promise((resolve, reject) => {
			const xhr = new XMLHttpRequest();

			// Monitorowanie postępu
			xhr.upload.onprogress = (event) => {
				if (event.lengthComputable) {
					uploadProgress = Math.round((event.loaded / event.total) * 100);
				}
			};

			xhr.onload = () => {
				if (xhr.status >= 200 && xhr.status < 300) resolve(JSON.parse(xhr.response));
				else reject();
			};

			// Wysyłamy do tej samej akcji, którą masz w <form action="?/saveSettings">
			xhr.open('POST', '?/addModel');
			// Ważne: przy XMLHttpRequest + FormData NIE ustawiamy ręcznie Content-Type
			xhr.send(formData);
		});
	}
</script>

<p>UPLOAD MODEL</p>
<hr />
<form
	action="?/addModel"
	method="POST"
	enctype="multipart/form-data"
	use:enhance={async ({ formData, cancel }) => {
		cancel();
		isUploading = true;
		uploadProgress = 0;
		try {
			formData.append('modelInfo', JSON.stringify(newModel));
			await handleUpload(formData);
			window.location.reload();
		} catch (err) {
			console.log(err);
		}
	}}
>
	{#if isUploading}
		<progress value={uploadProgress} max="100"></progress>
		<p>{uploadProgress}%</p>
	{/if}
	{#if modelExists}
		<p>Model already exists. Uploading will result in updating exisiting model.</p>
	{/if}
	<Input
		type="file"
		id="file"
		accept=".glb,.gltf"
		onchange={async (e) => {
			const file = e.target.files[0];
			const url = URL.createObjectURL(file);
			const loader = new GLTFLoader();

			const gltf = (await loader.loadAsync(url)).scene.children[0];
			const checkExisting = models.find((model) => model.name === gltf.name);
			console.log('Existing:', $state.snapshot(checkExisting));

			const parts = gltf.children.reduce((acc, part) => {
				if (!part.name.includes('use')) return acc;
				acc[part.name] = {
					id: nanoid(5),
					name: part.name,
					displayName: '',
					description: '',
					materials: [],
					material: null,
					color: null,
					position: [3, 2, 3],
					target: [0, 0.8, 0]
				};
				return acc;
			}, {});
			newModel = {
				id: nanoid(5),
				name: file.name.split('.')[0],
				displayName: '',
				description: '',
				icon: '',
				parts: parts
			};

			if (checkExisting) {
				const existingModel = checkExisting;

				const newParts = gltf.children.reduce((acc, part) => {
					if (!part.name.includes('use')) return acc;
					acc[part.name] = {
						id: nanoid(5),
						name: part.name,
						displayName: '',
						description: '',
						materials: [],
						material: null,
						color: null,
						position: [3, 2, 3],
						target: [0, 0.8, 0]
					};
					return acc;
				}, {});

				console.log('EXISTING PARTS', Object.values($state.snapshot(existingModel.parts)));
				console.log('NEW PARTS', Object.values(newParts));

				Object.values(newParts).forEach((part) => {
					const existingPart = existingModel.parts[part.name];
					if (existingPart) {
						newParts[part.name] = $state.snapshot(existingPart);
					}
				});

				console.log('UPDATED PARTS', newParts);

				modelExists = true;
				newModel.id = existingModel.id;
				newModel.name = existingModel.name;
				newModel.displayName = existingModel.displayName;
				newModel.description = existingModel.description;
				newModel.url = existingModel.url;
				newModel.icon = existingModel.icon;
				newModel.parts = newParts;
			}

			console.log('GLB', gltf);
			console.log('NEW MODEL', $state.snapshot(newModel));
		}}
		required
	/>
	<button type="submit">Add Model</button>
</form>

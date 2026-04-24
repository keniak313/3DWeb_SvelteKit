<script lang="ts">
	import { enhance } from '$app/forms';
	import ColorsForm from '$lib/components/admin/ColorsForm.svelte';
	import MaterialsForm from '$lib/components/admin/MaterialsForm.svelte';
	import ModelForm from '$lib/components/admin/ModelForm.svelte';
	import NewModelForm from '$lib/components/admin/NewModelForm.svelte';
	import SceneForm from '$lib/components/admin/SceneForm.svelte';
	import TextureForm from '$lib/components/admin/TextureForm.svelte';
	import InputSelect from '$lib/components/InputSelect.svelte';
	import Loader from '$lib/components/Loader.svelte';
	import Product from '$lib/components/Product.svelte';
	import { getContext } from 'svelte';
	import { cubicOut } from 'svelte/easing';
	import { Tween } from 'svelte/motion';
	import { fade } from 'svelte/transition';

	const config = getContext('config');

	let selectedMenu = $state();

	let isUploading = $state(false);

	let progress = $state(0);

	function handleUpload(formData) {
		return new Promise((resolve, reject) => {
			const xhr = new XMLHttpRequest();

			// Monitorowanie postępu
			xhr.upload.onprogress = (event) => {
				if (event.lengthComputable) {
					progress = Math.round((event.loaded / event.total) * 1);
				}
			};

			xhr.onload = async () => {
				if (xhr.status >= 200 && xhr.status < 300) {
					progress = 1; // Płynne dojście do końca po otrzymaniu odpowiedzi
					resolve(JSON.parse(xhr.response));
				} else {
					reject();
				}
			};

			// Wysyłamy do tej samej akcji, którą masz w <form action="?/saveSettings">
			xhr.open('POST', '?/saveSettings');
			// Ważne: przy XMLHttpRequest + FormData NIE ustawiamy ręcznie Content-Type
			xhr.send(formData);
		});
	}
</script>

<div class="wrapper">
	{#if isUploading}
		<Loader {progress} isServer={true} isShown={isUploading} />
		<!-- <div
			transition:fade={{
				duration: 200
			}}
			class="loader-wrapper"
		>
			<p class="loading">Loading</p>
			<div class="bar-wrapper">
				<div class="bar" style="width: {progressWidth}%"></div>
			</div>
		</div> -->
		<!-- <div class="loading-wrapper">
			{#if $progress < 95}
				<p>WYSYŁANIE PLIKÓW...</p>
			{:else}
				<p>PRZETWARZANIE NA SERWERZE (PROSZĘ CZEKAĆ)...</p>
			{/if}
			<progress value={$progress} max="100"></progress>
			<p>{Math.round($progress)}%</p>
		</div> -->
	{/if}
	<Product />
	<div class="forms">
		<div class="nav">
			<button onclick={() => (selectedMenu = 'scene')}>Scene</button>
			<button onclick={() => (selectedMenu = 'colors')}>Colors</button>
			<button onclick={() => (selectedMenu = 'materials')}>Materials</button>
			<!-- <button onclick={() => (selectedMenu = 'textures')}>Textures</button> -->
			<button onclick={() => (selectedMenu = 'models')}>Models</button>
			<!-- <button onclick={() => (selectedMenu = 'upload')}>Upload</button> -->
			<form method="POST" action="?/logout" use:enhance>
				<button>WYLOGUJ</button>
			</form>
		</div>
		<form
			method="POST"
			action="?/saveSettings"
			enctype="multipart/form-data"
			use:enhance={async ({ formData, cancel }) => {
				cancel();
				isUploading = true;
				try {
					for await (const model of Object.values(config.data.models)) {
						if (model.newIcon) {
							console.log('NEW ICON FOUND', model.icon);
							const base64 = model.icon;

							const res = await fetch(base64);
							const blob = await res.blob();
							formData.append(`model-icon-${model.id}`, blob, `${model.name}.webp`);
						} else {
							formData.append(`model-icon-${model.id}`, model.icon);
						}

						if (model?.file) {
							console.log('NEW FILE MODEL FOUND', model.file);
							formData.append(`model-file-${model.id}`, model.file, model.file.name);
						}
					}

					config.data.textures.forEach((texture) => {
						if (texture?.isNew) {
							console.log('NEW TEXTURE FOUND', texture.url);
							formData.append('texture-id', texture.id);
							formData.append(`texture-file-${texture.id}`, texture.file, texture.name);
						}
					});

					await handleUpload(formData);
					window.location.reload();
				} catch (err) {
					isUploading = false;
					console.log(err);
				}

				// return async ({ update, result }) => {
				// 	await update();
				// 	isUploading = false;
				// 	console.log(result);
				// 	config.updateData(result.data);
				// };
			}}
		>
			<button type="submit">Save Settings</button>
			<div class={selectedMenu === 'scene' ? '' : 'hidden'}>
				<SceneForm />
			</div>
			<div class={selectedMenu === 'colors' ? '' : 'hidden'}>
				<ColorsForm />
			</div>
			<div class={selectedMenu === 'materials' ? '' : 'hidden'}>
				<MaterialsForm />
			</div>

			<div class={selectedMenu === 'models' ? '' : 'hidden'}>
				<ModelForm />
			</div>
			<!-- <div class={selectedMenu === 'upload' ? '' : 'hidden'}>
				<NewModelForm models={config.models} />
			</div> -->
		</form>

		<!-- {#if selectedMenu === 'models'}
			<NewModelForm models={config.models} />
		{/if} -->

		<!-- {#if selectedMenu === 'textures'}
			<TextureForm textures={config.textures} />
		{/if} -->
	</div>
</div>

<style>
	.wrapper {
		position: relative;
		overflow: hidden;
		display: flex;
		width: 100%;
	}
	.nav {
		display: flex;
		width: 100%;
		gap: 0.2rem;
	}
	.forms {
		position: relative;
		width: 400px;
		height: 100vh;
		top: 0;
		right: 0;
		display: flex;
		flex-direction: column;
		gap: 1rem;
		overflow-y: auto;
		background-color: white;
	}

	.hidden {
		display: none;
	}

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
		z-index: 1000;
	}
</style>

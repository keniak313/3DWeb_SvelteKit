<script lang="ts">
	import ColorsForm from '$lib/components/admin/ColorsForm.svelte';
	import MaterialsForm from '$lib/components/admin/MaterialsForm.svelte';
	import ModelForm from '$lib/components/admin/ModelForm.svelte';
	import CdnCheck from '$lib/components/CdnCheck.svelte';
	import Library from '$lib/components/Library.svelte';
	import Loader from '$lib/components/Loader.svelte';
	import Product from '$lib/components/Product.svelte';
	import { getAppConfig } from '$lib/state/config.svelte.js';

	let { data, form } = $props();

	const config = getAppConfig();

	const models = $derived(config.data.models);
	const textures = $derived(config.data.textures);

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

{#if form}
	{console.log('FORM??', form)}
{/if}

<div class="wrapper">
	<div class="left">
		<CdnCheck>
			<Product />
		</CdnCheck>
		<Library />
	</div>

	<div class="right">
		<div class="nav">
			{#if data.session.user.role === 'admin'}
				<button onclick={() => (selectedMenu = 'scene')}>Scene</button>
			{/if}
			<button
				style={form?.error?.formName === 'colors' ? 'background-color: red;' : ''}
				onclick={() => (selectedMenu = 'colors')}>Colors</button
			>
			<button
				style={form?.error?.formName === 'materials' ? 'background-color: red;' : ''}
				onclick={() => (selectedMenu = 'materials')}>Materials</button
			>
			<!-- <button onclick={() => (selectedMenu = 'textures')}>Textures</button> -->
			<button
				style={form?.error?.formName === 'models' ? 'background-color: red;' : ''}
				onclick={() => (selectedMenu = 'models')}>Models</button
			>
			<!-- <button onclick={() => (selectedMenu = 'upload')}>Upload</button> -->
		</div>
		<div class={selectedMenu === 'colors' ? '' : 'hidden'}>
			<ColorsForm {form} />
		</div>
		<div class={selectedMenu === 'materials' ? '' : 'hidden'}>
			<MaterialsForm {form} />
		</div>
		<div class={selectedMenu === 'models' ? '' : 'hidden'}>
			<ModelForm {form} />
		</div>
		<!-- <form
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
							formData.append(`texture-file-${texture.id}`, texture.file, texture.file.name);
						}
					});

					await handleUpload(formData);
					window.location.reload();
				} catch (err) {
					isUploading = false;
					console.log(err);
				}
			}}
		>
			<div class={selectedMenu === 'scene' ? '' : 'hidden'}>
				<SceneForm />
			</div>
			<div class={selectedMenu === 'colors' ? '' : 'hidden'}>
				<ColorsForm />
			</div>
	


		</form> -->
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
	.right {
		position: relative;
		height: 100vh;
		top: 0;
		right: 0;
		display: flex;
		flex-direction: column;
		gap: 1rem;
		overflow-y: auto;
		background-color: white;
		flex: 0.25;
	}

	.left {
		display: flex;
		flex-direction: column;
		flex: 1;
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

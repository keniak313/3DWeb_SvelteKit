<script lang="ts">
	import { enhance } from '$app/forms';
	import ColorsForm from '$lib/components/admin/ColorsForm.svelte';
	import MaterialsForm from '$lib/components/admin/MaterialsForm.svelte';
	import ModelForm from '$lib/components/admin/ModelForm.svelte';
	import NewModelForm from '$lib/components/admin/NewModelForm.svelte';
	import SceneForm from '$lib/components/admin/SceneForm.svelte';
	import TextureForm from '$lib/components/admin/TextureForm.svelte';
	import InputSelect from '$lib/components/InputSelect.svelte';
	import Product from '$lib/components/Product.svelte';
	import { getContext } from 'svelte';

	const config = getContext('config');

	let selectedMenu = $state();
</script>

<div class="wrapper">
	<Product />
	<div class="forms">
		<div class="nav">
			<button onclick={() => (selectedMenu = 'scene')}>Scene</button>
			<button onclick={() => (selectedMenu = 'colors')}>Colors</button>
			<button onclick={() => (selectedMenu = 'materials')}>Materials</button>
			<button onclick={() => (selectedMenu = 'textures')}>Textures</button>
			<button onclick={() => (selectedMenu = 'models')}>Models</button>
			<form method="POST" action="?/logout" use:enhance>
				<button>WYLOGUJ</button>
			</form>
		</div>
		<form
			method="POST"
			action="?/saveSettings"
			enctype="multipart/form-data"
			use:enhance={async ({ formData }) => {
				for await (const model of Object.values(config.models)) {
					if (model.newIcon) {
						console.log('NEW ICON FOUND', model.icon);
						const base64 = model.icon;

						const res = await fetch(base64);
						const blob = await res.blob();
						formData.append(`model-icon-${model.id}`, blob, `${model.name}.webp`);
					} else {
						formData.append(`model-icon-${model.id}`, model.icon);
					}
				}

				return async ({ update, result }) => {
					await update({ reset: false });
					Object.values(config.models).forEach((model) => {
						if (model.newIcon) {
							model.newIcon = false;
							model.icon = result.data.updatedIcons.find((m) => m.id === model.id).icon;
						}
					});
				};
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
		</form>

		{#if selectedMenu === 'models'}
			<NewModelForm models={config.models} />
		{/if}

		{#if selectedMenu === 'textures'}
			<TextureForm textures={config.textures} />
		{/if}
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
		width: 400px;
		height: 100vh;
		top: 0;
		right: 0;
		display: flex;
		flex-direction: column;
		gap: 1rem;
		overflow-y: auto;
		padding: 0.5rem;
		background-color: white;
	}

	.hidden {
		display: none;
	}
</style>

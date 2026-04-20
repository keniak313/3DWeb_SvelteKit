<script lang="ts">
	import { enhance } from '$app/forms';
	import ColorsForm from '$lib/components/admin/ColorsForm.svelte';
	import MaterialsForm from '$lib/components/admin/MaterialsForm.svelte';
	import ModelForm from '$lib/components/admin/ModelForm.svelte';
	import SceneForm from '$lib/components/admin/SceneForm.svelte';
	import TextureForm from '$lib/components/admin/TextureForm.svelte';
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
		{#if selectedMenu === 'scene'}
			<SceneForm />
		{/if}
		{#if selectedMenu === 'colors'}
			<ColorsForm colors={config.colors} />
		{/if}
		{#if selectedMenu === 'materials'}
			<MaterialsForm materials={config.materials} colors={config.colors} />
		{/if}
		{#if selectedMenu === 'textures'}
			<TextureForm textures={config.textures} />
		{/if}
		{#if selectedMenu === 'models'}
			<ModelForm models={config.models} materials={config.materials} colors={config.colors} />
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
</style>

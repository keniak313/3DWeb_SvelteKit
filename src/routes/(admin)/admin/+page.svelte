<script lang="ts">
	import { enhance } from '$app/forms';
	import Input from '$lib/components/Input.svelte';
	import { useGltf } from '@threlte/extras';
	import { customAlphabet } from 'nanoid';
	import { GLTFLoader } from 'three/examples/jsm/Addons.js';
	import { Image } from '@unpic/svelte';
	import ModelForm from '$lib/components/admin/ModelForm.svelte';
	import { nanoid } from '$lib/utilities/helpers.js';
	import TextureForm from '$lib/components/admin/TextureForm.svelte';
	import MaterialsForm from '$lib/components/admin/MaterialsForm.svelte';
	import ColorsForm from '$lib/components/admin/ColorsForm.svelte';
	import Product from '$lib/components/Product.svelte';

	let { data } = $props();

	let colors = $state(data.colors);
	let materials = $state(data.materials);
	let models = $state(data.models);
	let textures = $state(data.textures);
</script>

<div class="wrapper">
	<ColorsForm bind:colors />
	<MaterialsForm bind:materials {colors} />
	<TextureForm bind:textures />
	<ModelForm bind:models {materials} {colors} />

	<form method="POST" action="?/logout" use:enhance>
		<button>WYLOGUJ</button>
	</form>
</div>

<style>
	.wrapper {
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}
</style>

<script lang="ts">
	import { enhance } from '$app/forms';
	import { getContext } from 'svelte';
	import Input from './Input.svelte';
	import ItemIcon from './ItemIcon.svelte';
	import SimpleLoader from './SimpleLoader.svelte';

	let { onclick, iconModel } = $props();

	let iconGen = getContext('iconGen');

	let isLoading = $state(false);
</script>

<SimpleLoader {isLoading} />

<div class="wrapper">
	<div class="content">
		<button {onclick}>Generate Icon</button>
		<div>
			<ItemIcon src={iconModel.icon} isNew={iconModel.newIcon} size={128} />
			<!-- <img src={iconModel.icon} alt="" width={128} height={128} /> -->
			<form
				method="POST"
				action="?/saveIcon"
				enctype="multipart/form-data"
				use:enhance={async ({ formData }) => {
					isLoading = true;
					if (iconModel.newIcon) {
						const base64 = iconModel.icon;

						const res = await fetch(base64);
						const blob = await res.blob();
						formData.append(`model-icon`, blob, `${iconModel.name}.webp`);
						formData.append(`model-id`, iconModel.id);
					}
					return async ({ update }) => {
						await update({ reset: false });
						window.location.reload();
					};
				}}
			>
				<button>SAVE</button>
				<button
					type="button"
					onclick={() => {
						iconGen.isOpen = false;
						iconGen.model = null;
					}}
				>
					DISCARD
				</button>
			</form>
		</div>
	</div>
</div>

<style>
	.wrapper {
		position: absolute;
		z-index: 1;
		width: 100%;
		height: 100%;
		display: flex;
		justify-content: center;
		align-items: end;
		padding: 2rem;
		pointer-events: none;
	}

	.content {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		button {
			pointer-events: all;
		}
	}
</style>

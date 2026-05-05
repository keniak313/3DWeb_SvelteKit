<script lang="ts">
	import { getAppConfig } from '$lib/state/config.svelte';
	import NewModelForm from './admin/NewModelForm.svelte';
	import NewTextureForm from './admin/NewTextureForm.svelte';
	import ItemIcon from './ItemIcon.svelte';

	const config = getAppConfig();
	const models = $derived(config.data.models);
	const textures = $derived(config.data.textures);

	let tab = $state('models');
</script>

<div class="wrapper">
	<div class="nav">
		<button onclick={() => (tab = 'models')}>MODELS</button>
		<button onclick={() => (tab = 'textures')}>TEXTURES</button>
	</div>

	{#if tab === 'models'}
		<div class="list">
			<NewModelForm />
			{#if models.length > 0}
				{#each models as model (model.id)}
					<div class="item">
						<ItemIcon
							src={model.icon}
							updatedAt={model.updatedAt}
							isNew={model.newIcon}
							size={80}
						/>
						<p>{model.name}</p>
					</div>
				{/each}
			{/if}
		</div>
	{/if}

	{#if tab === 'textures'}
		<div class="list">
			<NewTextureForm />
			{#if textures.length > 0}
				{#each textures as texture (texture.id)}
					<div class="item">
						<ItemIcon src={texture.url} updatedAt={texture.updatedAt} size={80} />
						<p>{texture.name}</p>
					</div>
				{/each}
			{/if}
		</div>
	{/if}
</div>

<style>
	.wrapper {
		position: relative;
		display: flex;
		background-color: red;
		flex: 1;
		padding: 0.5rem;
		gap: 1rem;
	}

	.nav {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.list {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
	}
	.item {
		display: flex;
		flex-direction: column;
		align-items: center;
	}
</style>

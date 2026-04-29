<script lang="ts">
	import { enhance } from '$app/forms';
	import { getContext } from 'svelte';
	import Input from './Input.svelte';
	import { Image } from '@unpic/svelte';
	import ItemIcon from './ItemIcon.svelte';

	const config = getContext('config');

	let selected = $derived(config.selectedAsset);

	const models = $derived(config.modelsHydrated);

	let user = false;
</script>

<div class="info">
	<div class="top">WORK IN PROGRESS</div>
	<div class="left">
		{#each Object.values(models) as model (model.id)}
			{@const time = new Date(model.updatedAt).getTime()}
			<button
				class={selected?.model?.name === model.name && 'selected'}
				onclick={() => config.setSelected({ modelName: model.name })}
			>
				<ItemIcon src={model.icon} updatedAt={model.updatedAt} isNew={model.newIcon} />
				<!-- {#if model.icon}
					{#if !model.newIcon}
						<Image src={model.icon + '?v=' + time} alt={model.name} width={50} height={50} />
					{:else}
						<Image src={model.icon} alt={model.name} width={50} height={50} />
					{/if}
				{:else}
					<div style="width: 50px; height: 50px; background-color: magenta"></div>
				{/if} -->
				{model.displayName}
			</button>
		{/each}
	</div>
	{#if selected?.part}
		<div class="bot">
			<div class="title">
				<p>{selected?.model.displayName} - {selected?.part.displayName}</p>
				<p>{selected?.part.description}</p>
			</div>
			<div class="options">
				<div>
					{#each Object.values(selected.model.sockets) as socket (socket.id)}
						{console.log($state.snapshot(selected.model))}
						{#if selected.part.socket === socket.name}
							<p>{socket.name}</p>
							{#each socket.attachments as attachment (attachment.id)}
								<button
									class={socket?.attachment?.id === attachment.id && 'selected'}
									onclick={(e) => {
										config.setSocketAttachment({
											socket: socket.name,
											attachmentId: attachment.id
										});
									}}
								>
									<ItemIcon
										src={attachment.icon}
										updatedAt={attachment.updatedAt}
										isNew={attachment.newIcon}
									/>
									<p>{attachment.name}</p>
								</button>
							{/each}
						{/if}
					{/each}
				</div>
				<div>
					{#each selected.part.materials as material (material.id)}
						<div>
							<button
								class={selected?.part?.material?.id === material.id && 'selected'}
								onclick={(e) => {
									// setProductMaterial({ part: selected.part, material });
									config.setAssetMaterial({ materialId: material?.id });
								}}
								>{material.name}
							</button>
						</div>
						{#if selected.part.material.id === material.id}
							{#each selected?.part?.material?.colors as color (color.id)}
								<button
									class={'color ' + (selected?.part?.color?.id === color.id && 'selected')}
									style="background-color: {color.color}"
									onclick={() => {
										// setProductMaterialColor(color);
										config.setAssetColor({ colorId: color?.id });
									}}>X</button
								>
							{/each}
						{/if}
					{/each}
					<button onclick={() => config.clearPart()}>CLOSE</button>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.info {
		position: absolute;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
		z-index: 200;
	}

	.top {
		position: absolute;
		top: 0;
		padding: 1rem;
	}

	.left {
		position: absolute;
		top: 0;
		left: 0;
		height: 100%;
		display: flex;
		flex-direction: column;
		gap: 1rem;
		pointer-events: none;
		padding: 2rem;

		button {
			pointer-events: all;
			cursor: pointer;
			display: flex;
			flex-direction: column;
			padding: 0.2rem;
		}
	}

	.bot {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		place-self: end;
		pointer-events: all;
		padding: 2rem;
	}

	.title {
		display: flex;
		flex-direction: column;
		background-color: white;
		padding: 0.2rem;
	}

	.options {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.color {
		width: 20px;
		height: 20px;
	}

	.selected {
		outline: 2px solid green;
	}

	.material-editor {
		display: flex;
		gap: 1rem;
		background-color: white;
		padding: 0.2rem;
		flex-wrap: wrap;
		width: 100%;
	}
</style>

<script lang="ts">
	let {
		id,
		title,
		placeholder = 'SELECT PLACEHOLDER',
		data = $bindable(),
		value = $bindable(),
		multiple = false,
		onChange = () => {}
	} = $props();

	let isOpen = $state(false);

	let listItems = $derived.by(() => {
		if (multiple) {
			return data.map((v) => {
				if (value.find((x) => x?.id === v.id)) {
					return { ...v, selected: true };
				} else {
					return { ...v, selected: false };
				}
			});
		} else {
			return data?.map((i) => {
				if (value && value === i?.id) {
					return { ...i, selected: true };
				} else {
					return { ...i, selected: false };
				}
			});
		}
	});

	let val = $derived.by(() => {
		if (multiple) {
			const filteredValue = value.filter((v) => data.some((d) => d.id === v.id));
			return JSON.stringify(filteredValue);
		} else {
			const check = data?.find((i) => i?.id === value);
			if (check) {
				return value;
			} else {
				return null;
			}
		}
	});

	let ref = $state();
</script>

<svelte:window
	onclick={(e) => {
		if (ref && !ref.contains(e.target)) {
			isOpen = false;
		}
	}}
/>

<div class="wrapper" bind:this={ref}>
	<input {id} name={id} value={val} hidden />
	{title}
	<button type="button" class="select-btn" onclick={() => (isOpen = !isOpen)}>
		{#if multiple}
			{#if !value || value.length === 0}
				<p>
					{placeholder}
				</p>
			{:else}
				{#each data as item (item.id)}
					{#if value.find((i) => i?.id === item.id)}
						{#if item.color}
							<div style="background-color: {item.color}; width: 20px; height: 20px"></div>
						{/if}
						<p>
							{item.name}
						</p>
					{/if}
				{/each}
			{/if}
		{:else if value}
			{#if data.find((i) => i?.id === value)?.color}
				<div
					style="background-color: {data.find((i) => i?.id === value)
						?.color}; width: 20px; height: 20px"
				></div>
			{/if}
			{data.find((i) => i?.id === value)?.name ?? 'INVALID COLOR'}
		{:else}
			<p>
				{placeholder}
			</p>
		{/if}
	</button>
	<div class="list">
		{#if isOpen}
			<div class="list-items">
				{#each listItems as item (item.id)}
					<button
						type="button"
						class={`list-item ${item.selected && 'selected'}`}
						onclick={() => {
							if (multiple) {
								if (!item.selected) {
									value.push({ id: item.id });
								} else {
									value = value.filter((v) => v.id !== item.id);
								}
							} else {
								value = item.id;
								isOpen = false;
							}
							onChange(value);
						}}
					>
						{#if item.color}
							<div style="background-color: {item.color}; width: 20px; height: 20px"></div>
						{/if}
						{item.name}
					</button>
				{/each}
			</div>
		{/if}
	</div>
</div>

<style>
	.wrapper {
		position: relative;
	}
	.select-btn {
		display: flex;
		gap: 0.5rem;
	}
	.list {
		position: absolute;
		left: 0;
		z-index: 100;
	}
	.list-items {
		display: flex;
		flex-direction: column;
	}
	.list-item {
		display: flex;
		gap: 0.5rem;
	}
	.selected {
		background-color: green;
	}
</style>

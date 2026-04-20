<script lang="ts">
	let {
		id,
		title = null,
		type = 'string',
		data = null,
		value = $bindable(),
		checked = $bindable(),
		style = '',
		...props
	} = $props();
</script>

<label for={id} {style}>
	{title}
	{#if type === 'select'}
		<select name={id} {id} bind:value {...props}>
			{#each data as item (item?.id)}
				<option value={item?.id}>{item?.name}</option>
			{/each}
		</select>
	{:else if type === 'select-multiple'}
		<select name={id} {id} bind:value multiple {...props}>
			{#each data as item (item.id)}
				<option value={item.id}>{item.name}</option>
			{/each}
		</select>
	{:else if type === 'checkbox'}
		<input {id} name={id} bind:checked type="checkbox" {...props} />
	{:else}
		<input {id} name={id} bind:value {type} {...props} />
	{/if}
</label>

<style>
	label {
		display: flex;
		flex-direction: column;
		width: 100%;
		font-size: 0.7rem;
	}

	input,
	select {
		width: 100%;
	}
</style>

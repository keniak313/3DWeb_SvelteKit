<script lang="ts">
	import { enhance } from '$app/forms';
	import Input from '$lib/components/Input.svelte';

	let { data, form } = $props();
	console.log(data);

	let newWorkspaceInputs = $state({
		name: '',
		slug: ''
	});

	let addEmail = $state();
</script>

{#if form}
	{console.log(form)}
{/if}

<div>
	<p>ME</p>
	<p>{data.session.user.username}</p>
	{#if data?.user?.workspaces.length > 0}
		{#each data.user.workspaces as wp (wp.workspace?.id)}
			<div>
				<a href="/{wp.workspace?.slug}">{wp.workspace?.name}</a>
				<div>
					<ul>
						{#each wp.workspace?.workspaceToUser as wtu (wtu.user?.id)}
							<li>{wtu.user?.username} - {wtu.role}</li>
						{/each}
					</ul>
				</div>
				<p>Dodaj uzytkownika do workspace</p>
				<form
					method="POST"
					action="?/addUserToWorkspace"
					use:enhance={() => {
						return async ({ update }) => {
							await update({ reset: false });
							if (!form?.error) {
								addEmail = '';
							}
						};
					}}
				>
					<Input id="workspaceId" title="workspaceId" value={wp.workspace?.id} hidden />
					<Input id="email" title="email" type="email" bind:value={addEmail} error={form?.error} />
					<button type="submit">DODAJ</button>
				</form>
			</div>
		{/each}
	{:else}
		<p>No workspaces found</p>

		<form
			method="POST"
			action="?/createWorkspace"
			use:enhance={() => {
				return async ({ update }) => {
					await update({ reset: false });
					newWorkspaceInputs.name = '';
					newWorkspaceInputs.slug = '';
				};
			}}
		>
			<Input id="name" title="Name" bind:value={newWorkspaceInputs.name} />
			<Input id="slug" title="Slug" bind:value={newWorkspaceInputs.slug} hidden />
			<button>CREATE</button>
		</form>
	{/if}
</div>

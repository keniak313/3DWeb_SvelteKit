<script>
	import { enhance } from '$app/forms';

	let { form } = $props();

	let inputs = $state({ password: null });
</script>

<h1>Login</h1>

<form method="POST" use:enhance>
	<label>
		Password:
		<input id="password" name="password" type="password" bind:value={inputs.password} required />
	</label>
	<button type="submit">Login</button>
</form>

{#if form?.error}
	<p>{form.error}</p>
{/if}

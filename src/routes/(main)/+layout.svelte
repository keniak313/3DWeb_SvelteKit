<script lang="ts">
	import { signIn, signOut } from '$lib/auth-client';

	let { children, data } = $props();

	const username = $derived(data.session.user.username);
</script>

<header>
	<div class="nav">
		<div class="nav">
			{#if data.session}
				<p>Logged in as: {data.session.user.username}</p>
				<a href="/me"> ME </a>
				<button onclick={signOut}>SIGN OUT</button>
			{:else}
				<button onclick={signIn}>LOGIN</button>
			{/if}
		</div>
	</div>
</header>

{@render children()}

<footer></footer>

<script lang="ts">
	import { page } from '$app/state';
	import favicon from '$lib/assets/favicon.svg';
	import { signIn, signOut } from '$lib/auth-client';

	let { children, data } = $props();

	const username = $derived(data.session.user.username);
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<!-- <header>
	<div class="nav">
		{#if data.session}
			<p>Logged in as: {data.session.user.username}</p>
			<a href="/{username}"> Main user page </a>
			<a href="/{username}/me/studio"> Studio </a>
			<button onclick={signOut}>SIGN OUT</button>
		{:else}
			<button onclick={signIn}>LOGIN</button>
		{/if}
	</div>
</header> -->

{@render children()}

<!-- <footer>
	<p>Footer</p>
</footer> -->

<style>
	main {
		display: flex;
		flex: 1;
	}
	:global {
		* {
			padding: 0;
			box-sizing: border-box;
			margin: 0;
		}

		html,
		body {
			scroll-behavior: smooth;
			overscroll-behavior: none;
			/* overflow-y: scroll; */
			/* scrollbar-gutter: stable; */
		}

		html,
		body {
			display: flex;
			flex-direction: column;
			justify-content: space-between;
			min-height: 100vh;
			width: 100%;
			align-self: center;
			justify-self: center;
			position: relative;
		}
	}
</style>

<script>
	import { page } from '$app/state';
</script>

<div>
	<h1>ERROR</h1>
	<p>{page.error?.message}</p>
</div>

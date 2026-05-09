<script>
	import { getContext } from 'svelte';
	import IconCanvas from './IconCanvas.svelte';
	import IconCanvasUI from './IconCanvasUI.svelte';
	import PopupWrapper from './PopupWrapper.svelte';

	let iconGen = getContext('iconGen');

	let iconModel = $derived(iconGen.model);

	let iconCanvasRef = $state();
	let genIcon = $state('');

	const generateIcon = async (model) => {
		const targetSize = 512;
		if (!iconCanvasRef) return;
		console.log('ICON CANVAS REF', iconCanvasRef);
		const sourceCanvas = iconCanvasRef?.querySelector('canvas');

		console.log('SOURCE', sourceCanvas);

		if (!sourceCanvas) {
			console.error('Nie znaleziono elementu canvas!');
			return null;
		}

		// 2. Sprawdź czy wymiary źródła są poprawne (nie są 0)
		if (sourceCanvas.width === 0 || sourceCanvas.height === 0) {
			console.error('Canvas ma zerowe wymiary!');
			return null;
		}

		const tempCanvas = document.createElement('canvas');
		tempCanvas.width = targetSize;
		tempCanvas.height = targetSize;
		const ctx = tempCanvas.getContext('2d');
		ctx?.drawImage(sourceCanvas, 0, 0, targetSize, targetSize);

		const url = tempCanvas.toDataURL('image/webp');
		// console.log('ICON URL', url);
		genIcon = url;
		iconModel.icon = url;
		iconModel.newIcon = true;
		console.log('ICON MODEL', $state.snapshot(iconModel));
	};
</script>

<PopupWrapper isSquare={true}>
	<IconCanvas {iconModel} bind:ref={iconCanvasRef} />
	<IconCanvasUI
		{iconModel}
		onclick={() => {
			generateIcon(iconModel);
		}}
	/>
</PopupWrapper>

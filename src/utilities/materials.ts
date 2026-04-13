import { MeshStandardMaterial } from 'three';

export const materials = () => {
	const glass = (aoMap) => {
		return new MeshStandardMaterial({
			name: 'glass',
			metalness: 1,
			roughness: 0,
			transparent: true,
			opacity: 0.5,
			color: 'blue',
			aoMap
		});
	};
	const steel = (aoMap) => {
		return new MeshStandardMaterial({
			name: 'steel',
			metalness: 1,
			roughness: 0.4239,
			aoMap,
			color: '#6f6f74'
		});
	};
	const plastic = (aoMap) => {
		return new MeshStandardMaterial({
			name: 'plastic',
			metalness: 0,
			roughness: 0.4239,
			aoMap,
			color: '#6f6f74'
		});
	};
	return { glass, steel, plastic };
};

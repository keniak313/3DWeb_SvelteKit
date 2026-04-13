import { customAlphabet } from 'nanoid';

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const nanoid = customAlphabet(alphabet, 21); // 21 is the default length

const SHARED_COLORS = [
	{ id: nanoid(5), color: '#c4c4c4', name: 'silver' },
	{ id: nanoid(5), color: '#1d1b1b', name: 'black' },
	{ id: nanoid(5), color: '#1b5a55', name: 'teal' },
	{ id: nanoid(5), color: '#e065c6', name: 'pink' }
];

const GLASS_COLORS = [
	{ id: nanoid(5), color: '#e8edf3', name: 'white' },
	{ id: nanoid(5), color: '#70abe2', name: 'blue' },
	{ id: nanoid(5), color: '#ec6666', name: 'red' },
	{ id: nanoid(5), color: '#17181a', name: 'black' }
];

export const materials = $state({
	steel: {
		id: nanoid(5),
		name: 'Steel',
		metalness: 1,
		roughness: 0.1413,
		color: SHARED_COLORS[0],
		colors: SHARED_COLORS
	},
	plastic: {
		id: nanoid(5),
		name: 'Plastic',
		metalness: 0,
		roughness: 0.4674,
		color: SHARED_COLORS[1],
		colors: SHARED_COLORS
	},
	glass: {
		id: nanoid(5),
		name: 'Glass',
		metalness: 1,
		roughness: 0.1,
		transparent: true,
		opacity: 0.5,
		color: GLASS_COLORS[0],
		colors: GLASS_COLORS
	}
});

export const models = $state({
	Watch01: {
		id: nanoid(5),
		name: 'Watch01',
		parts: {
			Body: {
				id: nanoid(5),
				name: 'Body',
				description: 'Super durable materials',
				material: materials.steel,
				color: materials.steel.colors[0],
				materials: [materials.steel, materials.plastic],
				position: [2.34, 2.08, 2.12],
				target: [0.03, 0.81, 0.08],
				aoMap: true
			},
			Glass: {
				id: nanoid(5),
				name: 'Glass',
				description: 'Gorilla glass V10',
				material: materials.glass,
				color: materials.glass.colors[1],
				materials: [materials.glass],
				position: [1.35, 1.56, 1.93],
				target: [0, 0.85, 0],
				aoMap: false
			}
		}
	}
});

import { customAlphabet } from 'nanoid';

export const encodeConfig = (obj) => {
	const json = JSON.stringify(obj);
	return btoa(json).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

export const decodeConfig = (str) => {
	try {
		const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
		return JSON.parse(atob(base64));
	} catch (e) {
		console.error('Błędny format konfiguracji w URL');
		return null;
	}
};

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
export const nanoid = customAlphabet(alphabet, 21); // 21 is the default length

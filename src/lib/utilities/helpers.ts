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

type SocketResult = {
	isSocket: boolean;
	name: string | null;
};

type AttachmentResult = {
	isAttachment: boolean;
	socket?: string | null;
	name?: string | null;
};

type UseResult = {
	isUse: boolean;
	name: string | null;
};

export const checkName = (name: string) => {
	return {
		socket: (): SocketResult => {
			const check = name.split('_');
			const index = check.indexOf('socket');
			const isSocket = index !== -1;

			return {
				isSocket,
				name: check[index + 1]
			};
		},
		attachment: (): AttachmentResult => {
			const check = name.split('_');
			const index = check.indexOf('attachment');
			const isAttachment = index !== -1;

			if (isAttachment) {
				return {
					isAttachment: isAttachment,
					socket: check[index + 1],
					name: check[index - 1]
				};
			} else {
				return { isAttachment: isAttachment };
			}
		},
		use: (): UseResult => {
			const check = name.split('_');
			const index = check.indexOf('use');
			const isUse = index !== -1;

			return {
				isUse,
				name: check[index - 1]
			};
		}
	};
};

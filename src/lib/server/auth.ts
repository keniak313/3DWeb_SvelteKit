import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { env } from '$env/dynamic/private';
import { db } from './db';

export const auth = betterAuth({
	database: drizzleAdapter(db, { provider: 'sqlite' }),
	socialProviders: {
		google: {
			clientId: env.GOOGLE_CLIENT_ID,
			clientSecret: env.GOOGLE_CLIENT_SECRET
		}
	},
	user: {
		additionalFields: {
			role: {
				type: 'string',
				input: false
			},
			username: {
				type: 'string',
				input: false
			}
		}
	},
	databaseHooks: {
		user: {
			create: {
				before: async (user) => {
					const base = user.email.split('@')[0];
					const randomSuffix = Math.floor(1000 + Math.random() * 9000);
					return { data: { ...user, username: `${base}_${randomSuffix}` } };
				}
			}
		}
	}
});

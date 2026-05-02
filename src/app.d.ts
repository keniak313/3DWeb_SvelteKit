import type { LibSQLDatabase } from 'drizzle-orm/libsql';

import type * as schema from '$lib/server/db/schema';
import type { Session, User } from 'better-auth';

type ExtendedUser = User & {
	role: string;
	username: string;
	displayName: string;
};

// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			db: LibSQLDatabase<typeof schema>;
			session: Session & { user: ExtendedUser };
		}
		interface PageData {
			session: Session & { user: ExtendedUser };
		}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};

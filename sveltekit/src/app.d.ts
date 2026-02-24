// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		interface Locals {
			user?: { id: string, email: string, [key: string]: any };
			session?: { id: string, [key: string]: any };
			db: ReturnType<typeof import('$lib/server/db').createDb>;
		}


		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export { };

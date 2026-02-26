import type { Handle } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { createDb } from '$lib/server/db';
import { syncUserWithDatabase } from '$lib/server/auth-utils';
import { auth } from '$lib/server/auth';

/**
 * Handle Better Auth API and session population.
 */
const authHandle: Handle = async ({ event, resolve }) => {
	// 1. Better Auth session handling
	const session = await auth.api.getSession({
		headers: event.request.headers
	});

	if (session) {
		event.locals.user = {
			id: session.user.id,
			email: session.user.email,
			name: session.user.name,
			role: (session.user as any).role || 'USER_PROCUREMENT'
		};
		event.locals.session = session.session;
	}

	return resolve(event);
};

/**
 * Handle database initialization and legacy Neon Auth sync.
 */
const dbHandle: Handle = async ({ event, resolve }) => {
	// Use the neon-auth cookie for RLS if present, otherwise no token
	const token = event.cookies.get('neon-auth');
	event.locals.db = createDb(token);

	// Provide fallback sync if not using Better Auth session yet
	if (token && !event.locals.user) {
		const user = await syncUserWithDatabase(token);
		if (user) {
			event.locals.user = {
				id: user.id,
				email: user.email,
				name: user.name,
				role: user.role
			};
		}
	}

	return resolve(event);
};

/**
 * Handle authorization based on user roles and route permissions.
 */
const authorizationHandle: Handle = async ({ event, resolve }) => {
	const user = event.locals.user;
	const path = event.url.pathname;

	// Protected route configurations (base path -> allowed roles)
	const routePermissions = [
		{ path: '/dashboard', roles: ['SUPER_ADMIN', 'ADMIN_PROCUREMENT', 'USER_PROCUREMENT', 'MANUFACT_PROCUREMENT'] },
		{ path: '/explore', roles: ['ANY'] },
		{ path: '/api/public', roles: ['ANY'] },
		{ path: '/procurements', roles: ['SUPER_ADMIN', 'ADMIN_PROCUREMENT', 'USER_PROCUREMENT', 'MANUFACT_PROCUREMENT'] },
		{ path: '/users', roles: ['SUPER_ADMIN', 'ADMIN_PROCUREMENT'] },
		{ path: '/submissions', roles: ['SUPER_ADMIN', 'ADMIN_PROCUREMENT', 'USER_PROCUREMENT', 'MANUFACT_PROCUREMENT'] },
	];

	// Find the matching route permission configuration based on prefix
	const requiredPermission = routePermissions.find(route => path.startsWith(route.path));

	if (requiredPermission) {
		// If ANY role is allowed, we don't strictly require a user object for authentication
		if (requiredPermission.roles.includes('ANY')) {
			return resolve(event);
		}

		if (!user) {

			// Redirect unauthenticated users to the auth page
			throw redirect(303, `/auth?callbackURL=${encodeURIComponent(path)}`);
		}

		if (!requiredPermission.roles.includes(user.role)) {
			// User is authenticated but does not have the required role
			// Redirect to the unauthorized access page
			throw redirect(303, '/unauthorized');
		}
	} else if (path.startsWith('/auth') && user) {
		// Prevent logged-in users from accessing the auth page
		throw redirect(303, '/dashboard');
	}

	return resolve(event);
};

export const handle = sequence(authHandle, dbHandle, authorizationHandle);

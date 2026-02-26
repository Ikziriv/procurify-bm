import { json } from '@sveltejs/kit';
import { AblyService } from '$lib/server/services/ably-service';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
    const user = locals.user;

    if (!user) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const tokenRequest = await AblyService.createTokenRequest(user.id);
        return json(tokenRequest);
    } catch (error) {
        console.error('Failed to create Ably token request:', error);
        return json({ error: 'Internal Server Error' }, { status: 500 });
    }
};

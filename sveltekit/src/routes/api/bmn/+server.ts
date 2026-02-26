import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { BMNService } from '$lib/server/services/bmn-service';

export const GET: RequestHandler = async ({ url }) => {
    try {
        const query = url.searchParams.get('q') || '';
        const items = await BMNService.search(query);
        return json({ items });
    } catch (error) {
        console.error('BMN Search API Error:', error);
        return json({ error: 'Failed to search BMN' }, { status: 500 });
    }
};

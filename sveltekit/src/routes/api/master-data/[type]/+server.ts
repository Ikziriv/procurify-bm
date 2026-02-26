import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { MasterDataService } from '$lib/server/services/master-data-service';

export const GET: RequestHandler = async ({ params, url }) => {
    try {
        const type = params.type;
        const query = url.searchParams.get('q') || '';

        let items: any[] = [];

        switch (type) {
            case 'kbli':
                items = await MasterDataService.searchKbli(query);
                break;
            case 'kbki':
                items = await MasterDataService.searchKbki(query);
                break;
            case 'bas':
                items = await MasterDataService.searchBas(query);
                break;
            default:
                return json({ error: 'Invalid master data type' }, { status: 400 });
        }

        return json({ items });
    } catch (error) {
        console.error('Master Data Search API Error:', error);
        return json({ error: 'Failed to search master data' }, { status: 500 });
    }
};

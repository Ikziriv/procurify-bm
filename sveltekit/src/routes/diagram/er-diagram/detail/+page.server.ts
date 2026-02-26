import { getERDiagram } from '$lib/server/db/diagram-mapper';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
    const { nodes, edges } = getERDiagram();
    return {
        nodes,
        edges
    };
};

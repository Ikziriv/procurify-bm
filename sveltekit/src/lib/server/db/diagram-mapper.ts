import * as schema from './schema';
import { isTable } from 'drizzle-orm';
import { getTableConfig } from 'drizzle-orm/pg-core';
import type { Node, Edge } from '@xyflow/svelte';

export function getERDiagram() {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    let x = 0;
    let y = 0;
    const spacingX = 350;
    const spacingY = 550; // Increased spacing for tables with many columns
    const cols = 4;

    let counter = 0;
    const EXCLUDED_TABLES = [

        'procurementKblis',
        'procurementKbkis',
        'submissionKblis',
        'submissionKbkis',
        'userKblis',
        'userKbkis',
        'kbliKbkiMapping',
        'subscriptionPlans',
        'subscriptions',
        'kbli',
        'kbki',
        'bas'
    ];

    // Iterate over all exports in schema
    for (const [key, value] of Object.entries(schema)) {
        if (isTable(value) && !EXCLUDED_TABLES.includes(key)) {
            const config = getTableConfig(value as any);
            const tableName = key;

            const nodeColumns = config.columns.map((col: any) => ({
                name: col.name,
                type: col.getSQLType(),
                isPK: col.primary,
                isFK: false // Will be updated below
            }));

            // Identify columns that are part of FKs
            config.foreignKeys.forEach((fk: any) => {
                fk.reference().columns.forEach((col: any) => {
                    // This logic is slightly complex as col here is target, 
                    // we need to find the source column in the mapping
                });
            });

            nodes.push({
                id: tableName,
                type: 'er',
                data: {
                    label: tableName,
                    columns: nodeColumns
                },
                position: {
                    x: (counter % cols) * spacingX,
                    y: Math.floor(counter / cols) * spacingY
                }
            });

            // Extract edges from foreign keys
            config.foreignKeys.forEach((fk: any) => {
                const sourceTable = tableName;
                const targetTable = Object.entries(schema).find(([_, v]) => v === fk.reference().table)?.[0];

                if (targetTable && !EXCLUDED_TABLES.includes(targetTable)) {
                    const sourceCol = fk.columns[0].name;
                    const targetCol = fk.reference().columns[0].name;

                    edges.push({
                        id: `e-${sourceTable}-${targetTable}-${sourceCol}`,
                        source: sourceTable,
                        target: targetTable,
                        sourceHandle: `${sourceCol}-source`,
                        targetHandle: `${targetCol}-target`,
                        animated: true,
                        style: 'stroke: #94a3b8; stroke-width: 2;'
                    });

                    // Update isFK in the node data
                    const node = nodes.find(n => n.id === sourceTable);
                    if (node) {
                        const colData = (node.data as any).columns.find((c: any) => c.name === sourceCol);
                        if (colData) colData.isFK = true;
                    }
                }
            });

            counter++;
        }
    }


    return { nodes, edges };
}

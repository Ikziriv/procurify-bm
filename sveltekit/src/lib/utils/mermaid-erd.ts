import type { Node, Edge } from '@xyflow/svelte';

export function convertToMermaidERD(nodes: Node[], edges: Edge[]): string {
    let mermaid = 'erDiagram\n';

    // Define tables and columns
    nodes.forEach((node) => {
        const tableName = node.id;
        const data = node.data as any;
        const columns = data.columns || [];

        // Mermaid table names cannot have special characters
        const sanitizedTableName = tableName.replace(/[^a-zA-Z0-9_]/g, '_');

        mermaid += `    ${sanitizedTableName} {\n`;
        columns.forEach((col: any) => {
            // Mermaid types cannot have spaces or complex characters
            const type = (col.type || 'unknown').replace(/[^a-zA-Z0-9]/g, '_');
            const name = col.name.replace(/[^a-zA-Z0-9_]/g, '_');
            const attributes = [];
            if (col.isPK) attributes.push('PK');
            if (col.isFK) attributes.push('FK');

            mermaid += `        ${type} ${name} ${attributes.join(',')}\n`;
        });
        mermaid += '    }\n';
    });

    // Define relationships
    // In Drizzle, the FK is on the child table. 
    // Mermaid ERD syntax: parent ||--o{ child : label
    edges.forEach((edge) => {
        const child = edge.source.replace(/[^a-zA-Z0-9_]/g, '_');
        const parent = edge.target.replace(/[^a-zA-Z0-9_]/g, '_');
        mermaid += `    ${parent} ||--o{ ${child} : "references"\n`;
    });

    return mermaid;
}

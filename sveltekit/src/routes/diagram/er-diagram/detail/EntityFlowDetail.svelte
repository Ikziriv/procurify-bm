<script lang="ts">
	import {
		SvelteFlow,
		Controls,
		Background,
		BackgroundVariant,
		useSvelteFlow,
		type NodeTypes,
		type Node,
		type Edge
	} from '@xyflow/svelte';
	import { appState } from '$lib/state.svelte';
	import ERNode from '$lib/components/diagram/ERNode.svelte';
	import dagre from 'dagre';
	import { onMount } from 'svelte';

	interface Props {
		nodes: Node[];
		edges: Edge[];
	}

	let { nodes = $bindable(), edges = $bindable() }: Props = $props();

	const nodeTypes: NodeTypes = {
		er: ERNode
	};

	const { fitView } = useSvelteFlow();

	function applyAutoLayout() {
		const g = new dagre.graphlib.Graph();
		g.setGraph({ rankdir: 'LR', nodesep: 100, ranksep: 200 });
		g.setDefaultEdgeLabel(() => ({}));

		nodes.forEach((node) => {
			const height = 100 + ((node.data as any).columns?.length || 0) * 25;
			g.setNode(node.id, { width: 300, height });
		});

		edges.forEach((edge) => {
			g.setEdge(edge.source, edge.target);
		});

		dagre.layout(g);

		nodes = nodes.map((node) => {
			const nodeWithPosition = g.node(node.id);
			return {
				...node,
				position: {
					x: nodeWithPosition.x - 150,
					y: nodeWithPosition.y - 50
				}
			};
		});

		setTimeout(() => {
			fitView({ duration: 800 });
		}, 100);
	}

	onMount(() => {
		applyAutoLayout();
	});
</script>

<div class="h-full w-full">
	<SvelteFlow {nodes} {edges} {nodeTypes} fitView colorMode="light" minZoom={0.1} maxZoom={2}>
		<Controls />
		<Background variant={BackgroundVariant.Dots} gap={20} size={1} />
	</SvelteFlow>
</div>

<style>
	:global(.svelte-flow__node-er) {
		border-radius: 0.75rem;
		border: none !important;
	}
	:global(.svelte-flow__edge-path) {
		stroke: #cbd5e1 !important;
		stroke-width: 1.5 !important;
	}
	:global(.svelte-flow__controls) {
		border-radius: 1rem !important;
		box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1) !important;
		border: none !important;
		background: white !important;
		padding: 4px !important;
		margin-bottom: 2rem !important;
	}
</style>

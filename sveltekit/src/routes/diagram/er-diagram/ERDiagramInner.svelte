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
	import { toPng } from 'html-to-image';
	import dagre from 'dagre';

	interface Props {
		nodes: Node[];
		edges: Edge[];
		nodeTypes: NodeTypes;
	}

	let { nodes = $bindable(), edges = $bindable(), nodeTypes }: Props = $props();

	const { fitView } = useSvelteFlow();

	async function exportDiagram() {
		const element = document.querySelector('.svelte-flow') as HTMLElement;
		if (!element) return;

		try {
			const dataUrl = await toPng(element, {
				backgroundColor: '#ffffff',
				quality: 1,
				pixelRatio: 2
			});
			const link = document.createElement('a');
			link.download = `er-diagram-${new Date().getTime()}.png`;
			link.href = dataUrl;
			link.click();
		} catch (err) {
			console.error('Failed to export diagram:', err);
		}
	}

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
		}, 50);
	}
</script>

<div class="flex h-screen w-full flex-col bg-slate-50/50">
	<!-- Header: Premium Control Bar -->
	<header
		class="z-10 flex h-20 items-center justify-between border-b border-slate-200/60 bg-white/80 px-8 backdrop-blur-xl"
	>
		<div class="flex items-center gap-8">
			<div>
				<h1 class="text-xl font-bold tracking-tight text-slate-900">
					{appState.t.erDiagram.title}
				</h1>
				<p class="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
					{appState.t.erDiagram.subtitle}
				</p>
			</div>
		</div>

		<div class="flex items-center gap-2">
			<button
				onclick={() => (window.location.href = '/diagram/er-diagram/detail')}
				class="group flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-[11px] font-bold tracking-widest text-slate-600 uppercase transition-all hover:bg-slate-50 hover:text-slate-900 active:scale-95"
			>
				{appState.t.erDiagram.detailTitle.split(' ')[0]}
			</button>

			<button
				onclick={exportDiagram}
				class="group flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-[11px] font-bold tracking-widest text-slate-600 uppercase transition-all hover:bg-slate-50 hover:text-slate-900 active:scale-95"
			>
				{appState.t.erDiagram.exportImage}
			</button>

			<button
				onclick={applyAutoLayout}
				class="group flex cursor-pointer items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-[11px] font-bold tracking-widest text-white uppercase shadow-lg shadow-slate-900/10 transition-all hover:bg-slate-800 active:scale-95"
			>
				{appState.t.erDiagram.autoLayout}
			</button>
		</div>
	</header>

	<div class="flex-1 overflow-hidden bg-slate-50/30">
		<SvelteFlow {nodes} {edges} {nodeTypes} fitView colorMode="light" minZoom={0.1} maxZoom={2}>
			<Controls />
			<Background variant={BackgroundVariant.Dots} gap={20} size={1} />
		</SvelteFlow>
	</div>
</div>

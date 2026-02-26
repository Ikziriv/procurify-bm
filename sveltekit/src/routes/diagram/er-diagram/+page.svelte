<script lang="ts" context="module">
	// No module context needed for now
</script>

<script lang="ts">
	import {
		SvelteFlow,
		Controls,
		Background,
		BackgroundVariant,
		useSvelteFlow,
		SvelteFlowProvider,
		type NodeTypes
	} from '@xyflow/svelte';
	import '@xyflow/svelte/dist/style.css';
	import ERNode from '$lib/components/diagram/ERNode.svelte';
	import ERDiagramInner from './ERDiagramInner.svelte';
	import { appState } from '$lib/state.svelte';
	import { toPng } from 'html-to-image';
	import dagre from 'dagre';

	let { data } = $props();

	let nodes = $state(data.nodes);
	let edges = $state(data.edges);

	const nodeTypes: NodeTypes = {
		er: ERNode
	};

	// We need a sub-component to use useSvelteFlow hooks
</script>

<SvelteFlowProvider>
	<ERDiagramInner bind:nodes bind:edges {nodeTypes} />
</SvelteFlowProvider>

<style>
	:global(.svelte-flow__node-er) {
		border-radius: 0.75rem;
	}
	:global(.svelte-flow__edge-path) {
		stroke-dasharray: 5;
		animation: dash 1s linear infinite;
	}
	@keyframes dash {
		from {
			stroke-dashoffset: 10;
		}
		to {
			stroke-dashoffset: 0;
		}
	}
</style>

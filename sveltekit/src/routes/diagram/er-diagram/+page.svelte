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
	}
	:global(.svelte-flow__controls-button) {
		border-radius: 0.5rem !important;
		border: none !important;
		background: transparent !important;
		transition: background 0.2s !important;
	}
	:global(.svelte-flow__controls-button:hover) {
		background: #f1f5f9 !important;
	}
</style>

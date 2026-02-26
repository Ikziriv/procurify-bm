<script lang="ts">
	import * as jointNamespace from '@joint/core';
	const joint = (jointNamespace as any).default || jointNamespace;
	const dia = joint.dia;

	import { onMount } from 'svelte';
	import JointFlow from '$lib/components/diagram/JointFlow.svelte';
	import { appState } from '$lib/state.svelte';
	import {
		FlowchartProcess,
		FlowchartDecision,
		FlowchartTerminal,
		FlowchartLink
	} from '$lib/components/diagram/shapes';

	let graph = $state<jointNamespace.dia.Graph | null>(null);

	function createDiagram(targetGraph: jointNamespace.dia.Graph) {
		const t = appState.t.standardFlowchart;

		// Utility to create nodes more easily
		const createNode = (Shape: any, x: number, y: number, w: number, h: number, text: string) => {
			const node = new Shape();
			node.position(x, y);
			node.size(w, h);
			node.attr('label/text', text);
			targetGraph.addCell(node);
			return node;
		};

		// Utility to create links with text labels
		const createLink = (source: any, target: any, labelText?: string) => {
			const link = new FlowchartLink();
			link.source(source);
			link.target(target);
			if (labelText) {
				link.labels([
					{
						attrs: { text: { text: labelText } },
						position: 0.5
					}
				]);
			}
			targetGraph.addCell(link);
			return link;
		};

		// 1. Start Node (Centered at 400)
		const start = createNode(FlowchartTerminal, 380, 50, 140, 48, t.nodes.start);

		// 2. Process: Login
		const login = createNode(FlowchartProcess, 350, 160, 200, 64, t.nodes.login);

		// 3. Decision: Role Check
		const roleCheck = createNode(FlowchartDecision, 400, 290, 100, 100, t.nodes.roleCheck);

		// 4. Process: Create Procurement
		const createProc = createNode(FlowchartProcess, 350, 480, 200, 64, t.nodes.createProc);

		// 5. Decision: PDN/TKDN Check
		const pdnCheck = createNode(FlowchartDecision, 400, 610, 100, 100, t.nodes.pdnCheck);

		// 6. Process: Publish Procurement
		const publish = createNode(FlowchartProcess, 350, 800, 200, 64, t.nodes.publish);

		// 7. End Node
		const end = createNode(FlowchartTerminal, 380, 930, 140, 48, t.nodes.end);

		// LINKS
		createLink(start, login);
		createLink(login, roleCheck);
		createLink(roleCheck, createProc, t.links.yes);
		createLink(createProc, pdnCheck);
		createLink(pdnCheck, publish, t.links.yes);
		createLink(publish, end);

		// Negative Paths
		const rejectRole = createNode(FlowchartTerminal, 650, 315, 140, 48, t.nodes.rejected);
		rejectRole.attr('body/fill', '#fee2e2');
		rejectRole.attr('body/stroke', '#f87171');
		rejectRole.attr('label/fill', '#ef4444');

		createLink(roleCheck, rejectRole, t.links.no);
	}

	$effect(() => {
		// Re-initialize graph when language changes to refresh labels
		if (typeof window !== 'undefined' && appState.language) {
			const newGraph = new dia.Graph();
			createDiagram(newGraph);
			graph = newGraph;
		}
	});

	onMount(() => {
		// Initial diagram creation (handled by $effect above if language is set)
	});
</script>

<svelte:head>
	<title>{appState.t.standardFlowchart.tag} | JointJS</title>
</svelte:head>

<div class="min-h-screen bg-[#fafbfc] p-8 md:p-12 lg:p-16">
	<div class="mx-auto max-w-7xl">
		<!-- Header Section -->
		<div class="mb-12">
			<div class="flex items-end justify-between gap-8">
				<div>
					<h1 class="text-4xl font-black tracking-tighter text-slate-900 lg:text-6xl">
						{appState.t.standardFlowchart.title}
						<span class="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
							>{appState.t.standardFlowchart.titleAccent}</span
						>
					</h1>
					<p class="mt-4 max-w-2xl text-lg leading-relaxed font-medium text-slate-500">
						{appState.t.standardFlowchart.description}
					</p>
				</div>
			</div>
		</div>

		<!-- JointJS Canvas -->
		<div
			class="relative min-h-[1000px] overflow-hidden rounded-[3rem] bg-white p-4 shadow-2xl ring-1 ring-slate-200/50"
		>
			{#if graph}
				<JointFlow {graph} height={1000} />
			{:else}
				<div class="flex h-[1000px] items-center justify-center text-slate-400">
					Initializing diagram engine...
				</div>
			{/if}
		</div>

		<!-- Documentation Footer -->
		<div class="mt-12 grid gap-8 lg:grid-cols-2">
			<div class="rounded-3xl border border-slate-200/50 bg-white/50 p-8">
				<h4 class="mb-2 text-sm font-black tracking-widest text-slate-400 uppercase">
					{appState.t.standardFlowchart.schemaMapping}
				</h4>
				<p class="text-sm text-slate-600">
					{appState.t.standardFlowchart.schemaMappingDesc}
				</p>
			</div>
			<div class="rounded-3xl border border-slate-200/50 bg-white/50 p-8">
				<h4 class="mb-2 text-sm font-black tracking-widest text-slate-400 uppercase">
					{appState.t.standardFlowchart.constraintRules}
				</h4>
				<ul class="space-y-2 text-sm text-slate-600">
					<li>
						• <strong>{appState.t.standardFlowchart.pdnConsistency}:</strong>
						{appState.t.standardFlowchart.pdnConsistencyDesc}
					</li>
					<li>
						• <strong>{appState.t.standardFlowchart.rolePropagation}:</strong>
						{appState.t.standardFlowchart.rolePropagationDesc}
					</li>
				</ul>
			</div>
		</div>
	</div>
</div>

<style>
	:global(.joint-paper) {
		background: #f8fafc !important;
	}
</style>

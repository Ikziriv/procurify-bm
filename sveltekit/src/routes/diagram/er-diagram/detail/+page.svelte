<script lang="ts">
	import type { Node, Edge } from '@xyflow/svelte';
	import type { PageData } from './$types';
	import { SvelteFlowProvider } from '@xyflow/svelte';
	import mermaid from 'mermaid';
	import { appState } from '$lib/state.svelte';
	import { convertToMermaidERD } from '$lib/utils/mermaid-erd';
	import EntityFlowDetail from './EntityFlowDetail.svelte';

	let { data }: { data: PageData } = $props();

	let diagramContainer = $state<HTMLElement>();
	let diagramInstance = $state<HTMLElement>();
	let mermaidSyntax = $derived(convertToMermaidERD(data.nodes as any, data.edges as any));

	// View Mode
	let viewMode = $state<'SCHEMA' | 'RELATIONS'>('SCHEMA');
	let nodes = $state.raw<Node[]>($state.snapshot(data.nodes as any));
	let edges = $state.raw<Edge[]>($state.snapshot(data.edges as any));

	// Sync nodes/edges when data changes (Svelte 5 best practice for raw state from props)
	$effect(() => {
		nodes = data.nodes as any;
		edges = data.edges as any;
	});

	// View state
	let scale = $state(1);
	let transformX = $state(0);
	let transformY = $state(0);
	let isDragging = $state(false);
	let startX = 0;
	let startY = 0;

	$effect(() => {
		if (viewMode === 'SCHEMA' && diagramInstance && mermaidSyntax) {
			mermaid.initialize({
				startOnLoad: false,
				theme: 'base',
				themeVariables: {
					fontFamily: 'Inter, sans-serif',
					fontSize: '13px',
					primaryColor: '#f8fafc',
					primaryTextColor: '#1e293b',
					primaryBorderColor: '#e2e8f0',
					lineColor: '#64748b',
					secondaryColor: '#f1f5f9',
					tertiaryColor: '#ffffff',
					mainBkg: '#ffffff',
					nodeBorder: '#e2e8f0',
					clusterBkg: '#f8fafc',
					clusterBorder: '#e2e8f0',
					titleColor: '#0f172a',
					attributeFontFamily: 'JetBrains Mono, monospace',
					attributeFontSize: '11px'
				},
				er: {
					useMaxWidth: false,
					layoutDirection: 'LR',
					entityPadding: 15
				}
			});

			mermaid
				.render('erd-diagram-' + Date.now(), mermaidSyntax)
				.then(({ svg }) => {
					if (diagramInstance) {
						diagramInstance.innerHTML = svg;
						requestAnimationFrame(() => {
							resetView();
						});
					}
				})
				.catch((error) => {
					console.error('Mermaid rendering failed:', error);
				});
		}
	});

	function handleWheel(e: WheelEvent) {
		e.preventDefault();
		const delta = e.deltaY > 0 ? 0.9 : 1.1;
		const nextScale = scale * delta;
		if (nextScale > 0.1 && nextScale < 5) {
			scale = nextScale;
		}
	}

	function handleMouseDown(e: MouseEvent) {
		if (e.button !== 0) return; // Only left click
		isDragging = true;
		startX = e.clientX - transformX;
		startY = e.clientY - transformY;
	}

	function handleMouseMove(e: MouseEvent) {
		if (!isDragging) return;
		transformX = e.clientX - startX;
		transformY = e.clientY - startY;
	}

	function handleMouseUp() {
		isDragging = false;
	}

	function zoomIn() {
		scale = Math.min(scale * 1.2, 5);
	}

	function zoomOut() {
		scale = Math.max(scale / 1.2, 0.1);
	}

	function resetView() {
		scale = 1;
		transformX = 0;
		transformY = 0;
	}

	async function downloadSVG() {
		if (!diagramInstance) return;
		const svgElement = diagramInstance.querySelector('svg');
		if (!svgElement) return;

		const serializer = new XMLSerializer();
		const source = serializer.serializeToString(svgElement);
		const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
		const url = URL.createObjectURL(blob);

		const link = document.createElement('a');
		link.href = url;
		link.download = `er-diagram-${new Date().getTime()}.svg`;
		link.click();
		URL.revokeObjectURL(url);
	}

	function goBack() {
		window.history.back();
	}
</script>

<div class="flex h-screen w-full flex-col bg-slate-50/50">
	<!-- Header: Premium Control Bar -->
	<header
		class="z-10 flex h-20 items-center justify-between border-b border-slate-200/60 bg-white/80 px-8 backdrop-blur-xl"
	>
		<div class="flex items-center gap-8">
			<button
				onclick={goBack}
				class="group flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-slate-500 transition-all hover:bg-slate-50 hover:text-slate-900 active:scale-95"
			>
				<span class="text-[11px] font-bold tracking-widest uppercase"
					>{appState.t.erDiagram.back}</span
				>
			</button>
			<div class="h-8 w-[1px] bg-slate-200/60"></div>
			<div>
				<h1 class="text-xl font-bold tracking-tight text-slate-900">
					{appState.t.erDiagram.detailTitle}
				</h1>
				<p class="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
					{appState.t.erDiagram.detailSubtitle}
				</p>
			</div>
		</div>

		<div class="flex items-center gap-3">
			<button
				onclick={() => (viewMode = viewMode === 'SCHEMA' ? 'RELATIONS' : 'SCHEMA')}
				class="group flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 transition-all hover:bg-slate-50 active:scale-95"
			>
				<span class="text-[11px] font-bold tracking-widest text-slate-600 uppercase">
					{viewMode === 'SCHEMA'
						? appState.t.erDiagram.viewRelations
						: appState.t.erDiagram.viewSchema}
				</span>
			</button>

			<button
				onclick={downloadSVG}
				class="flex h-10 items-center justify-center rounded-xl bg-slate-900 px-4 text-[11px] font-bold tracking-widest text-white uppercase shadow-lg shadow-slate-900/10 transition-all hover:bg-slate-800 active:scale-95"
			>
				Download SVG
			</button>
		</div>
	</header>

	<!-- Main Content: Interactive Canvas -->
	<main class="relative flex-1 overflow-hidden bg-slate-50/30">
		<div class="absolute top-2 left-2 h-auto w-auto">
			<div class="mr-2 flex items-center gap-1 rounded-xl bg-slate-100 p-1">
				<button
					onclick={zoomOut}
					class="flex h-8 items-center justify-center rounded-lg px-3 text-[10px] font-bold text-slate-500 transition-colors hover:bg-white hover:text-slate-900"
				>
					{appState.t.erDiagram.zoomOut || 'OUT'}
				</button>
				<div class="px-2 text-[10px] font-bold text-slate-400">
					{Math.round(scale * 100)}%
				</div>
				<button
					onclick={zoomIn}
					class="flex h-8 items-center justify-center rounded-lg px-3 text-[10px] font-bold text-slate-500 transition-colors hover:bg-white hover:text-slate-900"
				>
					{appState.t.erDiagram.zoomIn || 'IN'}
				</button>
				<div class="mx-1 h-4 w-[1px] bg-slate-200"></div>
				<button
					onclick={resetView}
					class="flex h-8 items-center justify-center rounded-lg px-3 text-[10px] font-bold text-slate-500 transition-colors hover:bg-white hover:text-slate-900"
				>
					{appState.t.erDiagram.reset || 'RESET'}
				</button>
			</div>
		</div>

		{#if viewMode === 'SCHEMA'}
			<div
				bind:this={diagramContainer}
				class="h-full w-full cursor-grab active:cursor-grabbing"
				onwheel={handleWheel}
				onmousedown={handleMouseDown}
				onmousemove={handleMouseMove}
				onmouseup={handleMouseUp}
				onmouseleave={handleMouseUp}
				role="presentation"
			>
				<div
					bind:this={diagramInstance}
					class="flex min-h-full min-w-full items-center justify-center transition-transform duration-75 ease-out"
					style:transform="translate({transformX}px, {transformY}px) scale({scale})"
				>
					<!-- Loading State -->
					<div class="flex flex-col items-center gap-6 text-slate-300">
						<div class="relative flex h-16 w-16 items-center justify-center">
							<div
								class="absolute inset-0 animate-spin rounded-full border-2 border-slate-100 border-t-slate-300"
							></div>
							<span class="material-symbols-outlined text-3xl">database</span>
						</div>
						<div class="text-center">
							<h4 class="text-[11px] font-bold tracking-widest text-slate-900 uppercase">
								{appState.t.erDiagram.loading}
							</h4>
							<p class="mt-2 text-[10px] font-medium text-slate-400">
								{appState.t.erDiagram.loadingSubtitle}
							</p>
						</div>
					</div>
				</div>
			</div>
		{:else}
			<SvelteFlowProvider>
				<EntityFlowDetail bind:nodes bind:edges />
			</SvelteFlowProvider>
		{/if}

		<!-- Hint Overlay -->
		<div class="pointer-events-none absolute bottom-8 left-1/2 -translate-x-1/2">
			<div
				class="rounded-full bg-slate-900/80 px-4 py-2 text-[10px] font-bold text-white backdrop-blur-md"
			>
				{appState.t.erDiagram.interactionHint}
			</div>
		</div>
	</main>
</div>

<style>
	:global(.mermaid) {
		width: 100%;
		height: auto;
	}

	:global(.mermaid svg) {
		max-width: none !important;
		height: auto !important;
		filter: drop-shadow(0 20px 50px rgba(0, 0, 0, 0.1));
		background: white;
		border-radius: 1.5rem;
		padding: 40px;
	}

	/* Custom scrollbar */
	::-webkit-scrollbar {
		width: 6px;
	}
	::-webkit-scrollbar-track {
		background: transparent;
	}
	::-webkit-scrollbar-thumb {
		background: rgba(0, 0, 0, 0.05);
		border-radius: 10px;
	}
	::-webkit-scrollbar-thumb:hover {
		background: rgba(0, 0, 0, 0.1);
	}
</style>

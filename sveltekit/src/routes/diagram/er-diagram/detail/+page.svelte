<script lang="ts">
	import { onMount } from 'svelte';
	import mermaid from 'mermaid';
	import { appState } from '$lib/state.svelte';
	import { convertToMermaidERD } from '$lib/utils/mermaid-erd';

	let { data } = $props();

	let container: HTMLElement;
	let diagramInstance: HTMLElement;
	let mermaidSyntax = $derived(convertToMermaidERD(data.nodes, data.edges));

	onMount(async () => {
		mermaid.initialize({
			startOnLoad: false,
			theme: 'base',
			themeVariables: {
				primaryColor: '#3b82f6',
				primaryTextColor: '#fff',
				primaryBorderColor: '#2563eb',
				lineColor: '#94a3b8',
				secondaryColor: '#f8fafc',
				tertiaryColor: '#fff'
			},
			er: {
				useMaxWidth: true,
				layoutDirection: 'LR'
			}
		});

		if (diagramInstance && mermaidSyntax) {
			try {
				const { svg } = await mermaid.render('erd-diagram', mermaidSyntax);
				diagramInstance.innerHTML = svg;
			} catch (error) {
				console.error('Mermaid rendering failed:', error);
			}
		}
	});

	function goBack() {
		window.history.back();
	}
</script>

<div class="flex h-screen w-full flex-col bg-slate-50/50">
	<!-- Header: Ultra-Premium Glassmorphism -->
	<header
		class="z-10 flex items-center justify-between border-b border-white/40 bg-white/70 px-8 py-5 shadow-sm backdrop-blur-2xl"
	>
		<div class="flex items-center gap-8">
			<button
				onclick={goBack}
				class="group flex cursor-pointer items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-slate-500 transition-all hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 active:scale-95"
			>
				<span
					class="material-symbols-outlined text-xl transition-transform group-hover:-translate-x-1"
					>arrow_back</span
				>
				<span class="text-xs font-black tracking-widest uppercase">{appState.t.erDiagram.back}</span
				>
			</button>
			<div class="h-10 w-[1px] bg-slate-200/60"></div>
			<div>
				<h1 class="text-xl font-black tracking-tight text-slate-900">
					{appState.t.erDiagram.detailTitle}
				</h1>
				<p class="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
					{appState.t.erDiagram.detailSubtitle}
				</p>
			</div>
		</div>

		<div class="flex items-center gap-4">
			<div
				class="flex items-center gap-2.5 rounded-2xl border border-blue-100 bg-blue-50/50 px-5 py-2 text-[10px] font-black tracking-widest text-blue-600 shadow-sm shadow-blue-500/5 transition-all hover:bg-blue-50"
			>
				<span class="relative flex h-2 w-2">
					<span
						class="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75"
					></span>
					<span class="relative inline-flex h-2 w-2 rounded-full bg-blue-500"></span>
				</span>
				<span class="uppercase">{appState.t.erDiagram.synchronized}</span>
			</div>
		</div>
	</header>

	<!-- Main Content: Premium Diagram Canvas -->
	<main class="flex flex-1 items-start justify-center overflow-auto bg-slate-50/30 p-8 lg:p-12">
		<div
			bind:this={diagramInstance}
			class="relative flex min-h-[600px] w-full max-w-7xl items-center justify-center overflow-hidden rounded-[2.5rem] border border-white/60 bg-white/40 shadow-[0_32px_128px_-32px_rgba(0,0,0,0.08)] backdrop-blur-sm transition-all hover:shadow-[0_32px_128px_-32px_rgba(0,0,0,0.12)] sm:p-8 lg:p-16"
		>
			<!-- Loading State with Sophisticated Animation -->
			<div class="flex flex-col items-center gap-6 text-slate-400">
				<div class="relative flex h-16 w-16 items-center justify-center">
					<div
						class="absolute inset-0 animate-spin rounded-full border-t-2 border-b-2 border-l-2 border-transparent border-t-blue-500/40"
					></div>
					<div
						class="animate-spin-reverse absolute inset-2 rounded-full border-t-2 border-r-2 border-b-2 border-transparent border-t-blue-600"
					></div>
					<div
						class="flex h-8 w-8 items-center justify-center rounded-2xl bg-blue-50 text-blue-500 shadow-lg shadow-blue-500/10"
					>
						<span class="material-symbols-outlined text-xl">database</span>
					</div>
				</div>
				<div class="text-center">
					<h4 class="text-xs font-black tracking-widest text-slate-900 uppercase">
						{appState.t.erDiagram.loading}
					</h4>
					<p class="mt-1 text-[10px] font-medium text-slate-400">
						Parsing schema metadata and generating visual associations...
					</p>
				</div>
			</div>
		</div>
	</main>
</div>

<style>
	:global(.mermaid) {
		width: 100%;
		height: auto;
		filter: drop-shadow(0 10px 30px rgba(0, 0, 0, 0.05));
	}

	:global(.mermaid svg) {
		max-width: 100% !important;
		height: auto !important;
		border-radius: 1.5rem;
	}

	/* Elegant Reverse Spin for Loading State */
	@keyframes spin-reverse {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(-360deg);
		}
	}
	.animate-spin-reverse {
		animation: spin-reverse 1.5s linear infinite;
	}

	/* Custom scrollbar for premium feel */
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

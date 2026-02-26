<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import * as jointNamespace from '@joint/core';
	const joint = (jointNamespace as any).default || jointNamespace;
	const dia = joint.dia;
	const diaValue = dia;

	interface Props {
		graph: jointNamespace.dia.Graph;
		width?: number | string;
		height?: number | string;
		gridSize?: number;
		readonly?: boolean;
	}

	let { graph, width = '100%', height = 600, gridSize = 10, readonly = false }: Props = $props();

	let container: HTMLDivElement;
	let paper: jointNamespace.dia.Paper;

	onMount(() => {
		paper = new diaValue.Paper({
			el: container,
			model: graph,
			width: typeof width === 'string' ? container.clientWidth : width,
			height: typeof height === 'string' ? container.clientHeight : height,
			gridSize: gridSize,
			drawGrid: { name: 'dot', color: '#cbd5e1' },
			background: { color: '#f8fafc' },
			interactive: !readonly,
			defaultLink: new diaValue.Link({
				attrs: { '.connection': { stroke: '#cbd5e1', 'stroke-width': 2 } }
			}),
			cellViewNamespace: {} // Add namespace if needed for custom shapes
		});

		// Ensure paper fits container on resize if width is percentage
		const resizeObserver = new ResizeObserver(() => {
			if (typeof width === 'string') {
				paper.setDimensions(container.clientWidth, container.clientHeight || height);
			}
		});
		resizeObserver.observe(container);

		fitToView();

		return () => {
			resizeObserver.disconnect();
			paper.remove();
		};
	});

	// REACITIVITY: Update paper model when graph prop changes
	$effect(() => {
		if (paper && graph) {
			paper.model = graph;
			fitToView();
		}
	});

	export function fitToView() {
		if (paper && graph) {
			paper.scaleContentToFit({
				padding: 50,
				maxScale: 1,
				minScale: 0.2,
				useModelGeometry: true
			});
		}
	}

	export function zoomIn() {
		const scale = paper.scale().sx;
		paper.scale(scale + 0.1);
	}

	export function zoomOut() {
		const scale = paper.scale().sx;
		paper.scale(Math.max(0.1, scale - 0.1));
	}
</script>

<div class="group relative h-full w-full">
	<div
		bind:this={container}
		class="joint-paper-container h-full w-full overflow-hidden rounded-[2.5rem] border border-slate-200/50 shadow-inner"
	></div>

	<!-- Controls Overlay -->
	<div
		class="absolute right-6 bottom-6 flex flex-col gap-2 opacity-0 transition-opacity group-hover:opacity-100"
	>
		<button
			onclick={fitToView}
			class="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm hover:bg-slate-50"
			title="Fit to View"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="16"
				height="16"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				class="text-slate-600"
				><path d="M3 12a9 9 0 1 0 18 0 9 9 0 1 0-18 0" /><path d="m9 12 2 2 4-4" /></svg
			>
		</button>
		<div
			class="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
		>
			<button
				onclick={zoomIn}
				class="flex h-10 w-10 cursor-pointer items-center justify-center border-b border-slate-100 hover:bg-slate-50"
				title="Rotate Clockwise"
			>
				<span class="text-xl font-bold text-slate-400">+</span>
			</button>
			<button
				onclick={zoomOut}
				class="flex h-10 w-10 cursor-pointer items-center justify-center hover:bg-slate-50"
				title="Rotate Counter-clockwise"
			>
				<span class="text-xl font-bold text-slate-400">-</span>
			</button>
		</div>
	</div>
</div>

<style>
	.joint-paper-container {
		position: relative;
		background-color: #f8fafc;
	}

	:global(.joint-paper) {
		cursor: grab;
	}

	:global(.joint-paper:active) {
		cursor: grabbing;
	}
</style>

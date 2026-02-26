<script lang="ts">
	import { Handle, Position, type Node, type NodeProps } from '@xyflow/svelte';
	import { appState } from '$lib/state.svelte';

	interface Column {
		name: string;
		type: string;
		isPK?: boolean;
		isFK?: boolean;
	}

	interface ERNodeData {
		label: string;
		columns: Column[];
		[key: string]: unknown;
	}

	type ERNode = Node<ERNodeData, 'er'>;

	let { data, id }: NodeProps<ERNode> = $props();
</script>

<div
	class="min-w-[220px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl transition-all duration-300 hover:shadow-blue-500/10"
>
	<!-- Header -->
	<div class="border-b border-slate-100 bg-slate-50/80 px-4 py-2.5 backdrop-blur-sm">
		<div class="flex items-center justify-between">
			<span class="text-xs font-black tracking-widest text-slate-400 uppercase"
				>{appState.t.erDiagram.tableLabel}</span
			>
			<span class="h-1.5 w-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"
			></span>
		</div>
		<h3 class="mt-0.5 font-bold tracking-tight text-slate-800">{data.label}</h3>
	</div>

	<!-- Columns -->
	<div class="flex flex-col py-1">
		{#each data.columns as col}
			<div
				class="group relative flex items-center justify-between px-4 py-1.5 transition-colors hover:bg-slate-50/50"
			>
				<div class="flex items-center gap-2">
					{#if col.isPK}
						<span class="material-symbols-outlined text-[14px] text-amber-500">key</span>
					{:else if col.isFK}
						<span class="material-symbols-outlined text-[14px] text-blue-400">link</span>
					{:else}
						<div class="w-[14px]"></div>
					{/if}
					<span class="text-xs font-medium text-slate-700">{col.name}</span>
				</div>
				<span
					class="font-mono text-[10px] text-slate-400 opacity-60 transition-opacity group-hover:opacity-100"
				>
					{col.type.toLowerCase()}
				</span>

				<!-- Handles for relationships - can be positioned dynamically or fixed -->
				{#if col.isFK || col.isPK}
					<Handle
						type="source"
						position={Position.Right}
						id="{col.name}-source"
						class="!top-1/2 !-right-1.5 !h-2.5 !w-2.5 !border-2 !border-white !bg-blue-400 opacity-0 transition-opacity group-hover:opacity-100"
					/>
					<Handle
						type="target"
						position={Position.Left}
						id="{col.name}-target"
						class="!top-1/2 !-left-1.5 !h-2.5 !w-2.5 !border-2 !border-white !bg-blue-400 opacity-0 transition-opacity group-hover:opacity-100"
					/>
				{/if}
			</div>
		{/each}
	</div>

	<!-- Generic handles for general layout -->
	<Handle type="target" position={Position.Top} class="!opacity-0" />
	<Handle type="source" position={Position.Bottom} class="!opacity-0" />
</div>

<style>
	:global(.svelte-flow__handle) {
		transition: opacity 0.2s ease;
	}
</style>

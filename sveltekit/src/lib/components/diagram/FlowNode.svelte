<script lang="ts">
	import { Handle, Position, type Node, type NodeProps } from '@xyflow/svelte';

	interface FlowNodeData {
		label: string;
		icon?: string;
		variant?: 'blue' | 'amber' | 'purple' | 'emerald' | 'slate';
		label_top?: string;
		description?: string;
		[key: string]: unknown;
	}

	type FlowNode = Node<FlowNodeData, 'custom'>;

	let { data }: NodeProps<FlowNode> = $props();

	const variants = {
		blue: 'bg-blue-50/80 text-blue-600 border-blue-200/50',
		amber: 'bg-amber-50/80 text-amber-600 border-amber-200/50',
		purple: 'bg-purple-50/80 text-purple-600 border-purple-200/50',
		emerald: 'bg-emerald-50/80 text-emerald-600 border-emerald-200/50',
		slate: 'bg-slate-50/80 text-slate-600 border-slate-200/50'
	} as const;

	const variant = $derived(data.variant || 'slate');
	const styleClass = $derived(variants[variant]);
</script>

<div
	class="min-w-[180px] rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-300 {styleClass}"
>
	<Handle type="target" position={Position.Top} class="!bg-slate-300" />

	<div class="flex items-center gap-3">
		{#if data.icon}
			<div
				class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/80 shadow-sm"
			>
				<span class="material-symbols-outlined text-xl">{data.icon}</span>
			</div>
		{/if}
		<div>
			<p class="text-[9px] font-bold tracking-widest text-slate-400 uppercase">
				{data.label_top || 'Step'}
			</p>
			<h4 class="text-sm font-semibold tracking-tight text-slate-900">{data.label}</h4>
		</div>
	</div>

	{#if data.description}
		<p class="mt-2 text-[10px] leading-relaxed text-slate-500">
			{data.description}
		</p>
	{/if}

	<Handle type="source" position={Position.Bottom} class="!bg-slate-300" />
</div>

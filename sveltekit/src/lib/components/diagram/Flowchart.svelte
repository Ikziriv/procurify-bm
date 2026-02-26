<script lang="ts">
	import {
		SvelteFlow,
		Controls,
		Background,
		BackgroundVariant,
		type Node,
		type Edge,
		type NodeTypes
	} from '@xyflow/svelte';
	import '@xyflow/svelte/dist/style.css';
	import FlowNode from './FlowNode.svelte';

	interface Props {
		nodes: Node[];
		edges: Edge[];
	}

	let { nodes, edges }: Props = $props();

	const nodeTypes: NodeTypes = {
		custom: FlowNode
	};
</script>

<div
	class="h-[600px] w-full overflow-hidden rounded-[2.5rem] border border-slate-200/50 bg-slate-50/30 shadow-inner"
>
	<SvelteFlow {nodes} {edges} {nodeTypes} fitView colorMode="light">
		<Controls />
		<Background variant={BackgroundVariant.Dots} gap={20} size={1} />
	</SvelteFlow>
</div>

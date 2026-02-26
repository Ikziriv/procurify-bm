<script lang="ts">
	import Flowchart from '$lib/components/diagram/Flowchart.svelte';
	import type { Node, Edge } from '@xyflow/svelte';
	import { appState } from '$lib/state.svelte';

	// --- VENDOR FLOW ---
	const vendorNodes = $derived<Node[]>([
		{
			id: 'v1',
			type: 'custom',
			data: {
				label: appState.t.flowchart.nodes.publicDiscovery,
				icon: 'search',
				variant: 'blue',
				label_top: appState.t.flowchart.nodes.labelTop.entry,
				description: appState.t.flowchart.nodes.publicDiscoveryDesc
			},
			position: { x: 250, y: 0 }
		},
		{
			id: 'v2',
			type: 'custom',
			data: {
				label: appState.t.flowchart.nodes.register,
				icon: 'login',
				variant: 'slate',
				label_top: appState.t.flowchart.nodes.labelTop.auth,
				description: appState.t.flowchart.nodes.registerDesc
			},
			position: { x: 250, y: 150 }
		},
		{
			id: 'v3',
			type: 'custom',
			data: {
				label: appState.t.flowchart.nodes.completeProfile,
				icon: 'badge',
				variant: 'purple',
				label_top: appState.t.flowchart.nodes.labelTop.identity,
				description: appState.t.flowchart.nodes.completeProfileDesc
			},
			position: { x: 250, y: 300 }
		},
		{
			id: 'v4',
			type: 'custom',
			data: {
				label: appState.t.flowchart.nodes.submitProposal,
				icon: 'upload_file',
				variant: 'amber',
				label_top: appState.t.flowchart.nodes.labelTop.action,
				description: appState.t.flowchart.nodes.submitProposalDesc
			},
			position: { x: 250, y: 450 }
		},
		{
			id: 'v5',
			type: 'custom',
			data: {
				label: appState.t.flowchart.nodes.notification,
				icon: 'notifications',
				variant: 'emerald',
				label_top: appState.t.flowchart.nodes.labelTop.feedback,
				description: appState.t.flowchart.nodes.notificationDesc
			},
			position: { x: 250, y: 600 }
		}
	]);

	const vendorEdges: Edge[] = [
		{ id: 'ev1-2', source: 'v1', target: 'v2', animated: true },
		{ id: 'ev2-3', source: 'v2', target: 'v3' },
		{ id: 'ev3-4', source: 'v3', target: 'v4' },
		{ id: 'ev4-5', source: 'v4', target: 'v5', animated: true }
	];

	// --- ADMIN PROCUREMENT FLOW ---
	const adminProcNodes = $derived<Node[]>([
		{
			id: 'ap1',
			type: 'custom',
			data: {
				label: appState.t.flowchart.nodes.storeProc,
				icon: 'inventory',
				variant: 'blue',
				label_top: appState.t.flowchart.nodes.labelTop.initiate,
				description: appState.t.flowchart.nodes.storeProcDesc
			},
			position: { x: 250, y: 0 }
		},
		{
			id: 'ap2',
			type: 'custom',
			data: {
				label: appState.t.flowchart.nodes.monitorSubs,
				icon: 'visibility',
				variant: 'purple',
				label_top: appState.t.flowchart.nodes.labelTop.discovery,
				description: appState.t.flowchart.nodes.monitorSubsDesc
			},
			position: { x: 250, y: 150 }
		},
		{
			id: 'ap3',
			type: 'custom',
			data: {
				label: appState.t.flowchart.nodes.approveSub,
				icon: 'check_circle',
				variant: 'emerald',
				label_top: appState.t.flowchart.nodes.labelTop.action,
				description: appState.t.flowchart.nodes.approveSubDesc
			},
			position: { x: 250, y: 300 }
		},
		{
			id: 'ap4',
			type: 'custom',
			data: {
				label: appState.t.flowchart.nodes.closeProc,
				icon: 'lock',
				variant: 'slate',
				label_top: appState.t.flowchart.nodes.labelTop.finalize,
				description: appState.t.flowchart.nodes.closeProcDesc
			},
			position: { x: 250, y: 450 }
		}
	]);

	const adminProcEdges: Edge[] = [
		{ id: 'eap1-2', source: 'ap1', target: 'ap2', animated: true },
		{ id: 'eap2-3', source: 'ap2', target: 'ap3' },
		{ id: 'eap3-4', source: 'ap3', target: 'ap4' }
	];

	// --- ADMIN TBP FLOW ---
	const adminTbpNodes = $derived<Node[]>([
		{
			id: 'at2',
			type: 'custom',
			data: {
				label: appState.t.flowchart.nodes.sysConfig,
				icon: 'settings',
				variant: 'slate',
				label_top: appState.t.flowchart.nodes.labelTop.governance,
				description: appState.t.flowchart.nodes.sysConfigDesc
			},
			position: { x: 250, y: 0 }
		},
		{
			id: 'at3',
			type: 'custom',
			data: {
				label: appState.t.flowchart.nodes.userRestrictions,
				icon: 'person_off',
				variant: 'amber',
				label_top: appState.t.flowchart.nodes.labelTop.control,
				description: appState.t.flowchart.nodes.userRestrictionsDesc
			},
			position: { x: 250, y: 150 }
		}
	]);

	const adminTbpEdges: Edge[] = [{ id: 'eat2-3', source: 'at2', target: 'at3' }];

	let activeTab = $state('vendor');
</script>

<svelte:head>
	<title>{appState.t.flowchart.title} | Flowcharts</title>
</svelte:head>

<div class="min-h-screen bg-[#fafbfc] p-8 md:p-12 lg:p-16">
	<div class="mx-auto max-w-7xl">
		<!-- Header Section -->
		<div class="mb-12">
			<div class="flex items-end justify-between gap-8">
				<div>
					<h1 class="text-5xl font-bold tracking-tight text-slate-900 lg:text-6xl">
						{appState.t.flowchart.title.split(' ')[0]}
						<span class="text-slate-400">
							{appState.t.flowchart.title.split(' ').slice(1).join(' ')}
						</span>
					</h1>
					<p class="mt-4 max-w-2xl text-lg leading-relaxed text-slate-500">
						{appState.t.flowchart.subtitle}
					</p>
				</div>
			</div>
		</div>

		<!-- Navigation Tabs -->
		<div class="mb-10 flex flex-wrap gap-2">
			<button
				onclick={() => (activeTab = 'vendor')}
				class="flex items-center gap-3 rounded-xl px-6 py-3 transition-all duration-300 {activeTab ===
				'vendor'
					? 'bg-slate-900 text-white shadow-lg shadow-slate-900/10'
					: 'text-slate-500 hover:bg-slate-100'}"
			>
				<span class="material-symbols-outlined text-xl {activeTab === 'vendor' ? 'text-white' : ''}"
					>storefront</span
				>
				<span class="text-[11px] font-bold tracking-widest uppercase"
					>{appState.t.flowchart.tabs.vendor}</span
				>
			</button>
			<button
				onclick={() => (activeTab = 'admin-proc')}
				class="flex items-center gap-3 rounded-xl px-6 py-3 transition-all duration-300 {activeTab ===
				'admin-proc'
					? 'bg-slate-900 text-white shadow-lg shadow-slate-900/10'
					: 'text-slate-500 hover:bg-slate-100'}"
			>
				<span
					class="material-symbols-outlined text-xl {activeTab === 'admin-proc' ? 'text-white' : ''}"
					>admin_panel_settings</span
				>
				<span class="text-[11px] font-bold tracking-widest uppercase"
					>{appState.t.flowchart.tabs.adminProc}</span
				>
			</button>
			<button
				onclick={() => (activeTab = 'admin-tbp')}
				class="flex items-center gap-3 rounded-xl px-6 py-3 transition-all duration-300 {activeTab ===
				'admin-tbp'
					? 'bg-slate-900 text-white shadow-lg shadow-slate-900/10'
					: 'text-slate-500 hover:bg-slate-100'}"
			>
				<span
					class="material-symbols-outlined text-xl {activeTab === 'admin-tbp' ? 'text-white' : ''}"
					>shield_person</span
				>
				<span class="text-[11px] font-bold tracking-widest uppercase"
					>{appState.t.flowchart.tabs.adminTbp}</span
				>
			</button>
		</div>

		<!-- Diagram Content -->
		<div class="relative">
			{#key activeTab}
				{#if activeTab === 'vendor'}
					<Flowchart nodes={vendorNodes} edges={vendorEdges} />
				{:else if activeTab === 'admin-proc'}
					<Flowchart nodes={adminProcNodes} edges={adminProcEdges} />
				{:else}
					<Flowchart nodes={adminTbpNodes} edges={adminTbpEdges} />
				{/if}
			{/key}
		</div>

		<!-- Details Section -->
		<div class="mt-12 grid gap-8 lg:grid-cols-3">
			<div
				class="rounded-3xl border border-slate-200/60 bg-white p-8 shadow-sm transition-all hover:shadow-md"
			>
				<div
					class="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 text-slate-600"
				>
					<span class="material-symbols-outlined text-xl">interactive_space</span>
				</div>
				<h3 class="mb-3 text-lg font-bold text-slate-900">
					{appState.t.flowchart.sections.interactive.title}
				</h3>
				<p class="text-[13px] leading-relaxed text-slate-500">
					{appState.t.flowchart.sections.interactive.desc}
				</p>
			</div>
			<div
				class="rounded-3xl border border-slate-200/60 bg-white p-8 shadow-sm transition-all hover:shadow-md"
			>
				<div
					class="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 text-slate-600"
				>
					<span class="material-symbols-outlined text-xl">rule</span>
				</div>
				<h3 class="mb-3 text-lg font-bold text-slate-900">
					{appState.t.flowchart.sections.logic.title}
				</h3>
				<p class="text-[13px] leading-relaxed text-slate-500">
					{appState.t.flowchart.sections.logic.desc}
				</p>
			</div>
			<div
				class="rounded-3xl border border-slate-200/60 bg-white p-8 shadow-sm transition-all hover:shadow-md"
			>
				<div
					class="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 text-slate-600"
				>
					<span class="material-symbols-outlined text-xl">security</span>
				</div>
				<h3 class="mb-3 text-lg font-bold text-slate-900">
					{appState.t.flowchart.sections.security.title}
				</h3>
				<p class="text-[13px] leading-relaxed text-slate-500">
					{appState.t.flowchart.sections.security.desc}
				</p>
			</div>
		</div>
	</div>
</div>

<style>
	:global(.svelte-flow__handle) {
		width: 8px !important;
		height: 8px !important;
		border: 2px solid white !important;
	}
	:global(.svelte-flow__edge-path) {
		stroke: #cbd5e1 !important;
		stroke-width: 2 !important;
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

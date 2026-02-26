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
		<div class="mb-16">
			<div class="flex items-end justify-between gap-8">
				<div>
					<h1 class="text-5xl font-black tracking-tighter text-slate-900 lg:text-7xl">
						{appState.t.flowchart.title.split(' ')[0]}
						<span class="bg-gradient-to-r from-zinc-600 to-blue-600 bg-clip-text text-transparent">
							{appState.t.flowchart.title.split(' ').slice(1).join(' ')}
						</span>
					</h1>
					<p class="mt-6 max-w-2xl text-lg leading-relaxed font-medium text-slate-500">
						{appState.t.flowchart.subtitle}
					</p>
				</div>
			</div>
		</div>

		<!-- Navigation Tabs -->
		<div class="mb-12 flex flex-wrap gap-4">
			<button
				onclick={() => (activeTab = 'vendor')}
				class="flex items-center gap-3 rounded-2xl px-6 py-4 transition-all duration-500 {activeTab ===
				'vendor'
					? 'scale-105 bg-white text-blue-600 shadow-xl ring-1 ring-slate-100'
					: 'text-slate-400 hover:text-slate-600'}"
			>
				<span class="material-symbols-outlined {activeTab === 'vendor' ? 'text-blue-500' : ''}"
					>storefront</span
				>
				<span class="text-sm font-black tracking-widest uppercase"
					>{appState.t.flowchart.tabs.vendor}</span
				>
			</button>
			<button
				onclick={() => (activeTab = 'admin-proc')}
				class="flex items-center gap-3 rounded-2xl px-6 py-4 transition-all duration-500 {activeTab ===
				'admin-proc'
					? 'scale-105 bg-white text-emerald-600 shadow-xl ring-1 ring-slate-100'
					: 'text-slate-400 hover:text-slate-600'}"
			>
				<span
					class="material-symbols-outlined {activeTab === 'admin-proc' ? 'text-emerald-500' : ''}"
					>admin_panel_settings</span
				>
				<span class="text-sm font-black tracking-widest uppercase"
					>{appState.t.flowchart.tabs.adminProc}</span
				>
			</button>
			<button
				onclick={() => (activeTab = 'admin-tbp')}
				class="flex items-center gap-3 rounded-2xl px-6 py-4 transition-all duration-500 {activeTab ===
				'admin-tbp'
					? 'scale-105 bg-white text-purple-600 shadow-xl ring-1 ring-slate-100'
					: 'text-slate-400 hover:text-slate-600'}"
			>
				<span class="material-symbols-outlined {activeTab === 'admin-tbp' ? 'text-purple-500' : ''}"
					>shield_person</span
				>
				<span class="text-sm font-black tracking-widest uppercase"
					>{appState.t.flowchart.tabs.adminTbp}</span
				>
			</button>
		</div>

		<!-- Diagram Content -->
		<div class="group relative">
			<div
				class="absolute -inset-1 rounded-[3rem] bg-gradient-to-r from-blue-500 to-purple-600 opacity-10 blur transition duration-1000 group-hover:opacity-20"
			></div>
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
		</div>

		<!-- Details Section -->
		<div class="mt-16 grid gap-12 lg:grid-cols-3">
			<div
				class="rounded-[2rem] border border-slate-200/50 bg-white p-8 shadow-sm transition-all hover:shadow-xl"
			>
				<div
					class="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600"
				>
					<span class="material-symbols-outlined text-2xl">interactive_space</span>
				</div>
				<h3 class="mb-4 text-xl font-bold text-slate-900">
					{appState.t.flowchart.sections.interactive.title}
				</h3>
				<p class="text-sm leading-relaxed text-slate-500">
					{appState.t.flowchart.sections.interactive.desc}
				</p>
			</div>
			<div
				class="rounded-[2rem] border border-slate-200/50 bg-white p-8 shadow-sm transition-all hover:shadow-xl"
			>
				<div
					class="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600"
				>
					<span class="material-symbols-outlined text-2xl">rule</span>
				</div>
				<h3 class="mb-4 text-xl font-bold text-slate-900">
					{appState.t.flowchart.sections.logic.title}
				</h3>
				<p class="text-sm leading-relaxed text-slate-500">
					{appState.t.flowchart.sections.logic.desc}
				</p>
			</div>
			<div
				class="rounded-[2rem] border border-slate-200/50 bg-white p-8 shadow-sm transition-all hover:shadow-xl"
			>
				<div
					class="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-50 text-purple-600"
				>
					<span class="material-symbols-outlined text-2xl">security</span>
				</div>
				<h3 class="mb-4 text-xl font-bold text-slate-900">
					{appState.t.flowchart.sections.security.title}
				</h3>
				<p class="text-sm leading-relaxed text-slate-500">
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

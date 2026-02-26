<script lang="ts">
	import JointFlow from '$lib/components/diagram/JointFlow.svelte';
	import * as jointNamespace from '@joint/core';
	import { appState } from '$lib/state.svelte';
	import {
		UseCaseActor,
		UseCaseNode,
		UseCaseLink,
		UseCaseBoundary
	} from '$lib/components/diagram/shapes';
	import { onMount } from 'svelte';

	const joint = (jointNamespace as any).default || jointNamespace;
	const dia = joint.dia;

	let activeTab = $state('vendor');

	// Create graphs
	const vendorGraph = new dia.Graph();
	const adminProcGraph = new dia.Graph();
	const adminTbpGraph = new dia.Graph();

	function createUseCaseDiagrams() {
		// --- VENDOR USE CASES ---
		const vendorBoundary = new UseCaseBoundary({
			position: { x: 200, y: 50 },
			size: { width: 400, height: 500 },
			attrs: { label: { text: 'Procureify-BM System' } }
		});

		const vendorActor = new UseCaseActor({
			position: { x: 50, y: 250 },
			size: { width: 20, height: 40 },
			attrs: { label: { text: appState.t.auth.roles.USER_PROCUREMENT } }
		});

		const ucDiscovery = new UseCaseNode({
			position: { x: 300, y: 100 },
			size: { width: 180, height: 60 },
			attrs: { label: { text: appState.t.flowchart.nodes.publicDiscovery } }
		});

		const ucRegister = new UseCaseNode({
			position: { x: 300, y: 200 },
			size: { width: 180, height: 60 },
			attrs: { label: { text: appState.t.flowchart.nodes.register } }
		});

		const ucProfile = new UseCaseNode({
			position: { x: 300, y: 300 },
			size: { width: 180, height: 60 },
			attrs: { label: { text: appState.t.flowchart.nodes.completeProfile } }
		});

		const ucProposal = new UseCaseNode({
			position: { x: 300, y: 400 },
			size: { width: 180, height: 60 },
			attrs: { label: { text: appState.t.flowchart.nodes.submitProposal } }
		});

		vendorGraph.addCells([
			vendorBoundary,
			vendorActor,
			ucDiscovery,
			ucRegister,
			ucProfile,
			ucProposal
		]);

		[ucDiscovery, ucRegister, ucProfile, ucProposal].forEach((uc) => {
			const link = new UseCaseLink({
				source: { id: vendorActor.id },
				target: { id: uc.id }
			});
			vendorGraph.addCell(link);
		});

		// --- ADMIN PROCUREMENT USE CASES ---
		const adminProcBoundary = new UseCaseBoundary({
			position: { x: 200, y: 50 },
			size: { width: 400, height: 500 },
			attrs: { label: { text: 'Governance Module' } }
		});

		const adminProcActor = new UseCaseActor({
			position: { x: 50, y: 250 },
			size: { width: 20, height: 40 },
			attrs: { label: { text: appState.t.auth.roles.ADMIN_PROCUREMENT } }
		});

		const ucCreate = new UseCaseNode({
			position: { x: 300, y: 100 },
			size: { width: 180, height: 60 },
			attrs: { label: { text: appState.t.flowchart.nodes.storeProc } }
		});

		const ucMonitor = new UseCaseNode({
			position: { x: 300, y: 200 },
			size: { width: 180, height: 60 },
			attrs: { label: { text: appState.t.flowchart.nodes.monitorSubs } }
		});

		const ucApprove = new UseCaseNode({
			position: { x: 300, y: 300 },
			size: { width: 180, height: 60 },
			attrs: { label: { text: appState.t.flowchart.nodes.approveSub } }
		});

		const ucClose = new UseCaseNode({
			position: { x: 300, y: 400 },
			size: { width: 180, height: 60 },
			attrs: { label: { text: appState.t.flowchart.nodes.closeProc } }
		});

		adminProcGraph.addCells([
			adminProcBoundary,
			adminProcActor,
			ucCreate,
			ucMonitor,
			ucApprove,
			ucClose
		]);

		[ucCreate, ucMonitor, ucApprove, ucClose].forEach((uc) => {
			adminProcGraph.addCell(
				new UseCaseLink({
					source: { id: adminProcActor.id },
					target: { id: uc.id }
				})
			);
		});

		// --- ADMIN TBP USE CASES ---
		const adminTbpBoundary = new UseCaseBoundary({
			position: { x: 200, y: 50 },
			size: { width: 400, height: 500 },
			attrs: { label: { text: 'Administration Module' } }
		});

		const adminTbpActor = new UseCaseActor({
			position: { x: 50, y: 250 },
			size: { width: 20, height: 40 },
			attrs: { label: { text: appState.t.flowchart.tabs.adminTbp } }
		});

		const ucOversight = new UseCaseNode({
			position: { x: 300, y: 100 },
			size: { width: 180, height: 60 },
			attrs: { label: { text: appState.t.flowchart.nodes.oversight } }
		});

		const ucSysConfig = new UseCaseNode({
			position: { x: 300, y: 200 },
			size: { width: 180, height: 60 },
			attrs: { label: { text: appState.t.flowchart.nodes.sysConfig } }
		});

		const ucRestrictions = new UseCaseNode({
			position: { x: 300, y: 300 },
			size: { width: 180, height: 60 },
			attrs: { label: { text: appState.t.flowchart.nodes.userRestrictions } }
		});

		const ucAuditing = new UseCaseNode({
			position: { x: 300, y: 400 },
			size: { width: 180, height: 60 },
			attrs: { label: { text: appState.t.flowchart.nodes.auditing } }
		});

		adminTbpGraph.addCells([
			adminTbpBoundary,
			adminTbpActor,
			ucOversight,
			ucSysConfig,
			ucRestrictions,
			ucAuditing
		]);

		[ucOversight, ucSysConfig, ucRestrictions, ucAuditing].forEach((uc) => {
			adminTbpGraph.addCell(
				new UseCaseLink({
					source: { id: adminTbpActor.id },
					target: { id: uc.id }
				})
			);
		});
	}

	onMount(() => {
		createUseCaseDiagrams();
	});
</script>

<svelte:head>
	<title>Use Case Diagrams | Procurify-BM</title>
</svelte:head>

<div class="min-h-screen bg-[#fafbfc] p-8 md:p-12 lg:p-16">
	<div class="mx-auto max-w-7xl">
		<!-- Header Section -->
		<div class="mb-16">
			<div class="flex items-end justify-between gap-8">
				<div>
					<h1 class="text-5xl font-black tracking-tighter text-slate-900 lg:text-7xl">
						Use Case
						<span
							class="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
						>
							Diagrams
						</span>
					</h1>
					<p class="mt-6 max-w-2xl text-lg leading-relaxed font-medium text-slate-500">
						Formal UML identification of system actors and their permitted actions within the
						procurement ecosystem, ensuring standardized role-based access control.
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
					? 'scale-105 bg-white text-indigo-600 shadow-xl ring-1 ring-slate-100'
					: 'text-slate-400 hover:text-slate-600'}"
			>
				<span class="material-symbols-outlined {activeTab === 'vendor' ? 'text-indigo-500' : ''}"
					>person</span
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
				class="absolute -inset-1 rounded-[3rem] bg-gradient-to-r from-indigo-500 to-purple-600 opacity-10 blur transition duration-1000 group-hover:opacity-20"
			></div>
			<div class="relative">
				{#key activeTab}
					{#if activeTab === 'vendor'}
						<JointFlow graph={vendorGraph} height={600} />
					{:else if activeTab === 'admin-proc'}
						<JointFlow graph={adminProcGraph} height={600} />
					{:else}
						<JointFlow graph={adminTbpGraph} height={600} />
					{/if}
				{/key}
			</div>
		</div>

		<!-- Technical Details Section -->
		<div class="mt-16 grid gap-12 lg:grid-cols-3">
			<div
				class="rounded-[2rem] border border-slate-200/50 bg-white p-8 shadow-sm transition-all hover:shadow-xl"
			>
				<div
					class="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600"
				>
					<span class="material-symbols-outlined text-2xl">account_tree</span>
				</div>
				<h3 class="mb-4 text-xl font-bold text-slate-900">UML Standardization</h3>
				<p class="text-sm leading-relaxed text-slate-500">
					All diagrams follow official UML 2.5 standards for use case modeling, providing a clear
					separation between system boundaries and external actors.
				</p>
			</div>
			<div
				class="rounded-[2rem] border border-slate-200/50 bg-white p-8 shadow-sm transition-all hover:shadow-xl"
			>
				<div
					class="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600"
				>
					<span class="material-symbols-outlined text-2xl">security</span>
				</div>
				<h3 class="mb-4 text-xl font-bold text-slate-900">RBAC Enforcement</h3>
				<p class="text-sm leading-relaxed text-slate-500">
					Each use case represents a permission set defined in our backend auth middleware, ensuring
					users can only execute actions mapped to their assigned roles.
				</p>
			</div>
			<div
				class="rounded-[2rem] border border-slate-200/50 bg-white p-8 shadow-sm transition-all hover:shadow-xl"
			>
				<div
					class="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-50 text-purple-600"
				>
					<span class="material-symbols-outlined text-2xl">data_object</span>
				</div>
				<h3 class="mb-4 text-xl font-bold text-slate-900">Live Data Mapping</h3>
				<p class="text-sm leading-relaxed text-slate-500">
					Diagram nodes are dynamically labeled using identical translation keys as the application
					UI, maintaining consistency across documentation and implementation.
				</p>
			</div>
		</div>
	</div>
</div>

<style>
	:global(.joint-paper) {
		background-color: transparent !important;
	}
</style>

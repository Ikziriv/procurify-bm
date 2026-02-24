<script lang="ts">
	import { appState } from '$lib/state.svelte';
	import { fly } from 'svelte/transition';
	import HeroDashboard from '$lib/components/HeroDashboard.svelte';
	import ProcurementCard from '$lib/components/ProcurementCard.svelte';
	import type { PageData } from './$types';

	let { data } = $props<{ data: PageData }>();
	const t = $derived(appState.t.landing);

	// Format currency helper
	const formatIDR = (val: number) => {
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			maximumFractionDigits: 0
		}).format(val);
	};
</script>

<div class="relative min-h-screen overflow-hidden bg-slate-50/50">
	<!-- Background Decorative Elements -->
	<div
		class="pointer-events-none absolute top-0 left-1/2 h-[800px] w-full -translate-x-1/2 overflow-hidden"
	>
		<div
			class="absolute -top-[10%] left-[10%] h-[500px] w-[500px] rounded-full bg-blue-500/10 blur-[120px]"
		></div>
		<div
			class="absolute top-[20%] right-[10%] h-[400px] w-[400px] rounded-full bg-violet-500/10 blur-[120px]"
		></div>
	</div>

	<main class="relative container mx-auto max-w-5xl px-6 pt-12 pb-24">
		<!-- Minimalist Header -->
		<div class="mb-12 flex items-end justify-between" in:fly={{ y: -20, duration: 800 }}>
			<div>
				<h1 class="text-4xl font-black tracking-tight text-slate-900 lg:text-5xl">Dashboard</h1>
				<p class="mt-2 text-sm font-bold tracking-widest text-slate-400 uppercase">
					Tracking {data.procurements.length} Active System Tenders
				</p>
			</div>
			<div class="hidden lg:block">
				<a
					href="/explore"
					class="flex items-center gap-2 rounded-2xl bg-white px-6 py-3 text-[10px] font-black tracking-widest text-slate-900 uppercase shadow-sm transition-all hover:bg-slate-50"
				>
					Explore All <span class="material-symbols-outlined text-sm">arrow_forward</span>
				</a>
			</div>
		</div>

		<!-- Hero Metrics -->
		<HeroDashboard procurements={data.procurements} />

		<!-- Recent Activity / Tracking List -->
		<div class="mt-16 space-y-6" in:fly={{ y: 30, duration: 800, delay: 400 }}>
			<div class="flex items-center justify-between">
				<h3 class="text-[10px] font-black tracking-[0.4em] text-slate-400 uppercase">
					Recent Procurement Activity
				</h3>
			</div>

			<div class="grid gap-4">
				{#each data.procurements as p}
					<ProcurementCard
						id={p.id}
						title={p.title}
						type={p.type?.name || 'Reguler'}
						amount={formatIDR(Number(p.budget))}
						deadline={new Date(p.deadline).toLocaleDateString('id-ID', {
							day: 'numeric',
							month: 'short',
							year: 'numeric'
						})}
						deadlineLabel="Awarding Date"
					/>
				{:else}
					<div
						class="flex h-48 flex-col items-center justify-center rounded-[2.5rem] border border-dashed border-slate-200 bg-white/40 backdrop-blur-sm"
					>
						<span class="material-symbols-outlined mb-4 text-4xl text-slate-300">inventory_2</span>
						<p class="text-sm font-bold text-slate-400">No active procurements found</p>
					</div>
				{/each}
			</div>

			{#if data.procurements.length > 0}
				<div class="flex justify-center pt-8">
					<a
						href="/explore"
						class="text-[10px] font-black tracking-[0.2em] text-blue-600 uppercase hover:underline"
					>
						View full procurement pipeline
					</a>
				</div>
			{/if}
		</div>
	</main>
</div>

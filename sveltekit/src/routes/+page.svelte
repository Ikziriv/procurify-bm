<script lang="ts">
	import { appState } from '$lib/state.svelte';
	import { fly } from 'svelte/transition';
	import HeroDashboard from '$lib/components/HeroDashboard.svelte';
	import ProcurementCard from '$lib/components/ProcurementCard.svelte';
	import { formatIDR, formatDate } from '$lib/utils/format';
	import type { PageData } from './$types';

	let { data } = $props<{ data: PageData }>();
</script>

<div class="relative min-h-screen overflow-hidden bg-white">
	<!-- Subtle Background Texture -->
	<div
		class="pointer-events-none absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_0%,#000_70%,transparent_100%)] [background-size:32px_32px] opacity-20"
	></div>

	<main class="relative container mx-auto max-w-6xl px-6 pt-10 pb-24 lg:px-10">
		<!-- Minimalist Header -->
		<div
			class="mb-10 flex items-end justify-between border-b border-slate-100 pb-8"
			in:fly={{ y: -10, duration: 600 }}
		>
			<div>
				<h1 class="text-3xl font-bold tracking-tight text-slate-900 uppercase lg:text-4xl">
					Dashboard
				</h1>
				<p class="mt-2 text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase">
					Tracking {data.procurements.length} Active System Tenders
				</p>
			</div>
			<div class="hidden lg:block">
				<a
					href="/explore"
					class="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-[10px] font-bold tracking-widest text-slate-700 uppercase shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50"
				>
					Explore All <span class="material-symbols-outlined text-sm">arrow_forward</span>
				</a>
			</div>
		</div>

		<!-- Hero Metrics - Only for registered users -->
		{#if appState.currentUser}
			<HeroDashboard procurements={data.procurements} />
		{/if}

		<!-- Recent Activity / Tracking List -->
		<div class="mt-12 space-y-6" in:fly={{ y: 20, duration: 600, delay: 300 }}>
			<div class="flex items-center justify-between px-2">
				<h3 class="text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase">
					Recent Procurement Activity
				</h3>
			</div>

			<div class="grid gap-3" data-testid="procurement-list">
				{#each data.procurements as p}
					<ProcurementCard
						id={p.id}
						title={p.title}
						type={p.type?.name || 'Reguler'}
						amount={formatIDR(Number(p.budget))}
						deadline={formatDate(p.deadline)}
						deadlineLabel="Awarding Date"
					/>
				{:else}
					<div
						class="flex h-40 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50"
					>
						<span class="material-symbols-outlined mb-3 text-3xl text-slate-300">inventory_2</span>
						<p class="text-xs font-semibold text-slate-400">No active procurements found</p>
					</div>
				{/each}
			</div>

			{#if data.procurements.length > 0}
				<div class="flex justify-center pt-6">
					<a
						href="/explore"
						class="text-[10px] font-bold tracking-widest text-blue-600 uppercase hover:text-blue-700 hover:underline"
					>
						View full procurement pipeline
					</a>
				</div>
			{/if}
		</div>
	</main>
</div>

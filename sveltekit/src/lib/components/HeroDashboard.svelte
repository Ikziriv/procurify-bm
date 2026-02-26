<script lang="ts">
	import { appState } from '$lib/state.svelte';
	import type { Procurement } from '$lib/server/db/schema';
	import { fly } from 'svelte/transition';
	import { formatIDR } from '$lib/utils/format';

	let { procurements = [] } = $props<{ procurements: Procurement[] }>();

	const t = $derived(appState.t.heroDashboard);

	// Derived metrics for the dashboard
	const activeCount = $derived(procurements.length);
	const totalBudget = $derived(
		procurements.reduce((acc: number, curr: Procurement) => acc + (Number(curr.budget) || 0), 0)
	);
	const avgBudget = $derived(activeCount > 0 ? totalBudget / activeCount : 0);

	// Latest activities
	const latestActivities = $derived(procurements.slice(0, 3));
</script>

<div class="relative h-auto w-full" in:fly={{ x: 30, duration: 800, delay: 200 }}>
	<!-- Subtle Background Glow -->
	<div class="absolute -top-6 -right-6 h-48 w-48 rounded-full bg-blue-500/5 blur-[60px]"></div>

	<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
		<!-- Main Stat: Total Volume -->
		<div
			class="group relative col-span-full overflow-hidden rounded-3xl border border-slate-200/60 bg-white/50 p-8 transition-all hover:bg-white/80 hover:shadow-xl hover:shadow-blue-500/5"
			data-testid="hero-stat-total"
		>
			<div class="relative z-10">
				<div class="mb-4 flex items-center gap-2">
					<div
						class="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-md shadow-blue-200"
					>
						<span class="material-symbols-outlined text-lg">payments</span>
					</div>
					<span class="text-[10px] font-bold tracking-widest text-blue-600 uppercase"
						>{t.liveValueManaged}</span
					>
				</div>
				<h3 class="text-4xl font-bold tracking-tight text-slate-900 lg:text-5xl">
					{formatIDR(totalBudget)}
				</h3>
				<p class="mt-2 text-xs font-semibold text-slate-400">
					{t.realTimeAggregation.replace('{count}', activeCount.toString())}
				</p>
			</div>

			<!-- Refined Sparkline Decoration -->
			<div
				class="absolute right-0 bottom-0 left-0 h-16 opacity-5 transition-opacity group-hover:opacity-10"
			>
				<svg viewBox="0 0 400 100" class="h-full w-full" preserveAspectRatio="none">
					<path
						d="M0,80 L40,75 L80,85 L120,60 L160,70 L200,40 L240,55 L280,30 L320,45 L360,20 L400,35 V100 H0 Z"
						fill="currentColor"
						class="text-blue-600"
					/>
				</svg>
			</div>
		</div>

		<!-- Secondary Stat: Active Count -->
		<div
			class="rounded-3xl border border-slate-200/60 bg-white/50 p-6 transition-all hover:bg-white/80"
			data-testid="hero-stat-count"
		>
			<div class="mb-4 flex items-center justify-between">
				<span class="text-[10px] font-bold tracking-widest text-slate-400 uppercase"
					>{t.activeProcurements}</span
				>
				<div class="flex h-2 w-2 items-center justify-center">
					<div class="absolute h-2 w-2 animate-ping rounded-full bg-emerald-500/20"></div>
					<div class="h-2 w-2 rounded-full bg-emerald-500"></div>
				</div>
			</div>
			<div class="flex items-baseline gap-2">
				<span class="text-3xl font-bold tracking-tight text-slate-900">{activeCount}</span>
				<span class="rounded-md bg-emerald-50 px-1.5 py-0.5 text-xs font-bold text-emerald-500"
					>+12.5%</span
				>
			</div>
		</div>

		<!-- Secondary Stat: Avg Budget -->
		<div
			class="rounded-3xl border border-slate-200/60 bg-white/50 p-6 transition-all hover:bg-white/80"
			data-testid="hero-stat-avg"
		>
			<span class="mb-4 block text-[10px] font-bold tracking-widest text-slate-400 uppercase"
				>{t.avgOpportunity}</span
			>
			<div class="flex items-baseline gap-2">
				<span class="text-2xl font-bold tracking-tight text-slate-900"
					>{activeCount > 0 ? formatIDR(avgBudget).split(',')[0] : 'Rp 0'}</span
				>
			</div>
		</div>

		<!-- Live Activity Ticker -->
		<div
			class="col-span-full overflow-hidden rounded-3xl border border-slate-200/60 bg-slate-50/50 p-6"
		>
			<div class="mb-5 flex items-center justify-between">
				<h4 class="text-[10px] font-bold tracking-widest text-slate-500 uppercase">
					{t.procurementActivity}
				</h4>
				<span
					class="flex h-5 items-center rounded-md bg-blue-50 px-2 text-[8px] font-bold tracking-tighter text-blue-600 uppercase"
				>
					{t.liveUpdates}
				</span>
			</div>

			<div class="space-y-3">
				{#each latestActivities as activity, i}
					<div
						class="flex items-center gap-4 border-b border-slate-100 pb-3 last:border-0 last:pb-0"
					>
						<div class="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded bg-blue-50">
							<span class="material-symbols-outlined text-xs text-blue-400">history</span>
						</div>
						<div class="min-w-0 flex-1">
							<p class="truncate text-xs font-semibold text-slate-800">{activity.title}</p>
							<p class="text-[10px] font-medium text-slate-400">
								{t.justPublished} • {formatIDR(Number(activity.budget))}
							</p>
						</div>
					</div>
				{:else}
					<p class="py-4 text-center text-xs font-medium text-slate-400">{t.noRecentActivity}</p>
				{/each}
			</div>
		</div>
	</div>
</div>

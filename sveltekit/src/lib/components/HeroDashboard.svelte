<script lang="ts">
	import { appState } from '$lib/state.svelte';
	import type { Procurement } from '$lib/server/db/schema';
	import { fly } from 'svelte/transition';

	let { procurements = [] } = $props<{ procurements: Procurement[] }>();

	const t = $derived(appState.t.landing);

	// Derived metrics for the dashboard
	const activeCount = $derived(procurements.length);
	const totalBudget = $derived(
		procurements.reduce((acc: number, curr: Procurement) => acc + (Number(curr.budget) || 0), 0)
	);
	const avgBudget = $derived(activeCount > 0 ? totalBudget / activeCount : 0);

	// Format currency helper
	const formatIDR = (val: number) => {
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			maximumFractionDigits: 0
		}).format(val);
	};

	// Latest activities
	const latestActivities = $derived(procurements.slice(0, 3));
</script>

<div class="relative h-auto w-full" in:fly={{ x: 50, duration: 1000, delay: 200 }}>
	<!-- Decorative Background Glow -->
	<div class="absolute -top-10 -right-10 h-64 w-64 rounded-full bg-blue-500/10 blur-[80px]"></div>

	<div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
		<!-- Main Stat: Total Volume -->
		<div
			class="group relative col-span-full overflow-hidden rounded-[2.5rem] border border-white/20 bg-white/40 p-8 py-10 backdrop-blur-md transition-all hover:bg-white/60 hover:shadow-2xl hover:shadow-blue-500/10"
		>
			<div class="relative z-10">
				<div class="mb-4 flex items-center gap-3">
					<div
						class="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-200"
					>
						<span class="material-symbols-outlined text-xl">payments</span>
					</div>
					<span class="text-[10px] font-black tracking-[0.2em] text-blue-600 uppercase"
						>Live Value Managed</span
					>
				</div>
				<h3 class="text-4xl font-black tracking-tighter text-slate-900 lg:text-5xl">
					{formatIDR(totalBudget)}
				</h3>
				<p class="mt-2 text-xs font-bold text-slate-400">
					Real-time aggregation across {activeCount} active tenders
				</p>
			</div>

			<!-- Sparkline Decoration (Simulated with CSS/SVG) -->
			<div
				class="absolute right-0 bottom-0 left-0 h-24 opacity-10 transition-opacity group-hover:opacity-20"
			>
				<svg viewBox="0 0 400 100" class="h-full w-full" preserveAspectRatio="none">
					<path
						d="M0,80 Q50,70 100,50 T200,60 T300,30 T400,40 V100 H0 Z"
						fill="currentColor"
						class="text-blue-600"
					/>
				</svg>
			</div>
		</div>

		<!-- Secondary Stat: Active Count -->
		<div
			class="rounded-[2.5rem] border border-white/20 bg-white/40 p-8 backdrop-blur-md transition-all hover:bg-white/60"
		>
			<div class="mb-3 flex items-center justify-between">
				<span class="text-[9px] font-black tracking-widest text-slate-400 uppercase"
					>Active Tenders</span
				>
				<div class="flex h-1.5 w-1.5 items-center justify-center">
					<div class="absolute h-1.5 w-1.5 animate-ping rounded-full bg-emerald-500/40"></div>
					<div class="h-1.5 w-1.5 rounded-full bg-emerald-500"></div>
				</div>
			</div>
			<div class="flex items-baseline gap-2">
				<span class="text-4xl font-black tracking-tight text-slate-900">{activeCount}</span>
				<span class="text-xs font-bold text-emerald-500">+12%</span>
			</div>
		</div>

		<!-- Secondary Stat: Avg Budget -->
		<div
			class="rounded-[2.5rem] border border-white/20 bg-white/40 p-8 backdrop-blur-md transition-all hover:bg-white/60"
		>
			<span class="mb-3 block text-[9px] font-black tracking-widest text-slate-400 uppercase"
				>Avg. Opportunity</span
			>
			<div class="flex items-baseline gap-2">
				<span class="text-2xl font-black tracking-tight text-slate-900"
					>{activeCount > 0 ? formatIDR(avgBudget).split(',')[0] : 'Rp 0'}</span
				>
			</div>
		</div>

		<!-- Live Activity Ticker -->
		<div
			class="col-span-full overflow-hidden rounded-[2.5rem] border border-white/20 bg-slate-950/5 p-8 backdrop-blur-md"
		>
			<div class="mb-6 flex items-center justify-between">
				<h4 class="text-[10px] font-black tracking-[0.2em] text-slate-500 uppercase">
					Latest Network Activity
				</h4>
				<span
					class="flex h-5 items-center rounded-full bg-blue-50 px-2 text-[8px] font-black text-blue-600 uppercase"
				>
					Live Updates
				</span>
			</div>

			<div class="space-y-4">
				{#each latestActivities as activity, i}
					<div
						class="flex items-center gap-4 border-b border-blue-500/5 pb-4 last:border-0 last:pb-0"
					>
						<div class="h-8 w-8 rounded-lg bg-white/80 p-1 shadow-sm">
							<div class="h-full w-full rounded bg-blue-50"></div>
						</div>
						<div class="min-w-0 flex-1">
							<p class="truncate text-xs font-bold text-slate-800">{activity.title}</p>
							<p class="text-[10px] font-medium text-slate-400">
								Just published • {formatIDR(Number(activity.budget))}
							</p>
						</div>
					</div>
				{:else}
					<p class="py-4 text-center text-xs font-medium text-slate-400">No recent activity</p>
				{/each}
			</div>
		</div>
	</div>
</div>

<script lang="ts">
	import { appState } from '$lib/state.svelte';
	import StatCard from '$lib/components/StatCard.svelte';
	import ProcurementCard from '$lib/components/ProcurementCard.svelte';
	import { fade, fly } from 'svelte/transition';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const t = $derived(appState.t.dashboard);
</script>

<div class="space-y-16 py-8" in:fade={{ duration: 800 }}>
	<div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
		<div in:fly={{ y: 20, duration: 600, delay: 200 }}>
			<StatCard
				title={t.activeTenders}
				value="{data.stats.activeTenders} Active"
				icon="work"
				variant="amber"
			/>
		</div>
		<div in:fly={{ y: 20, duration: 600, delay: 300 }}>
			<StatCard
				title={t.totalSubmissions}
				value="{data.stats.totalSubmissions} Total"
				icon="description"
				variant="purple"
			/>
		</div>
		<div in:fly={{ y: 20, duration: 600, delay: 400 }}>
			<StatCard
				title={t.completed}
				value="{data.stats.completed} Units"
				icon="verified"
				variant="blue"
			/>
		</div>
	</div>

	<div class="grid grid-cols-1 gap-14 lg:grid-cols-3">
		<div class="col-span-full space-y-10">
			<div class="flex items-center justify-between">
				<div class="space-y-1">
					<h4 class="text-sm font-black tracking-[0.2em] text-slate-400 uppercase">
						{t.recentProc}
					</h4>
					<div class="h-1 w-8 rounded-full bg-blue-600/20"></div>
				</div>
				<a
					href="/procurements"
					class="group flex items-center gap-2 text-xs font-black tracking-widest text-blue-600 uppercase transition-all hover:opacity-70"
				>
					{t.viewAll}
					<span class="transition-transform group-hover:translate-x-1">→</span>
				</a>
			</div>

			<div class="grid gap-6">
				{#each data.recentProcurements as proc, i}
					<div in:fly={{ x: -20, duration: 500, delay: 500 + i * 100 }}>
						<ProcurementCard
							id={proc.id}
							title={proc.title}
							type={proc.type?.name || 'General'}
							amount={proc.budget}
							deadline={proc.deadline}
							deadlineLabel={t.deadline}
						/>
					</div>
				{:else}
					<div
						class="flex h-40 items-center justify-center rounded-[2rem] border-2 border-dashed border-slate-100 bg-slate-50/50 p-8 text-center"
					>
						<p class="text-sm font-bold text-slate-400 uppercase tracking-widest">
							No recent procurements found
						</p>
					</div>
				{/each}
			</div>
		</div>
	</div>
</div>

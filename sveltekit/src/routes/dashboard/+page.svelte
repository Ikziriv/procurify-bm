<script lang="ts">
	import { appState } from '$lib/state.svelte';
	import StatCard from '$lib/components/StatCard.svelte';
	import ProcurementCard from '$lib/components/ProcurementCard.svelte';
	import { fade, fly } from 'svelte/transition';

	const t = $derived(appState.t.dashboard);

	const recentProcurements = [
		{
			id: '1',
			title: 'Cloud Infrastructure Upgrade 2024',
			type: 'Enterprise',
			amount: '$500,000',
			deadline: '31 Dec 2024'
		},
		{
			id: '2',
			title: 'Office Hardware Renewal',
			type: 'Operational',
			amount: '$85,000',
			deadline: '15 Nov 2024'
		},
		{
			id: '3',
			title: 'Security Audit Services',
			type: 'Compliance',
			amount: '$120,000',
			deadline: '20 Oct 2024'
		}
	];
</script>

<div class="space-y-16 py-8" in:fade={{ duration: 800 }}>
	<header class="space-y-2">
		<h2 class="text-5xl font-black tracking-tight text-slate-900 lg:text-6xl">
			{t.welcome}, <span class="text-blue-600">{appState.currentUser?.name || 'User'}</span>
		</h2>
		<p class="max-w-2xl text-lg leading-relaxed font-medium text-slate-400">{t.overview}</p>
	</header>

	<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
		<div in:fly={{ y: 20, duration: 600, delay: 100 }}>
			<StatCard
				title={t.status}
				value="Procurify v1.4"
				icon="terminal"
				status={t.operational}
				variant="blue"
			/>
		</div>
		<div in:fly={{ y: 20, duration: 600, delay: 200 }}>
			<StatCard title={t.activeTenders} value="12 Active" icon="work" variant="amber" />
		</div>
		<div in:fly={{ y: 20, duration: 600, delay: 300 }}>
			<StatCard title={t.totalSubmissions} value="84 Total" icon="description" variant="purple" />
		</div>
		<div in:fly={{ y: 20, duration: 600, delay: 400 }}>
			<StatCard title={t.completed} value="156 Units" icon="verified" variant="blue" />
		</div>
	</div>

	<div class="grid grid-cols-1 gap-12 lg:grid-cols-3">
		<div class="space-y-8 lg:col-span-2">
			<div class="flex items-center justify-between">
				<h4 class="text-sm font-black tracking-[0.2em] text-slate-400 uppercase">
					{t.recentProc}
				</h4>
				<button
					class="text-xs font-black tracking-widest text-blue-600 uppercase transition-all hover:translate-x-1 hover:opacity-70"
				>
					{t.viewAll} →
				</button>
			</div>

			<div class="grid gap-4">
				{#each recentProcurements as proc, i}
					<div in:fly={{ x: -20, duration: 500, delay: 500 + i * 100 }}>
						<ProcurementCard
							id={proc.id}
							title={proc.title}
							type={proc.type}
							amount={proc.amount}
							deadline={proc.deadline}
							deadlineLabel={t.deadline}
						/>
					</div>
				{/each}
			</div>
		</div>

		<div class="space-y-8">
			<h4 class="text-sm font-black tracking-[0.2em] text-slate-400 uppercase">
				{t.actionItems}
			</h4>
			<div
				class="group relative flex min-h-[400px] flex-col justify-between overflow-hidden rounded-[3rem] bg-slate-950 p-10 text-white shadow-2xl shadow-slate-900/40"
				in:fly={{ x: 20, duration: 600, delay: 800 }}
			>
				<div
					class="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-blue-500/10 blur-[80px] transition-all duration-700 group-hover:bg-blue-500/20"
				></div>

				<div class="relative z-10 space-y-6">
					<div
						class="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-blue-400 backdrop-blur-sm"
					>
						<span class="material-symbols-outlined text-2xl">bolt</span>
					</div>
					<div class="space-y-2">
						<h5 class="text-xl font-bold tracking-tight">Review Submissions</h5>
						<p class="text-sm leading-relaxed font-medium text-slate-400">
							{t.actionDesc}
						</p>
					</div>

					<div class="flex items-center gap-4">
						<div class="flex -space-x-4">
							{#each Array(3) as _, i}
								<img
									src="https://i.pravatar.cc/100?u={i}"
									alt="Vendor"
									class="h-10 w-10 rounded-xl border-2 border-slate-950 object-cover shadow-lg transition-transform hover:z-20 hover:scale-110"
								/>
							{/each}
						</div>
						<div class="space-y-0.5">
							<span class="block text-xs font-black tracking-widest text-blue-400 uppercase">
								+5 {t.pendingCount}
							</span>
							<span class="block text-[10px] font-bold tracking-tight text-slate-500 uppercase"
								>Requires Attention</span
							>
						</div>
					</div>
				</div>

				<button
					class="relative z-10 w-full rounded-2xl bg-blue-600 py-5 text-xs font-black tracking-[0.3em] uppercase shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-500 hover:shadow-blue-500/40 active:scale-95"
				>
					{t.reviewAll}
				</button>
			</div>
		</div>
	</div>
</div>

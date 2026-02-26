<script lang="ts">
	import { appState } from '$lib/state.svelte';
	import ProcurementCard from '$lib/components/ProcurementCard.svelte';
	import HeroDashboard from '$lib/components/HeroDashboard.svelte';
	import SearchAutocomplete from '$lib/components/SearchAutocomplete.svelte';
	import { fade, fly } from 'svelte/transition';
	import { createQuery } from '@tanstack/svelte-query';
	import { type Procurement } from '$lib/server/db/schema';

	let { data } = $props();
	const t = $derived(appState.t.landing);
	const pt = $derived(appState.t.pagination);

	// 1. Pagination & Search State
	let page = $state(1);
	let pageSize = $state(10);
	let searchTerm = $state('');
	let debouncedSearch = $state('');

	// Debounce search input
	let debounceTimer: ReturnType<typeof setTimeout>;
	$effect(() => {
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => {
			debouncedSearch = searchTerm;
			page = 1; // Reset to first page on search
		}, 400);
	});

	// 2. TanStack Query: Fetch paginated procurements
	const query = createQuery<{
		items: Procurement[];
		totalCount: number;
		page: number;
		pageSize: number;
		totalPages: number;
	}>(() => ({
		queryKey: ['procurements-public', page, pageSize, debouncedSearch],
		queryFn: async () => {
			const params = new URLSearchParams({
				page: page.toString(),
				pageSize: pageSize.toString(),
				search: debouncedSearch
			});
			const res = await fetch(`/api/public/procurements?${params.toString()}`);
			if (!res.ok) throw new Error('Network response was not ok');
			return res.json();
		}
	}));

	// 3. Page Layout derived translations
	// (Keeping script clean by using direct data binding)
</script>

<div class="min-h-screen space-y-24 py-12" in:fade={{ duration: 800 }}>
	<!-- Hero Section - Architect Edition -->
	<header class="relative">
		<div
			class="absolute -top-24 -left-20 h-[500px] w-[500px] rounded-full bg-blue-500/[0.03] blur-[120px]"
		></div>

		<div class="flex h-auto w-full items-center gap-16">
			<!-- Hero Dashboard Component - Only for registered users -->
			{#if appState.currentUser}
				<div class="flex h-full w-full flex-col md:flex-row">
					<HeroDashboard procurements={query.data?.items ?? []} />
				</div>
			{/if}
		</div>
	</header>

	<!-- Public Feed Section -->
	<section id="feed" class="space-y-12">
		<div
			class="flex flex-col gap-8 border-b border-slate-100 pb-8 lg:flex-row lg:items-end lg:justify-between"
		>
			<div class="space-y-2">
				<h4 class="text-xs font-black tracking-[0.3em] text-blue-600 uppercase">{t.liveFeed}</h4>
				<h3 class="text-4xl font-black tracking-tight text-slate-900">{t.activeOpps}</h3>
			</div>

			<!-- Search Interface -->
			<div class="w-full max-w-md">
				<SearchAutocomplete
					bind:value={searchTerm}
					placeholder={t.searchPlaceholder}
					onSearch={(val) => {
						searchTerm = val;
						debouncedSearch = val;
						page = 1;
					}}
				/>
			</div>
		</div>

		<div class="grid grid-cols-1 gap-6">
			{#if query.isLoading}
				{#each Array(4) as _, i}
					<div class="h-64 animate-pulse rounded-[2.5rem] bg-slate-100"></div>
				{/each}
			{:else if query.data && query.data.items.length > 0}
				{#each query.data.items as proc, i}
					<div in:fly={{ y: 20, duration: 600, delay: i * 100 }}>
						<ProcurementCard
							id={proc.id}
							title={proc.title}
							type={proc.typeId || 'General'}
							amount={proc.budget}
							deadline={proc.deadline}
							deadlineLabel={t.deadlineLabel}
						/>
					</div>
				{/each}

				<!-- Pagination Controls -->
				{#if query.data.totalPages > 1}
					<div class="mt-12 flex items-center justify-between border-t border-slate-100 pt-12">
						<div class="text-sm font-medium text-slate-400">
							{pt.page}
							<span class="font-bold text-slate-900">{query.data.page}</span>
							{pt.of}
							<span class="font-bold text-slate-900">{query.data.totalPages}</span>
						</div>
						<div class="flex items-center gap-4">
							<button
								onclick={() => (page = Math.max(1, page - 1))}
								disabled={page === 1}
								class="flex h-12 items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 text-xs font-black tracking-widest text-slate-900 uppercase transition-all hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-white"
							>
								<span class="material-symbols-outlined text-base">arrow_back</span>
								{pt.previous}
							</button>
							<button
								onclick={() => (page = Math.min(query.data?.totalPages || 1, page + 1))}
								disabled={page === query.data.totalPages}
								class="flex h-12 items-center gap-2 rounded-xl bg-slate-900 px-6 text-xs font-black tracking-widest text-white uppercase transition-all hover:bg-slate-800 disabled:opacity-30"
							>
								{pt.next}
								<span class="material-symbols-outlined text-base">arrow_forward</span>
							</button>
						</div>
					</div>
				{/if}
			{:else}
				<div
					class="col-span-full rounded-[3rem] border-2 border-dashed border-slate-100 py-24 text-center"
				>
					<div
						class="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 text-slate-300"
					>
						<span class="material-symbols-outlined text-3xl">inventory_2</span>
					</div>
					<h5 class="mt-6 text-xl font-bold text-slate-900">
						{query.isError ? t.errorLoading : t.noTenders}
					</h5>
					<p class="mt-2 text-sm font-medium text-slate-400">
						{query.isError ? query.error.message : t.tryAdjust}
					</p>
				</div>
			{/if}
		</div>
	</section>

	<!-- Trust / Stats Section -->
	<section
		class="rounded-[4rem] bg-slate-950 p-16 text-white shadow-2xl shadow-slate-900/40 lg:p-24"
		in:fly={{ y: 40, duration: 800, delay: 1000 }}
	>
		<div class="grid grid-cols-1 gap-16 lg:grid-cols-3">
			<div class="space-y-4">
				<span class="text-5xl font-black tracking-tighter text-blue-400">$2.4B</span>
				<p class="text-xs font-black tracking-[0.2em] text-slate-500 uppercase">{t.volManaged}</p>
			</div>
			<div class="space-y-4">
				<span class="text-5xl font-black tracking-tighter text-blue-400">1.2k+</span>
				<p class="text-xs font-black tracking-[0.2em] text-slate-500 uppercase">
					{t.verifiedVendors}
				</p>
			</div>
			<div class="space-y-4">
				<span class="text-5xl font-black tracking-tighter text-blue-400">99.9%</span>
				<p class="text-xs font-black tracking-[0.2em] text-slate-500 uppercase">
					{t.compliance}
				</p>
			</div>
		</div>
	</section>
</div>

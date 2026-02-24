<script lang="ts">
	import { appState } from '$lib/state.svelte';
	import ProcurementCard from '$lib/components/ProcurementCard.svelte';
	import HeroDashboard from '$lib/components/HeroDashboard.svelte';
	import { fade, fly } from 'svelte/transition';
	import { createQuery } from '@tanstack/svelte-query';
	import {
		createTable,
		getCoreRowModel,
		getFilteredRowModel,
		getSortedRowModel,
		createColumnHelper
	} from '@tanstack/table-core';
	import { createForm } from '@tanstack/svelte-form';
	import { type Procurement } from '$lib/server/db/schema';

	let { data } = $props();
	const t = $derived(appState.t.landing);

	// 1. TanStack Query: Fetch procurements from our new API
	const query = createQuery<Procurement[]>(() => ({
		queryKey: ['procurements'],
		queryFn: async () => {
			const res = await fetch('/api/procurements');
			if (!res.ok) throw new Error('Network response was not ok');
			return res.json();
		}
	}));

	// 2. TanStack Form: Manage search state
	const form = createForm(() => ({
		defaultValues: {
			search: ''
		}
	}));

	// 3. TanStack Table: Headless data management
	const columnHelper = createColumnHelper<Procurement>();

	const columns = [
		columnHelper.accessor('title', { header: 'Title' }),
		columnHelper.accessor('budget', { header: 'Budget' }),
		columnHelper.accessor('deadline', { header: 'Deadline' })
	];

	// Map search state to table filtering
	let globalFilter = $state('');
	$effect(() => {
		// Sync form value to global filter
		globalFilter = form.state.values.search;
	});

	const table = $derived(
		createTable({
			get data() {
				return query.data ?? [];
			},
			columns,
			get state() {
				return {
					globalFilter
				};
			},
			onStateChange: (updater) => {
				if (typeof updater === 'function') {
					// This would handle bulk state updates if needed
					// For now we just sync individual state pieces
				}
			},
			onGlobalFilterChange: (updater) => {
				if (typeof updater === 'function') {
					globalFilter = updater(globalFilter);
				} else {
					globalFilter = updater;
				}
			},
			getCoreRowModel: getCoreRowModel(),
			getFilteredRowModel: getFilteredRowModel(),
			getSortedRowModel: getSortedRowModel(),
			renderFallbackValue: null
		})
	);
</script>

<div class="min-h-screen space-y-24 py-12" in:fade={{ duration: 800 }}>
	<!-- Hero Section - Architect Edition -->
	<header class="relative">
		<div
			class="absolute -top-24 -left-20 h-[500px] w-[500px] rounded-full bg-blue-500/[0.03] blur-[120px]"
		></div>

		<div class="flex h-auto w-full items-center gap-16">
			<!-- Hero Dashboard Component -->
			<div class="flex h-full w-full flex-col md:flex-row">
				<HeroDashboard procurements={query.data ?? []} />
			</div>
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

			<!-- TanStack Form: Search Interface -->
			<div class="w-full max-w-md">
				<form
					onsubmit={(e) => {
						e.preventDefault();
						e.stopPropagation();
					}}
				>
					<form.Field name="search">
						{#snippet children(field)}
							<div class="group relative">
								<span
									class="material-symbols-outlined absolute top-1/2 left-5 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-blue-600"
									>search</span
								>
								<input
									name={field.name}
									value={field.state.value}
									oninput={(e) => field.handleChange(e.currentTarget.value)}
									onblur={field.handleBlur}
									placeholder={t.searchPlaceholder}
									class="w-full rounded-2xl border border-slate-200 bg-white py-4 pr-6 pl-14 text-sm font-medium transition-all outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
								/>
							</div>
						{/snippet}
					</form.Field>
				</form>
			</div>
		</div>

		<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
			{#if query.isLoading}
				{#each Array(4) as _, i}
					<div class="h-64 animate-pulse rounded-[2.5rem] bg-slate-100"></div>
				{/each}
			{:else if table.getRowModel().rows.length > 0}
				{#each table.getRowModel().rows as row, i}
					{@const proc = row.original}
					<div in:fly={{ y: 20, duration: 600, delay: i * 100 }}>
						<ProcurementCard
							id={proc.id}
							title={proc.title}
							type="Enterprise"
							amount={proc.budget}
							deadline={proc.deadline}
							deadlineLabel={t.deadlineLabel}
						/>
					</div>
				{/each}
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

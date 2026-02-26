<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import { appState } from '$lib/state.svelte';
	import BMNAutocomplete from './BMNAutocomplete.svelte';

	/**
	 * Senior Architecture Note:
	 * Using a consolidated state object ensures atomic updates and cleaner prop-drilling
	 * if these filters were to be extracted into sub-components.
	 */
	interface FilterState {
		category: string;
		budget: string;
		location: string;
	}

	interface Props {
		onFilter: (filters: FilterState) => void;
	}

	let { onFilter }: Props = $props();
	const t = $derived(appState.t.explore);

	// Unified state management
	let filters = $state<FilterState>({
		category: '',
		budget: '',
		location: ''
	});

	const budgetOptions = [
		{ label: 'Any', value: '' },
		{ label: '< 100M IDR', value: '0-100000000' },
		{ label: '100M - 500M IDR', value: '100000000-500000000' },
		{ label: '500M - 2B IDR', value: '500000000-2000000000' },
		{ label: '> 2B IDR', value: '2000000000-' }
	];

	function handleApply() {
		onFilter($state.snapshot(filters));
	}

	function handleClear() {
		filters = {
			category: '',
			budget: '',
			location: ''
		};
		handleApply();
	}

	// Performance: Derived check for "isDirty" to highlight reset button
	const isDirty = $derived(
		filters.category !== '' || filters.budget !== '' || filters.location !== ''
	);
</script>

<div
	class="group relative flex flex-col gap-8 overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition-all hover:shadow-md lg:flex-row lg:items-end lg:justify-between"
	in:fly={{ y: 15, duration: 500 }}
	data-testid="advanced-filter-card"
>
	<!-- Architectural Grid Pattern (Subtle Background) -->
	<div
		class="pointer-events-none absolute inset-0 opacity-[0.03]"
		style="background-image: radial-gradient(#000 1px, transparent 0); background-size: 24px 24px;"
	></div>

	<div class="relative flex-1 space-y-8">
		<!-- Header: Clean & Systematic -->
		<div class="flex items-center gap-4">
			<div class="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
				<span class="material-symbols-outlined text-xl">tune</span>
			</div>
			<div class="space-y-0.5">
				<h4 class="text-[11px] font-bold tracking-widest text-slate-900 uppercase">
					{t.advancedFilter}
				</h4>
				<p class="text-[11px] font-medium text-slate-400">
					{t.filterSubtitle}
				</p>
			</div>
		</div>

		<div class="grid grid-cols-1 gap-8 md:grid-cols-3 lg:gap-12">
			<!-- Category Scope -->
			<div class="space-y-3">
				<BMNAutocomplete
					bind:value={filters.category}
					label={t.category}
					placeholder={t.any}
					class="architect-input"
				/>
			</div>

			<!-- Budget Parameters -->
			<div class="space-y-3">
				<label class="block text-[10px] font-black tracking-widest text-slate-400 uppercase">
					{t.budget}
				</label>
				<div class="relative">
					<select
						bind:value={filters.budget}
						class="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/50 px-5 py-3.5 text-sm font-bold text-slate-900 transition-all outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5"
					>
						{#each budgetOptions as option}
							<option value={option.value}>{option.label === 'Any' ? t.any : option.label}</option>
						{/each}
					</select>
					<div class="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-slate-400">
						<span class="material-symbols-outlined text-lg">unfold_more</span>
					</div>
				</div>
			</div>

			<!-- Geographic Context -->
			<div class="space-y-3">
				<label class="block text-[10px] font-black tracking-widest text-slate-400 uppercase">
					{t.location}
				</label>
				<div class="group relative">
					<input
						type="text"
						bind:value={filters.location}
						placeholder={t.any}
						class="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-5 py-3.5 text-sm font-bold text-slate-900 transition-all outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5"
					/>
					<div
						class="absolute top-1/2 right-4 -translate-y-1/2 text-slate-300 transition-colors group-focus-within:text-blue-500"
					>
						<span class="material-symbols-outlined text-lg">location_on</span>
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- Action Bundle -->
	<div class="relative flex items-center gap-4 lg:pl-10">
		{#if isDirty}
			<button
				onclick={handleClear}
				transition:fade={{ duration: 200 }}
				class="group flex h-12 items-center justify-center gap-2 rounded-xl px-4 text-[11px] font-bold text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-600"
			>
				<span class="material-symbols-outlined text-lg transition-transform group-hover:rotate-180"
					>restart_alt</span
				>
				{t.clear}
			</button>
		{/if}

		<button
			onclick={handleApply}
			class="flex h-12 items-center justify-center gap-3 rounded-xl bg-slate-900 px-8 text-[11px] font-bold tracking-widest text-white uppercase transition-all hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-500/20 active:scale-[0.98]"
		>
			<span class="material-symbols-outlined text-lg">search</span>
			{t.apply}
		</button>
	</div>
</div>

<style>
	/* Senior UI Refinement: Clean input baseline */
	:global(.architect-input input) {
		border-radius: 0.75rem !important;
		background-color: rgb(248 250 252 / 0.5) !important;
		padding: 0.875rem 1.25rem !important;
		font-size: 0.875rem !important;
	}

	:global(.architect-input input:focus) {
		background-color: white !important;
		box-shadow: 0 0 0 4px rgb(59 130 246 / 0.05) !important;
	}
</style>

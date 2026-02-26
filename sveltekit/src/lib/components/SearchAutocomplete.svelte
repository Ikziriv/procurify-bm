<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import { createQuery } from '@tanstack/svelte-query';
	import type { Procurement } from '$lib/server/db/schema';

	interface Props {
		value: string;
		placeholder?: string;
		onSearch?: (value: string) => void;
	}

	let { value = $bindable(), placeholder = 'Search...', onSearch }: Props = $props();

	let isOpen = $state(false);
	let highlightedIndex = $state(-1);
	let inputElement: HTMLInputElement;

	// Suggestions Query
	const suggestionsQuery = createQuery<{ items: Procurement[] }>(() => ({
		queryKey: ['procurement-suggestions', value],
		queryFn: async () => {
			if (!value || value.length < 2) return { items: [] };
			const params = new URLSearchParams({ search: value, pageSize: '5' });
			const res = await fetch(`/api/public/procurements?${params.toString()}`);
			if (!res.ok) throw new Error('Failed to fetch suggestions');
			return res.json();
		},
		enabled: value.length >= 2 && isOpen
	}));

	const suggestions = $derived(suggestionsQuery.data?.items || []);

	function handleKeyDown(e: KeyboardEvent) {
		if (!isOpen) {
			if (e.key === 'ArrowDown' || e.key === 'Enter') isOpen = true;
			return;
		}

		switch (e.key) {
			case 'ArrowDown':
				e.preventDefault();
				highlightedIndex = (highlightedIndex + 1) % suggestions.length;
				break;
			case 'ArrowUp':
				e.preventDefault();
				highlightedIndex = (highlightedIndex - 1 + suggestions.length) % suggestions.length;
				break;
			case 'Enter':
				e.preventDefault();
				if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
					selectSuggestion(suggestions[highlightedIndex].title);
				} else {
					handleSubmit();
				}
				break;
			case 'Escape':
				isOpen = false;
				highlightedIndex = -1;
				break;
		}
	}

	function selectSuggestion(title: string) {
		value = title;
		isOpen = false;
		highlightedIndex = -1;
		onSearch?.(title);
	}

	function handleSubmit() {
		isOpen = false;
		highlightedIndex = -1;
		onSearch?.(value);
	}

	function highlightMatch(text: string, query: string) {
		if (!query) return text;
		const parts = text.split(new RegExp(`(${query})`, 'gi'));
		return parts
			.map((part) =>
				part.toLowerCase() === query.toLowerCase()
					? `<span class="text-blue-500 font-bold">${part}</span>`
					: part
			)
			.join('');
	}
</script>

<div class="relative w-full">
	<div class="group relative">
		<span
			class="material-symbols-outlined absolute top-1/2 left-5 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-blue-600"
		>
			search
		</span>
		<input
			bind:this={inputElement}
			bind:value
			{placeholder}
			onfocus={() => (isOpen = true)}
			onblur={() => setTimeout(() => (isOpen = false), 200)}
			onkeydown={handleKeyDown}
			class="w-full rounded-2xl border border-slate-200 bg-white py-4 pr-14 pl-14 text-sm font-medium transition-all outline-none placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
		/>

		{#if value}
			<button
				onclick={() => {
					value = '';
					onSearch?.('');
				}}
				class="absolute top-1/2 right-4 -translate-y-1/2 rounded-full p-1 text-slate-300 transition-colors hover:bg-slate-100 hover:text-slate-600"
			>
				<span class="material-symbols-outlined text-xl">close</span>
			</button>
		{/if}
	</div>

	<!-- Suggestions Dropdown -->
	{#if isOpen && (suggestions.length > 0 || suggestionsQuery.isLoading)}
		<div
			transition:fly={{ y: 10, duration: 200 }}
			class="absolute top-full z-50 mt-3 w-full overflow-hidden rounded-[2rem] border border-white/20 bg-white/80 p-2 shadow-2xl backdrop-blur-xl"
		>
			{#if suggestionsQuery.isLoading}
				<div class="flex items-center gap-3 px-4 py-8">
					<div
						class="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"
					></div>
					<span class="text-xs font-bold tracking-widest text-slate-400 uppercase"
						>Searching procurements...</span
					>
				</div>
			{:else}
				<div class="max-h-[320px] overflow-y-auto">
					{#each suggestions as suggestion, i}
						<button
							onclick={() => selectSuggestion(suggestion.title)}
							onmouseenter={() => (highlightedIndex = i)}
							class="flex w-full items-start gap-4 rounded-2xl px-5 py-4 text-left transition-all
                            {i === highlightedIndex
								? 'bg-blue-50/80 text-blue-700'
								: 'text-slate-600 hover:bg-slate-50/50'}"
						>
							<div
								class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl transition-all
                                {i === highlightedIndex
									? 'bg-blue-600 text-white'
									: 'bg-slate-100 text-slate-400'}"
							>
								<span class="material-symbols-outlined text-4xl">inventory_2</span>
							</div>
							<div class="flex flex-col">
								<span class="text-xs leading-tight font-bold">
									{@html highlightMatch(suggestion.title, value)}
								</span>
								<span class="mt-1 text-[10px] font-medium tracking-widest text-slate-400 uppercase"
									>{suggestion.budget}</span
								>
							</div>
						</button>
					{/each}
				</div>

				<div class="mt-2 border-t border-slate-100 p-2">
					<button
						onclick={handleSubmit}
						class="flex w-full items-center justify-between rounded-xl bg-slate-900 px-4 py-3 text-white transition-all hover:bg-slate-800"
					>
						<span class="text-[10px] font-black tracking-widest uppercase">Show all results</span>
						<span class="material-symbols-outlined text-sm">arrow_forward</span>
					</button>
				</div>
			{/if}
		</div>
	{/if}
</div>

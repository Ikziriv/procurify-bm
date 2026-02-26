<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import { appState } from '$lib/state.svelte';

	interface BMNItem {
		id: string;
		kodefikasiBmn: string;
		name: string;
		unit?: string;
		level: number;
	}

	interface Props {
		value: string; // This will hold the bmnId
		id?: string;
		label?: string;
		placeholder?: string;
		required?: boolean;
		class?: string;
	}

	let {
		value = $bindable(),
		id = 'bmn-autocomplete',
		label = '',
		placeholder = 'Search BMN...',
		required = false,
		class: className = ''
	}: Props = $props();

	let searchQuery = $state('');
	let selectedName = $state('');
	let isOpen = $state(false);
	let highlightedIndex = $state(-1);
	let suggestions = $state<BMNItem[]>([]);
	let isLoading = $state(false);
	let inputElement: HTMLInputElement | undefined = $state();
	let searchContainer: HTMLDivElement | undefined = $state();

	// Debounce search
	let debounceTimer: any;
	function handleInput() {
		if (debounceTimer) clearTimeout(debounceTimer);
		if (searchQuery.length < 2) {
			suggestions = [];
			return;
		}

		isLoading = true;
		debounceTimer = setTimeout(async () => {
			try {
				const res = await fetch(`/api/bmn?q=${encodeURIComponent(searchQuery)}`);
				const data = await res.json();
				suggestions = data.items || [];
			} catch (err) {
				console.error('Search error:', err);
			} finally {
				isLoading = false;
			}
		}, 300);
	}

	function handleKeyDown(e: KeyboardEvent) {
		if (!isOpen) {
			if (e.key === 'ArrowDown' || e.key === 'Enter') {
				isOpen = true;
			}
			return;
		}

		switch (e.key) {
			case 'ArrowDown':
				e.preventDefault();
				highlightedIndex = (highlightedIndex + 1) % (suggestions.length || 1);
				break;
			case 'ArrowUp':
				e.preventDefault();
				highlightedIndex =
					(highlightedIndex - 1 + (suggestions.length || 1)) % (suggestions.length || 1);
				break;
			case 'Enter':
				if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
					e.preventDefault();
					selectSuggestion(suggestions[highlightedIndex]);
				}
				break;
			case 'Escape':
				isOpen = false;
				highlightedIndex = -1;
				break;
			case 'Tab':
				isOpen = false;
				highlightedIndex = -1;
				break;
		}
	}

	function selectSuggestion(suggestion: BMNItem) {
		value = suggestion.id;
		selectedName = `${suggestion.id} - ${suggestion.name}`;
		searchQuery = selectedName;
		isOpen = false;
		highlightedIndex = -1;
	}

	function highlightMatch(text: string, query: string) {
		if (!query) return text;
		const parts = text.split(new RegExp(`(${query})`, 'gi'));
		return parts
			.map((part) =>
				part.toLowerCase() === query.toLowerCase()
					? `<span class="text-blue-600 font-black">${part}</span>`
					: part
			)
			.join('');
	}

	function handleOutsideClick(e: MouseEvent) {
		if (searchContainer && !searchContainer.contains(e.target as Node)) {
			isOpen = false;
			// If no selection was made, we might want to reset or keep the query
		}
	}

	// Update query if value (bmnId) changes externally (e.g. when editing)
	$effect(() => {
		if (value && !selectedName) {
			// Fetch the BMN name if we only have the ID
			fetch(`/api/bmn?q=${encodeURIComponent(value)}`)
				.then((res) => res.json())
				.then((data) => {
					const item = data.items?.find((i: BMNItem) => i.id === value);
					if (item) {
						selectedName = `${item.id} - ${item.name}`;
						searchQuery = selectedName;
					}
				});
		}
	});
</script>

<svelte:window onclick={handleOutsideClick} />

<div class="relative w-full {className}" bind:this={searchContainer}>
	{#if label}
		<label
			for={id}
			class="mb-2 block text-[10px] font-black tracking-widest text-slate-400 uppercase"
		>
			{label}
		</label>
	{/if}

	<div class="group relative">
		<input
			{id}
			{placeholder}
			{required}
			type="text"
			autocomplete="off"
			bind:this={inputElement}
			bind:value={searchQuery}
			oninput={handleInput}
			onfocus={() => (isOpen = true)}
			onkeydown={handleKeyDown}
			class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-6 py-4 text-sm font-bold text-slate-900 transition-all outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
		/>

		<div class="pointer-events-none absolute top-1/2 right-5 -translate-y-1/2 text-slate-300">
			{#if isLoading}
				<div
					class="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-blue-500"
				></div>
			{:else}
				<span
					class="material-symbols-outlined transition-transform duration-300 {isOpen
						? 'rotate-180 text-blue-500'
						: ''}"
				>
					expand_more
				</span>
			{/if}
		</div>
	</div>

	<!-- Suggestions Dropdown -->
	{#if isOpen && (suggestions.length > 0 || searchQuery.length >= 2)}
		<div
			transition:fly={{ y: 10, duration: 200 }}
			class="absolute top-full z-[100] mt-3 w-full overflow-hidden rounded-[2rem] border border-white/20 bg-white/90 p-2 shadow-2xl backdrop-blur-xl"
		>
			<div class="custom-scrollbar max-h-[320px] overflow-y-auto">
				{#if suggestions.length > 0}
					{#each suggestions as suggestion, i}
						<button
							type="button"
							onclick={() => selectSuggestion(suggestion)}
							onmouseenter={() => (highlightedIndex = i)}
							class="flex w-full items-center gap-4 rounded-2xl px-5 py-4 text-left transition-all
							{i === highlightedIndex
								? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
								: 'text-slate-600 hover:bg-slate-100/50'}"
						>
							<div
								class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl transition-all
								{i === highlightedIndex ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-400'}"
							>
								<span class="material-symbols-outlined text-xl"> inventory_2 </span>
							</div>
							<div class="flex min-w-0 flex-col">
								<span class="truncate text-xs leading-tight font-bold">
									{@html highlightMatch(suggestion.name, searchQuery)}
								</span>
								<div class="mt-1 flex items-center gap-2">
									<span
										class="text-[9px] font-black tracking-widest uppercase {i === highlightedIndex
											? 'text-white/70'
											: 'text-slate-400'}"
									>
										{suggestion.id}
									</span>
								</div>
							</div>
						</button>
					{/each}
				{:else if !isLoading && searchQuery.length >= 2}
					<div class="px-5 py-8 text-center text-slate-400">
						<span class="material-symbols-outlined mb-2 block text-3xl opacity-20">search_off</span>
						<p class="text-xs font-bold tracking-widest uppercase italic">No matches found</p>
					</div>
				{/if}
			</div>
		</div>
	{/if}
</div>

<style>
	.custom-scrollbar::-webkit-scrollbar {
		width: 6px;
	}
	.custom-scrollbar::-webkit-scrollbar-track {
		background: transparent;
	}
	.custom-scrollbar::-webkit-scrollbar-thumb {
		background: rgba(0, 0, 0, 0.05);
		border-radius: 10px;
	}
	.custom-scrollbar::-webkit-scrollbar-thumb:hover {
		background: rgba(0, 0, 0, 0.1);
	}
</style>

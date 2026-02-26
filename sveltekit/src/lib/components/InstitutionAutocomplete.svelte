<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import { searchInstitutions, type Institution } from '$lib/data/klpd';
	import { appState } from '$lib/state.svelte';

	interface Props {
		value: string;
		id?: string;
		name?: string;
		label?: string;
		placeholder?: string;
		required?: boolean;
		class?: string;
		isSelectable?: (institution: Institution) => boolean;
	}

	let {
		value = $bindable(),
		id = 'institution-autocomplete',
		name = 'institutionName',
		label = '',
		placeholder = 'Select institution...',
		required = false,
		class: className = '',
		isSelectable = () => true
	}: Props = $props();

	let isOpen = $state(false);
	let highlightedIndex = $state(-1);
	let inputElement: HTMLInputElement | undefined = $state();
	let searchContainer: HTMLDivElement | undefined = $state();

	const suggestions = $derived(isOpen ? searchInstitutions(value) : []);

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
				} else if (suggestions.length === 1) {
					e.preventDefault();
					selectSuggestion(suggestions[0]);
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

	function selectSuggestion(suggestion: Institution) {
		value = suggestion.name;
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

	// Handle clicks outside to close the dropdown
	function handleOutsideClick(e: MouseEvent) {
		if (searchContainer && !searchContainer.contains(e.target as Node)) {
			isOpen = false;
		}
	}
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
			{name}
			{placeholder}
			{required}
			type="text"
			autocomplete="off"
			bind:this={inputElement}
			bind:value
			onfocus={() => (isOpen = true)}
			onkeydown={handleKeyDown}
			class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-6 py-4 text-sm font-bold text-slate-900 transition-all outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
		/>

		<div class="pointer-events-none absolute top-1/2 right-5 -translate-y-1/2 text-slate-300">
			<span
				class="material-symbols-outlined transition-transform duration-300 {isOpen
					? 'rotate-180 text-blue-500'
					: ''}"
			>
				expand_more
			</span>
		</div>
	</div>

	<!-- Suggestions Dropdown -->
	{#if isOpen && suggestions.length > 0}
		<div
			transition:fly={{ y: 10, duration: 200 }}
			class="absolute top-full z-[100] mt-3 w-full overflow-hidden rounded-[2rem] border border-white/20 bg-white/90 p-2 shadow-2xl backdrop-blur-xl"
		>
			<div class="custom-scrollbar max-h-[320px] overflow-y-auto">
				{#each suggestions as suggestion, i}
					{@const selectable = isSelectable(suggestion)}
					<button
						type="button"
						onclick={() => selectable && selectSuggestion(suggestion)}
						onmouseenter={() => (highlightedIndex = i)}
						disabled={!selectable}
						class="flex w-full items-center gap-4 rounded-2xl px-5 py-4 text-left transition-all
                        {i === highlightedIndex && selectable
							? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
							: selectable
								? 'text-slate-600 hover:bg-slate-100/50'
								: 'cursor-not-allowed opacity-50 grayscale'}"
					>
						<div
							class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl transition-all
                            {i === highlightedIndex && selectable
								? 'bg-white/20 text-white'
								: 'bg-slate-100 text-slate-400'}"
						>
							<span class="material-symbols-outlined text-xl">
								{suggestion.category === 'MINISTRY'
									? 'account_balance'
									: suggestion.category === 'AGENCY'
										? 'token'
										: suggestion.category === 'PROVINCE'
											? 'map'
											: 'location_city'}
							</span>
						</div>
						<div class="flex min-w-0 flex-col">
							<span class="truncate text-xs leading-tight font-bold">
								{@html highlightMatch(suggestion.name, value)}
							</span>
							<div class="mt-1 flex items-center gap-2">
								<span
									class="text-[9px] font-black tracking-widest uppercase {i === highlightedIndex
										? 'text-white/70'
										: 'text-slate-400'}"
								>
									{suggestion.category}
								</span>
								{#if suggestion.abbreviation}
									<span
										class="h-1 w-1 rounded-full {i === highlightedIndex
											? 'bg-white/30'
											: 'bg-slate-200'}"
									></span>
									<span
										class="text-[9px] font-bold {i === highlightedIndex
											? 'text-white'
											: 'text-blue-500'}"
									>
										{suggestion.abbreviation}
									</span>
								{/if}
							</div>
						</div>
					</button>
				{/each}
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

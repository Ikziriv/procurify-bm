<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import type { Snippet } from 'svelte';

	interface Props {
		open: boolean;
		onClose: () => void;
		title?: string;
		children?: Snippet;
		footer?: Snippet;
	}

	let { open, onClose, title, children, footer }: Props = $props();

	function handleKeydown(e: KeyboardEvent) {
		if (open && e.key === 'Escape') {
			onClose();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
	<div class="fixed inset-0 z-[100] flex items-end justify-end sm:items-center">
		<!-- Backdrop -->
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
			transition:fade={{ duration: 300 }}
			onclick={onClose}
		></div>

		<!-- Drawer Panel -->
		<div
			class="relative flex h-[85vh] w-full flex-col rounded-t-[3rem] border-t border-slate-200 bg-white shadow-2xl transition-all sm:h-full sm:max-w-md sm:rounded-t-none sm:rounded-l-none sm:border-t-0 sm:border-l"
			transition:fly={{ x: 400, y: 0, duration: 500, opacity: 1 }}
		>
			<!-- Header -->
			<div class="flex items-center justify-between border-b border-slate-50 p-8">
				<div>
					{#if title}
						<h3 class="text-xs font-black tracking-[0.3em] text-slate-400 uppercase">
							{title}
						</h3>
					{/if}
				</div>
				<button
					onclick={onClose}
					class="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-900"
				>
					<span class="material-symbols-outlined">close</span>
				</button>
			</div>

			<!-- Body -->
			<div class="flex-1 overflow-y-auto px-8 py-10">
				{@render children?.()}
			</div>

			<!-- Footer (Sticky if provided) -->
			{#if footer}
				<div class="border-t border-slate-50 p-8">
					{@render footer()}
				</div>
			{/if}
		</div>
	</div>
{/if}

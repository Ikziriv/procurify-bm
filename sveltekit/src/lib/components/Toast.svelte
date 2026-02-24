<script lang="ts">
	import { onMount } from 'svelte';
	import { fly, fade } from 'svelte/transition';
	import { backOut } from 'svelte/easing';

	let { title, message, type, onRemove } = $props<{
		title: string;
		message: string;
		type: 'SUCCESS' | 'ERROR' | 'INFO';
		onRemove: () => void;
	}>();

	let progress = $state(100);
	let interval: any;

	onMount(() => {
		const start = Date.now();
		const duration = 5000;
		interval = setInterval(() => {
			const elapsed = Date.now() - start;
			progress = Math.max(0, 100 - (elapsed / duration) * 100);
			if (progress <= 0) clearInterval(interval);
		}, 10);

		return () => clearInterval(interval);
	});

	const configs = {
		SUCCESS: {
			icon: 'check_circle',
			bg: 'bg-emerald-500/10',
			border: 'border-emerald-500/20',
			text: 'text-emerald-400',
			progress: 'bg-emerald-500'
		},
		ERROR: {
			icon: 'error',
			bg: 'bg-rose-500/10',
			border: 'border-rose-500/20',
			text: 'text-rose-400',
			progress: 'bg-rose-500'
		},
		INFO: {
			icon: 'info',
			bg: 'bg-blue-500/10',
			border: 'border-blue-500/20',
			text: 'text-blue-400',
			progress: 'bg-blue-500'
		}
	};

	let config = $derived(configs[type as keyof typeof configs]);
</script>

<div
	role="alert"
	in:fly={{ x: 100, duration: 600, easing: backOut }}
	out:fade={{ duration: 300 }}
	class="group relative mb-4 overflow-hidden rounded-2xl border {config.border} {config.bg} p-5 shadow-2xl backdrop-blur-xl"
>
	<div class="flex items-start gap-4">
		<div
			class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 {config.text}"
		>
			<span class="material-symbols-outlined text-2xl">{config.icon}</span>
		</div>
		<div class="flex-1 pt-0.5">
			<h4 class="text-sm font-black tracking-widest text-white uppercase">{title}</h4>
			<p class="mt-1 text-xs leading-relaxed font-medium text-white/80">
				{message}
			</p>
		</div>
		<button
			onclick={onRemove}
			class="shrink-0 rounded-lg p-1 text-white/30 transition-colors hover:bg-white/5 hover:text-white"
		>
			<span class="material-symbols-outlined text-xl">close</span>
		</button>
	</div>

	<!-- Progress Bar -->
	<div class="absolute bottom-0 left-0 h-0.5 w-full bg-white/5">
		<div
			class="h-full {config.progress} transition-all duration-[10ms] ease-linear"
			style="width: {progress}%"
		></div>
	</div>
</div>

<style>
	:global(.material-symbols-outlined) {
		font-variation-settings:
			'FILL' 0,
			'wght' 400,
			'GRAD' 0,
			'opsz' 24;
	}
</style>

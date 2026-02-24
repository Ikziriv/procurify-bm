<script lang="ts">
	import { appState } from '$lib/state.svelte';
	import { fade, fly } from 'svelte/transition';

	const t = $derived(appState.t);
</script>

<svelte:head>
	<title>{t.errors.unauthorizedTitle}</title>
</svelte:head>

<div class="flex min-h-[80vh] items-center justify-center p-6" in:fade>
	<div
		class="w-full max-w-[500px] space-y-8 rounded-[3rem] border border-slate-200/60 bg-white p-12 text-center shadow-2xl shadow-slate-200/50"
		in:fly={{ y: 20, duration: 600 }}
	>
		<div
			class="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-rose-50 text-rose-500 ring-8 ring-rose-50/50"
		>
			<span class="material-symbols-outlined text-5xl">gpp_maybe</span>
		</div>

		<div class="space-y-4">
			<h1 class="text-3xl font-black tracking-tight text-slate-900 md:text-4xl">
				{t.errors.unauthorizedTitle}
			</h1>
			<p class="text-sm leading-relaxed font-medium text-slate-500">
				{t.errors.unauthorizedSubtitle}
			</p>
			<p class="text-xs font-semibold tracking-wide text-slate-400">
				{t.errors.unauthorizedDesc}
			</p>
		</div>

		<a
			href="/dashboard"
			class="group relative inline-flex w-full items-center justify-center overflow-hidden rounded-2xl bg-blue-600 py-5 text-xs font-black tracking-[0.2em] text-white uppercase shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-500 hover:shadow-blue-500/40 active:scale-95"
		>
			<span class="relative z-10 flex items-center gap-2">
				<span class="material-symbols-outlined text-[16px]">arrow_back</span>
				{t.errors.backToDashboard}
			</span>
			<div
				class="absolute inset-0 z-0 -translate-x-full bg-linear-to-r from-transparent via-white/10 to-transparent group-hover:animate-[shimmer_1.5s_infinite]"
			></div>
		</a>
	</div>
</div>

<style>
	@keyframes shimmer {
		100% {
			transform: translateX(100%);
		}
	}
</style>

<script lang="ts">
	import { page } from '$app/state';
	import { appState } from '$lib/state.svelte';
	import { fade, fly } from 'svelte/transition';
	import { backOut } from 'svelte/easing';

	const status = $derived(page.status);
	const is404 = $derived(status === 404);
	const errorTitle = $derived(
		is404 ? appState.t.errors.notFoundTitle : appState.t.errors.serverErrorTitle
	);
	const errorMessage = $derived(
		is404 ? appState.t.errors.notFoundMessage : appState.t.errors.serverErrorMessage
	);
</script>

<div class="flex min-h-[100vh] flex-col items-center justify-center px-4 text-center">
	<div class="relative py-8">
		<!-- Large decorative status code background -->
		<div
			class="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[12rem] font-black text-slate-100 select-none lg:text-[20rem]"
			in:fade={{ duration: 1000, delay: 200 }}
		>
			{status}
		</div>

		<!-- Main visual item -->
		<div
			class="relative flex h-32 w-32 items-center justify-center rounded-[2.5rem] bg-white shadow-2xl shadow-blue-500/10"
			in:fly={{ y: 20, duration: 800, easing: backOut }}
		>
			<span class="material-symbols-outlined text-6xl text-blue-600">
				{is404 ? 'sentiment_dissatisfied' : 'error'}
			</span>
		</div>
	</div>

	<h1
		class="py-16 text-3xl font-black tracking-tight text-slate-900 lg:text-5xl"
		in:fly={{ y: 10, duration: 800, delay: 200 }}
	>
		{errorTitle}
	</h1>

	<p
		class="mb-10 max-w-md text-base font-medium text-slate-500"
		in:fly={{ y: 10, duration: 800, delay: 300 }}
	>
		{errorMessage}
	</p>

	<a
		href="/"
		class="group relative flex items-center gap-2 overflow-hidden rounded-2xl bg-slate-900 px-8 py-4 text-sm font-bold text-white transition-all hover:bg-slate-800 hover:shadow-xl hover:shadow-slate-900/20 active:scale-95"
		in:fly={{ y: 10, duration: 800, delay: 400 }}
	>
		<span class="material-symbols-outlined text-lg transition-transform group-hover:-translate-x-1"
			>west</span
		>
		{appState.t.errors.backHome}
	</a>
</div>

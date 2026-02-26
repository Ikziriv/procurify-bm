<script lang="ts">
	import { enhance } from '$app/forms';
	import { appState } from '$lib/state.svelte';
	import { fade, fly } from 'svelte/transition';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let isEnforced = $state(data.restrictInstitutions);
	let success = $state(false);

	$effect(() => {
		if (form?.success) {
			success = true;
			const timer = setTimeout(() => (success = false), 3000);
			return () => clearTimeout(timer);
		}
	});
</script>

<div class="mx-auto max-w-4xl px-4 py-12 lg:px-8" in:fade={{ duration: 800 }}>
	<div class="mb-12">
		<h1 class="text-4xl font-black tracking-tight text-slate-900 uppercase">
			System <span class="text-blue-600">Configuration</span>
		</h1>
		<p class="mt-4 font-medium text-slate-500">Manage global system settings and restrictions.</p>
	</div>

	{#if success}
		<div
			class="mb-8 flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm font-bold text-emerald-600 shadow-sm"
			in:fly={{ y: -10 }}
			out:fade
		>
			<span class="material-symbols-outlined">check_circle</span>
			Settings updated successfully.
		</div>
	{/if}

	<div class="grid gap-8">
		<!-- Institution Restriction Card -->
		<section
			class="group relative overflow-hidden rounded-[2.5rem] border border-white/20 bg-white/80 p-8 shadow-2xl shadow-slate-200/50 backdrop-blur-xl transition-all hover:shadow-blue-500/5 lg:p-12"
		>
			<div class="relative z-10">
				<div class="mb-8 flex items-center justify-between">
					<div class="flex items-center gap-4">
						<div
							class="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 transition-transform group-hover:scale-110"
						>
							<span class="material-symbols-outlined">account_balance</span>
						</div>
						<div>
							<h2 class="text-lg font-black tracking-tight text-slate-900 uppercase">
								Institution Restrictions
							</h2>
							<p class="mt-1 text-xs font-bold tracking-wider text-slate-400 uppercase">
								Global Selection Enforcer
							</p>
						</div>
					</div>

					<form
						method="POST"
						action="?/toggleRestriction"
						use:enhance={() => {
							return ({ result }) => {
								if (result.type === 'success') {
									// state is already updated via local binding but we can refresh from data if needed
								}
							};
						}}
					>
						<input type="hidden" name="enabled" value={(!isEnforced).toString()} />
						<button
							type="submit"
							onclick={() => (isEnforced = !isEnforced)}
							class="relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:ring-4 focus:ring-blue-500/20 focus:outline-none {isEnforced
								? 'bg-blue-600'
								: 'bg-slate-200'}"
						>
							<span
								class="pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-300 ease-in-out {isEnforced
									? 'translate-x-7'
									: 'translate-x-0'}"
							></span>
						</button>
					</form>
				</div>

				<div class="rounded-3xl border border-slate-100/50 bg-slate-50/50 p-6">
					<p class="text-sm leading-relaxed font-medium text-slate-600">
						When enabled, all users (except <span class="font-black text-slate-900"
							>SUPER_ADMIN</span
						>
						and
						<span class="font-black text-slate-900">ADMIN_TBP</span>) will be restricted to
						selecting only
						<span class="font-bold text-blue-600">Kementerian Pekerjaan Umum</span> and
						<span class="font-bold text-blue-600">Kementerian Perumahan dan Kawasan Permukiman</span
						> in their profiles.
					</p>
				</div>

				<div
					class="mt-6 flex items-center gap-2 text-[10px] font-black tracking-widest text-slate-400 uppercase"
				>
					<span class="material-symbols-outlined text-sm">info</span>
					This change takes effect immediately across the platform.
				</div>
			</div>

			<!-- Decorative Background Elements -->
			<div
				class="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-blue-50/50 opacity-0 blur-3xl transition-opacity group-hover:opacity-100"
			></div>
		</section>
	</div>
</div>

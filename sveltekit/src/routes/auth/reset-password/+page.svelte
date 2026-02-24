<script lang="ts">
	import { authClient } from '$lib/auth-client';
	import { appState } from '$lib/state.svelte';
	import { fade, fly } from 'svelte/transition';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';

	let newPassword = $state('');
	let confirmPassword = $state('');
	let loading = $state(false);
	let error = $state('');
	let success = $state(false);

	const token = $derived(page.url.searchParams.get('token'));
	const t = $derived(appState.t);

	async function handleSubmit() {
		if (!token) {
			error = t.auth.tokenMissing;
			return;
		}

		if (newPassword !== confirmPassword) {
			error = t.auth.passwordsDoNotMatch;
			return;
		}

		loading = true;
		error = '';

		try {
			const { error: resetError } = await authClient.resetPassword({
				newPassword,
				token
			});

			if (resetError) throw new Error(resetError.message);
			success = true;

			// Auto redirect after 3 seconds
			setTimeout(() => {
				goto('/auth');
			}, 3000);
		} catch (e: any) {
			error = e.message || t.auth.resetFailed;
		} finally {
			loading = false;
		}
	}
</script>

<div class="flex min-h-[80vh] items-center justify-center p-1 md:p-6" in:fade>
	<div
		class="w-full max-w-[500px] space-y-10 rounded-[3rem] border border-slate-200/60 bg-white p-12 shadow-2xl shadow-slate-200/50"
		in:fly={{ y: 40, duration: 800 }}
	>
		<div class="space-y-4 text-center">
			<h1 class="text-2xl font-black tracking-tight text-slate-900 md:text-4xl">
				{success ? t.auth.updateSuccess : t.auth.resetPasswordTitle}
			</h1>
			<p class="md:text-md text-sm font-medium text-slate-400">
				{success ? t.auth.updateSuccessDesc : t.auth.resetPasswordSubtitle}
			</p>
		</div>

		{#if error}
			<div
				class="rounded-2xl border border-rose-100 bg-rose-50 p-4 text-center text-xs font-bold text-rose-600 uppercase"
				in:fade
			>
				{error}
			</div>
		{/if}

		{#if success}
			<div
				class="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-center text-xs font-bold text-emerald-600 uppercase"
				in:fade
			>
				{t.auth.redirecting}
			</div>
		{:else}
			<form
				class="space-y-6"
				onsubmit={(e) => {
					e.preventDefault();
					handleSubmit();
				}}
			>
				<div class="space-y-4">
					<div class="space-y-2">
						<label
							for="newPassword"
							class="ml-2 text-[10px] font-black tracking-widest text-slate-400 uppercase"
							>{t.auth.password}</label
						>
						<input
							id="newPassword"
							type="password"
							bind:value={newPassword}
							required
							minlength="8"
							class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-6 py-4 text-sm font-medium transition-all outline-none focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-100"
							placeholder="••••••••"
						/>
					</div>

					<div class="space-y-2">
						<label
							for="confirmPassword"
							class="ml-2 text-[10px] font-black tracking-widest text-slate-400 uppercase"
							>{t.auth.confirmPassword}</label
						>
						<input
							id="confirmPassword"
							type="password"
							bind:value={confirmPassword}
							required
							class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-6 py-4 text-sm font-medium transition-all outline-none focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-100"
							placeholder="••••••••"
						/>
					</div>
				</div>

				<button
					type="submit"
					disabled={loading || !token}
					class="group relative w-full overflow-hidden rounded-2xl bg-blue-600 py-5 text-xs font-black tracking-[0.3em] text-white uppercase shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-500 hover:shadow-blue-500/40 active:scale-95 disabled:opacity-50"
				>
					<span class="relative z-10">{loading ? t.auth.processing : t.auth.updateButton}</span>
					<div
						class="absolute inset-0 z-0 -translate-x-full bg-linear-to-r from-transparent via-white/10 to-transparent group-hover:animate-[shimmer_1.5s_infinite]"
					></div>
				</button>
			</form>
		{/if}

		{#if !success && !token}
			<div class="text-center">
				<a
					href="/auth"
					class="text-[10px] font-black tracking-widest text-blue-600 uppercase transition-all hover:text-blue-500"
				>
					{t.auth.requestNewLink}
				</a>
			</div>
		{/if}
	</div>
</div>

<style>
	@keyframes shimmer {
		100% {
			transform: translateX(100%);
		}
	}
</style>

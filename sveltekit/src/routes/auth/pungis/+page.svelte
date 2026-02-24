<script lang="ts">
	import { authClient } from '$lib/auth-client';
	import { appState } from '$lib/state.svelte';
	import { fade, fly } from 'svelte/transition';
	import { page } from '$app/state';
	import { Shield, Briefcase, User, Factory, ChevronRight, Check } from '@lucide/svelte';

	let email = $state('');
	let password = $state('');
	let confirmPassword = $state('');
	let name = $state('');
	let role = $state('USER_PROCUREMENT');
	let showPassword = $state(false);
	let loading = $state(false);
	let isRedirecting = $state(false);
	let error = $state('');
	let successMessage = $state('');

	const callbackURL = $derived(page.url.searchParams.get('callbackURL') || '/');
	const t = $derived(appState.t);

	const roleOptions = [
		{
			id: 'USER_PROCUREMENT',
			icon: User,
			color: 'text-blue-600',
			bg: 'bg-blue-50',
			border: 'border-blue-100'
		},
		{
			id: 'ADMIN_PROCUREMENT',
			icon: Briefcase,
			color: 'text-purple-600',
			bg: 'bg-purple-50',
			border: 'border-purple-100'
		},
		{
			id: 'MANUFACT_PROCUREMENT',
			icon: Factory,
			color: 'text-emerald-600',
			bg: 'bg-emerald-50',
			border: 'border-emerald-100'
		},
		{
			id: 'SUPER_ADMIN',
			icon: Shield,
			color: 'text-rose-600',
			bg: 'bg-rose-50',
			border: 'border-rose-100'
		}
	];

	async function handleSubmit() {
		loading = true;
		error = '';
		successMessage = '';

		try {
			if (password.length < 8) {
				error = t.auth.passwordTooShort;
				loading = false;
				return;
			}
			if (password !== confirmPassword) {
				error = t.auth.passwordsDoNotMatch;
				loading = false;
				return;
			}

			const { data, error: signUpError } = await authClient.signUp.email({
				email,
				password,
				name,
				role
			} as any);

			if (signUpError) throw new Error(signUpError.message);

			isRedirecting = true;
			window.location.href = callbackURL;
		} catch (e: any) {
			error = e.message || t.auth.authError;
		} finally {
			if (!isRedirecting) {
				loading = false;
			}
		}
	}
</script>

{#if isRedirecting}
	<div
		class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm"
		in:fade
		out:fade
	>
		<div
			class="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent shadow-md"
		></div>
		<p class="mt-6 text-sm font-black tracking-widest text-blue-600 uppercase drop-shadow-sm">
			{t.auth.processing}
		</p>
	</div>
{/if}

<div class="flex min-h-screen items-center justify-center bg-slate-50/50 p-6" in:fade>
	<div
		class="w-full max-w-4xl space-y-12 rounded-[3.5rem] border border-slate-200/60 bg-white p-16 shadow-2xl shadow-slate-200/50"
		in:fly={{ y: 40, duration: 800 }}
	>
		<div class="space-y-4 text-center">
			<h1 class="text-4xl font-black tracking-tight text-slate-900 md:text-5xl">
				{t.auth.createAccount}
			</h1>
			<p class="text-lg font-medium text-slate-400">
				{t.auth.joinNetwork}
			</p>
		</div>

		{#if error}
			<div
				class="rounded-3xl border border-rose-100 bg-rose-50 p-6 text-center text-sm font-black tracking-widest text-rose-600 uppercase"
				in:fade
			>
				{error}
			</div>
		{/if}

		<form
			class="grid gap-12 lg:grid-cols-2"
			onsubmit={(e) => {
				e.preventDefault();
				handleSubmit();
			}}
		>
			<!-- Role Selection -->
			<div class="space-y-6">
				<label class="ml-2 text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase">
					Select Your Role
				</label>
				<div class="grid grid-cols-1 gap-4">
					{#each roleOptions as option}
						<button
							type="button"
							onclick={() => (role = option.id)}
							class="group relative flex items-center gap-6 rounded-3xl border-2 p-6 text-left transition-all hover:scale-[1.02] active:scale-95 {role ===
							option.id
								? `${option.border} ${option.bg} shadow-xl shadow-slate-200/50`
								: 'border-slate-100 bg-white'}"
						>
							<div
								class="flex h-14 w-14 items-center justify-center rounded-2xl {option.bg} {option.color} transition-colors group-hover:bg-white"
							>
								<option.icon class="h-7 w-7" />
							</div>
							<div class="flex-1">
								<h3
									class="text-sm font-black tracking-widest uppercase {role === option.id
										? 'text-slate-900'
										: 'text-slate-500'}"
								>
									{t.auth.roles[option.id as keyof typeof t.auth.roles]}
								</h3>
								<p class="mt-1 text-xs font-medium text-slate-400">
									Access Level: {option.id.split('_').join(' ')}
								</p>
							</div>
							{#if role === option.id}
								<div
									class="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-200"
									in:fade
								>
									<Check class="h-4 w-4" />
								</div>
							{/if}
						</button>
					{/each}
				</div>
			</div>

			<!-- Form Fields -->
			<div class="space-y-8">
				<div class="space-y-4">
					<div class="space-y-2">
						<label
							for="name"
							class="ml-2 text-[10px] font-black tracking-widest text-slate-400 uppercase"
							>{t.auth.fullName}</label
						>
						<input
							id="name"
							type="text"
							bind:value={name}
							required
							class="w-full rounded-[2rem] border border-slate-200 bg-slate-50 px-8 py-5 text-sm font-medium transition-all outline-none focus:border-blue-600 focus:bg-white focus:ring-8 focus:ring-blue-100"
							placeholder={t.auth.fullNamePlaceholder}
						/>
					</div>

					<div class="space-y-2">
						<label
							for="email"
							class="ml-2 text-[10px] font-black tracking-widest text-slate-400 uppercase"
							>{t.auth.emailAddress}</label
						>
						<input
							id="email"
							type="email"
							bind:value={email}
							required
							class="w-full rounded-[2rem] border border-slate-200 bg-slate-50 px-8 py-5 text-sm font-medium transition-all outline-none focus:border-blue-600 focus:bg-white focus:ring-8 focus:ring-blue-100"
							placeholder={t.auth.emailPlaceholder}
						/>
					</div>

					<div class="space-y-2">
						<label
							for="password"
							class="ml-2 text-[10px] font-black tracking-widest text-slate-400 uppercase"
							>{t.auth.password}</label
						>
						<div class="relative">
							<input
								id="password"
								type={showPassword ? 'text' : 'password'}
								bind:value={password}
								required
								class="w-full rounded-[2rem] border border-slate-200 bg-slate-50 px-8 py-5 pr-16 text-sm font-medium transition-all outline-none focus:border-blue-600 focus:bg-white focus:ring-8 focus:ring-blue-100"
								placeholder="••••••••"
							/>
							<button
								type="button"
								onclick={() => (showPassword = !showPassword)}
								class="absolute top-1/2 right-6 -translate-y-1/2 text-slate-400 transition-colors hover:text-blue-600"
							>
								<span class="material-symbols-outlined text-2xl">
									{showPassword ? 'visibility_off' : 'visibility'}
								</span>
							</button>
						</div>
					</div>

					<div class="space-y-2">
						<label
							for="confirmPassword"
							class="ml-2 text-[10px] font-black tracking-widest text-slate-400 uppercase"
							>{t.auth.confirmPassword}</label
						>
						<input
							id="confirmPassword"
							type={showPassword ? 'text' : 'password'}
							bind:value={confirmPassword}
							required
							class="w-full rounded-[2rem] border border-slate-200 bg-slate-50 px-8 py-5 text-sm font-medium transition-all outline-none focus:border-blue-600 focus:bg-white focus:ring-8 focus:ring-blue-100"
							placeholder={t.auth.confirmPasswordPlaceholder}
						/>
					</div>
				</div>

				<button
					type="submit"
					disabled={loading}
					class="group relative w-full overflow-hidden rounded-[2rem] bg-slate-900 py-6 text-xs font-black tracking-[0.4em] text-white uppercase shadow-2xl shadow-slate-900/20 transition-all hover:bg-slate-800 hover:shadow-slate-800/40 active:scale-95 disabled:opacity-50"
				>
					<span class="relative z-10 flex items-center justify-center gap-4">
						{#if loading}
							{t.auth.processing}
						{:else}
							{t.auth.signUp}
							<ChevronRight class="h-4 w-4" />
						{/if}
					</span>
					<div
						class="absolute inset-0 z-0 -translate-x-full bg-linear-to-r from-transparent via-white/5 to-transparent group-hover:animate-[shimmer_2s_infinite]"
					></div>
				</button>

				<div class="text-center">
					<a
						href="/auth"
						class="text-[10px] font-black tracking-widest text-slate-400 uppercase transition-all hover:text-blue-600"
					>
						{t.auth.hasAccount}
					</a>
				</div>
			</div>
		</form>
	</div>
</div>

<style>
	@keyframes shimmer {
		100% {
			transform: translateX(100%);
		}
	}
</style>

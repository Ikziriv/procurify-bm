<script lang="ts">
	import { authClient } from '$lib/auth-client';
	import { appState } from '$lib/state.svelte';
	import { fade, fly } from 'svelte/transition';
	import { page } from '$app/state';
	import { Shield, Eye, EyeOff, Loader2 } from '@lucide/svelte';

	let identifier = $state('');
	let password = $state('');
	let confirmPassword = $state('');
	let name = $state('');
	let role = $state('USER_PROCUREMENT');
	let isSignUp = $state(false);
	let isForgotPassword = $state(false);
	let showPassword = $state(false);
	let loading = $state(false);
	let isRedirecting = $state(false);
	let error = $state('');
	let successMessage = $state('');

	const callbackURL = $derived(page.url.searchParams.get('callbackURL') || '/');
	const t = $derived(appState.t);

	async function handleSubmit() {
		loading = true;
		error = '';
		successMessage = '';

		try {
			if (isForgotPassword) {
				const { error: forgotError } = await authClient.requestPasswordReset({
					email: identifier,
					redirectTo: `${window.location.origin}/auth/reset-password`
				});
				if (forgotError) throw new Error(forgotError.message);
				successMessage = t.auth.checkEmail;
				return;
			}

			if (isSignUp) {
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

				const { error: signUpError } = await authClient.signUp.email({
					email: identifier,
					password,
					name,
					role
				} as any);
				if (signUpError) throw new Error(signUpError.message);
			} else {
				const isEmail = identifier.includes('@');
				const { error: signInError } = isEmail
					? await authClient.signIn.email({
							email: identifier,
							password
						})
					: await authClient.signIn.username({
							username: identifier,
							password
						});

				if (signInError) throw new Error(signInError.message);
			}

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
		class="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white/80 backdrop-blur-xl"
		in:fade={{ duration: 400 }}
		out:fade={{ duration: 300 }}
	>
		<div class="relative flex flex-col items-center">
			<div class="relative flex items-center justify-center">
				<!-- Minimalistic Progress Ring -->
				<div
					class="h-20 w-20 animate-spin rounded-full border-[3px] border-slate-100 border-t-blue-600"
				></div>

				<div
					class="absolute flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-lg shadow-blue-500/5"
				>
					<Shield class="h-6 w-6 text-blue-600" />
				</div>
			</div>

			<div class="mt-8 flex flex-col items-center space-y-2">
				<p class="text-[11px] font-bold tracking-widest text-slate-900 uppercase opacity-60">
					{t.auth.processing}
				</p>
			</div>
		</div>
	</div>
{/if}

<div class="flex min-h-[85vh] items-center justify-center p-4" in:fade>
	<div
		class="w-full max-w-[460px] space-y-8 rounded-3xl border border-slate-200/60 bg-white p-8 shadow-xl shadow-slate-200/40 md:p-10"
		in:fly={{ y: 20, duration: 600 }}
	>
		<div class="space-y-1 text-left">
			<div
				class="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600"
			>
				<Shield size={24} />
			</div>
			<h1 class="text-2xl font-bold tracking-tight text-slate-900">
				{#if isForgotPassword}
					{t.auth.resetPassword}
				{:else}
					{isSignUp ? t.auth.createAccount : t.auth.welcomeBack}
				{/if}
			</h1>
			<p class="text-sm font-medium text-slate-400">
				{#if isForgotPassword}
					{t.auth.resetLinkDesc}
				{:else}
					{isSignUp ? t.auth.joinNetwork : t.auth.secureAccess}
				{/if}
			</p>
		</div>

		{#if !isForgotPassword}
			<div class="flex rounded-xl bg-slate-50 p-1">
				<button
					onclick={() => (isSignUp = false)}
					class="flex-1 rounded-lg py-2.5 text-[11px] font-bold tracking-wider uppercase transition-all {!isSignUp
						? 'bg-white text-blue-600 shadow-sm'
						: 'text-slate-400 hover:text-slate-600'}"
				>
					{t.auth.signIn}
				</button>
				<button
					onclick={() => {
						isSignUp = true;
						role = 'USER_PROCUREMENT';
					}}
					class="flex-1 rounded-lg py-2.5 text-[11px] font-bold tracking-wider uppercase transition-all {isSignUp
						? 'bg-white text-blue-600 shadow-sm'
						: 'text-slate-400 hover:text-slate-600'}"
				>
					{t.auth.signUp}
				</button>
			</div>
		{/if}

		{#if successMessage || error}
			<div
				class="rounded-xl border p-4 text-center text-[11px] font-bold uppercase transition-all {error
					? 'border-rose-100 bg-rose-50 text-rose-600'
					: 'border-emerald-100 bg-emerald-50 text-emerald-600'}"
				in:fade
			>
				{successMessage || error}
			</div>
		{/if}

		<form
			class="space-y-5"
			onsubmit={(e) => {
				e.preventDefault();
				handleSubmit();
			}}
		>
			<div class="space-y-4">
				{#if isSignUp}
					<div class="space-y-1.5" in:fly={{ y: 10, duration: 400 }}>
						<label
							for="name"
							class="ml-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase"
						>
							{t.auth.fullName}
						</label>
						<input
							id="name"
							type="text"
							bind:value={name}
							required
							class="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-5 py-3.5 text-sm font-medium transition-all outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5"
							placeholder={t.auth.fullNamePlaceholder}
						/>
					</div>
				{/if}

				<div class="space-y-1.5">
					<label
						for="identifier"
						class="ml-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase"
					>
						{isSignUp ? t.auth.emailAddress : 'Email or Username'}
					</label>
					<input
						id="identifier"
						type={isSignUp ? 'email' : 'text'}
						bind:value={identifier}
						required
						class="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-5 py-3.5 text-sm font-medium transition-all outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5"
						placeholder={isSignUp ? t.auth.emailPlaceholder : 'Enter your email or username'}
					/>
				</div>

				{#if !isForgotPassword}
					<div class="space-y-1.5">
						<div class="flex items-center justify-between">
							<label
								for="password"
								class="ml-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase"
							>
								{t.auth.password}
							</label>
							{#if !isSignUp}
								<button
									type="button"
									onclick={() => (isForgotPassword = true)}
									class="mr-1 text-[10px] font-bold tracking-wider text-blue-600 uppercase transition-all hover:text-blue-500"
								>
									{t.auth.forgot}
								</button>
							{/if}
						</div>
						<div class="relative">
							<input
								id="password"
								type={showPassword ? 'text' : 'password'}
								bind:value={password}
								required={!isForgotPassword}
								class="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-5 py-3.5 pr-12 text-sm font-medium transition-all outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5"
								placeholder="••••••••"
							/>
							<button
								type="button"
								onclick={() => (showPassword = !showPassword)}
								class="absolute top-1/2 right-4 -translate-y-1/2 text-slate-400 transition-colors hover:text-blue-600"
							>
								{#if showPassword}
									<EyeOff size={18} />
								{:else}
									<Eye size={18} />
								{/if}
							</button>
						</div>
					</div>

					{#if isSignUp}
						<div class="space-y-1.5" in:fly={{ y: 10, duration: 400 }}>
							<label
								for="confirmPassword"
								class="ml-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase"
							>
								{t.auth.confirmPassword}
							</label>
							<input
								id="confirmPassword"
								type={showPassword ? 'text' : 'password'}
								bind:value={confirmPassword}
								required
								class="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-5 py-3.5 text-sm font-medium transition-all outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5"
								placeholder={t.auth.confirmPasswordPlaceholder}
							/>
						</div>
					{/if}
				{/if}
			</div>

			<button
				type="submit"
				disabled={loading}
				class="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-slate-900 py-4 text-[11px] font-bold tracking-widest text-white uppercase transition-all hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-500/20 active:scale-[0.98] disabled:opacity-50"
			>
				{#if loading}
					<Loader2 class="h-4 w-4 animate-spin" />
					<span>{t.auth.processing}</span>
				{:else}
					<span>
						{#if isForgotPassword}
							{t.auth.sendResetLink}
						{:else}
							{isSignUp ? t.auth.signUp : t.auth.signIn}
						{/if}
					</span>
				{/if}
			</button>
		</form>

		<div class="pt-2 text-center">
			<button
				onclick={() => {
					if (isForgotPassword) {
						isForgotPassword = false;
					} else {
						isSignUp = !isSignUp;
						if (isSignUp) role = 'USER_PROCUREMENT';
					}
				}}
				class="text-[10px] font-bold tracking-wider text-slate-400 uppercase transition-all hover:text-blue-600"
			>
				{#if isForgotPassword}
					{t.auth.backToSignIn}
				{:else if isSignUp}
					{t.auth.hasAccount}
				{:else}
					{t.auth.noAccount}
				{/if}
			</button>
		</div>
	</div>
</div>

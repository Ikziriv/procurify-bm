<script lang="ts">
	import { authClient } from '$lib/auth-client';
	import { appState } from '$lib/state.svelte';
	import { fade, fly } from 'svelte/transition';
	import { goto } from '$app/navigation';

	import { page } from '$app/state';
	import { Shield } from '@lucide/svelte';

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
				const { data, error: forgotError } = await authClient.requestPasswordReset({
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

				const { data, error: signUpError } = await authClient.signUp.email({
					email: identifier, // Use identifier as email for signup (validation will handle if it's not)
					password,
					name,
					// Custom field 'role' is passed directly in standard better-auth signUp
					role
				} as any);
				if (signUpError) throw new Error(signUpError.message);
			} else {
				const isEmail = identifier.includes('@');
				const { data, error: signInError } = isEmail
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

			// Show full screen indicator while we fetch the new page
			isRedirecting = true;

			// Using window.location.href forces a full hard reload of the application,
			// which is often best practice after authentication to clear any stale state
			window.location.href = callbackURL;
		} catch (e: any) {
			error = e.message || t.auth.authError;
		} finally {
			// Only turn off loading if we are not actively redirecting away
			// This prevents flickering where loading turns off right before the page unloads
			if (!isRedirecting) {
				loading = false;
			}
		}
	}
</script>

{#if isRedirecting}
	<div
		class="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden"
		in:fade={{ duration: 600 }}
		out:fade={{ duration: 400 }}
	>
		<!-- Animated Background Layers -->
		<div class="absolute inset-0 bg-white/40 backdrop-blur-2xl"></div>
		<div
			class="bg-radial-at-tr absolute inset-0 from-blue-500/10 via-transparent to-transparent"
		></div>
		<div
			class="bg-radial-at-bl absolute inset-0 from-purple-500/5 via-transparent to-transparent"
		></div>

		<div class="relative flex flex-col items-center">
			<div class="relative flex items-center justify-center">
				<!-- Outer Pulse -->
				<div
					class="absolute h-40 w-40 animate-ping rounded-full bg-blue-500/10 [animation-duration:3s]"
				></div>

				<!-- Multiple Rotating Rings for Depth -->
				<div
					class="h-32 w-32 animate-spin rounded-full border-t-2 border-r-2 border-blue-600/30 [animation-duration:2s]"
				></div>
				<div
					class="absolute h-24 w-24 animate-spin rounded-full border-b-2 border-l-2 border-blue-600 [animation-direction:reverse] [animation-duration:1.5s]"
				></div>

				<!-- Center Logo Container -->
				<div
					class="absolute flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-white shadow-2xl shadow-blue-200/50"
				>
					<Shield class="h-8 w-8 animate-pulse text-blue-600" />
				</div>
			</div>

			<!-- Status Text -->
			<div class="mt-12 flex flex-col items-center space-y-4">
				<div class="flex items-center gap-3">
					<span class="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-600 [animation-delay:-0.3s]"
					></span>
					<span class="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-600 [animation-delay:-0.15s]"
					></span>
					<span class="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-600"></span>
				</div>
				<p class="text-[10px] font-black tracking-[0.5em] text-slate-900 uppercase opacity-80">
					{t.auth.processing}
				</p>
			</div>
		</div>
	</div>
{/if}

<div class="flex min-h-[80vh] items-center justify-center p-1 md:p-6" in:fade>
	<div
		class="w-full max-w-[500px] space-y-10 rounded-[3rem] border border-slate-200/60 bg-white p-12 shadow-2xl shadow-slate-200/50"
		in:fly={{ y: 40, duration: 800 }}
	>
		<div class="space-y-0 text-center">
			<h1 class="text-xl font-black tracking-tight text-slate-900 uppercase md:text-2xl">
				{#if isForgotPassword}
					{t.auth.resetPassword}
				{:else}
					{isSignUp ? t.auth.createAccount : t.auth.welcomeBack}
				{/if}
			</h1>
			<p class="md:text-md text-sm font-medium text-slate-400">
				{#if isForgotPassword}
					{t.auth.resetLinkDesc}
				{:else}
					{isSignUp ? t.auth.joinNetwork : t.auth.secureAccess}
				{/if}
			</p>
		</div>

		{#if !isForgotPassword}
			<div class="flex rounded-2xl bg-slate-50 p-1">
				<button
					onclick={() => (isSignUp = false)}
					class="flex-1 rounded-xl py-3 text-[10px] font-black tracking-widest uppercase transition-all {!isSignUp
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
					class="flex-1 rounded-xl py-3 text-[10px] font-black tracking-widest uppercase transition-all {isSignUp
						? 'bg-white text-blue-600 shadow-sm'
						: 'text-slate-400 hover:text-slate-600'}"
				>
					{t.auth.signUp}
				</button>
			</div>
		{/if}

		{#if successMessage}
			<div
				class="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-center text-xs font-bold text-emerald-600 uppercase"
				in:fade
			>
				{successMessage}
			</div>
		{/if}

		{#if error}
			<div
				class="rounded-2xl border border-rose-100 bg-rose-50 p-4 text-center text-xs font-bold text-rose-600 uppercase"
				in:fade
			>
				{error}
			</div>
		{/if}

		<form
			class="space-y-6"
			onsubmit={(e) => {
				e.preventDefault();
				handleSubmit();
			}}
		>
			<div class="space-y-4">
				{#if isSignUp}
					<div class="space-y-2" in:fly={{ y: 10, duration: 400 }}>
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
							class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-6 py-4 text-sm font-medium transition-all outline-none focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-100"
							placeholder={t.auth.fullNamePlaceholder}
						/>
					</div>
				{/if}

				<div class="space-y-2">
					<label
						for="identifier"
						class="ml-2 text-[10px] font-black tracking-widest text-slate-400 uppercase"
						>{isSignUp ? t.auth.emailAddress : 'Email or Username'}</label
					>
					<input
						id="identifier"
						type={isSignUp ? 'email' : 'text'}
						bind:value={identifier}
						required
						class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-6 py-4 text-sm font-medium transition-all outline-none focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-100"
						placeholder={isSignUp ? t.auth.emailPlaceholder : 'Enter your email or username'}
					/>
				</div>

				{#if !isForgotPassword}
					<div class="space-y-2">
						<div class="flex items-center justify-between">
							<label
								for="password"
								class="ml-2 text-[10px] font-black tracking-widest text-slate-400 uppercase"
								>{t.auth.password}</label
							>
							{#if !isSignUp}
								<button
									type="button"
									onclick={() => (isForgotPassword = true)}
									class="mr-2 text-[10px] font-black tracking-widest text-blue-600 uppercase transition-all hover:text-blue-500"
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
								class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-6 py-4 pr-14 text-sm font-medium transition-all outline-none focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-100"
								placeholder="••••••••"
							/>
							<button
								type="button"
								onclick={() => (showPassword = !showPassword)}
								class="absolute top-1/2 right-4 -translate-y-1/2 text-slate-400 transition-colors hover:text-blue-600"
							>
								<span class="material-symbols-outlined text-xl">
									{showPassword ? 'visibility_off' : 'visibility'}
								</span>
							</button>
						</div>
					</div>

					{#if isSignUp}
						<div class="space-y-2" in:fly={{ y: 10, duration: 400 }}>
							<label
								for="confirmPassword"
								class="ml-2 text-[10px] font-black tracking-widest text-slate-400 uppercase"
								>{t.auth.confirmPassword}</label
							>
							<div class="relative">
								<input
									id="confirmPassword"
									type={showPassword ? 'text' : 'password'}
									bind:value={confirmPassword}
									required
									class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-6 py-4 pr-14 text-sm font-medium transition-all outline-none focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-100"
									placeholder={t.auth.confirmPasswordPlaceholder}
								/>
							</div>
						</div>
					{/if}
				{/if}
			</div>

			<button
				type="submit"
				disabled={loading}
				class="group relative w-full overflow-hidden rounded-2xl bg-blue-600 py-5 text-xs font-black tracking-[0.3em] text-white uppercase shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-500 hover:shadow-blue-500/40 active:scale-95 disabled:opacity-50"
			>
				<span class="relative z-10">
					{#if loading}
						{t.auth.processing}
					{:else if isForgotPassword}
						{t.auth.sendResetLink}
					{:else}
						{isSignUp ? t.auth.signUp : t.auth.signIn}
					{/if}
				</span>
				<div
					class="absolute inset-0 z-0 -translate-x-full bg-linear-to-r from-transparent via-white/10 to-transparent group-hover:animate-[shimmer_1.5s_infinite]"
				></div>
			</button>
		</form>

		<div class="text-center">
			<button
				onclick={() => {
					if (isForgotPassword) {
						isForgotPassword = false;
					} else {
						isSignUp = !isSignUp;
						if (isSignUp) role = 'USER_PROCUREMENT';
					}
				}}
				class="text-[10px] font-black tracking-widest text-slate-400 uppercase transition-all hover:text-blue-600"
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

<style>
	@keyframes shimmer {
		100% {
			transform: translateX(100%);
		}
	}
</style>

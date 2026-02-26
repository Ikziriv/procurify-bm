<script lang="ts">
	import { appState, type Language } from '$lib/state.svelte';
	import NotificationDropdown from './NotificationDropdown.svelte';
	import { fade, fly } from 'svelte/transition';
	import { authClient } from '$lib/auth-client';

	let { onNavigate } = $props<{ onNavigate: (view: any) => void }>();

	function handleRoleSwitch(e: Event) {
		const target = e.target as HTMLSelectElement;
		// Role switching logic will be more robust after auth integration
		console.log('Switching to user:', target.value);
	}

	const currentUser = $derived(appState.currentUser);

	let showUserDropdown = $state(false);
	let showLogoutModal = $state(false);
	let isLoggingOut = $state(false);
	let isLogoutSuccess = $state(false);

	function toggleUserDropdown(e: Event) {
		e.stopPropagation();
		showUserDropdown = !showUserDropdown;
	}

	function closeUserDropdown() {
		showUserDropdown = false;
	}

	$effect(() => {
		if (showUserDropdown) {
			window.addEventListener('click', closeUserDropdown);
			return () => window.removeEventListener('click', closeUserDropdown);
		}
	});

	async function handleConfirmLogout() {
		isLoggingOut = true;
		try {
			// Sign out safely
			await authClient.signOut();
			appState.setUser(null); // Clear user state immediately locally

			// Trigger success notification view in modal
			isLogoutSuccess = true;

			// Redirect with hard reload for safety after showing success notification
			setTimeout(() => {
				window.location.href = '/auth';
			}, 1500);
		} catch (error) {
			console.error('Logout failed:', error);
			isLoggingOut = false;
			showLogoutModal = false;
		}
	}
</script>

{#if showLogoutModal}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
		in:fade
		out:fade
	>
		<div
			class="w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-2xl"
			in:fly={{ y: 20, duration: 300 }}
		>
			{#if isLogoutSuccess}
				<div
					class="flex flex-col items-center justify-center p-10 text-center"
					in:fade={{ duration: 400 }}
				>
					<div
						class="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-500 shadow-inner"
					>
						<span class="material-symbols-outlined text-4xl">check_circle</span>
					</div>
					<h3 class="text-xl font-black tracking-tight text-slate-800">
						{appState.t.signOut.success}
					</h3>
				</div>
			{:else}
				<div class="p-6 md:p-8">
					<div
						class="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-rose-500"
					>
						<span class="material-symbols-outlined text-3xl">logout</span>
					</div>
					<h3 class="mb-3 text-2xl font-black tracking-tight text-slate-900">
						{appState.t.signOut.title}
					</h3>
					<p class="text-sm leading-relaxed font-medium text-slate-500">
						{appState.t.signOut.message}
					</p>
				</div>
				<div class="flex items-center gap-3 bg-slate-50 p-6 md:px-8">
					<button
						onclick={() => (showLogoutModal = false)}
						disabled={isLoggingOut}
						class="flex-1 cursor-pointer rounded-xl border border-slate-200/60 bg-white py-3.5 text-xs font-black tracking-widest text-slate-600 uppercase transition-all hover:bg-slate-50 hover:text-slate-900 active:scale-95 disabled:opacity-50"
					>
						{appState.t.signOut.cancel}
					</button>
					<button
						onclick={handleConfirmLogout}
						disabled={isLoggingOut}
						class="relative flex-1 cursor-pointer overflow-hidden rounded-xl bg-rose-500 py-3.5 text-center text-xs font-black tracking-widest text-white uppercase shadow-lg shadow-rose-500/20 transition-all hover:bg-rose-400 hover:shadow-rose-400/40 active:scale-95 disabled:opacity-50"
					>
						<span class="relative z-10 flex items-center justify-center gap-2">
							{#if isLoggingOut}
								<div
									class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
								></div>
							{:else}
								{appState.t.signOut.confirm}
							{/if}
						</span>
					</button>
				</div>
			{/if}
		</div>
	</div>
{/if}

<header
	class="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200/60 bg-white/80 px-4 backdrop-blur-xl lg:h-20 lg:px-10"
>
	<div class="flex w-full items-center justify-between lg:w-full lg:justify-start lg:gap-6">
		<button
			onclick={() => appState.toggleSidebar()}
			class="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/60 bg-white text-slate-500 transition-all hover:border-slate-300 hover:bg-slate-50 active:scale-95 lg:h-12 lg:w-12 lg:rounded-2xl"
			aria-label={appState.sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
		>
			<span
				class="material-symbols-outlined transition-transform duration-500 {appState.sidebarCollapsed
					? ''
					: 'rotate-180'}">menu_open</span
			>
		</button>

		<div class="hidden items-center gap-10 lg:flex">
			<div
				class="flex items-center gap-3 rounded-2xl border border-slate-200/50 bg-slate-100 p-1.5 shadow-inner"
			>
				<button
					onclick={() => appState.setLanguage('ID')}
					class="cursor-pointer rounded-xl px-4 py-1.5 text-[10px] font-black tracking-widest uppercase transition-all {appState.language ===
					'ID'
						? 'border border-slate-200/50 bg-white text-blue-600 shadow-sm'
						: 'text-slate-400 hover:text-slate-600'}"
				>
					ID
				</button>
				<button
					onclick={() => appState.setLanguage('EN')}
					class="cursor-pointer rounded-xl px-4 py-1.5 text-[10px] font-black tracking-widest uppercase transition-all {appState.language ===
					'EN'
						? 'border border-slate-200/50 bg-white text-blue-600 shadow-sm'
						: 'text-slate-400 hover:text-slate-600'}"
				>
					EN
				</button>
			</div>

			{#if currentUser?.role === 'SUPER_ADMIN'}
				<div
					class="flex items-center gap-4 rounded-2xl border border-slate-200/40 bg-slate-50 px-5 py-2"
				>
					<span class="text-[9px] font-black tracking-[0.2em] text-slate-400 uppercase"
						>Authority Level</span
					>
					<select
						class="cursor-pointer border-none bg-transparent text-xs font-black tracking-widest text-slate-800 uppercase outline-none focus:ring-0"
						onchange={handleRoleSwitch}
					>
						{#if currentUser}
							<option value="current"
								>{currentUser.name?.toUpperCase()} / {currentUser.role?.toUpperCase() ||
									'USER'}</option
							>
						{/if}
						<option value="1">Admin / SUPER ADMIN</option>
						<option value="2">Sarah / PROCUREMENT</option>
					</select>
				</div>
			{/if}
		</div>

		<div class="flex w-full items-center justify-between gap-3 lg:gap-8">
			<div class="relative" id="notification-container">
				<button
					onclick={(e) => {
						e.stopPropagation();
						appState.toggleNotifications();
					}}
					class="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-slate-200/60 bg-white text-slate-400 transition-all hover:border-slate-300 hover:text-slate-600 lg:h-12 lg:w-12 lg:rounded-2xl {appState.showNotifications
						? 'border-blue-600/30 text-blue-600 shadow-lg shadow-blue-100'
						: ''}"
				>
					<span class="material-symbols-outlined text-[22px]">notifications</span>
					{#if appState.notifications.filter((n) => !n.read).length > 0}
						<span
							class="absolute top-2.5 right-2.5 flex h-2 w-2 lg:top-3 lg:right-3 lg:h-2.5 lg:w-2.5"
						>
							<span
								class="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75"
							></span>
							<span
								class="relative inline-flex h-2 w-2 rounded-full border-2 border-white bg-blue-600 shadow-lg shadow-blue-500/50 lg:h-2.5 lg:w-2.5"
							></span>
						</span>
					{/if}
				</button>
			</div>

			{#if currentUser}
				<div class="relative">
					<button
						onclick={toggleUserDropdown}
						class="group flex items-center gap-3 transition-all active:scale-95 lg:gap-4"
					>
						<div class="xs:block relative hidden">
							<img
								src={currentUser.image || 'https://picsum.photos/100'}
								alt="Avatar"
								class="h-10 w-10 rounded-xl border-2 border-slate-100 object-cover shadow-sm transition-transform group-hover:scale-110 lg:h-12 lg:w-12 lg:rounded-[1.25rem]"
							/>
							<div
								class="absolute -right-1 -bottom-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500 shadow-lg lg:h-4 lg:w-4"
							></div>
						</div>
						<div
							class="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/60 bg-white text-slate-500 transition-all hover:border-slate-300 hover:bg-slate-50 lg:h-12 lg:w-12 lg:rounded-2xl"
						>
							<span
								class="material-symbols-outlined text-[20px] transition-transform {showUserDropdown
									? 'rotate-180'
									: ''}">expand_more</span
							>
						</div>
					</button>

					{#if showUserDropdown}
						<div
							class="absolute right-0 mt-3 w-64 origin-top-right overflow-hidden rounded-3xl border border-slate-200/60 bg-white/90 p-2 shadow-2xl backdrop-blur-xl"
							in:fly={{ y: 10, duration: 200 }}
							out:fade={{ duration: 150 }}
							onclick={(e) => e.stopPropagation()}
						>
							<!-- User Info Header -->
							<div class="mb-2 flex items-center gap-4 p-4 pb-2">
								<img
									src={currentUser.image || 'https://picsum.photos/100'}
									alt="Avatar"
									class="h-12 w-12 rounded-2xl object-cover shadow-sm"
								/>
								<div class="min-w-0 flex-1">
									<p class="truncate text-xs font-black tracking-tight text-slate-900 uppercase">
										{currentUser.name}
									</p>
									<p class="truncate text-[9px] font-bold tracking-widest text-blue-600 uppercase">
										{currentUser.role?.replace('_', ' ') || 'Procurement'}
									</p>
								</div>
							</div>

							<div class="h-px w-full bg-slate-100"></div>

							<!-- Menu Items -->
							<div class="mt-2 space-y-1">
								<a
									href="/profile"
									onclick={closeUserDropdown}
									class="group flex items-center gap-3 rounded-2xl p-3 text-slate-600 transition-all hover:bg-slate-50 hover:text-blue-600"
								>
									<div
										class="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 transition-all group-hover:bg-blue-100 group-hover:text-blue-600"
									>
										<span class="material-symbols-outlined text-sm">person</span>
									</div>
									<span class="text-[10px] font-black tracking-widest uppercase">My Profile</span>
								</a>

								<button
									onclick={() => {
										closeUserDropdown();
										showLogoutModal = true;
									}}
									class="group flex w-full items-center gap-3 rounded-2xl p-3 text-rose-500 transition-all hover:bg-rose-50"
								>
									<div
										class="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-100 transition-all group-hover:bg-rose-500 group-hover:text-white"
									>
										<span class="material-symbols-outlined text-sm">logout</span>
									</div>
									<span class="text-[10px] font-black tracking-widest uppercase">Sign Out</span>
								</button>
							</div>
						</div>
					{/if}
				</div>
			{:else}
				<a
					href="/auth"
					class="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-[9px] font-black tracking-widest text-white uppercase shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-500 hover:shadow-blue-500/40 active:scale-95 lg:gap-3 lg:rounded-2xl lg:px-6 lg:py-3 lg:text-[10px]"
				>
					<span class="material-symbols-outlined text-xs lg:text-sm">login</span>
					Sign In
				</a>
			{/if}
		</div>
	</div>
</header>

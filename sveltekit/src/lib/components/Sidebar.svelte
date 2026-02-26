<script lang="ts">
	import { appState } from '$lib/state.svelte';
	import { page } from '$app/state';
	import { afterNavigate } from '$app/navigation';
	import { fade } from 'svelte/transition';
	import { Shield, LayoutGrid, Briefcase, Users, FileText, Compass, User } from '@lucide/svelte';

	const navItems = $derived([
		{
			id: 'explore',
			label: appState.t.sidebar.explore,
			icon: Compass,
			roles: [
				'SUPER_ADMIN',
				'ADMIN_PROCUREMENT',
				'USER_PROCUREMENT',
				'MANUFACT_PROCUREMENT',
				'GUEST'
			]
		},
		{
			id: 'dashboard',
			label: appState.t.sidebar.dashboard,
			icon: LayoutGrid,
			roles: ['SUPER_ADMIN', 'ADMIN_PROCUREMENT', 'USER_PROCUREMENT']
		},
		{
			id: 'procurements',
			label: appState.t.sidebar.procurements,
			icon: Briefcase,
			roles: ['SUPER_ADMIN', 'ADMIN_PROCUREMENT', 'USER_PROCUREMENT']
		},
		{
			id: 'users',
			label: appState.t.sidebar.users,
			icon: Users,
			roles: ['SUPER_ADMIN', 'ADMIN_PROCUREMENT']
		},
		{
			id: 'submissions',
			label: appState.t.sidebar.submissions,
			icon: FileText,
			roles: ['SUPER_ADMIN', 'ADMIN_PROCUREMENT', 'USER_PROCUREMENT']
		}
	]);

	const currentRole = $derived(appState.currentUser?.role || 'GUEST');
	const visibleItems = $derived(navItems.filter((item) => item.roles.includes(currentRole as any)));

	const activePath = $derived(page.url.pathname.split('/')[1] || '');

	function handleRoleSwitch(e: Event) {
		const target = e.target as HTMLSelectElement;
		console.log('Switching to user:', target.value);
	}

	afterNavigate(() => {
		if (window.innerWidth < 1024) {
			appState.sidebarCollapsed = true;
		}
	});
</script>

{#if !appState.sidebarCollapsed}
	<button
		onclick={() => appState.toggleSidebar()}
		class="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm transition-opacity lg:hidden"
		aria-label="Close sidebar"
		transition:fade={{ duration: 200 }}
	></button>
{/if}

<aside
	class="fixed inset-y-0 left-0 z-50 flex flex-col overflow-hidden border-r border-slate-800/60 bg-slate-950 text-white transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] lg:relative {appState.sidebarCollapsed
		? '-translate-x-full lg:w-20 lg:translate-x-0'
		: 'w-72 translate-x-0'}"
>
	<!-- Logo Area -->
	<div class="mb-2 p-6 {appState.sidebarCollapsed ? 'px-5' : 'px-8'}">
		<div class="flex items-center gap-4">
			<div
				class="relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-500/20"
			>
				<Shield size={20} strokeWidth={2.5} />
			</div>
			{#if !appState.sidebarCollapsed}
				<a href="/" class="flex flex-col whitespace-nowrap" transition:fade={{ duration: 200 }}>
					<h1 class="text-xl font-black tracking-tight text-white uppercase">SITAMPAN</h1>
					<div class="flex flex-col -space-y-0.5">
						<span class="text-[9px] font-bold tracking-widest text-slate-400 uppercase"
							>Sistem Informasi</span
						>
						<span class="text-[9px] font-bold tracking-widest text-slate-400 uppercase"
							>Tahapan & Pemasaran</span
						>
						<span class="text-[9px] font-bold tracking-widest text-blue-500 uppercase"
							>Nasional 2026</span
						>
					</div>
				</a>
			{/if}
		</div>
	</div>

	<!-- Navigation -->
	<nav class="flex-1 space-y-1.5 px-3 py-6">
		{#if !appState.sidebarCollapsed}
			<div class="mb-4 px-5 whitespace-nowrap" transition:fade={{ duration: 200 }}>
				<p class="text-[10px] font-bold tracking-widest text-slate-500 uppercase">
					{appState.t.sidebar.general}
				</p>
			</div>
		{/if}

		{#each visibleItems as item}
			<a
				href="/{item.id}"
				data-sveltekit-preload-data="hover"
				data-sveltekit-preload-code="hover"
				title={appState.sidebarCollapsed ? item.label : ''}
				class="group relative flex w-full items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200
                {activePath === item.id
					? 'bg-blue-600/10 text-blue-400'
					: 'text-slate-400 hover:bg-white/5 hover:text-slate-100'}"
			>
				<!-- Active Indicator Bar -->
				{#if activePath === item.id}
					<div
						class="absolute left-0 h-5 w-1 rounded-r-full bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.5)]"
					></div>
				{/if}

				<div
					class="flex-shrink-0 transition-all duration-200
                    {activePath === item.id
						? 'scale-110 text-blue-400'
						: 'text-slate-400 group-hover:scale-110 group-hover:text-slate-200'}"
				>
					<item.icon size={20} strokeWidth={2.5} />
				</div>

				{#if !appState.sidebarCollapsed}
					<span
						class="truncate tracking-tight whitespace-nowrap uppercase"
						transition:fade={{ duration: 200 }}>{item.label}</span
					>
					{#if activePath === item.id}
						<div class="ml-auto h-1 w-1 flex-shrink-0 rounded-full bg-blue-500"></div>
					{/if}
				{/if}
			</a>
		{/each}

		<!-- Mobile Only: Language & Role Switcher -->
		{#if !appState.sidebarCollapsed}
			<div class="mt-8 space-y-6 px-4 lg:hidden" transition:fade={{ duration: 200 }}>
				<div class="h-px w-full bg-slate-800"></div>

				<div class="space-y-3">
					<p class="px-1 text-[9px] font-bold tracking-widest text-slate-500 uppercase">
						{appState.t.sidebar.language}
					</p>
					<div
						class="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/50 p-1"
					>
						<button
							onclick={() => appState.setLanguage('ID')}
							class="flex-1 rounded-lg py-2 text-[10px] font-bold transition-all {appState.language ===
							'ID'
								? 'bg-slate-800 text-white shadow-sm'
								: 'text-slate-500 hover:text-slate-300'}"
						>
							ID
						</button>
						<button
							onclick={() => appState.setLanguage('EN')}
							class="flex-1 rounded-lg py-2 text-[10px] font-bold transition-all {appState.language ===
							'EN'
								? 'bg-slate-800 text-white shadow-sm'
								: 'text-slate-500 hover:text-slate-300'}"
						>
							EN
						</button>
					</div>
				</div>

				{#if appState.currentUser?.role === 'SUPER_ADMIN'}
					<div class="space-y-3">
						<p class="px-1 text-[9px] font-bold tracking-widest text-slate-500 uppercase">
							{appState.t.sidebar.authority}
						</p>
						<div class="rounded-xl border border-slate-800 bg-slate-900/50 px-3 py-2">
							<select
								class="w-full cursor-pointer border-none bg-transparent text-[10px] font-bold tracking-widest text-slate-300 uppercase outline-none focus:ring-0"
								onchange={handleRoleSwitch}
							>
								{#if appState.currentUser}
									<option value="current"
										>{appState.currentUser.role?.replace('_', ' ') || 'USER'}</option
									>
								{/if}
								<option value="1">SUPER ADMIN</option>
								<option value="2">PROCUREMENT</option>
							</select>
						</div>
					</div>
				{/if}
			</div>
		{/if}
	</nav>

	<!-- User Profile Section -->
	<div class="mt-auto border-t border-slate-800 p-4">
		<div
			class="flex items-center gap-3 rounded-xl p-2 transition-all hover:bg-white/5 {appState.sidebarCollapsed
				? 'justify-center px-0'
				: ''}"
		>
			<div
				class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-slate-800 text-slate-400 ring-1 ring-slate-700"
			>
				<User size={18} strokeWidth={2.5} />
			</div>
			{#if !appState.sidebarCollapsed}
				<div
					class="flex flex-col overflow-hidden whitespace-nowrap"
					transition:fade={{ duration: 200 }}
				>
					<span class="truncate text-[11px] font-bold text-slate-100 uppercase"
						>{currentRole.replace('_', ' ')}</span
					>
					<div class="flex items-center gap-1.5">
						<div class="h-1 w-1 rounded-full bg-emerald-500"></div>
						<span class="text-[9px] font-bold tracking-tight text-slate-500 uppercase"
							>{appState.t.sidebar.verifiedAccount}</span
						>
					</div>
				</div>
			{/if}
		</div>
	</div>
</aside>

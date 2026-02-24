<script lang="ts">
	import { appState } from '$lib/state.svelte';
	import { page } from '$app/state';
	import { fade } from 'svelte/transition';

	const navItems = $derived([
		{
			id: 'dashboard',
			label: appState.t.sidebar.dashboard,
			icon: 'grid_view',
			roles: ['SUPER_ADMIN', 'ADMIN_PROCUREMENT', 'USER_PROCUREMENT']
		},
		{
			id: 'explore',
			label: appState.t.sidebar.explore,
			icon: 'explore',
			roles: [
				'SUPER_ADMIN',
				'ADMIN_PROCUREMENT',
				'USER_PROCUREMENT',
				'MANUFACT_PROCUREMENT',
				'GUEST'
			]
		},
		{
			id: 'procurements',
			label: appState.t.sidebar.procurements,
			icon: 'work',
			roles: ['SUPER_ADMIN', 'ADMIN_PROCUREMENT', 'USER_PROCUREMENT']
		},
		{
			id: 'users',
			label: appState.t.sidebar.users,
			icon: 'group',
			roles: ['SUPER_ADMIN', 'ADMIN_PROCUREMENT']
		},
		{
			id: 'submissions',
			label: appState.t.sidebar.submissions,
			icon: 'edit_document',
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
	class="fixed inset-y-0 left-0 z-50 flex flex-col overflow-hidden border-r border-white/5 bg-slate-950/90 text-white backdrop-blur-2xl transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] lg:relative lg:bg-slate-950/80 {appState.sidebarCollapsed
		? '-translate-x-full lg:w-20 lg:translate-x-0'
		: 'w-72 translate-x-0'}"
>
	<!-- Logo Area -->
	<div class="mb-2 p-6 {appState.sidebarCollapsed ? 'px-4' : 'px-8'}">
		<div class="flex items-center gap-4">
			<div
				class="to-azure-600 relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 shadow-lg shadow-blue-500/30"
			>
				<span class="material-symbols-outlined text-xl text-white">deployed_code</span>
				<div
					class="absolute inset-0 rounded-xl bg-white/10 transition-opacity group-hover:opacity-0"
				></div>
			</div>
			{#if !appState.sidebarCollapsed}
				<a href="/" class="flex flex-col whitespace-nowrap" transition:fade={{ duration: 200 }}>
					<h1 class="text-xl font-black tracking-tighter text-white">BM2026</h1>
					<span class="text-[10px] font-bold tracking-[0.2em] text-blue-400/80 uppercase"
						>Business Matching</span
					>
				</a>
			{/if}
		</div>
	</div>

	<!-- Navigation -->
	<nav class="flex-1 space-y-1.5 px-3 py-4">
		{#if !appState.sidebarCollapsed}
			<div class="mb-4 px-5 whitespace-nowrap" transition:fade={{ duration: 200 }}>
				<p class="text-[10px] font-black tracking-[0.2em] text-slate-500 uppercase">
					{appState.t.sidebar.general}
				</p>
			</div>
		{/if}

		{#each visibleItems as item}
			<a
				href="/{item.id}"
				data-sveltekit-preload-data="hover"
				data-sveltekit-preload-code="hover"
				onclick={() => {
					if (window.innerWidth < 1024) {
						appState.sidebarCollapsed = true;
					}
				}}
				title={appState.sidebarCollapsed ? item.label : ''}
				class="group relative flex w-full items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-bold transition-all duration-300
                {activePath === item.id
					? 'bg-blue-500/10 text-blue-400 shadow-[inset_0_0_20px_rgba(99,102,241,0.05)]'
					: 'text-slate-400 hover:bg-white/5 hover:text-slate-100'}"
			>
				<!-- Active Indicator Bar -->
				{#if activePath === item.id}
					<div class="absolute left-0 h-5 w-1 rounded-r-full bg-blue-500"></div>
				{/if}

				<span
					class="material-symbols-outlined flex-shrink-0 text-[22px] transition-all duration-300
                    {activePath === item.id
						? 'scale-110 text-blue-400 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]'
						: 'group-hover:scale-110 group-hover:text-slate-200'}"
				>
					{item.icon}
				</span>

				{#if !appState.sidebarCollapsed}
					<span
						class="truncate tracking-tight whitespace-nowrap"
						transition:fade={{ duration: 200 }}>{item.label}</span
					>
					{#if activePath === item.id}
						<div
							class="ml-auto h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500/50 shadow-[0_0_8px_rgba(99,102,241,0.4)]"
						></div>
					{/if}
				{/if}
			</a>
		{/each}

		<!-- Mobile Only: Language & Role Switcher -->
		{#if !appState.sidebarCollapsed}
			<div class="mt-4 space-y-4 px-2 lg:hidden" transition:fade={{ duration: 200 }}>
				<div class="h-px w-full bg-white/10"></div>

				<div class="space-y-2">
					<p class="px-3 text-[9px] font-black tracking-widest text-slate-500 uppercase">
						{appState.t.sidebar.language}
					</p>
					<div class="flex items-center gap-2 rounded-xl bg-white/5 p-1">
						<button
							onclick={() => appState.setLanguage('ID')}
							class="flex-1 rounded-lg py-2 text-[10px] font-black transition-all {appState.language ===
							'ID'
								? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20'
								: 'text-slate-400 hover:text-slate-200'}"
						>
							ID
						</button>
						<button
							onclick={() => appState.setLanguage('EN')}
							class="flex-1 rounded-lg py-2 text-[10px] font-black transition-all {appState.language ===
							'EN'
								? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20'
								: 'text-slate-400 hover:text-slate-200'}"
						>
							EN
						</button>
					</div>
				</div>

				{#if appState.currentUser?.role === 'SUPER_ADMIN'}
					<div class="space-y-2">
						<p class="px-3 text-[9px] font-black tracking-widest text-slate-500 uppercase">
							{appState.t.sidebar.authority}
						</p>
						<div class="rounded-xl bg-white/5 px-2 py-1">
							<select
								class="w-full cursor-pointer border-none bg-transparent text-[10px] font-black tracking-widest text-slate-200 uppercase outline-none focus:ring-0"
								onchange={handleRoleSwitch}
							>
								{#if appState.currentUser}
									<option value="current"
										>{appState.currentUser.name?.toUpperCase()} / {appState.currentUser.role?.toUpperCase() ||
											'USER'}</option
									>
								{/if}
								<option value="1">Admin / SUPER ADMIN</option>
								<option value="2">Sarah / PROCUREMENT</option>
							</select>
						</div>
					</div>
				{/if}
			</div>
		{/if}
	</nav>

	<!-- User Profile / Session Area -->
	<div class="mt-auto p-4">
		<div
			class="group relative overflow-hidden rounded-2xl border border-white/5 bg-white/[0.03] p-4 transition-all hover:bg-white/[0.05] {appState.sidebarCollapsed
				? 'px-2'
				: ''}"
		>
			{#if !appState.sidebarCollapsed}
				<div
					class="mb-3 flex items-center justify-between whitespace-nowrap"
					transition:fade={{ duration: 200 }}
				>
					<p class="text-[9px] font-black tracking-widest text-slate-500 uppercase">
						{appState.t.sidebar.activeSession}
					</p>
					<div class="flex h-1.5 w-1.5 items-center justify-center">
						<div class="absolute h-1.5 w-1.5 animate-ping rounded-full bg-emerald-500/40"></div>
						<div class="h-1.5 w-1.5 rounded-full bg-emerald-500"></div>
					</div>
				</div>
			{/if}

			<div class="flex items-center gap-3">
				<div
					class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-slate-800 text-slate-300 ring-1 ring-white/10"
				>
					<span class="material-symbols-outlined text-lg">person</span>
				</div>
				{#if !appState.sidebarCollapsed}
					<div
						class="flex flex-col overflow-hidden whitespace-nowrap"
						transition:fade={{ duration: 200 }}
					>
						<span class="truncate text-[11px] font-black text-slate-100 uppercase"
							>{currentRole.replace('_', ' ')}</span
						>
						<span class="text-[9px] font-bold text-slate-500"
							>{appState.t.sidebar.verifiedAccount}</span
						>
					</div>
				{/if}
			</div>
		</div>
	</div>
</aside>

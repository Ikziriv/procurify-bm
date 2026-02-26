<script lang="ts">
	import { appState } from '$lib/state.svelte';
	import { formatDate } from '$lib/utils/date';
	import { fade, fly } from 'svelte/transition';
	import type { PageData } from './$types';
	import type { ProcurementWithDetails } from '$lib/server/db/schema';
	import { createMutation, useQueryClient } from '@tanstack/svelte-query';
	import Drawer from '$lib/components/Drawer.svelte';

	let { data }: { data: PageData } = $props();
	const t = $derived(appState.t.procurement);
	const procurement = $derived(data.procurement) as unknown as ProcurementWithDetails;
	const creator = $derived(data.creator);
	const queryClient = useQueryClient();

	const isAuthenticated = $derived(!!appState.currentUser);

	let showModal = $state(false);
	let drawerOpen = $state(false);
	let formData = $state({
		companyName: '',
		companyDescription: '',
		items: [] as any[]
	});

	const userProfile = $derived(data.userProfile);
	const isProfileIncomplete = $derived(
		!userProfile?.companyProfile?.companyName || !userProfile?.companyProfile?.description
	);

	let hasSharedProfile = $state(data.hasSharedProfile);

	const completionPercentage = $derived.by(() => {
		if (!userProfile) return 0;
		const fields = [
			userProfile.name,
			userProfile.phone,
			userProfile.companyProfile?.companyName,
			userProfile.companyProfile?.nib,
			userProfile.companyProfile?.website,
			userProfile.companyProfile?.foundedYear,
			userProfile.companyProfile?.employeeCount,
			userProfile.companyProfile?.provinceId,
			userProfile.companyProfile?.regencyId,
			userProfile.companyProfile?.description,
			userProfile.companyProfile?.address
		];
		const filled = fields.filter((f) => f !== null && f !== undefined && f !== '').length;
		return Math.round((filled / fields.length) * 100);
	});

	function openModal() {
		formData = {
			companyName: userProfile?.companyProfile?.companyName || '',
			companyDescription: userProfile?.companyProfile?.description || '',
			items: procurement.items.map((i: any) => ({
				procurementItemId: i.id,
				name: i.name,
				offeredPrice: '',
				specification: ''
			}))
		};
		showModal = true;
	}

	const submitProposal = createMutation(() => ({
		mutationFn: async (payload: any) => {
			const res = await fetch('/api/submissions', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ ...payload, procurementId: procurement.id })
			});
			if (!res.ok) throw new Error('Failed to submit proposal');
			return res.json();
		},
		onSuccess: () => {
			showModal = false;
			appState.addToast(appState.t.general.success, t.submitSuccess, 'SUCCESS');
			queryClient.invalidateQueries({ queryKey: ['procurement', procurement.id] });
		},
		onError: (error) => {
			appState.addToast(appState.t.general.error, error.message || t.submitError, 'ERROR');
		}
	}));

	function handleSubmit(e: Event) {
		e.preventDefault();
		submitProposal.mutate(formData);
	}

	const shareProfile = createMutation(() => ({
		mutationFn: async () => {
			const res = await fetch('/api/profile/share', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					adminId: procurement.createdBy,
					procurementId: procurement.id
				})
			});
			if (!res.ok) throw new Error('Failed to share profile');
			return res.json();
		},
		onSuccess: () => {
			appState.addToast('Sukses', appState.t.vendorProfile.shareSuccess, 'SUCCESS');
			hasSharedProfile = true;
		},
		onError: (error) => {
			appState.addToast('Gagal', error.message || 'Gagal membagikan profil.', 'ERROR');
		}
	}));

	// Meta info for the detail page
	const metaStats = $derived([
		{ label: t.type, value: t.enterpriseProcurement, icon: 'category', color: 'blue' },
		{ label: t.budgetRange, value: procurement.budget, icon: 'payments', color: 'emerald' },
		{ label: t.deadline, value: formatDate(procurement.deadline), icon: 'event', color: 'amber' },
		{
			label: 'Location',
			value: `${procurement.regency?.name || ''}, ${procurement.province?.name || ''}`,
			icon: 'location_on',
			color: 'rose'
		},
		{ label: t.labelStatus, value: procurement.status, icon: 'stars', color: 'indigo' }
	]);

	function formatRupiah(value: string | number) {
		const number = typeof value === 'string' ? value.replace(/[^0-9]/g, '') : value.toString();
		if (!number) return '';
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			minimumFractionDigits: 0
		}).format(parseInt(number));
	}

	function handlePriceInput(e: Event, index: number) {
		const input = e.target as HTMLInputElement;
		const rawValue = input.value.replace(/[^0-9]/g, '');
		formData.items[index].offeredPrice = rawValue;
		input.value = formatRupiah(rawValue);
	}
</script>

<div class="mx-auto max-w-7xl px-4 py-12 lg:px-8" in:fade={{ duration: 800 }}>
	<!-- Breadcrumb -->
	<nav
		class="mb-12 flex items-center gap-2 text-xs font-black tracking-widest text-slate-400 uppercase"
	>
		<a href="/" class="transition-colors hover:text-blue-600">{t.home}</a>
		<span class="material-symbols-outlined text-[10px]">chevron_right</span>
		<a href="/#feed" class="transition-colors hover:text-blue-600">{t.list}</a>
		<span class="material-symbols-outlined text-[10px]">chevron_right</span>
		<span class="text-slate-900">{procurement.id.slice(0, 8)}</span>
	</nav>

	<div class="grid grid-cols-1 gap-16 lg:grid-cols-12">
		<!-- Main Content -->
		<div class="lg:col-span-12">
			<header
				class="relative mb-16 flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-end"
			>
				<div class="max-w-4xl space-y-6">
					<div class="flex flex-wrap items-center gap-3" in:fly={{ y: 10, duration: 600 }}>
						<div
							class="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[10px] font-black tracking-[0.2em] uppercase transition-all
								{procurement.status === 'OPEN'
								? 'border-blue-200 bg-blue-50/50 text-blue-600 shadow-sm shadow-blue-100/50'
								: 'border-slate-200 bg-slate-50 text-slate-400'}"
						>
							<span class="material-symbols-outlined text-[14px]">
								{procurement.status === 'OPEN' ? 'verified' : 'pause_circle'}
							</span>
							{procurement.status === 'OPEN' ? t.active : t.paused}
						</div>

						{#if procurement.isPdn}
							<div
								class="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50/50 px-4 py-1.5 text-[10px] font-black tracking-[0.2em] text-emerald-600 uppercase shadow-sm shadow-emerald-100/50 transition-all"
							>
								<span class="material-symbols-outlined text-[14px]">workspace_premium</span>
								PDN
							</div>
						{/if}

						{#if procurement.isTkdn}
							<div
								class="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50/50 px-4 py-1.5 text-[10px] font-black tracking-[0.2em] text-indigo-600 uppercase shadow-sm shadow-indigo-100/50 transition-all"
							>
								<span class="material-symbols-outlined text-[14px]">fact_check</span>
								TKDN {procurement.tkdnPercentage}%
							</div>
						{/if}
					</div>

					<h1
						class="text-5xl leading-[1.1] font-black tracking-tight text-slate-900 uppercase lg:text-6xl"
						in:fly={{ y: 20, duration: 600, delay: 100 }}
					>
						{procurement.title}
					</h1>
				</div>
			</header>

			<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4" in:fade={{ delay: 300 }}>
				{#each metaStats as stat}
					<div
						class="group relative overflow-hidden rounded-[2rem] border border-slate-200/60 bg-white/40 p-8 transition-all hover:border-slate-300 hover:bg-white hover:shadow-2xl hover:shadow-slate-200/50"
					>
						<div class="relative z-10 flex flex-col gap-5">
							<div
								class="flex h-12 w-12 items-center justify-center rounded-2xl ring-1 transition-all ring-inset group-hover:scale-110
									{stat.color === 'blue' ? 'bg-blue-50 text-blue-600 ring-blue-500/20' : ''}
									{stat.color === 'emerald' ? 'bg-emerald-50 text-emerald-600 ring-emerald-500/20' : ''}
									{stat.color === 'amber' ? 'bg-amber-50 text-amber-600 ring-amber-500/20' : ''}
									{stat.color === 'indigo' ? 'bg-indigo-50 text-indigo-600 ring-indigo-500/20' : ''}"
							>
								<span class="material-symbols-outlined text-2xl">{stat.icon}</span>
							</div>
							<div class="space-y-1">
								<span
									class="block text-[10px] font-black tracking-[0.25em] text-slate-400 uppercase"
								>
									{stat.label}
								</span>
								<p class="text-sm font-black text-slate-900 uppercase">
									{stat.value}
								</p>
							</div>
						</div>

						<!-- Decorative background element -->
						<div
							class="absolute -right-4 -bottom-4 translate-x-4 translate-y-4 opacity-[0.03] transition-transform group-hover:translate-x-0 group-hover:translate-y-0"
						>
							<span class="material-symbols-outlined text-8xl">{stat.icon}</span>
						</div>
					</div>
				{/each}
			</div>

			<div class="flex w-full shrink-0 flex-col items-center gap-4 py-4 md:flex-row md:py-8">
				<a
					href="/api/procurements/{procurement.id}/download"
					class="group flex h-16 w-full items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-6 text-[10px] font-black tracking-[0.3em] text-slate-900 uppercase transition-all hover:border-slate-300 hover:bg-slate-50 active:scale-95 sm:h-20 sm:px-8"
					download
				>
					<span
						class="material-symbols-outlined text-lg transition-transform group-hover:-translate-y-1"
						>download</span
					>
					{t.downloadPdf}
				</a>

				<button
					onclick={() => (drawerOpen = true)}
					class="group flex h-16 w-full items-center justify-between gap-4 rounded-2xl bg-slate-900 px-8 text-xs font-black tracking-[0.3em] text-white uppercase shadow-2xl shadow-slate-900/20 transition-all hover:bg-black active:scale-95 sm:h-20 sm:px-12"
				>
					{t.takeAction}
					<span
						class="material-symbols-outlined text-lg transition-transform group-hover:translate-x-1"
						>arrow_forward</span
					>
				</button>
			</div>

			<article class="prose mt-8 max-w-none prose-slate" in:fade={{ delay: 500 }}>
				<div class="flex items-center gap-4">
					<div class="h-10 w-1.5 rounded-full bg-blue-600"></div>
					<h3 class="text-3xl font-black tracking-tight text-slate-900 uppercase">
						{t.projectOverview}
					</h3>
				</div>
				<p class="mt-8 text-lg leading-[1.8] font-medium text-slate-600">
					{procurement.description}
				</p>

				{#if procurement.province || procurement.regency || procurement.location}
					<div
						class="mt-12 space-y-4 rounded-[2rem] border border-slate-100 bg-slate-50/50 p-8 transition-all hover:bg-slate-50"
					>
						<div class="flex items-center gap-3">
							<div
								class="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600"
							>
								<span class="material-symbols-outlined text-xl">location_on</span>
							</div>
							<h4 class="text-sm font-black tracking-[0.15em] text-slate-900 uppercase">
								{t.labelLocation || 'Location Information'}
							</h4>
						</div>
						<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
							{#if procurement.province}
								<div class="space-y-1">
									<p class="text-[10px] font-black tracking-widest text-slate-400 uppercase">
										{appState.t.profile.province}
									</p>
									<p class="text-sm font-black text-slate-900">{procurement.province.name}</p>
								</div>
							{/if}
							{#if procurement.regency}
								<div class="space-y-1">
									<p class="text-[10px] font-black tracking-widest text-slate-400 uppercase">
										{appState.t.profile.regency}
									</p>
									<p class="text-sm font-black text-slate-900">{procurement.regency.name}</p>
								</div>
							{/if}
							{#if procurement.location}
								<div class="space-y-1 lg:col-span-1">
									<p class="text-[10px] font-black tracking-widest text-slate-400 uppercase">
										{appState.t.profile.address}
									</p>
									<p class="text-sm font-medium text-slate-600">{procurement.location}</p>
								</div>
							{/if}
						</div>
					</div>
				{/if}

				<div
					class="mt-16 overflow-hidden rounded-[3rem] border border-slate-200/60 bg-white shadow-2xl shadow-slate-200/40 transition-all hover:shadow-slate-300/50"
				>
					<div class="border-b border-slate-100 bg-slate-50/50 p-10">
						<div class="flex items-center justify-between">
							<div class="space-y-2">
								<h4 class="text-lg font-black tracking-[0.1em] text-slate-900 uppercase">
									{t.lineItemDetails}
								</h4>
								<p class="text-sm font-bold tracking-wide text-slate-400">
									{t.lineItemSubtitle}
								</p>
							</div>
							<div
								class="flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-white text-slate-900 shadow-sm ring-1 ring-slate-200 transition-transform ring-inset hover:scale-110"
							>
								<span class="material-symbols-outlined text-2xl">inventory_2</span>
							</div>
						</div>
					</div>

					<div class="overflow-x-auto">
						<table class="w-full text-left">
							<thead>
								<tr class="bg-slate-50/30">
									<th
										class="px-10 py-6 text-[10px] font-black tracking-[0.25em] text-slate-400 uppercase"
										>{t.itemSpec}</th
									>
									<th
										class="w-32 px-10 py-6 text-[10px] font-black tracking-[0.25em] text-slate-400 uppercase"
										>{t.qtyUnit}</th
									>
									<th
										class="w-56 px-10 py-6 text-right text-[10px] font-black tracking-[0.25em] text-slate-400 uppercase"
										>{t.estimatedCost}</th
									>
								</tr>
							</thead>
							<tbody class="divide-y divide-slate-100">
								{#each procurement.items as item}
									<tr class="group transition-colors hover:bg-slate-50/30">
										<td class="px-10 py-8">
											<div class="flex flex-col gap-3">
												<div class="flex items-center gap-3">
													<span class="text-base font-black text-slate-900 uppercase">
														{item.name}
													</span>
													<div class="flex gap-2">
														{#if item.isPdn}
															<span
																class="inline-flex items-center rounded-lg border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-[9px] font-black tracking-[0.15em] text-emerald-600 uppercase shadow-sm shadow-emerald-50"
																>PDN</span
															>
														{/if}
														{#if item.isTkdn}
															<span
																class="inline-flex items-center rounded-lg border border-blue-100 bg-blue-50 px-2.5 py-1 text-[9px] font-black tracking-[0.15em] text-blue-600 uppercase shadow-sm shadow-blue-50"
																>TKDN {item.tkdnPercentage}%</span
															>
														{/if}
													</div>
												</div>
												{#if item.description}
													<p class="max-w-2xl text-xs leading-relaxed font-bold text-slate-400">
														{item.description}
													</p>
												{/if}
											</div>
										</td>
										<td class="px-10 py-8 align-top">
											<div class="flex flex-col gap-1">
												<span class="text-sm font-black text-slate-900">
													{item.quantity}
												</span>
												<span
													class="text-[10px] font-black tracking-[0.1em] text-slate-400 uppercase"
												>
													{item.unit}
												</span>
											</div>
										</td>
										<td class="px-10 py-8 text-right align-top">
											<div class="inline-flex flex-col items-end gap-1">
												<span class="text-sm font-black text-slate-900">
													{item.estimatedPrice || t.priceNA}
												</span>
												<span
													class="text-[10px] font-black tracking-[0.1em] text-slate-400 uppercase"
												>
													{t.estPriceLabel}
												</span>
											</div>
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				</div>

				<!-- General Requirements Section -->
				<div
					class="mt-8 overflow-hidden rounded-[2.5rem] border border-blue-100 bg-blue-50/30 p-10 transition-all hover:bg-blue-50/50"
				>
					<div class="mb-8 flex items-center gap-4">
						<div
							class="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600"
						>
							<span class="material-symbols-outlined text-xl">gavel</span>
						</div>
						<h4 class="text-sm font-black tracking-[0.15em] text-blue-900 uppercase">
							{appState.t.generalRequirements.title}
						</h4>
					</div>
					<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
						{#each procurement.rules as rule}
							<div
								class="group flex items-start gap-4 rounded-2xl bg-white/60 p-5 shadow-sm ring-1 ring-blue-100/50 transition-all hover:bg-white hover:shadow-md"
							>
								<span
									class="material-symbols-outlined shrink-0 text-lg font-black text-blue-500 transition-transform group-hover:scale-110"
									>check_circle</span
								>
								<span class="text-sm leading-relaxed font-bold text-blue-900/80">{rule.rule}</span>
							</div>
						{/each}
					</div>
				</div>
			</article>
		</div>

		<Drawer open={drawerOpen} onClose={() => (drawerOpen = false)} title={t.actions}>
			<div class="space-y-12">
				<!-- Lead Info -->
				<div class="space-y-6">
					<h4 class="text-[10px] font-black tracking-[0.3em] text-slate-400 uppercase">
						{t.lead}
					</h4>
					<div class="flex items-center gap-5">
						<img
							src={creator?.avatar || 'https://i.pravatar.cc/150'}
							alt={creator?.name}
							class="h-20 w-20 rounded-3xl object-cover shadow-2xl shadow-slate-200"
						/>
						<div>
							<h5 class="text-base font-black text-slate-900 uppercase">
								{creator?.name || 'Admin'}
							</h5>
							<p class="text-xs font-bold text-slate-400 uppercase">
								{creator?.governmentProfile?.institutionName || 'Procurify Dept'}
							</p>
						</div>
					</div>
				</div>

				<div class="h-px bg-slate-100"></div>

				<!-- CTA -->
				{#if isAuthenticated}
					<div class="space-y-8">
						<div class="rounded-3xl bg-blue-50/50 p-8">
							<p class="text-xs leading-relaxed font-bold text-blue-900">
								{t.authMessage}
							</p>
						</div>
						<button
							onclick={() => {
								drawerOpen = false;
								openModal();
							}}
							class="group flex w-full items-center justify-center gap-4 rounded-3xl bg-blue-600 py-8 text-xs font-black tracking-[0.3em] text-white uppercase shadow-2xl shadow-blue-600/40 transition-all hover:bg-blue-700 hover:shadow-blue-700/50 active:scale-95"
						>
							{t.submitProposal}
							<span
								class="material-symbols-outlined text-sm transition-transform group-hover:translate-x-1"
								>send</span
							>
						</button>

						{#if appState.currentUser?.role === 'USER_PROCUREMENT'}
							<button
								onclick={() => shareProfile.mutate()}
								disabled={shareProfile.isPending || hasSharedProfile}
								class="flex w-full items-center justify-center gap-4 rounded-3xl border-2 py-6 text-xs font-black tracking-[0.3em] uppercase transition-all active:scale-95 disabled:pointer-events-none {hasSharedProfile
									? 'border-emerald-200 bg-emerald-50 text-emerald-600'
									: 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50 disabled:opacity-50'}"
							>
								{#if shareProfile.isPending}
									{t.sharing}
								{:else if hasSharedProfile}
									{appState.t.vendorProfile.profileShared}
								{:else}
									{appState.t.vendorProfile.shareProfile}
								{/if}
								<span class="material-symbols-outlined text-sm"
									>{hasSharedProfile ? 'check_circle' : 'share'}</span
								>
							</button>
						{/if}
					</div>
				{:else}
					<div class="space-y-8">
						<div class="rounded-3xl bg-slate-50 p-8">
							<p class="text-xs leading-relaxed font-bold text-slate-500">
								{t.unauthMessage}
							</p>
						</div>
						<a
							href="/auth?callbackURL=/procurements/{data.procurement.id}"
							class="group flex w-full items-center justify-center gap-4 rounded-3xl bg-slate-900 py-8 text-xs font-black tracking-[0.3em] text-white uppercase shadow-2xl transition-all hover:bg-black active:scale-95"
						>
							{t.applyNow}
							<span
								class="material-symbols-outlined text-sm transition-transform group-hover:translate-x-1"
								>login</span
							>
						</a>
					</div>
				{/if}

				<div class="rounded-2xl border border-slate-100 bg-slate-50/50 p-6">
					<p class="text-center text-[9px] font-black tracking-widest text-slate-400 uppercase">
						{t.refId} <br />
						<span class="mt-1 block text-slate-600">{procurement.id}</span>
					</p>
				</div>
			</div>
		</Drawer>

		<!-- Sticky Mobile/Small Screen Trigger -->
		<div class="fixed bottom-8 left-1/2 z-40 -translate-x-1/2 lg:hidden">
			<button
				onclick={() => (drawerOpen = true)}
				class="flex items-center gap-3 rounded-full bg-slate-900 px-8 py-5 text-[10px] font-black tracking-[0.3em] text-white uppercase shadow-2xl shadow-slate-900/40 transition-all hover:scale-105 active:scale-95"
			>
				{t.actionsBtn}
				<div class="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-400"></div>
			</button>
		</div>
	</div>
</div>

{#if showModal}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
		in:fade
		out:fade
	>
		<div
			class="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl"
			in:fly={{ y: 20, duration: 300 }}
		>
			<div class="flex items-center justify-between border-b border-slate-100 p-6 md:p-8">
				<div>
					<h3 class="text-2xl font-black tracking-tight text-slate-900">{t.submitProposal}</h3>
					<p class="mt-2 text-xs font-bold tracking-widest text-slate-400 uppercase">
						{t.submitSubtitle}
					</p>
				</div>
				<button
					onclick={() => (showModal = false)}
					class="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
				>
					<span class="material-symbols-outlined">close</span>
				</button>
			</div>

			{#if isProfileIncomplete && !appState.profileNotificationDismissed}
				<div
					class="mx-6 flex flex-col items-start gap-4 rounded-2xl border p-4 py-6 md:mx-8 md:flex-row md:items-center {completionPercentage >=
					70
						? 'border-emerald-100 bg-emerald-50'
						: 'border-amber-100 bg-amber-50'}"
					in:fly={{ y: -10 }}
				>
					<div
						class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl font-black {completionPercentage >=
						70
							? 'bg-emerald-100 text-emerald-600'
							: 'bg-amber-100 text-amber-600'}"
					>
						<div class="relative flex h-full w-full items-center justify-center">
							<svg class="h-10 w-10 -rotate-90">
								<circle
									cx="20"
									cy="20"
									r="16"
									stroke="currentColor"
									stroke-width="3"
									fill="transparent"
									class="opacity-20"
								/>
								<circle
									cx="20"
									cy="20"
									r="16"
									stroke="currentColor"
									stroke-width="3"
									fill="transparent"
									stroke-dasharray="100.5"
									stroke-dashoffset={100.5 - (100.5 * completionPercentage) / 100}
									class="transition-all duration-1000"
								/>
							</svg>
							<span class="absolute text-[10px]">{completionPercentage}%</span>
						</div>
					</div>
					<div class="flex-1">
						<div class="flex items-center gap-2">
							<span
								class="text-[10px] font-black tracking-widest uppercase {completionPercentage >= 70
									? 'text-emerald-600'
									: 'text-amber-600'}"
							>
								{appState.t.profile.completion}
							</span>
						</div>
						<p
							class="mt-0.5 text-xs leading-relaxed font-bold {completionPercentage >= 70
								? 'text-emerald-900'
								: 'text-amber-900'}"
						>
							{appState.t.procurement.incompleteProfile}
						</p>
					</div>
					<div class="flex items-center gap-2">
						<button
							onclick={() => appState.dismissProfileNotification()}
							class="rounded-xl px-4 py-2 text-[10px] font-black tracking-widest whitespace-nowrap uppercase transition-all active:scale-95 {completionPercentage >=
							70
								? 'text-emerald-600 hover:bg-emerald-100/50'
								: 'text-amber-600 hover:bg-amber-100/50'}"
						>
							{appState.t.procurement.dismiss}
						</button>
						<a
							href="/profile"
							class="rounded-xl px-4 py-2 text-[10px] font-black tracking-widest whitespace-nowrap text-white uppercase transition-all active:scale-95 {completionPercentage >=
							70
								? 'bg-emerald-600 hover:bg-emerald-700'
								: 'bg-amber-600 hover:bg-amber-700'}"
						>
							{appState.t.procurement.completeProfileBtn}
						</a>
					</div>
				</div>
			{/if}

			<form onsubmit={handleSubmit} class="max-h-[70vh] space-y-6 overflow-y-auto p-6 md:p-8">
				<div class="space-y-4">
					<div>
						<label
							for="companyName"
							class="mb-2 block text-[10px] font-black tracking-widest text-slate-400 uppercase"
							>{t.companyName}</label
						>
						<input
							id="companyName"
							type="text"
							bind:value={formData.companyName}
							required
							class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-800 transition-all outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
							placeholder={t.placeholderTitle}
						/>
					</div>
					<div>
						<label
							for="companyDescription"
							class="mb-2 block text-[10px] font-black tracking-widest text-slate-400 uppercase"
							>{t.companyDesc}</label
						>
						<textarea
							id="companyDescription"
							bind:value={formData.companyDescription}
							required
							rows="3"
							class="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-600 transition-all outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
							placeholder={t.companyDescPlaceholder}
						></textarea>
					</div>

					{#if formData.items.length > 0}
						<div>
							<h4 class="mt-6 mb-4 text-sm font-black tracking-widest text-slate-900 uppercase">
								{t.lineItemBids}
							</h4>
							<div class="space-y-4">
								{#each formData.items as item, i}
									<div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
										<p class="mb-3 text-xs font-black text-slate-900 uppercase">{item.name}</p>
										<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
											<div>
												<label
													for="offeredPrice-{item.procurementItemId}"
													class="mb-2 block text-[10px] font-black tracking-widest text-slate-400 uppercase"
													>{t.offeredPrice}</label
												>
												<input
													id="offeredPrice-{item.procurementItemId}"
													type="text"
													required
													value={formatRupiah(item.offeredPrice)}
													oninput={(e) => handlePriceInput(e, item.procurementItemId)}
													class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-800 transition-all outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
													placeholder="Rp 0"
												/>
											</div>
											<div>
												<label
													for="spec-{item.procurementItemId}"
													class="mb-2 block text-[10px] font-black tracking-widest text-slate-400 uppercase"
													>{t.specLinkNotes}</label
												>
												<input
													id="spec-{item.procurementItemId}"
													type="text"
													bind:value={item.specification}
													class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-600 transition-all outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
													placeholder={t.specPlaceholder}
												/>
											</div>
										</div>
									</div>
								{/each}
							</div>
						</div>
					{/if}
				</div>

				<div class="flex items-center gap-3 border-t border-slate-100 pt-4">
					<button
						type="button"
						onclick={() => (showModal = false)}
						class="flex-1 cursor-pointer rounded-2xl border border-slate-200/60 bg-white py-4 text-xs font-black tracking-widest text-slate-600 uppercase transition-all hover:bg-slate-50 hover:text-slate-900 active:scale-95 disabled:opacity-50"
					>
						{t.cancel}
					</button>
					<button
						type="submit"
						disabled={submitProposal.isPending}
						class="relative flex-1 cursor-pointer overflow-hidden rounded-2xl bg-blue-600 py-4 text-center text-xs font-black tracking-widest text-white uppercase shadow-lg shadow-blue-500/20 transition-all hover:bg-blue-500 hover:shadow-blue-500/40 active:scale-95 disabled:opacity-50"
					>
						{#if submitProposal.isPending}
							{t.submitting}
						{:else}
							{t.confirmProposal}
						{/if}
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

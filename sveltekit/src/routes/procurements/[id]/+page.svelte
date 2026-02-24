<script lang="ts">
	import { appState } from '$lib/state.svelte';
	import { formatDate } from '$lib/utils/date';
	import { fade, fly, slide } from 'svelte/transition';
	import type { PageData } from './$types';
	import type { ProcurementWithDetails } from '$lib/server/db/schema';
	import { createMutation, useQueryClient } from '@tanstack/svelte-query';
	import Drawer from '$lib/components/Drawer.svelte';

	let { data }: { data: PageData } = $props();
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
			items: procurement.items.map((i) => ({
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
			appState.addToast('Sukses', 'Proposal Anda berhasil disubmit untuk dievaluasi.', 'SUCCESS');
			queryClient.invalidateQueries({ queryKey: ['procurement', procurement.id] });
		},
		onError: (error) => {
			appState.addToast('Gagal', error.message || 'Gagal mengirim proposal.', 'ERROR');
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
		{ label: 'Type', value: 'Enterprise Procurement', icon: 'category' },
		{ label: 'Budget Range', value: procurement.budget, icon: 'payments' },
		{ label: 'Deadline', value: formatDate(procurement.deadline), icon: 'event' },
		{ label: 'Status', value: procurement.status, icon: 'stars' }
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
		<a href="/" class="transition-colors hover:text-blue-600">Home</a>
		<span class="material-symbols-outlined text-[10px]">chevron_right</span>
		<a href="/#feed" class="transition-colors hover:text-blue-600">Procurements</a>
		<span class="material-symbols-outlined text-[10px]">chevron_right</span>
		<span class="text-slate-900">{procurement.id.slice(0, 8)}</span>
	</nav>

	<div class="grid grid-cols-1 gap-16 lg:grid-cols-12">
		<!-- Main Content -->
		<div class="lg:col-span-12">
			<header
				class="mb-12 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center"
			>
				<div class="space-y-4">
					<div class="flex flex-wrap items-center gap-3" in:fly={{ y: 10, duration: 600 }}>
						<div
							class="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[10px] font-black tracking-[0.2em] uppercase transition-colors
								{procurement.status === 'OPEN'
								? 'border-blue-100 bg-blue-50/50 text-blue-600'
								: 'border-slate-200 bg-slate-50 text-slate-400'}"
						>
							<span class="material-symbols-outlined text-xs">
								{procurement.status === 'OPEN' ? 'verified' : 'pause_circle'}
							</span>
							{procurement.status === 'OPEN' ? 'Active Tender' : 'Tender Paused'}
						</div>

						{#if procurement.isPdn}
							<div
								class="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[10px] font-black tracking-[0.2em] uppercase transition-colors
									{procurement.status === 'OPEN'
									? 'border-emerald-100 bg-emerald-50 text-emerald-600'
									: 'border-slate-200 bg-slate-50 text-slate-400'}"
							>
								<span class="material-symbols-outlined text-xs">workspace_premium</span>
								PDN
							</div>
						{/if}

						{#if procurement.isTkdn}
							<div
								class="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[10px] font-black tracking-[0.2em] uppercase transition-colors
									{procurement.status === 'OPEN'
									? 'border-indigo-100 bg-indigo-50 text-indigo-600'
									: 'border-slate-200 bg-slate-50 text-slate-400'}"
							>
								<span class="material-symbols-outlined text-xs">fact_check</span>
								TKDN {procurement.tkdnPercentage}%
							</div>
						{/if}
					</div>
					<h1
						class="text-4xl font-black tracking-tight text-slate-900 lg:text-7xl"
						in:fly={{ y: 20, duration: 600, delay: 100 }}
					>
						{procurement.title}
					</h1>
				</div>

				<button
					onclick={() => (drawerOpen = true)}
					class="group flex items-center gap-3 rounded-2xl bg-slate-900 px-8 py-5 text-xs font-black tracking-[0.3em] text-white uppercase shadow-xl shadow-slate-900/20 transition-all hover:bg-black active:scale-95"
				>
					Take Action
					<span
						class="material-symbols-outlined text-sm transition-transform group-hover:translate-x-1"
						>arrow_forward</span
					>
				</button>
			</header>

			<div
				class="grid grid-cols-2 gap-8 border-y border-slate-100 py-12 md:grid-cols-4"
				in:fade={{ delay: 300 }}
			>
				{#each metaStats as stat}
					<div class="space-y-1">
						<span
							class="flex items-center gap-1.5 text-[10px] font-black tracking-widest text-slate-400 uppercase"
						>
							<span class="material-symbols-outlined text-sm">{stat.icon}</span>
							{stat.label}
						</span>
						<p class="text-sm font-black text-slate-900 uppercase">{stat.value}</p>
					</div>
				{/each}
			</div>

			<article
				class="prose mt-12 max-w-none font-medium text-slate-600 prose-slate"
				in:fade={{ delay: 500 }}
			>
				<h3 class="text-xl font-bold text-slate-900">Project Overview</h3>
				<p class="leading-relaxed">
					{procurement.description}
				</p>

				<div
					class="mt-8 rounded-[2.5rem] border border-slate-200/60 bg-white/60 p-8 shadow-sm ring-1 ring-slate-200/50 backdrop-blur-xl"
				>
					<div class="mb-8 flex items-center justify-between">
						<div>
							<h4 class="text-sm font-black tracking-[0.2em] text-slate-900 uppercase">
								Line Item Details
							</h4>
							<p class="mt-2 text-xs font-semibold tracking-wide text-slate-500">
								Rincian spesifikasi barang atau jasa
							</p>
						</div>
						<div
							class="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 ring-1 ring-slate-200/50 ring-inset"
						>
							<span class="material-symbols-outlined">inventory_2</span>
						</div>
					</div>

					<div
						class="overflow-hidden rounded-3xl border border-slate-200/60 bg-white shadow-sm ring-1 ring-black/[0.03]"
					>
						<table class="w-full text-left text-xs">
							<thead>
								<tr class="border-b border-slate-200/60 bg-slate-50/80">
									<th
										class="px-6 py-4 text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase"
										>Item</th
									>
									<th
										class="w-24 px-6 py-4 text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase"
										>Qty</th
									>
									<th
										class="w-24 px-6 py-4 text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase"
										>Unit</th
									>
									<th
										class="w-48 px-6 py-4 text-right text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase"
										>Estimasi Biaya</th
									>
								</tr>
							</thead>
							<tbody class="divide-y divide-slate-100/80 font-bold text-slate-600">
								{#each procurement.items as item}
									<tr class="group transition-colors hover:bg-slate-50/50">
										<td class="px-6 py-5">
											<div class="flex items-center gap-3">
												<div class="font-black tracking-widest text-slate-900 uppercase">
													{item.name}
												</div>
												<div
													class="flex gap-1.5 opacity-80 transition-opacity group-hover:opacity-100"
												>
													{#if item.isPdn}
														<span
															class="inline-flex items-center rounded-lg bg-emerald-50 px-2 py-1 text-[9px] font-black tracking-widest text-emerald-600 uppercase ring-1 ring-emerald-500/20 ring-inset"
															>PDN</span
														>
													{/if}
													{#if item.isTkdn}
														<span
															class="inline-flex items-center rounded-lg bg-blue-50 px-2.5 py-1 text-[9px] font-black tracking-widest text-blue-600 uppercase ring-1 ring-blue-500/20 ring-inset"
															>TKDN {item.tkdnPercentage}%</span
														>
													{/if}
												</div>
											</div>
											{#if item.description}
												<div
													class="mt-2 max-w-lg text-[11px] leading-relaxed font-semibold text-slate-500"
												>
													{item.description}
												</div>
											{/if}
										</td>
										<td class="px-6 py-5 align-top">
											<span
												class="inline-flex h-8 min-w-8 items-center justify-center rounded-xl bg-slate-100/80 px-2.5 text-xs font-black text-slate-700 ring-1 ring-slate-200/50 ring-inset"
											>
												{item.quantity}
											</span>
										</td>
										<td class="px-6 py-5 align-top">
											<span class="text-xs font-black tracking-widest text-slate-500 uppercase"
												>{item.unit}</span
											>
										</td>
										<td class="px-6 py-5 text-right align-top font-black text-slate-900">
											{#if item.estimatedPrice}
												<div
													class="inline-flex items-center rounded-xl bg-slate-50 px-3 py-1.5 text-xs ring-1 ring-slate-200/60 transition-colors ring-inset group-hover:bg-white group-hover:shadow-sm"
												>
													{item.estimatedPrice}
												</div>
											{:else}
												<span class="text-slate-400 italic">N/A</span>
											{/if}
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				</div>

				<div class="mt-8 rounded-[2rem] border border-blue-100/50 bg-blue-50/30 p-8">
					<h4 class="mb-4 text-sm font-black tracking-widest text-blue-900 uppercase">
						{appState.t.generalRequirements.title}
					</h4>
					<ul class="space-y-3 font-bold text-blue-900/70">
						{#each procurement.rules as rule}
							<li class="flex items-start gap-4">
								<span
									class="material-symbols-outlined mt-1 text-[10px] font-black text-blue-500 transition-transform group-hover:scale-110"
									>check_circle</span
								>
								<span class="leading-relaxed">{rule.rule}</span>
							</li>
						{/each}
					</ul>
				</div>
			</article>
		</div>

		<Drawer open={drawerOpen} onClose={() => (drawerOpen = false)} title="Procurement Actions">
			<div class="space-y-12">
				<!-- Lead Info -->
				<div class="space-y-6">
					<h4 class="text-[10px] font-black tracking-[0.3em] text-slate-400 uppercase">
						Procurement Lead
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
								You are authenticated. You can now submit your formal proposal for this procurement.
							</p>
						</div>
						<button
							onclick={() => {
								drawerOpen = false;
								openModal();
							}}
							class="group flex w-full items-center justify-center gap-4 rounded-3xl bg-blue-600 py-8 text-xs font-black tracking-[0.3em] text-white uppercase shadow-2xl shadow-blue-600/40 transition-all hover:bg-blue-700 hover:shadow-blue-700/50 active:scale-95"
						>
							Submit Proposal
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
									Sharing...
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
								To participate in this tender and submit a proposal, you must first secure your
								account.
							</p>
						</div>
						<a
							href="/auth?callbackURL=/procurements/{data.procurement.id}"
							class="group flex w-full items-center justify-center gap-4 rounded-3xl bg-slate-900 py-8 text-xs font-black tracking-[0.3em] text-white uppercase shadow-2xl transition-all hover:bg-black active:scale-95"
						>
							Apply Now
							<span
								class="material-symbols-outlined text-sm transition-transform group-hover:translate-x-1"
								>login</span
							>
						</a>
					</div>
				{/if}

				<div class="rounded-2xl border border-slate-100 bg-slate-50/50 p-6">
					<p class="text-center text-[9px] font-black tracking-widest text-slate-400 uppercase">
						Official Reference ID <br />
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
				Actions
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
					<h3 class="text-2xl font-black tracking-tight text-slate-900">Submit Proposal</h3>
					<p class="mt-2 text-xs font-bold tracking-widest text-slate-400 uppercase">
						Fill in your company details and item pricing
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
							>Company Name</label
						>
						<input
							id="companyName"
							type="text"
							bind:value={formData.companyName}
							required
							class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-800 transition-all outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
							placeholder="E.g. PT Maju Bersama"
						/>
					</div>
					<div>
						<label
							for="companyDescription"
							class="mb-2 block text-[10px] font-black tracking-widest text-slate-400 uppercase"
							>Company Description / Proposal Summary</label
						>
						<textarea
							id="companyDescription"
							bind:value={formData.companyDescription}
							required
							rows="3"
							class="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-600 transition-all outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
							placeholder="Provide details about your company and why you are the best fit..."
						></textarea>
					</div>

					{#if formData.items.length > 0}
						<div>
							<h4 class="mt-6 mb-4 text-sm font-black tracking-widest text-slate-900 uppercase">
								Line Item Bids
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
													>Offered Price</label
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
													>Specification Link/Notes</label
												>
												<input
													id="spec-{item.procurementItemId}"
													type="text"
													bind:value={item.specification}
													class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-600 transition-all outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
													placeholder="Drive link or specifications..."
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
						Cancel
					</button>
					<button
						type="submit"
						disabled={submitProposal.isPending}
						class="relative flex-1 cursor-pointer overflow-hidden rounded-2xl bg-blue-600 py-4 text-center text-xs font-black tracking-widest text-white uppercase shadow-lg shadow-blue-500/20 transition-all hover:bg-blue-500 hover:shadow-blue-500/40 active:scale-95 disabled:opacity-50"
					>
						{#if submitProposal.isPending}
							Submitting...
						{:else}
							Confirm Proposal
						{/if}
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<script lang="ts">
	import BMNAutocomplete from '$lib/components/BMNAutocomplete.svelte';
	import MasterDataAutocomplete from '$lib/components/MasterDataAutocomplete.svelte';
	import { appState } from '$lib/state.svelte';
	import { formatDate } from '$lib/utils/date';
	import { createQuery, createMutation, useQueryClient } from '@tanstack/svelte-query';
	import { fade, fly, slide } from 'svelte/transition';

	let { data, form }: { data: any; form: any } = $props();
	const t = $derived(appState.t.procurement);
	const queryClient = useQueryClient();
	const currentUser = $derived(appState.currentUser);

	const isGov = $derived(
		currentUser?.role === 'ADMIN_PROCUREMENT' || currentUser?.role === 'SUPER_ADMIN'
	);

	// Fetch procurements
	const procurementsQuery = createQuery(() => ({
		queryKey: ['procurements'],
		queryFn: async () => {
			const res = await fetch('/api/procurements');
			const data = await res.json();
			if (!res.ok) throw new Error(data.error);
			return data.procurements;
		}
	}));

	// Create mutation
	const createProcurement = createMutation(() => ({
		mutationFn: async (newProcurement: any) => {
			const res = await fetch('/api/procurements', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(newProcurement)
			});
			if (!res.ok) throw new Error('Failed to create procurement');
			return res.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['procurements'] });
			showModal = false;
			resetForm();
		}
	}));

	// Update mutation
	const updateProcurement = createMutation(() => ({
		mutationFn: async (updatedProcurement: any) => {
			const res = await fetch('/api/procurements', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(updatedProcurement)
			});
			if (!res.ok) throw new Error('Failed to update procurement');
			return res.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['procurements'] });
			showModal = false;
			resetForm();
		}
	}));

	// Delete mutation
	const deleteProcurement = createMutation(() => ({
		mutationFn: async (id: string) => {
			const res = await fetch(`/api/procurements?id=${id}`, {
				method: 'DELETE'
			});
			if (!res.ok) throw new Error('Failed to delete procurement');
			return res.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['procurements'] });
		}
	}));

	// Form State
	let showModal = $state(false);
	let isEditing = $state(false);
	let viewMode = $state<'grid' | 'list'>('grid');
	let formData = $state({
		id: '',
		title: '',
		description: '',
		budget: '',
		deadline: '',
		status: 'OPEN',
		provinceId: '',
		regencyId: '',
		location: '',
		currency: 'IDR', // Added currency
		bmnId: '', // Added bmnId
		kbliId: '',
		kbkiId: '',
		basId: ''
	});

	const filteredRegencies = $derived(
		data.regencies?.filter((r: any) => r.provinceId === formData.provinceId) || []
	);

	// Reset regency if province changes
	$effect(() => {
		if (formData.provinceId) {
			const regency = data.regencies?.find((r: any) => r.id === formData.regencyId);
			if (regency && regency.provinceId !== formData.provinceId) {
				formData.regencyId = '';
			}
		}
	});

	function resetForm() {
		formData = {
			id: '',
			title: '',
			description: '',
			budget: '',
			deadline: '',
			status: 'OPEN',
			provinceId: '',
			regencyId: '',
			location: '',
			currency: 'IDR', // Added currency
			bmnId: '', // Added bmnId
			kbliId: '',
			kbkiId: '',
			basId: ''
		};
		isEditing = false;
	}

	function handleEdit(procurement: any) {
		formData = {
			...procurement,
			currency: procurement.currency || 'IDR',
			location: procurement.location || '',
			bmnId: procurement.bmnId || '',
			kbliId: procurement.kblis?.[0]?.kbliId || '',
			kbkiId: procurement.kbkis?.[0]?.kbkiId || '',
			basId: procurement.basId || ''
		};
		isEditing = true;
		showModal = true;
	}

	function handleSubmit(e: Event) {
		e.preventDefault();
		if (isEditing) {
			updateProcurement.mutate(formData);
		} else {
			createProcurement.mutate(formData);
		}
	}

	function handleDelete(id: string) {
		if (confirm(t.deleteConfirm)) {
			deleteProcurement.mutate(id);
		}
	}
</script>

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
					<h3 class="text-2xl font-black tracking-tight text-slate-900">
						{isEditing ? t.editTitle : t.createTitle}
					</h3>
					<p class="mt-2 text-xs font-bold tracking-widest text-slate-400 uppercase">
						{t.formSubtitle}
					</p>
				</div>
				<button
					onclick={() => (showModal = false)}
					class="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
				>
					<span class="material-symbols-outlined">close</span>
				</button>
			</div>

			<form onsubmit={handleSubmit} class="space-y-6 p-6 md:p-8">
				<div class="space-y-4">
					<div>
						<label
							for="procurement-title"
							class="mb-2 block text-[10px] font-black tracking-widest text-slate-400 uppercase"
							>{t.labelTitle}</label
						>
						<input
							id="procurement-title"
							type="text"
							bind:value={formData.title}
							required
							class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-800 transition-all outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
							placeholder={t.placeholderTitle}
						/>
					</div>
					<div>
						<label
							for="procurement-desc"
							class="mb-2 block text-[10px] font-black tracking-widest text-slate-400 uppercase"
							>{t.labelDesc}</label
						>
						<textarea
							id="procurement-desc"
							bind:value={formData.description}
							rows="3"
							class="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-600 transition-all outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
							placeholder={t.placeholderDesc}
						></textarea>
					</div>
					<div class="space-y-4 rounded-3xl border border-slate-100 bg-slate-50/50 p-6">
						<div class="flex items-center gap-2">
							<span class="material-symbols-outlined text-blue-600">location_on</span>
							<h4 class="text-xs font-black tracking-widest text-slate-900 uppercase">
								{t.labelLocation || 'Location Details'}
							</h4>
						</div>

						<div class="grid grid-cols-2 gap-4">
							<div class="space-y-2">
								<label
									for="provinceId"
									class="text-[10px] font-black tracking-widest text-slate-400 uppercase"
								>
									{appState.t.profile.province}
								</label>
								<select
									id="provinceId"
									bind:value={formData.provinceId}
									class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-800 transition-all outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
								>
									<option value="">Select Province</option>
									{#each data.provinces || [] as province}
										<option value={province.id}>{province.name}</option>
									{/each}
								</select>
							</div>

							<div class="space-y-2">
								<label
									for="regencyId"
									class="text-[10px] font-black tracking-widest text-slate-400 uppercase"
								>
									{appState.t.profile.regency}
								</label>
								<select
									id="regencyId"
									bind:value={formData.regencyId}
									disabled={!formData.provinceId}
									class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-800 transition-all outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:opacity-50"
								>
									<option value="">Select Regency</option>
									{#each filteredRegencies as regency}
										<option value={regency.id}>{regency.name}</option>
									{/each}
								</select>
							</div>
						</div>

						<!-- BMN Autocomplete -->
						<div class="space-y-4">
							<BMNAutocomplete
								bind:value={formData.bmnId}
								label={t.labelBmn}
								placeholder={t.placeholderBmn}
								class="w-full"
							/>
						</div>

						{#if data.enableAdvancedDetailData}
							<div
								class="grid grid-cols-1 gap-4 rounded-2xl border border-slate-100 bg-white/50 p-4"
								transition:slide
							>
								<MasterDataAutocomplete
									type="kbli"
									bind:value={formData.kbliId}
									label="KBLI"
									placeholder="Search KBLI..."
								/>
								<MasterDataAutocomplete
									type="kbki"
									bind:value={formData.kbkiId}
									label="KBKI"
									placeholder="Search KBKI..."
								/>
								<MasterDataAutocomplete
									type="bas"
									bind:value={formData.basId}
									label="BAS"
									placeholder="Search BAS..."
								/>
							</div>
						{/if}

						<div class="flex h-auto w-full flex-col"></div>

						<div class="space-y-2">
							<label
								for="procurement-location"
								class="text-[10px] font-black tracking-widest text-slate-400 uppercase"
							>
								{appState.t.profile.address}
							</label>
							<textarea
								id="procurement-location"
								bind:value={formData.location}
								rows="2"
								class="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-600 transition-all outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
								placeholder="Enter specific address or room details"
							></textarea>
						</div>
					</div>
					{#if isEditing}
						<div>
							<label
								for="procurement-status"
								class="mb-2 block text-[10px] font-black tracking-widest text-slate-400 uppercase"
								>{t.labelStatus}</label
							>
							<select
								id="procurement-status"
								bind:value={formData.status}
								class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-800 uppercase transition-all outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
							>
								<option value="OPEN">{t.statusOpen}</option>
								<option value="CLOSED">{t.statusClosed}</option>
								<option value="DRAFT">{t.statusDraft}</option>
							</select>
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
						disabled={createProcurement.isPending || updateProcurement.isPending}
						class="relative flex-1 cursor-pointer overflow-hidden rounded-2xl bg-blue-600 py-4 text-center text-xs font-black tracking-widest text-white uppercase shadow-lg shadow-blue-500/20 transition-all hover:bg-blue-500 hover:shadow-blue-500/40 active:scale-95 disabled:opacity-50"
					>
						{#if createProcurement.isPending || updateProcurement.isPending}
							{t.processing}
						{:else}
							{isEditing ? t.saveChanges : t.publishNow}
						{/if}
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<div class="space-y-12">
	<header
		class="flex flex-col justify-between gap-8 border-b border-slate-200 pb-12 md:flex-row md:items-end"
	>
		<div class="space-y-2">
			<h2 class="text-4xl font-black tracking-tight text-slate-900">{t.title}</h2>
			<p class="font-medium text-slate-400">{t.subtitle}</p>
		</div>
		<div class="flex items-center gap-4">
			<div class="flex items-center rounded-2xl bg-slate-100 p-1">
				<button
					onclick={() => (viewMode = 'grid')}
					class="flex h-10 w-10 items-center justify-center rounded-xl transition-all {viewMode ===
					'grid'
						? 'bg-white text-blue-600 shadow-sm'
						: 'text-slate-400 hover:text-slate-600'}"
				>
					<span class="material-symbols-outlined text-sm">grid_view</span>
				</button>
				<button
					onclick={() => (viewMode = 'list')}
					class="flex h-10 w-10 items-center justify-center rounded-xl transition-all {viewMode ===
					'list'
						? 'bg-white text-blue-600 shadow-sm'
						: 'text-slate-400 hover:text-slate-600'}"
				>
					<span class="material-symbols-outlined text-sm">format_list_bulleted</span>
				</button>
			</div>
			{#if currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'ADMIN_PROCUREMENT'}
				<button
					onclick={() => {
						resetForm();
						showModal = true;
					}}
					class="flex items-center gap-3 rounded-2xl bg-blue-600 px-8 py-4 text-xs font-black tracking-widest text-white uppercase shadow-xl shadow-blue-500/20 transition-all hover:bg-blue-500 active:scale-95"
				>
					<span class="material-symbols-outlined text-lg">add_circle</span>
					{t.publish}
				</button>
			{/if}
		</div>
	</header>

	{#if procurementsQuery.isLoading}
		<div class="flex items-center justify-center p-20">
			<div
				class="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"
			></div>
		</div>
	{:else if procurementsQuery.isError}
		<div class="rounded-3xl border border-rose-100 bg-rose-50 p-10 text-center">
			<span class="material-symbols-outlined mb-4 block text-4xl text-rose-500">error</span>
			<h3 class="text-lg font-black tracking-tight text-rose-900">{t.errorLoad}</h3>
			<p class="mt-2 text-sm text-rose-600">{procurementsQuery.error?.message}</p>
		</div>
	{:else if !procurementsQuery.data || procurementsQuery.data.length === 0}
		<div class="rounded-3xl border-2 border-dashed border-slate-200 p-20 text-center">
			<span class="material-symbols-outlined mb-6 block text-6xl text-slate-300">inbox</span>
			<h3 class="text-xl font-black tracking-tight text-slate-800">{t.noFound}</h3>
			<p class="mx-auto mt-2 max-w-sm font-medium text-slate-500">
				{t.noFoundDesc}
			</p>
		</div>
	{:else if viewMode === 'grid'}
		<div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
			{#each procurementsQuery.data as procurement (procurement.id)}
				<div
					in:fade={{ duration: 200 }}
					class="group flex flex-col justify-between rounded-[3rem] border border-slate-200/60 bg-white p-10 shadow-sm transition-all group-hover:border-blue-100 hover:shadow-2xl hover:shadow-blue-500/10"
				>
					<div class="space-y-6">
						<div class="flex items-start justify-between">
							<div
								class="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 transition-colors group-hover:bg-blue-50 group-hover:text-blue-600"
							>
								<span class="material-symbols-outlined text-4xl">inventory_2</span>
							</div>
							<span
								class="rounded-full px-4 py-1.5 text-[10px] font-black tracking-widest uppercase
									{procurement.status === 'OPEN'
									? 'bg-emerald-50 text-emerald-600'
									: procurement.status === 'CLOSED'
										? 'bg-rose-50 text-rose-600'
										: 'bg-amber-50 text-amber-600'}"
							>
								{procurement.status === 'OPEN'
									? t.statusOpen
									: procurement.status === 'CLOSED'
										? t.statusClosed
										: t.statusDraft}
							</span>
						</div>

						<div class="space-y-2">
							<h3 class="text-xl leading-tight font-black tracking-tight text-slate-900 uppercase">
								{procurement.title}
							</h3>
							<p class="line-clamp-2 text-sm font-medium text-slate-400">
								{procurement.description}
							</p>
						</div>

						<div class="grid grid-cols-1 gap-4">
							<div
								class="rounded-2xl border border-slate-100 bg-slate-50 p-4 transition-colors group-hover:border-slate-200 group-hover:bg-white"
							>
								<p class="mb-1 text-[9px] font-black tracking-widest text-slate-400 uppercase">
									{t.budget}
								</p>
								<p class="line-clamp-1 text-sm font-black tracking-tight text-slate-900">
									{procurement.budget}
								</p>
							</div>
							<div
								class="rounded-2xl border border-slate-100 bg-slate-50 p-4 transition-colors group-hover:border-slate-200 group-hover:bg-white"
							>
								<p class="mb-1 text-[9px] font-black tracking-widest text-slate-400 uppercase">
									{t.deadline}
								</p>
								<p class="text-sm font-black tracking-tight text-slate-900">
									{formatDate(procurement.deadline)}
								</p>
							</div>
							{#if procurement.regency || procurement.province}
								<div
									class="rounded-2xl border border-slate-100 bg-slate-50 p-4 transition-colors group-hover:border-slate-200 group-hover:bg-white"
								>
									<p class="mb-1 text-[9px] font-black tracking-widest text-slate-400 uppercase">
										Location
									</p>
									<p class="line-clamp-1 text-sm font-black tracking-tight text-slate-900">
										{procurement.regency?.name || ''}, {procurement.province?.name || ''}
									</p>
								</div>
							{/if}
						</div>
					</div>

					<div class="mt-10 flex gap-3">
						{#if currentUser?.role === 'SUPER_ADMIN' || (currentUser?.role === 'USER_PROCUREMENT' && currentUser?.id === procurement.createdBy)}
							<button
								onclick={() => handleEdit(procurement)}
								class="flex-1 cursor-pointer rounded-2xl bg-slate-50 py-4 text-[10px] font-black tracking-widest text-slate-500 uppercase transition-all hover:bg-slate-200 hover:text-slate-900 active:scale-95"
							>
								{t.edit}
							</button>
							<button
								onclick={() => handleDelete(procurement.id)}
								disabled={deleteProcurement.isPending}
								class="flex cursor-pointer items-center justify-center rounded-2xl bg-rose-50 px-6 py-4 text-[10px] font-black tracking-widest text-rose-600 uppercase transition-all hover:bg-rose-500 hover:text-white active:scale-95 disabled:opacity-50"
								title={t.delete}
							>
								<span class="material-symbols-outlined">delete</span>
							</button>
						{/if}
						<a
							href="/procurements/{procurement.id}"
							class="flex items-center justify-center rounded-2xl bg-blue-50 px-6 py-4 text-[10px] font-black tracking-widest text-blue-600 uppercase transition-all hover:bg-blue-600 hover:text-white active:scale-95"
						>
							<span class="material-symbols-outlined">chevron_right</span>
						</a>
					</div>
				</div>
			{/each}
		</div>
	{:else}
		<div
			class="overflow-hidden rounded-[3rem] border border-slate-200/60 bg-white shadow-sm"
			in:fade={{ duration: 200 }}
		>
			<div class="overflow-x-auto">
				<table class="w-full text-left text-sm whitespace-nowrap">
					<thead class="border-b border-slate-100 bg-slate-50/50">
						<tr>
							<th class="px-8 py-5 text-[10px] font-black tracking-widest text-slate-400 uppercase"
								>{t.tableTitleDesc}</th
							>
							<th class="px-8 py-5 text-[10px] font-black tracking-widest text-slate-400 uppercase"
								>{t.tableStatus}</th
							>
							<th class="px-8 py-5 text-[10px] font-black tracking-widest text-slate-400 uppercase"
								>{t.tableBudget}</th
							>
							<th class="px-8 py-5 text-[10px] font-black tracking-widest text-slate-400 uppercase"
								>{t.tableDeadline}</th
							>
							<th class="px-8 py-5 text-[10px] font-black tracking-widest text-slate-400 uppercase"
								>Location</th
							>
							<th
								class="px-8 py-5 text-right text-[10px] font-black tracking-widest text-slate-400 uppercase"
								>{t.tableActions}</th
							>
						</tr>
					</thead>
					<tbody class="divide-y divide-slate-100">
						{#each procurementsQuery.data as procurement (procurement.id)}
							<tr class="transition-colors hover:bg-slate-50/50">
								<td class="px-8 py-6">
									<div class="flex items-center gap-4">
										<div
											class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600"
										>
											<span class="material-symbols-outlined text-xl">inventory_2</span>
										</div>
										<div>
											<p class="font-black text-slate-900 uppercase">{procurement.title}</p>
											<p class="mt-1 w-64 truncate text-xs font-medium text-slate-400">
												{procurement.description}
											</p>
										</div>
									</div>
								</td>
								<td class="px-8 py-6">
									<span
										class="rounded-full px-4 py-1.5 text-[10px] font-black tracking-widest uppercase
											{procurement.status === 'OPEN'
											? 'bg-emerald-50 text-emerald-600'
											: procurement.status === 'CLOSED'
												? 'bg-rose-50 text-rose-600'
												: 'bg-amber-50 text-amber-600'}"
									>
										{procurement.status === 'OPEN'
											? t.statusOpen
											: procurement.status === 'CLOSED'
												? t.statusClosed
												: t.statusDraft}
									</span>
								</td>
								<td class="px-8 py-6 font-black text-slate-900">{procurement.budget}</td>
								<td class="px-8 py-6 font-medium text-slate-500">
									{formatDate(procurement.deadline)}
								</td>
								<td class="px-8 py-6 font-medium text-slate-500">
									{procurement.regency?.name || ''}, {procurement.province?.name || ''}
								</td>
								<td class="px-8 py-6 text-right">
									<div class="flex items-center justify-end gap-2">
										{#if currentUser?.role === 'SUPER_ADMIN' || (currentUser?.role === 'USER_PROCUREMENT' && currentUser?.id === procurement.createdBy)}
											<button
												onclick={() => handleEdit(procurement)}
												class="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-slate-50 text-slate-400 transition-all hover:bg-slate-200 hover:text-slate-900 active:scale-95"
												title={t.edit}
											>
												<span class="material-symbols-outlined text-sm">edit</span>
											</button>
											<button
												onclick={() => handleDelete(procurement.id)}
												disabled={deleteProcurement.isPending}
												class="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-rose-50 text-rose-500 transition-all hover:bg-rose-500 hover:text-white active:scale-95 disabled:opacity-50"
												title={t.delete}
											>
												<span class="material-symbols-outlined text-sm">delete</span>
											</button>
										{/if}
										<a
											href="/procurements/{procurement.id}"
											class="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-all hover:bg-blue-600 hover:text-white active:scale-95"
											title={t.viewDetails}
										>
											<span class="material-symbols-outlined text-sm">chevron_right</span>
										</a>
									</div>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	{/if}
</div>

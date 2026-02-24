<script lang="ts">
	import { enhance } from '$app/forms';
	import { appState } from '$lib/state.svelte';
	import { fade, fly } from 'svelte/transition';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	const user = $derived(data.profile);
	const isGov = $derived(user.role === 'ADMIN_PROCUREMENT' || user.role === 'SUPER_ADMIN');

	let success = $state(false);
	let selectedProvince = $state(user.companyProfile?.provinceId || '');
	let selectedRegency = $state(user.companyProfile?.regencyId || '');

	const filteredRegencies = $derived(
		data.regencies.filter((r) => r.provinceId === selectedProvince)
	);

	// Reset regency if province changes and current regency is not in the new province
	$effect(() => {
		if (selectedProvince && selectedRegency) {
			const regency = data.regencies.find((r) => r.id === selectedRegency);
			if (regency && regency.provinceId !== selectedProvince) {
				selectedRegency = '';
			}
		}
	});

	$effect(() => {
		if (form?.success) {
			success = true;
			const timer = setTimeout(() => (success = false), 3000);
			return () => clearTimeout(timer);
		}
	});
</script>

<div class="mx-auto max-w-4xl px-4 py-12 lg:px-8" in:fade={{ duration: 800 }}>
	<header class="mb-12">
		<h1 class="text-4xl font-black tracking-tight text-slate-900 lg:text-6xl">
			{appState.t.profile.title}
		</h1>
		<p class="mt-4 text-base font-medium text-slate-500">
			{appState.t.profile.subtitle}
		</p>
	</header>

	{#if success}
		<div
			class="mb-8 flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm font-bold text-emerald-600"
			in:fly={{ y: -10 }}
			out:fade
		>
			<span class="material-symbols-outlined">check_circle</span>
			{appState.t.profile.success}
		</div>
	{/if}

	<form method="POST" action="?/update" use:enhance class="space-y-8">
		<!-- Personal Info Section -->
		<section class="rounded-[2.5rem] border border-slate-100 bg-white p-8 shadow-sm lg:p-12">
			<div class="mb-10 flex items-center gap-4">
				<div
					class="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600"
				>
					<span class="material-symbols-outlined">person</span>
				</div>
				<h2 class="text-xl font-black tracking-tight text-slate-900 uppercase">
					{appState.t.profile.personalInfo}
				</h2>
			</div>

			<div class="grid grid-cols-1 gap-8 md:grid-cols-2">
				<div class="space-y-2">
					<label for="name" class="text-[10px] font-black tracking-widest text-slate-400 uppercase">
						{appState.t.profile.name}
					</label>
					<input
						id="name"
						name="name"
						type="text"
						value={user.name}
						required
						class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-6 py-4 text-sm font-bold text-slate-900 transition-all outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
					/>
				</div>

				<div class="space-y-2">
					<label
						for="phone"
						class="text-[10px] font-black tracking-widest text-slate-400 uppercase"
					>
						{appState.t.profile.phone}
					</label>
					<input
						id="phone"
						name="phone"
						type="tel"
						value={user.phone || ''}
						class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-6 py-4 text-sm font-bold text-slate-900 transition-all outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
					/>
				</div>

				<div class="space-y-2 md:col-span-2">
					<label
						for="email"
						class="text-[10px] font-black tracking-widest text-slate-400 uppercase"
					>
						{appState.t.profile.email}
					</label>
					<input
						id="email"
						type="email"
						value={user.email}
						disabled
						class="w-full cursor-not-allowed rounded-2xl border border-slate-200 bg-slate-100 px-6 py-4 text-sm font-bold text-slate-400"
					/>
					<p class="text-[10px] font-medium text-slate-400">
						Email addresses are managed through the identity provider.
					</p>
				</div>
			</div>
		</section>

		<!-- Role Specific Section -->
		<section class="rounded-[2.5rem] border border-slate-100 bg-white p-8 shadow-sm lg:p-12">
			{#if isGov}
				<div class="mb-10 flex items-center gap-4">
					<div
						class="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600"
					>
						<span class="material-symbols-outlined">account_balance</span>
					</div>
					<h2 class="text-xl font-black tracking-tight text-slate-900 uppercase">
						{appState.t.profile.govInfo}
					</h2>
				</div>

				<div class="grid grid-cols-1 gap-8 md:grid-cols-2">
					<div class="space-y-2 md:col-span-2">
						<label
							for="institutionName"
							class="text-[10px] font-black tracking-widest text-slate-400 uppercase"
						>
							{appState.t.profile.institutionName}
						</label>
						<input
							id="institutionName"
							name="institutionName"
							type="text"
							value={user.governmentProfile?.institutionName || ''}
							required
							class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-6 py-4 text-sm font-bold text-slate-900 transition-all outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
						/>
					</div>

					<div class="space-y-2">
						<label
							for="department"
							class="text-[10px] font-black tracking-widest text-slate-400 uppercase"
						>
							{appState.t.profile.department}
						</label>
						<input
							id="department"
							name="department"
							type="text"
							value={user.governmentProfile?.department || ''}
							class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-6 py-4 text-sm font-bold text-slate-900 transition-all outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
						/>
					</div>

					<div class="space-y-2">
						<label
							for="nip"
							class="text-[10px] font-black tracking-widest text-slate-400 uppercase"
						>
							{appState.t.profile.nip}
						</label>
						<input
							id="nip"
							name="nip"
							type="text"
							value={user.governmentProfile?.nip || ''}
							class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-6 py-4 text-sm font-bold text-slate-900 transition-all outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
						/>
					</div>
				</div>
			{:else}
				<div class="mb-10 flex items-center gap-4">
					<div
						class="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600"
					>
						<span class="material-symbols-outlined">corporate_fare</span>
					</div>
					<h2 class="text-xl font-black tracking-tight text-slate-900 uppercase">
						{appState.t.profile.companyInfo}
					</h2>
				</div>

				<div class="grid grid-cols-1 gap-8 md:grid-cols-2">
					<div class="space-y-2 md:col-span-2">
						<label
							for="companyName"
							class="text-[10px] font-black tracking-widest text-slate-400 uppercase"
						>
							{appState.t.profile.companyName}
						</label>
						<input
							id="companyName"
							name="companyName"
							type="text"
							value={user.companyProfile?.companyName || ''}
							required
							class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-6 py-4 text-sm font-bold text-slate-900 transition-all outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
						/>
					</div>

					<div class="space-y-2">
						<label
							for="nib"
							class="text-[10px] font-black tracking-widest text-slate-400 uppercase"
						>
							{appState.t.profile.nib}
						</label>
						<input
							id="nib"
							name="nib"
							type="text"
							value={user.companyProfile?.nib || ''}
							class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-6 py-4 text-sm font-bold text-slate-900 transition-all outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
						/>
					</div>

					<div class="space-y-2">
						<label
							for="website"
							class="text-[10px] font-black tracking-widest text-slate-400 uppercase"
						>
							{appState.t.profile.website}
						</label>
						<input
							id="website"
							name="website"
							type="url"
							value={user.companyProfile?.website || ''}
							placeholder="https://example.com"
							class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-6 py-4 text-sm font-bold text-slate-900 transition-all outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
						/>
					</div>

					<div class="space-y-2">
						<label
							for="foundedYear"
							class="text-[10px] font-black tracking-widest text-slate-400 uppercase"
						>
							{appState.t.profile.foundedYear}
						</label>
						<input
							id="foundedYear"
							name="foundedYear"
							type="number"
							min="1900"
							max={new Date().getFullYear()}
							value={user.companyProfile?.foundedYear || ''}
							class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-6 py-4 text-sm font-bold text-slate-900 transition-all outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
						/>
					</div>

					<div class="space-y-2">
						<label
							for="employeeCount"
							class="text-[10px] font-black tracking-widest text-slate-400 uppercase"
						>
							{appState.t.profile.employeeCount}
						</label>
						<input
							id="employeeCount"
							name="employeeCount"
							type="text"
							value={user.companyProfile?.employeeCount || ''}
							class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-6 py-4 text-sm font-bold text-slate-900 transition-all outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
						/>
					</div>

					<div class="space-y-2">
						<label
							for="provinceId"
							class="text-[10px] font-black tracking-widest text-slate-400 uppercase"
						>
							{appState.t.profile.province}
						</label>
						<select
							id="provinceId"
							name="provinceId"
							bind:value={selectedProvince}
							class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-6 py-4 text-sm font-bold text-slate-900 transition-all outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
						>
							<option value="">Select Province</option>
							{#each data.provinces as province}
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
							name="regencyId"
							bind:value={selectedRegency}
							disabled={!selectedProvince}
							class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-6 py-4 text-sm font-bold text-slate-900 transition-all outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-50"
						>
							<option value="">Select Regency</option>
							{#each filteredRegencies as regency}
								<option value={regency.id}>{regency.name}</option>
							{/each}
						</select>
					</div>

					<div class="space-y-2 md:col-span-2">
						<label
							for="description"
							class="text-[10px] font-black tracking-widest text-slate-400 uppercase"
						>
							{appState.t.profile.description}
						</label>
						<textarea
							id="description"
							name="description"
							rows="4"
							class="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-6 py-4 text-sm font-bold text-slate-900 transition-all outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
							>{user.companyProfile?.description || ''}</textarea
						>
					</div>

					<div class="space-y-2 md:col-span-2">
						<label
							for="address"
							class="text-[10px] font-black tracking-widest text-slate-400 uppercase"
						>
							{appState.t.profile.address}
						</label>
						<textarea
							id="address"
							name="address"
							rows="3"
							class="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-6 py-4 text-sm font-bold text-slate-900 transition-all outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
							>{user.companyProfile?.address || ''}</textarea
						>
					</div>
				</div>
			{/if}
		</section>

		<div class="flex justify-end">
			<button
				type="submit"
				class="group flex items-center gap-4 rounded-3xl bg-slate-900 px-12 py-6 text-xs font-black tracking-[0.3em] text-white uppercase shadow-2xl shadow-slate-900/40 transition-all hover:bg-black active:scale-95"
			>
				{appState.t.profile.save}
				<span
					class="material-symbols-outlined text-sm transition-transform group-hover:translate-x-1"
					>save</span
				>
			</button>
		</div>
	</form>
</div>

<script lang="ts">
	import { appState } from '$lib/state.svelte';
	import { fade, fly } from 'svelte/transition';
	import {
		X,
		Building2,
		Globe,
		MapPin,
		Mail,
		Phone,
		Calendar,
		Users,
		CheckCircle2,
		History
	} from '@lucide/svelte';

	let { isOpen = $bindable(false), vendorId } = $props<{
		isOpen: boolean;
		vendorId: string | null;
	}>();

	let loading = $state(false);
	let profileData = $state<any>(null);
	let error = $state<string | null>(null);

	$effect(() => {
		if (isOpen && vendorId) {
			fetchProfile();
		}
	});

	async function fetchProfile() {
		loading = true;
		error = null;
		try {
			const res = await fetch(`/api/profile/${vendorId}`);
			if (!res.ok) {
				const data = await res.json();
				throw new Error(data.error || 'Failed to fetch profile');
			}
			const data = await res.json();
			profileData = data.profile;
		} catch (e: any) {
			error = e.message;
		} finally {
			loading = false;
		}
	}

	const t = $derived(appState.t.vendorProfile);
	const pt = $derived(appState.t.profile);
</script>

{#if isOpen}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="fixed inset-0 z-50 flex items-center justify-end bg-black/40 backdrop-blur-sm"
		onclick={() => (isOpen = false)}
		transition:fade={{ duration: 200 }}
	>
		<div
			class="h-full w-full max-w-2xl overflow-y-auto bg-white shadow-2xl"
			onclick={(e) => e.stopPropagation()}
			transition:fly={{ x: 500, duration: 300 }}
		>
			<!-- Header -->
			<div class="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-6 py-4">
				<div>
					<h2 class="text-xl font-bold text-gray-900">{t.title}</h2>
					<p class="text-sm text-gray-500">{t.subtitle}</p>
				</div>
				<button
					onclick={() => (isOpen = false)}
					class="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
				>
					<X class="h-6 w-6" />
				</button>
			</div>

			<div class="p-6">
				{#if loading}
					<div class="flex h-64 items-center justify-center">
						<div
							class="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"
						></div>
					</div>
				{:else if error}
					<div class="rounded-lg bg-red-50 p-4 text-red-700">
						{error}
					</div>
				{:else if profileData}
					<!-- Profile Summary Card -->
					<div
						class="mb-8 rounded-xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-teal-50 p-6"
					>
						<div class="flex items-start gap-4">
							<div
								class="flex h-16 w-16 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-emerald-100"
							>
								<Building2 class="h-8 w-8 text-emerald-600" />
							</div>
							<div class="flex-1">
								<div class="flex items-center gap-2">
									<h3 class="text-2xl font-bold text-gray-900">
										{profileData.companyProfile?.companyName || profileData.name}
									</h3>
									<div
										class="flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold tracking-wider text-emerald-700 uppercase"
									>
										<CheckCircle2 class="h-3 w-3" />
										{t.verified}
									</div>
								</div>
								<p class="text-gray-600">{profileData.email}</p>
							</div>
						</div>
					</div>

					<!-- Company Details Grid -->
					<section class="mb-10">
						<h4
							class="mb-4 flex items-center gap-2 text-sm font-bold tracking-wider text-gray-400 uppercase"
						>
							<Building2 class="h-4 w-4" />
							{t.companyDetails}
						</h4>
						<div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
							<div class="space-y-4">
								<div class="flex items-center gap-3 text-gray-700">
									<Globe class="h-5 w-5 text-gray-400" />
									<a
										href={profileData.companyProfile?.website}
										target="_blank"
										class="text-emerald-600 hover:underline"
									>
										{profileData.companyProfile?.website || '-'}
									</a>
								</div>
								<div class="flex items-center gap-3 text-gray-700">
									<MapPin class="h-5 w-5 text-gray-400" />
									<span>
										{profileData.companyProfile?.regency?.name || ''}, {profileData.companyProfile
											?.province?.name || ''}
									</span>
								</div>
								<div class="flex items-center gap-3 text-gray-700">
									<Users class="h-5 w-5 text-gray-400" />
									<span>{profileData.companyProfile?.employeeCount || '-'} {pt.employeeCount}</span>
								</div>
							</div>
							<div class="space-y-4 border-l border-gray-100 pl-6">
								<div>
									<p class="text-xs font-medium text-gray-400 uppercase">{pt.nib}</p>
									<p class="font-mono text-sm text-gray-900">
										{profileData.companyProfile?.nib || '-'}
									</p>
								</div>
								<div>
									<p class="text-xs font-medium text-gray-400 uppercase">{pt.foundedYear}</p>
									<p class="text-sm text-gray-900">
										{profileData.companyProfile?.foundedYear || '-'}
									</p>
								</div>
							</div>
						</div>
						<div class="mt-6 border-t border-gray-50 pt-4">
							<p class="text-sm leading-relaxed text-gray-600 italic">
								"{profileData.companyProfile?.description || '-'}"
							</p>
						</div>
					</section>

					<!-- Submissions History -->
					<section>
						<h4
							class="mb-4 flex items-center gap-2 text-sm font-bold tracking-wider text-gray-400 uppercase"
						>
							<History class="h-4 w-4" />
							{t.submissions}
						</h4>
						{#if profileData.submissions && profileData.submissions.length > 0}
							<div class="space-y-3">
								{#each profileData.submissions as sub}
									<div
										class="flex items-center justify-between rounded-lg border border-gray-100 p-4 transition-colors hover:bg-gray-50"
									>
										<div class="min-w-0 flex-1">
											<p class="truncate font-semibold text-gray-900">{sub.procurement?.title}</p>
											<p class="text-xs text-gray-500">
												{new Date(sub.submittedAt).toLocaleDateString(
													appState.language === 'ID' ? 'id-ID' : 'en-US',
													{
														year: 'numeric',
														month: 'long',
														day: 'numeric'
													}
												)}
											</p>
										</div>
										<div class="ml-4">
											<span
												class="inline-flex rounded-full px-2 py-1 text-[10px] font-bold tracking-widest uppercase
                                                {sub.status === 'ACCEPTED'
													? 'bg-emerald-100 text-emerald-700'
													: sub.status === 'REJECTED'
														? 'bg-red-100 text-red-700'
														: 'bg-amber-100 text-amber-700'}"
											>
												{sub.status}
											</span>
										</div>
									</div>
								{/each}
							</div>
						{:else}
							<p class="py-12 text-center text-sm text-gray-400">{t.noSubmissions}</p>
						{/if}
					</section>
				{/if}
			</div>
		</div>
	</div>
{/if}

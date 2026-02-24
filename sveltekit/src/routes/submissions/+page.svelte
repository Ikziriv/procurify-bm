<script lang="ts">
	import { appState } from '$lib/state.svelte';
	import { formatDate, formatDateTime } from '$lib/utils/date';
	import { PdfConverterService } from '$lib/services/pdf-converter';
	import { createQuery } from '@tanstack/svelte-query';
	import {
		getCoreRowModel,
		getFilteredRowModel,
		getSortedRowModel,
		createTable,
		type ColumnDef,
		type TableOptions,
		type SortingState
	} from '@tanstack/table-core';
	import { fade } from 'svelte/transition';
	import VendorProfileDrawer from '$lib/components/VendorProfileDrawer.svelte';
	import SubmissionTrackingDrawer from '$lib/components/SubmissionTrackingDrawer.svelte';

	const t = $derived(appState.t.submissions);

	let isVendorDrawerOpen = $state(false);
	let selectedVendorId = $state<string | null>(null);

	let isTrackingDrawerOpen = $state(false);
	let selectedSubmission = $state<any>(null);

	// Fetch submissions
	const submissionsQuery = createQuery(() => ({
		queryKey: ['submissions'],
		queryFn: async () => {
			const res = await fetch('/api/submissions');
			const data = await res.json();
			if (!res.ok) throw new Error(data.error);
			return data.submissions;
		}
	}));

	let globalFilter = $state('');
	let sorting = $state<SortingState>([]);

	const columns: ColumnDef<any>[] = [
		{
			header: 'Vendor',
			accessorFn: (row) => row.user?.companyProfile?.companyName || row.companyName,
			id: 'vendor'
		},
		{
			header: 'Procurement',
			accessorFn: (row) => row.procurement?.title,
			id: 'procurementTitle'
		},
		{
			header: 'Submitted At',
			accessorKey: 'submittedAt'
		},
		{
			header: 'Status',
			accessorKey: 'status'
		}
	];

	let options = $derived<TableOptions<any>>({
		data: submissionsQuery.data || [],
		columns,
		state: {
			globalFilter,
			sorting
		},
		onStateChange: () => {},
		onGlobalFilterChange: (updater) => {
			if (typeof updater === 'function') {
				globalFilter = updater(globalFilter);
			} else {
				globalFilter = updater;
			}
		},
		onSortingChange: (updater) => {
			if (typeof updater === 'function') {
				sorting = updater(sorting);
			} else {
				sorting = updater;
			}
		},
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getSortedRowModel: getSortedRowModel()
	});

	// Create headless table instance from core
	const table = createTable<any>(options as any);

	// Connect table to Svelte 5 runes ecosystem to make it fully reactive
	let tableRows = $derived.by(() => {
		// Sync the internal states whenever Svelte variables (options) change
		table.setOptions(options as any);
		return table.getRowModel().rows as any[];
	});

	async function handleExportPdf(submission: any) {
		const converter = new PdfConverterService();
		await converter.generateAuditPdf({
			id: submission.id,
			companyName: submission.user?.companyProfile?.companyName || submission.companyName,
			companyDescription:
				submission.user?.companyProfile?.description || submission.companyDescription,
			submittedAt: formatDate(submission.submittedAt),
			status: submission.status,
			procurementTitle: submission.procurement?.title || 'Unknown Procurement',
			budget: 'See Procurement Details', // Could fetch or pass budget if joined
			vendorName: submission.user?.name || 'Unknown User',
			vendorEmail: submission.user?.email || 'Unknown Email',
			history: [
				{
					status: submission.status,
					changedAt: formatDateTime(submission.submittedAt),
					changedBy: submission.user?.name || 'Vendor'
				}
			]
		});
	}
</script>

<div class="space-y-12">
	<header
		class="flex flex-col justify-between gap-8 border-b border-slate-200 pb-12 md:flex-row md:items-end"
	>
		<div class="space-y-2">
			<h2 class="text-4xl font-black tracking-tight text-slate-900">{t.title}</h2>
			<p class="font-medium text-slate-400">{t.subtitle}</p>
		</div>
		<div class="flex items-center gap-4">
			<div class="group relative">
				<span
					class="material-symbols-outlined absolute top-1/2 left-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-blue-600"
					>search</span
				>
				<input
					type="text"
					bind:value={globalFilter}
					placeholder={t.search}
					class="w-64 rounded-2xl border border-slate-200 bg-white py-4 pr-6 pl-12 text-xs font-black tracking-widest uppercase transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none"
				/>
			</div>
		</div>
	</header>

	{#if submissionsQuery.isLoading}
		<div class="flex items-center justify-center p-20">
			<div
				class="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"
			></div>
		</div>
	{:else if submissionsQuery.isError}
		<div class="rounded-3xl border border-rose-100 bg-rose-50 p-10 text-center">
			<span class="material-symbols-outlined mb-4 block text-4xl text-rose-500">error</span>
			<h3 class="text-lg font-black tracking-tight text-rose-900">Failed to load submissions</h3>
			<p class="mt-2 text-sm text-rose-600">{submissionsQuery.error.message}</p>
		</div>
	{:else if tableRows.length === 0}
		<div class="rounded-3xl border-2 border-dashed border-slate-200 p-20 text-center">
			<span class="material-symbols-outlined mb-6 block text-6xl text-slate-300">folder_open</span>
			<h3 class="text-xl font-black tracking-tight text-slate-800">No Submissions Found</h3>
			<p class="mx-auto mt-2 max-w-sm font-medium text-slate-500">
				Either no vendors have submitted bids yet, or no submissions match your search.
			</p>
		</div>
	{:else}
		<div class="grid grid-cols-1 gap-6">
			{#each tableRows as row, i (row.id)}
				{@const submission = row.original as any}
				<div
					in:fade={{ duration: 200 }}
					class="group flex cursor-pointer flex-col justify-between gap-6 rounded-[2.5rem] border border-l-8 border-slate-200/60 bg-white p-6 shadow-sm transition-all hover:shadow-2xl hover:shadow-blue-500/5 md:flex-row md:items-center md:gap-0 md:p-8 {i %
						2 ===
					0
						? 'border-l-amber-500'
						: 'border-l-emerald-500'}"
				>
					<div class="flex flex-1 items-start gap-6 md:items-center md:gap-8">
						<div
							class="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 transition-colors group-hover:bg-blue-50 group-hover:text-blue-600 md:h-16 md:w-16"
						>
							<span class="material-symbols-outlined text-3xl md:text-4xl">inventory_2</span>
						</div>
						<div class="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 md:gap-12">
							<div class="space-y-1">
								<p
									class="text-[9px] font-black tracking-widest text-slate-400 uppercase md:text-[10px]"
								>
									{t.profile}
								</p>
								<button
									onclick={(e) => {
										e.stopPropagation();
										selectedVendorId = submission.userId;
										isVendorDrawerOpen = true;
									}}
									class="text-left font-black tracking-tight text-slate-900 uppercase transition-colors hover:text-blue-600"
								>
									{submission.user?.companyProfile?.companyName || submission.companyName}
								</button>
							</div>
							<div class="space-y-1">
								<p
									class="text-[9px] font-black tracking-widest text-slate-400 uppercase md:text-[10px]"
								>
									Procurement
								</p>
								<h4
									class="line-clamp-2 font-black tracking-tight text-slate-900 uppercase md:line-clamp-1"
								>
									{submission.procurement?.title || 'Unknown Procurement'}
								</h4>
							</div>
							<div class="space-y-1">
								<p
									class="text-[9px] font-black tracking-widest text-slate-400 uppercase md:text-[10px]"
								>
									{t.appliedOn}
								</p>
								<h4 class="font-black tracking-tight text-slate-900 uppercase">
									{formatDate(submission.submittedAt)}
								</h4>
							</div>
						</div>
					</div>

					<div
						class="flex items-center justify-between gap-6 border-t border-slate-100 pt-4 md:justify-end md:border-t-0 md:pt-0"
					>
						<div class="flex-1 text-left md:flex-none md:text-right">
							<p
								class="mb-1 text-[9px] font-black tracking-widest text-slate-400 uppercase md:text-[10px]"
							>
								Status
							</p>
							<span
								class="inline-block rounded-full px-3 py-1 text-[10px] font-black tracking-widest uppercase
								{submission.status === 'ACCEPTED'
									? 'bg-emerald-50 text-emerald-600'
									: submission.status === 'REJECTED'
										? 'bg-rose-50 text-rose-600'
										: 'bg-amber-50 text-amber-600'}">{submission.status}</span
							>
						</div>
						<div class="flex items-center gap-2">
							<button
								onclick={(e) => {
									e.stopPropagation();
									handleExportPdf(submission);
								}}
								class="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 transition-all group-hover:shadow-lg hover:bg-blue-600 hover:text-white active:scale-95 md:h-14 md:w-14"
								title={t.exportPdf}
							>
								<span class="material-symbols-outlined">picture_as_pdf</span>
							</button>
							<button
								onclick={() => {
									selectedSubmission = submission;
									isTrackingDrawerOpen = true;
								}}
								class="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 transition-all group-hover:shadow-lg hover:bg-slate-900 hover:text-white active:scale-95 md:h-14 md:w-14"
							>
								<span class="material-symbols-outlined">chevron_right</span>
							</button>
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<VendorProfileDrawer bind:isOpen={isVendorDrawerOpen} vendorId={selectedVendorId} />
<SubmissionTrackingDrawer bind:isOpen={isTrackingDrawerOpen} submission={selectedSubmission} />

<script lang="ts">
	import { appState } from '$lib/state.svelte';
	import { fade, fly } from 'svelte/transition';
	import { X, CheckCircle2, Clock, AlertCircle, FileText, ArrowRight } from '@lucide/svelte';

	let { isOpen = $bindable(false), submission } = $props<{
		isOpen: boolean;
		submission: any;
	}>();

	const t = $derived(appState.t.submissions);

	function getStatusConfig(status: string) {
		switch (status) {
			case 'ACCEPTED':
				return { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50' };
			case 'REJECTED':
				return { icon: AlertCircle, color: 'text-rose-500', bg: 'bg-rose-50' };
			default:
				return { icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50' };
		}
	}
</script>

{#if isOpen && submission}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="fixed inset-0 z-50 flex items-center justify-end bg-black/40 backdrop-blur-sm"
		onclick={() => (isOpen = false)}
		transition:fade={{ duration: 200 }}
	>
		<div
			class="h-full w-full max-w-lg overflow-y-auto bg-white shadow-2xl"
			onclick={(e) => e.stopPropagation()}
			transition:fly={{ x: 500, duration: 300 }}
		>
			<div class="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-6 py-4">
				<div>
					<h2 class="text-xl font-bold text-gray-900">Track Submission</h2>
					<p class="text-xs font-medium tracking-wider text-gray-500 uppercase">{submission.id}</p>
				</div>
				<button
					onclick={() => (isOpen = false)}
					class="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
				>
					<X class="h-6 w-6" />
				</button>
			</div>

			<div class="p-8">
				<!-- Header Info -->
				<div class="mb-10 text-center">
					<div
						class="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-[2rem] bg-slate-50 text-slate-400"
					>
						<FileText class="h-10 w-10" />
					</div>
					<h3 class="text-2xl font-black tracking-tight text-gray-900 uppercase">
						{submission.procurement?.title || 'Unknown Procurement'}
					</h3>
					<p class="mt-2 font-bold text-blue-600">
						{submission.user?.companyProfile?.companyName || submission.companyName}
					</p>
				</div>

				<!-- Timeline -->
				<div class="relative">
					<div class="absolute top-0 left-6 h-full w-0.5 bg-slate-100"></div>

					<div class="space-y-12">
						<!-- Current Status / Submitted -->
						<div class="relative flex items-start gap-8">
							<div
								class="z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-4 border-white bg-blue-600 text-white shadow-xl shadow-blue-500/20"
							>
								<Clock class="h-6 w-6" />
							</div>
							<div class="flex-1 pt-2">
								<div class="flex items-center justify-between">
									<h4 class="font-black tracking-widest text-gray-900 uppercase italic">
										SUBMITTED
									</h4>
									<span class="text-[10px] font-black tracking-widest text-gray-400 uppercase">
										{new Date(submission.submittedAt).toLocaleDateString('id-ID', {
											day: 'numeric',
											month: 'short',
											year: 'numeric'
										})}
									</span>
								</div>
								<p class="mt-1 text-sm font-medium text-gray-500 italic">
									Submission sent for review.
								</p>
							</div>
						</div>

						{#if submission.statusHistory && submission.statusHistory.length > 0}
							{#each submission.statusHistory as history}
								{@const config = getStatusConfig(history.statusTo)}
								<div class="relative flex items-start gap-8">
									<div
										class="z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-4 border-white {config.bg} {config.color} shadow-lg shadow-gray-100"
									>
										<config.icon class="h-6 w-6" />
									</div>
									<div class="flex-1 pt-2">
										<div class="flex items-center justify-between">
											<h4 class="font-black tracking-widest text-gray-900 uppercase italic">
												{history.statusTo}
											</h4>
											<span class="text-[10px] font-black tracking-widest text-gray-400 uppercase">
												{new Date(history.createdAt).toLocaleDateString('id-ID', {
													day: 'numeric',
													month: 'short',
													year: 'numeric'
												})}
											</span>
										</div>
										<p class="mt-1 text-sm font-medium text-gray-500 italic">
											{history.notes || `Submission status updated to ${history.statusTo}.`}
										</p>
										<p
											class="mt-2 text-[10px] font-black tracking-widest text-slate-300 uppercase italic"
										>
											By {history.changedBy?.name}
										</p>
									</div>
								</div>
							{/each}
						{/if}
					</div>
				</div>

				<!-- Status Footer Card -->
				<div class="mt-16 rounded-3xl border border-slate-100 bg-slate-50 p-6 text-center">
					<p class="text-[10px] font-black tracking-widest text-slate-400 uppercase">
						Latest Status
					</p>
					<div
						class="mt-2 inline-block rounded-full px-4 py-1 text-xs font-black tracking-[0.2em] uppercase
						{submission.status === 'ACCEPTED'
							? 'bg-emerald-100 text-emerald-700'
							: submission.status === 'REJECTED'
								? 'bg-rose-100 text-rose-700'
								: 'bg-amber-100 text-amber-700'}"
					>
						{submission.status}
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}

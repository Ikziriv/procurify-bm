<script lang="ts">
	import { appState } from '$lib/state.svelte';
	import { fly, fade } from 'svelte/transition';

	let { open = $bindable() } = $props<{ open: boolean }>();

	// Focus Mode: Prevent background scrolling when notifications are open
	$effect(() => {
		if (open) {
			const originalStyle = window.getComputedStyle(document.body).overflow;
			document.body.style.overflow = 'hidden';
			return () => {
				document.body.style.overflow = originalStyle;
			};
		}
	});

	function getIcon(type: string) {
		switch (type) {
			case 'SUCCESS':
				return 'check_circle';
			case 'WARNING':
				return 'warning';
			case 'ERROR':
				return 'error';
			default:
				return 'notifications';
		}
	}

	function getColorClass(type: string) {
		switch (type) {
			case 'SUCCESS':
				return 'text-emerald-500 bg-emerald-50';
			case 'WARNING':
				return 'text-amber-500 bg-amber-50';
			case 'ERROR':
				return 'text-rose-500 bg-rose-50';
			default:
				return 'text-blue-500 bg-blue-50';
		}
	}

	function formatTime(date: Date) {
		const now = new Date();
		const diff = now.getTime() - date.getTime();
		const minutes = Math.floor(diff / 60000);
		const hours = Math.floor(minutes / 60);

		if (minutes < 1) return 'Just now';
		if (minutes < 60) return `${minutes}m ago`;
		if (hours < 24) return `${hours}h ago`;
		return date.toLocaleDateString();
	}

	function markAsRead(id: string) {
		appState.markAsRead(id);
	}

	function markAllAsRead() {
		appState.markAllAsRead();
	}
</script>

{#if open}
	<!-- Backdrop: Ultra-premium thin glass for focus -->
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="fixed inset-0 z-[90] bg-slate-950/20 backdrop-blur-[2px] transition-all"
		onclick={() => (open = false)}
		in:fade={{ duration: 400 }}
		out:fade={{ duration: 300 }}
	></div>

	<!-- Drawer: Premium Right Panel -->
	<div
		class="fixed inset-y-0 right-0 z-[100] flex w-full flex-col border-l border-white/40 bg-white/70 shadow-[-20px_0_80px_-20px_rgba(0,0,0,0.15)] backdrop-blur-3xl sm:w-[440px] lg:w-[480px]"
		in:fly={{ x: 480, duration: 600, opacity: 1 }}
		out:fly={{ x: 480, duration: 400, opacity: 1 }}
	>
		<!-- Header: Sophisticated Title Bar -->
		<div class="shrink-0 space-y-6 px-8 pt-10 pb-6">
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-4">
					<div
						class="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-lg shadow-slate-900/10"
					>
						<span class="material-symbols-outlined text-xl">notifications</span>
					</div>
					<div>
						<h3 class="text-sm font-black tracking-tight text-slate-900">Notifications</h3>
						<p class="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
							{appState.notifications.filter((n) => !n.read).length} Unread Updates
						</p>
					</div>
				</div>
				<button
					onclick={() => (open = false)}
					class="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-400 transition-all hover:bg-slate-200 hover:text-slate-900 active:scale-95"
				>
					<span class="material-symbols-outlined text-xl">close</span>
				</button>
			</div>

			<div class="flex items-center justify-between">
				<div class="flex items-center gap-1.5">
					<span class="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-600"></span>
					<span class="text-[10px] font-black tracking-wider text-blue-600 uppercase"
						>Activity Feed</span
					>
				</div>
				{#if appState.notifications.some((n) => !n.read)}
					<button
						onclick={markAllAsRead}
						class="group flex items-center gap-2 text-[10px] font-black tracking-widest text-slate-400 uppercase transition-all hover:text-blue-600"
					>
						Mark all as read
						<span
							class="material-symbols-outlined text-[14px] transition-transform group-hover:translate-x-0.5"
							>done_all</span
						>
					</button>
				{/if}
			</div>
		</div>

		<!-- Scrollable Area -->
		<div class="flex-1 overflow-y-auto px-4 pb-10">
			{#if appState.notifications.length === 0}
				<div class="flex h-full flex-col items-center justify-center text-center">
					<div
						class="mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-slate-50 text-slate-200"
					>
						<span class="material-symbols-outlined text-6xl">notifications_paused</span>
					</div>
					<h4 class="text-xs font-black tracking-widest text-slate-900 uppercase">All caught up</h4>
					<p class="mt-2 max-w-[200px] text-[11px] font-medium text-slate-400">
						You don't have any notifications at the moment.
					</p>
				</div>
			{:else}
				<div class="space-y-3">
					{#each [...appState.notifications].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()) as notification (notification.id)}
						<button
							onclick={() => markAsRead(notification.id)}
							class="group relative flex w-full flex-col gap-3 rounded-2xl border border-transparent p-5 text-left transition-all hover:border-slate-200/50 hover:bg-white/80 hover:shadow-xl hover:shadow-slate-200/20 {notification.read
								? 'opacity-60'
								: ''}"
						>
							{#if !notification.read}
								<div
									class="absolute top-5 right-5 h-2 w-2 rounded-full bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.5)]"
								></div>
							{/if}

							<div class="flex items-center gap-4">
								<div
									class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all group-hover:scale-110 {getColorClass(
										notification.type
									)}"
								>
									<span class="material-symbols-outlined text-xl">{getIcon(notification.type)}</span
									>
								</div>
								<div class="min-w-0 flex-1">
									<p class="truncate text-xs font-black tracking-tight text-slate-900">
										{notification.title}
									</p>
									<span class="text-[9px] font-black tracking-widest text-slate-400 uppercase">
										{formatTime(notification.createdAt)}
									</span>
								</div>
							</div>

							<p class="line-clamp-2 pl-14 text-[12px] leading-relaxed font-medium text-slate-500">
								{notification.message}
							</p>
						</button>
					{/each}
				</div>
			{/if}
		</div>

		<!-- Footer: Activity Log -->
		<div class="shrink-0 border-t border-slate-100/50 p-8">
			<button
				class="group flex w-full items-center justify-between rounded-2xl bg-slate-950 p-5 text-white shadow-xl shadow-slate-950/20 transition-all hover:bg-slate-900 hover:shadow-2xl active:scale-[0.98]"
			>
				<div class="flex flex-col items-start gap-0.5">
					<span class="text-[10px] font-black tracking-[0.2em] text-blue-400 uppercase"
						>Deep Insights</span
					>
					<span class="text-xs font-black tracking-tight">View Activity Log</span>
				</div>
				<span class="material-symbols-outlined transition-transform group-hover:translate-x-1"
					>arrow_forward</span
				>
			</button>
		</div>
	</div>
{/if}

<style>
	/* Custom scrollbar for premium feel */
	::-webkit-scrollbar {
		width: 4px;
	}
	::-webkit-scrollbar-track {
		background: transparent;
	}
	::-webkit-scrollbar-thumb {
		background: rgba(0, 0, 0, 0.05);
		border-radius: 10px;
	}
	::-webkit-scrollbar-thumb:hover {
		background: rgba(0, 0, 0, 0.1);
	}
</style>

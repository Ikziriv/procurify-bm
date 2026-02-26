<script lang="ts">
	import { appState } from '$lib/state.svelte';
	import { notificationManager } from '$lib/state/notification-manager.svelte';
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
		const nt = appState.t.notifications.time;

		if (minutes < 1) return nt.justNow;
		if (minutes < 60)
			return nt.ago.replace('{time}', minutes.toString()).replace('{unit}', nt.units.m);
		if (hours < 24) return nt.ago.replace('{time}', hours.toString()).replace('{unit}', nt.units.h);
		return date.toLocaleDateString(appState.language === 'ID' ? 'id-ID' : 'en-US');
	}

	function markAsRead(id: string) {
		notificationManager.markAsRead(id);
	}

	function markAllAsRead() {
		notificationManager.markAllAsRead();
	}

	const t = $derived(appState.t.notifications);
</script>

{#if open}
	<!-- Backdrop: Subtle blur for focus -->
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="fixed inset-0 z-[90] bg-slate-900/10 backdrop-blur-[2px] transition-all"
		onclick={() => (open = false)}
		in:fade={{ duration: 400 }}
		out:fade={{ duration: 300 }}
	></div>

	<!-- Drawer: Professional Right Panel -->
	<div
		class="fixed inset-y-0 right-0 z-[100] flex w-full flex-col border-l border-slate-200/60 bg-white/95 shadow-[-10px_0_50px_-15px_rgba(0,0,0,0.1)] backdrop-blur-xl sm:w-[420px] lg:w-[440px]"
		in:fly={{ x: 440, duration: 500, opacity: 1 }}
		out:fly={{ x: 440, duration: 400, opacity: 1 }}
	>
		<!-- Header: Clean Title Bar -->
		<div class="shrink-0 space-y-6 px-6 pt-10 pb-6 lg:px-8">
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-4">
					<div
						class="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-md shadow-slate-900/10"
					>
						<span class="material-symbols-outlined text-xl">notifications</span>
					</div>
					<div>
						<h3 class="text-sm font-bold tracking-tight text-slate-900 uppercase">{t.title}</h3>
						<p class="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
							{t.unreadCount.replace(
								'{count}',
								appState.notifications.filter((n) => !n.read).length.toString()
							)}
						</p>
					</div>
				</div>
				<button
					onclick={() => (open = false)}
					class="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/60 bg-white text-slate-400 transition-all hover:bg-slate-50 hover:text-slate-900 active:scale-95"
				>
					<span class="material-symbols-outlined text-xl">close</span>
				</button>
			</div>

			<div class="flex items-center justify-between border-b border-slate-100 pb-4">
				<div class="flex items-center gap-1.5">
					<span
						class="h-1.5 w-1.5 {appState.isLive
							? 'animate-pulse bg-blue-600'
							: 'bg-slate-300'} rounded-full"
					></span>
					<span
						class="text-[10px] font-bold tracking-widest {appState.isLive
							? 'text-blue-600'
							: 'text-slate-400'} uppercase"
						>{appState.isLive ? t.activityLive : t.activityLog}</span
					>
				</div>
				{#if appState.notifications.some((n) => !n.read)}
					<button
						onclick={markAllAsRead}
						class="group flex items-center gap-2 text-[10px] font-bold tracking-widest text-slate-400 uppercase transition-all hover:text-blue-600"
					>
						{t.markAllRead}
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
				<div class="flex h-full flex-col items-center justify-center text-center opacity-80">
					<div
						class="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-50 text-slate-200"
					>
						<span class="material-symbols-outlined text-5xl">notifications_paused</span>
					</div>
					<h4 class="text-xs font-bold tracking-widest text-slate-900 uppercase">
						{t.allCaughtUp}
					</h4>
					<p class="mt-2 max-w-[200px] text-[11px] font-medium text-slate-400">
						{t.noNotifications}
					</p>
				</div>
			{:else}
				<div class="space-y-1">
					{#each [...appState.notifications].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()) as notification (notification.id)}
						<button
							onclick={() => markAsRead(notification.id)}
							class="group relative flex w-full flex-col gap-3 rounded-2xl border border-transparent p-4 text-left transition-all hover:bg-slate-50 {notification.read
								? 'opacity-60'
								: 'bg-white'}"
						>
							{#if !notification.read}
								<div
									class="absolute top-5 right-5 h-2 w-2 rounded-full bg-blue-600 shadow-sm"
								></div>
							{/if}

							<div class="flex items-center gap-4">
								<div
									class="group-hover:bg-opacity-100 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all {getColorClass(
										notification.type
									)}"
								>
									<span class="material-symbols-outlined text-lg">{getIcon(notification.type)}</span
									>
								</div>
								<div class="min-w-0 flex-1">
									<p class="truncate text-xs font-bold tracking-tight text-slate-900 uppercase">
										{notification.title}
									</p>
									<span class="text-[9px] font-bold tracking-widest text-slate-400 uppercase">
										{formatTime(notification.createdAt)}
									</span>
								</div>
							</div>

							<p class="line-clamp-2 pl-13 text-[11px] leading-relaxed font-medium text-slate-500">
								{notification.message}
							</p>
						</button>
					{/each}
				</div>
			{/if}
		</div>

		<!-- Footer: Activity Log -->
		<div class="shrink-0 border-t border-slate-100/60 p-6 lg:p-8">
			<button
				class="group flex w-full items-center justify-between rounded-xl border border-slate-200/60 bg-white p-5 text-slate-900 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50 active:scale-[0.98]"
			>
				<div class="flex flex-col items-start gap-0.5">
					<span class="text-[9px] font-bold tracking-widest text-blue-600 uppercase"
						>{t.deepInsights}</span
					>
					<span class="text-xs font-bold tracking-tight uppercase">{t.viewActivityLog}</span>
				</div>
				<span
					class="material-symbols-outlined text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-blue-600"
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

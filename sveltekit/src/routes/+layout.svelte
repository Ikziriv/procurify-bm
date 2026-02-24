<script lang="ts">
	import { appState } from '$lib/state.svelte';
	import { onMount } from 'svelte';
	import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import Header from '$lib/components/Header.svelte';
	import NavigationProgress from '$lib/components/NavigationProgress.svelte';
	import NotificationDropdown from '$lib/components/NotificationDropdown.svelte';
	import ToastContainer from '$lib/components/ToastContainer.svelte';
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';

	let { data, children } = $props();

	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				enabled: typeof window !== 'undefined'
			}
		}
	});

	onMount(() => {
		appState.init();
	});

	// Sync session data to global state
	$effect(() => {
		if (data.user) {
			appState.setUser(data.user);
		} else {
			appState.setUser(null);
		}
	});
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<QueryClientProvider client={queryClient}>
	<NavigationProgress />
	<div
		class="flex min-h-screen bg-slate-50 text-slate-900 selection:bg-blue-100 selection:text-blue-600"
	>
		<Sidebar />

		<main class="layout-transition flex min-h-screen flex-1 flex-col overflow-x-hidden">
			<Header onNavigate={() => {}} />

			<div class="mx-auto w-full max-w-[1600px] p-4 lg:p-12">
				{@render children()}
			</div>
		</main>
	</div>

	<NotificationDropdown bind:open={appState.showNotifications} />
	<ToastContainer />
</QueryClientProvider>

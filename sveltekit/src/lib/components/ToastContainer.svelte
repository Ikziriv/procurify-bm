<script lang="ts">
	import { appState } from '$lib/state.svelte';
	import Toast from './Toast.svelte';
</script>

<!-- Global Toast Container -->
<div class="fixed top-6 right-6 z-50 flex max-w-sm flex-col">
	{#each appState.toasts as toast (toast.id)}
		<Toast
			title={toast.title}
			message={toast.message}
			type={toast.type}
			onRemove={() => appState.removeToast(toast.id)}
		/>
	{/each}
</div>

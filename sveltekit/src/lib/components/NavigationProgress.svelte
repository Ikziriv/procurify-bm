<script lang="ts">
	import { navigating } from '$app/state';
	import { fade } from 'svelte/transition';

	let progress = $state(0);
	const isNavigating = $derived(navigating.to !== null);

	$effect(() => {
		let timer: ReturnType<typeof setInterval>;
		if (isNavigating) {
			progress = 0;
			timer = setInterval(() => {
				if (progress < 90) {
					progress += Math.random() * 30;
				}
			}, 200);
		} else {
			progress = 100;
		}

		return () => clearInterval(timer);
	});
</script>

{#if isNavigating}
	<div class="fixed top-0 right-0 left-0 z-[100] h-1" out:fade={{ duration: 400, delay: 200 }}>
		<div
			class="h-full bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-400 transition-all duration-300 ease-out"
			style="width: {progress}%"
		>
			<div
				class="absolute top-0 right-0 h-full w-24 bg-gradient-to-r from-transparent to-white/30 blur-sm"
			></div>
		</div>
	</div>
{/if}

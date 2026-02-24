<script lang="ts">
	import { appState } from '$lib/state.svelte';
	import { fly } from 'svelte/transition';
	import { onMount } from 'svelte';

	const t = $derived(appState.t.landing);

	let mounted = $state(false);
	onMount(() => {
		mounted = true;
	});

	const features = $derived([
		{ title: t.feat1Title, desc: t.feat1Desc, icon: 'security' },
		{ title: t.feat2Title, desc: t.feat2Desc, icon: 'language' },
		{ title: t.feat3Title, desc: t.feat3Desc, icon: 'auto_awesome' }
	]);
</script>

<div class="relative min-h-screen overflow-hidden">
	<!-- Background Decorative Elements -->
	<div
		class="pointer-events-none absolute top-0 left-1/2 h-[800px] w-full -translate-x-1/2 overflow-hidden"
	>
		<div
			class="absolute -top-[10%] left-[10%] h-[500px] w-[500px] rounded-full bg-blue-500/10 blur-[120px]"
		></div>
		<div
			class="absolute top-[20%] right-[10%] h-[400px] w-[400px] rounded-full bg-violet-500/10 blur-[120px]"
		></div>
	</div>

	<!-- Hero Section -->
	<header class="relative container mx-auto max-w-5xl px-6 pt-32 pb-48 text-center">
		<div in:fly={{ y: 30, duration: 1000 }} class="space-y-12">
			<div>
				<span
					class="inline-block rounded-full border border-blue-100 bg-blue-50/50 px-6 py-2 text-xs font-black tracking-[0.3em] text-blue-600 uppercase shadow-sm backdrop-blur-sm"
				>
					{t.network}
				</span>

				<h1
					class="mt-10 text-7xl leading-[0.9] font-black tracking-tighter text-slate-900 lg:text-9xl"
				>
					{t.marketingHero} <br />
					<span class="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
						{t.heroAccent}
					</span>
				</h1>
			</div>

			<p class="mx-auto max-w-2xl text-xl leading-relaxed font-medium text-slate-500/80">
				{t.marketingSub}
			</p>

			<div class="flex flex-wrap items-center justify-center gap-6 pt-6">
				<a
					href="/auth"
					class="group relative overflow-hidden rounded-2xl bg-blue-600 px-12 py-6 text-sm font-black tracking-[0.2em] text-white uppercase shadow-2xl shadow-blue-600/40 transition-all hover:bg-blue-500 active:scale-95"
				>
					<span class="relative z-10">{t.joinNetwork}</span>
				</a>

				<a
					href="/explore"
					class="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/80 px-12 py-6 text-sm font-black tracking-[0.2em] text-slate-900 uppercase shadow-sm backdrop-blur-md transition-all hover:bg-slate-50 active:scale-95"
				>
					<span>{t.exploreTenders}</span>
					<span
						class="material-symbols-outlined text-sm transition-transform group-hover:translate-x-1"
						>arrow_forward</span
					>
				</a>
			</div>
		</div>
	</header>

	<!-- Feature Grid -->
	<section class="container mx-auto px-6 py-24">
		<div class="grid grid-cols-1 gap-8 md:grid-cols-3">
			{#each features as feature, i}
				<div
					in:fly={{ y: 30, duration: 800, delay: 200 + i * 100 }}
					class="group relative overflow-hidden rounded-[3rem] border border-slate-200/60 bg-white/40 p-12 backdrop-blur-xl transition-all hover:border-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/5"
				>
					<div class="relative z-10 space-y-6">
						<div
							class="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shadow-inner transition-colors duration-500 group-hover:bg-blue-600 group-hover:text-white"
						>
							<span class="material-symbols-outlined text-3xl">{feature.icon}</span>
						</div>
						<h3 class="text-2xl font-black tracking-tight text-slate-900">{feature.title}</h3>
						<p class="text-sm leading-relaxed font-medium text-slate-500">
							{feature.desc}
						</p>
					</div>

					<!-- Glow Effect on Hover -->
					<div
						class="absolute -right-20 -bottom-20 h-40 w-40 rounded-full bg-blue-500/5 opacity-0 blur-[50px] transition-opacity group-hover:opacity-100"
					></div>
				</div>
			{/each}
		</div>
	</section>

	<!-- Trusted By / Stats Snippet -->
	<section class="container mx-auto border-t border-slate-100 px-6 py-32">
		<div class="flex flex-col items-center gap-16 text-center">
			<h4 class="text-[10px] font-black tracking-[0.4em] text-slate-400 uppercase">
				{t.trustTitle}
			</h4>

			<div
				class="flex flex-wrap items-center justify-center gap-12 opacity-40 grayscale transition-all hover:opacity-100 hover:grayscale-0 lg:gap-24"
			>
				<!-- Simulated Partner Logos -->
				{#each Array(5) as _, i}
					<div class="flex items-center gap-2">
						<div class="h-8 w-8 rounded bg-slate-200"></div>
						<div class="text-sm font-black tracking-widest text-slate-900">AGENCY {i + 1}</div>
					</div>
				{/each}
			</div>

			<div class="mt-8 grid grid-cols-2 gap-12 lg:grid-cols-4 lg:gap-24">
				<div class="space-y-2">
					<p class="text-4xl font-black tracking-tighter text-blue-600">$2.4B</p>
					<p class="text-[9px] font-black tracking-widest text-slate-400 uppercase">
						{t.volManaged}
					</p>
				</div>
				<div class="space-y-2">
					<p class="text-4xl font-black tracking-tighter text-blue-600">1.2k+</p>
					<p class="text-[9px] font-black tracking-widest text-slate-400 uppercase">
						{t.verifiedVendors}
					</p>
				</div>
				<div class="space-y-2">
					<p class="text-4xl font-black tracking-tighter text-blue-600">500+</p>
					<p class="text-[9px] font-black tracking-widest text-slate-400 uppercase">
						Active Projects
					</p>
				</div>
				<div class="space-y-2">
					<p class="text-4xl font-black tracking-tighter text-blue-600">99.9%</p>
					<p class="text-[9px] font-black tracking-widest text-slate-400 uppercase">
						Award Accuracy
					</p>
				</div>
			</div>
		</div>
	</section>

	<!-- Final CTA -->
	<section class="container mx-auto px-6 py-32">
		<div
			class="relative overflow-hidden rounded-[4rem] bg-slate-950 p-16 text-center shadow-2xl shadow-blue-900/10 lg:p-32"
		>
			<div
				class="pointer-events-none absolute inset-0 bg-gradient-to-tr from-blue-600/10 to-transparent"
			></div>

			<div class="relative z-10 space-y-12">
				<h2 class="text-4xl leading-[1.1] font-black tracking-tight text-white lg:text-7xl">
					Ready to transform your <br />
					<span class="text-blue-400">procurement workflow?</span>
				</h2>

				<div class="flex flex-wrap justify-center gap-6">
					<a
						href="/auth"
						class="rounded-2xl bg-white px-12 py-6 text-sm font-black tracking-[0.2em] text-slate-950 uppercase shadow-xl shadow-white/5 transition-all hover:bg-slate-100 active:scale-95"
					>
						Get Started Now
					</a>
					<a
						href="/explore"
						class="rounded-2xl border border-white/20 bg-white/5 px-12 py-6 text-sm font-black tracking-[0.2em] text-white uppercase transition-all hover:bg-white/10 active:scale-95"
					>
						Explore Tenders
					</a>
				</div>
			</div>
		</div>
	</section>
</div>

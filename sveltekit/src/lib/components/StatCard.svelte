<script lang="ts">
	interface Props {
		title: string;
		value: string | number;
		icon: string;
		status?: string;
		variant?: 'blue' | 'amber' | 'purple' | 'emerald' | 'slate';
	}

	let { title, value, icon, status, variant = 'slate' }: Props = $props();

	const variants = {
		blue: 'bg-blue-50 text-blue-600',
		amber: 'bg-amber-50 text-amber-600',
		purple: 'bg-purple-50 text-purple-600',
		emerald: 'bg-emerald-50 text-emerald-600',
		slate: 'bg-slate-50 text-slate-600'
	};

	const iconBg = $derived(variants[variant] || variants.slate);
</script>

<div
	class="group relative overflow-hidden rounded-[2.5rem] border border-slate-200/50 bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-500 hover:border-blue-200/50 hover:shadow-[0_20px_50px_rgba(37,99,235,0.1)]"
>
	<div
		class="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-slate-50 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
	></div>

	<div class="relative z-10">
		<div class="mb-8 flex items-start justify-between">
			<div
				class="flex h-16 w-16 items-center justify-center rounded-2xl ring-1 ring-slate-100 transition-all duration-500 group-hover:scale-110 group-hover:ring-blue-100 {iconBg}"
			>
				<span class="material-symbols-outlined text-3xl">{icon}</span>
			</div>
			{#if status}
				<span
					class="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-black tracking-widest text-emerald-600 uppercase"
				>
					{status}
				</span>
			{/if}
		</div>
		<p class="mb-2 text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase">
			{title}
		</p>
		<h3 class="text-3xl font-black tracking-tight text-slate-900 lg:text-4xl">
			{value}
		</h3>
	</div>
</div>

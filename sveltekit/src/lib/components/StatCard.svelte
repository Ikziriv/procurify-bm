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
	class="group rounded-[2.5rem] border border-slate-200/60 bg-white p-8 shadow-sm transition-all hover:shadow-xl hover:shadow-blue-500/5"
>
	<div class="mb-6 flex items-start justify-between">
		<div
			class="flex h-14 w-14 items-center justify-center rounded-2xl transition-transform group-hover:scale-110 {iconBg}"
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
	<p class="mb-1 text-[10px] font-black tracking-widest text-slate-400 uppercase">
		{title}
	</p>
	<h3 class="text-2xl font-black tracking-tighter text-slate-900">
		{value}
	</h3>
</div>

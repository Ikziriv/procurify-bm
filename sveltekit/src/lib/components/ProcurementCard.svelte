<script lang="ts">
	interface Props {
		id: string;
		title: string;
		type: string;
		amount: string;
		deadline: string;
		deadlineLabel: string;
	}

	let { id, title, type, amount, deadline, deadlineLabel }: Props = $props();
</script>

<a
	href="/procurements/{id}"
	class="group relative flex cursor-pointer flex-col justify-between gap-6 overflow-hidden rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm transition-all duration-300 hover:border-blue-400/30 hover:shadow-md md:flex-row md:items-center"
	data-testid="procurement-card"
>
	<div class="flex items-center gap-6">
		<div
			class="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-400 ring-1 ring-slate-100 transition-all duration-300 group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:ring-blue-100"
		>
			<span class="material-symbols-outlined text-2xl">inventory_2</span>
		</div>
		<div class="space-y-1">
			<h5
				class="text-base font-bold tracking-tight text-slate-900 transition-colors group-hover:text-blue-700"
			>
				{title}
			</h5>
			<div class="flex items-center gap-3">
				<span
					class="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold tracking-wider text-slate-600 uppercase"
				>
					{type}
				</span>
				<span class="text-xs font-semibold tracking-wide text-slate-400">
					&bull; {amount}
				</span>
			</div>
		</div>
	</div>

	<div class="flex flex-col border-t border-slate-50 pt-4 md:border-none md:pt-0 md:text-right">
		<p class="mb-1 text-[10px] font-bold tracking-widest text-slate-400 uppercase">
			{deadlineLabel}
		</p>
		<p class="text-sm font-bold tracking-tight text-slate-900">{deadline}</p>
	</div>

	<!-- Subtle indicator -->
	<div
		class="absolute top-0 right-0 h-full w-1 translate-x-full bg-blue-600 transition-transform duration-300 group-hover:translate-x-0"
	></div>
</a>

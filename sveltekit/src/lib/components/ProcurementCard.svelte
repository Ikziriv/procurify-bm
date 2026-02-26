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
	class="group relative flex cursor-pointer flex-col justify-between gap-6 overflow-hidden rounded-[2.5rem] border border-slate-200/50 bg-white p-8 shadow-[0_4px_20px_rgba(0,0,0,0.02)] transition-all duration-500 hover:border-blue-200/50 hover:shadow-[0_20px_40px_rgba(37,99,235,0.08)] md:flex-row md:items-center"
>
	<div class="flex items-center gap-8">
		<div
			class="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-3xl bg-slate-50 text-slate-400 ring-1 ring-slate-100 transition-all duration-500 group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:ring-blue-100"
		>
			<span class="material-symbols-outlined text-4xl">inventory_2</span>
		</div>
		<div class="space-y-2">
			<h5 class="text-lg font-black tracking-tight text-slate-900 uppercase">
				{title}
			</h5>
			<div class="flex items-center gap-3">
				<span
					class="rounded-lg bg-blue-50/50 px-2 py-1 text-[10px] font-black tracking-widest text-blue-600 uppercase"
				>
					{type}
				</span>
				<span class="text-xs font-bold tracking-widest text-slate-400 uppercase">
					• {amount}
				</span>
			</div>
		</div>
	</div>

	<div class="flex flex-col border-t border-slate-50 pt-6 md:border-none md:pt-0 md:text-right">
		<p class="mb-1 text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase">
			{deadlineLabel}
		</p>
		<p class="text-base font-black tracking-tight text-slate-900 uppercase">{deadline}</p>
	</div>

	<!-- Hover accent -->
	<div
		class="absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-500 group-hover:w-full"
	></div>
</a>

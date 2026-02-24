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
	class="group flex cursor-pointer items-center justify-between rounded-[2rem] border border-slate-200/60 bg-white p-8 shadow-sm transition-all hover:border-blue-200 hover:shadow-md"
>
	<div class="flex items-center gap-6">
		<div
			class="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 transition-colors group-hover:bg-blue-50 group-hover:text-blue-600"
		>
			<span class="material-symbols-outlined text-3xl">inventory_2</span>
		</div>
		<div>
			<h5 class="font-black tracking-tight text-slate-900 uppercase">
				{title}
			</h5>
			<p class="text-xs font-bold tracking-widest text-slate-400 uppercase">
				{type} • {amount}
			</p>
		</div>
	</div>
	<div class="text-right">
		<p class="mb-1 text-[10px] font-black tracking-widest text-slate-400 uppercase">
			{deadlineLabel}
		</p>
		<p class="text-sm font-black text-slate-900 uppercase">{deadline}</p>
	</div>
</a>

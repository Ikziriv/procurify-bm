<script lang="ts">
	import { appState } from '$lib/state.svelte';

	const t = $derived(appState.t.userManagement);
</script>

<div class="space-y-12">
	<header
		class="flex flex-col justify-between gap-8 border-b border-slate-200 pb-12 md:flex-row md:items-end"
	>
		<div class="space-y-2">
			<h2 class="text-4xl font-black tracking-tight text-slate-900">{t.title}</h2>
			<p class="font-medium text-slate-400">{t.subtitle}</p>
		</div>
		<button
			class="flex items-center gap-3 rounded-2xl bg-slate-950 px-8 py-4 text-xs font-black tracking-widest text-white uppercase shadow-xl shadow-slate-900/20 transition-all active:scale-95"
		>
			<span class="material-symbols-outlined text-lg">person_add</span>
			{t.addUser}
		</button>
	</header>

	<div class="overflow-hidden rounded-[3rem] border border-slate-200/60 bg-white shadow-sm">
		<table class="w-full border-collapse text-left">
			<thead>
				<tr class="border-b border-slate-100 bg-slate-50/50">
					<th class="px-10 py-6 text-[10px] font-black tracking-widest text-slate-400 uppercase"
						>{t.user}</th
					>
					<th class="px-10 py-6 text-[10px] font-black tracking-widest text-slate-400 uppercase"
						>{t.role}</th
					>
					<th class="px-10 py-6 text-[10px] font-black tracking-widest text-slate-400 uppercase"
						>{t.status}</th
					>
					<th
						class="px-10 py-6 text-right text-[10px] font-black tracking-widest text-slate-400 uppercase"
						>{t.actions}</th
					>
				</tr>
			</thead>
			<tbody class="divide-y divide-slate-50">
				{#each Array(5) as _, i}
					<tr class="group transition-colors hover:bg-slate-50/50">
						<td class="px-10 py-8">
							<div class="flex items-center gap-4">
								<img
									src="https://picsum.photos/100"
									alt="Avatar"
									class="h-12 w-12 rounded-[1.25rem] object-cover ring-2 ring-slate-100"
								/>
								<div>
									<p class="font-black tracking-tight text-slate-900 uppercase">Super Admin One</p>
									<p class="text-[10px] font-bold tracking-tight text-slate-400 uppercase">
										super@procurify.com
									</p>
								</div>
							</div>
						</td>
						<td class="px-10 py-8">
							<span
								class="rounded-full bg-blue-50 px-4 py-1.5 text-[9px] font-black tracking-widest text-blue-600 uppercase"
								>Super Admin</span
							>
						</td>
						<td class="px-10 py-8">
							<div class="flex items-center gap-2 text-emerald-600">
								<div
									class="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
								></div>
								<span
									class="text-[10px] font-black tracking-widest uppercase transition-transform group-hover:translate-x-1"
									>{t.active}</span
								>
							</div>
						</td>
						<td class="px-10 py-8 text-right">
							<button
								class="h-10 w-10 rounded-xl text-slate-300 transition-all hover:bg-white hover:text-blue-600 hover:shadow-md"
							>
								<span class="material-symbols-outlined">more_horiz</span>
							</button>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>

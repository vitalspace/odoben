<script lang="ts">
	import { fade } from 'svelte/transition';
	import { Key, Zap, Calendar, Clock, Copy, Trash2, CheckCircle, XCircle } from 'lucide-svelte';
	import axios from '../../services/axios';

	let apiKeys: any[] = [];
	let isLoading = false;
	let newKey: string | null = null;
	let isGenerating = false;

	async function loadKeys() {
		isLoading = true;
		try {
			const res = await axios.get('/apikeys');
			apiKeys = res.data;
		} catch (e) {
			console.error(e);
		} finally {
			isLoading = false;
		}
	}

	async function generateKey() {
		isGenerating = true;
		try {
			const res = await axios.post('/apikeys', { name: 'key' });
			newKey = res.data.apiKey;
			await loadKeys();
		} catch (e) {
			console.error(e);
		} finally {
			isGenerating = false;
		}
	}

	async function deleteKey(id: string) {
		if (!confirm('Are you sure? This action cannot be undone.')) return;
		try {
			await axios.delete(`/apikeys/${id}`);
			await loadKeys();
		} catch (e) {
			console.error(e);
		}
	}

	// Load keys on mount
	import { onMount } from 'svelte';
	onMount(() => {
		loadKeys();
	});
</script>

<div class="bg-odoben-surface/50 backdrop-blur-xl border border-odoben-primary/10 rounded-3xl p-8">
	<div class="flex justify-end mb-6">
		<button
			class="px-6 py-3 bg-linear-to-r from-odoben-accent to-odoben-aqua text-odoben-text rounded-xl font-medium hover:shadow-lg hover:shadow-odoben-bg/30 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
			onclick={generateKey}
			disabled={isGenerating}
		>
			{#if isGenerating}
				<Zap class="w-5 h-5 animate-pulse" />
				Generating...
			{:else}
				<Key class="w-5 h-5" />
				Generate New Key
			{/if}
		</button>
	</div>

	{#if newKey}
		<div class="mb-8 p-6 bg-linear-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-2xl" in:fade>
			<h3 class="text-lg font-bold text-green-400 mb-2 flex items-center gap-2">
				<Key class="w-6 h-6 text-green-400" />
				New API Key Generated!
			</h3>
			<p class="text-green-300 mb-4 text-sm">Please copy this key now. You won't be able to see it again.</p>
			<div class="flex gap-2">
				<code class="flex-1 p-4 bg-black/30 border border-green-500/20 rounded-xl font-mono text-green-200 break-all text-sm backdrop-blur-sm">
					{newKey}
				</code>
				<button
					class="px-6 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium flex items-center gap-2"
					onclick={() => navigator.clipboard.writeText(newKey || '')}
				>
					<Copy class="w-4 h-4" />
					Copy
				</button>
			</div>
			<button
				class="mt-4 text-sm text-green-400 hover:text-green-300 underline flex items-center gap-2"
				onclick={() => (newKey = null)}
			>
				<CheckCircle class="w-4 h-4" />
				I have saved it
			</button>
		</div>
	{/if}

	{#if isLoading}
		<div class="flex justify-center py-8">
			<div class="w-8 h-8 border-4 border-odoben-primary/10 border-t-odoben-primary rounded-full animate-spin"></div>
		</div>
	{:else if apiKeys.length === 0}
		<div class="text-center py-12 bg-white/5 border border-white/10 rounded-2xl">
			<Key class="w-16 h-16 mx-auto mb-4 opacity-50 text-gray-400" />
			<p class="text-gray-400 text-lg">No API keys generated yet</p>
			<p class="text-gray-500 text-sm mt-2">Generate your first key to get started with the API</p>
		</div>
	{:else}
		<div class="space-y-4">
			{#each apiKeys as key (key._id)}
				<div class="flex items-center justify-between p-5 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all group">
					<div class="flex-1">
						<div class="font-medium text-white text-lg mb-1">{key.name}</div>
						<div class="flex items-center gap-4 text-xs text-gray-400">
							<span class="flex items-center gap-1">
								<Calendar class="w-3 h-3" />
								Created {new Date(key.createdAt).toLocaleDateString()}
							</span>
							{#if key.lastUsedAt}
								<span class="flex items-center gap-1">
									<Clock class="w-3 h-3" />
									Last used {new Date(key.lastUsedAt).toLocaleDateString()}
								</span>
							{/if}
						</div>
					</div>
					<button
						class="p-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all border border-transparent hover:border-red-500/20"
						onclick={() => deleteKey(key._id)}
						title="Revoke Key"
					>
						<Trash2 class="w-5 h-5" />
					</button>
				</div>
			{/each}
		</div>
	{/if}
</div>

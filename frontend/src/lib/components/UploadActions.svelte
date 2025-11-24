<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	
	let { isLoading = $bindable(false), loadingText = $bindable('') } = $props();
	const dispatch = createEventDispatcher();
	
	function onUpload() {
		dispatch('upload');
	}
	
	function onClear() {
		dispatch('clear');
	}
</script>

<div class="flex gap-4 mb-8">
	<button 
		class="flex-1 bg-gradient-to-r from-odoben-accent to-odoben-aqua text-odoben-text py-3 px-6 rounded-xl font-semibold shadow-lg shadow-odoben-bg/30 hover:shadow-xl hover:shadow-odoben-bg/50 transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
		onclick={onUpload}
		disabled={isLoading}
	>
		{#if isLoading}
			<span class="inline-block animate-spin mr-2">⏳</span>
		{/if}
		{isLoading ? (loadingText || 'Processing...') : '📤 Upload to Walrus'}
	</button>
	<button 
		class="px-6 py-3 bg-odoben-surface/30 text-odoben-text/80 rounded-xl font-semibold hover:bg-odoben-surface/50 transition-colors border border-odoben-primary/10"
		onclick={onClear}
		disabled={isLoading}
	>
		🗑️ Clear
	</button>
</div>

{#if isLoading}
	<div class="text-center py-8">
		<div class="w-12 h-12 border-4 border-odoben-primary/10 border-t-odoben-primary rounded-full animate-spin mx-auto mb-4"></div>
		<p class="text-odoben-text/60 font-medium">{loadingText}</p>
	</div>
{/if}
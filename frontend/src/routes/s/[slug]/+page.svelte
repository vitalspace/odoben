<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { apiServices } from '$lib/services/apiServices';
	import Guardian from '$lib/components/Guardian.svelte';
	import { fade } from 'svelte/transition';

	let slug = $page.params.slug;
	let upload: any = null;
	let loading = true;
	let error = '';

	onMount(async () => {
		if (!slug) {
			error = 'Invalid link';
			loading = false;
			return;
		}

		try {
			upload = await apiServices.getUploadBySlug(slug);
		} catch (err: any) {
			console.error('Error fetching upload:', err);
			error = err.response?.data?.message || 'Failed to load file';
		} finally {
			loading = false;
		}
	});

	function handleUnlock(blobId: string) {
		if (upload) {
			upload.blobId = blobId;
			upload = { ...upload }; // Trigger reactivity
		}
	}
</script>

<div class="min-h-screen bg-odoben-bg text-odoben-text font-sans selection:bg-odoben-aqua/30">
	<!-- Background Gradients -->
	<div class="fixed inset-0 z-0 pointer-events-none overflow-hidden">
		<div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-odoben-primary/10 rounded-full blur-[120px]"></div>
		<div class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-odoben-aqua/10 rounded-full blur-[120px]"></div>
	</div>

	<div class="relative z-10">
		{#if loading}
			<div class="min-h-screen flex items-center justify-center">
				<div class="w-16 h-16 border-4 border-odoben-primary/10 border-t-odoben-primary rounded-full animate-spin"></div>
			</div>
		{:else if error}
			<div class="min-h-screen flex items-center justify-center p-4" in:fade>
				<div class="bg-red-500/10 border border-red-500/20 rounded-2xl p-8 text-center max-w-md">
					<div class="text-4xl mb-4">🚫</div>
					<h2 class="text-xl font-bold text-red-400 mb-2">Access Error</h2>
					<p class="text-odoben-text/60">{error}</p>
					<a href="/" class="inline-block mt-6 text-sm text-odoben-text/40 hover:text-odoben-text underline">
						Go Home
					</a>
				</div>
			</div>
		{:else if upload}
			<Guardian {upload} onUnlock={handleUnlock} />
		{/if}
	</div>
</div>

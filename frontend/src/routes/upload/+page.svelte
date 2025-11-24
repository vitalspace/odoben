<script>
	import WalrusUploader from '$lib/components/WalrusUploader.svelte';
	import WalletGuard from '$lib/components/WalletGuard.svelte';
</script>

<WalletGuard>
	<div class="min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
		<WalrusUploader />
	</div>
</WalletGuard>

<script lang="ts">
	import { fade, slide } from 'svelte/transition';
	import { Download, Music, FileText } from 'lucide-svelte';
	
	let { viewBlobId = $bindable(''), viewLoading = $bindable(false), viewContent = $bindable(null), viewError = $bindable('') } = $props();
	
	function formatFileSize(bytes: number) {
		if (bytes === 0) return '0 Bytes';
		const k = 1024;
		const sizes = ['Bytes', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
	}
	
	function detectFileType(arrayBuffer: ArrayBuffer): string {
		const bytes = new Uint8Array(arrayBuffer);
		
		if (bytes.length >= 3 && bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) return 'image/jpeg';
		if (bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) return 'image/png';
		if (bytes.length >= 6 && bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) return 'image/gif';
		if (bytes.length >= 12 && bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) return 'image/webp';
		if (bytes.length >= 5 && bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46) return 'application/pdf';
		
		return 'application/octet-stream';
	}
	
	async function viewFile() {
		if (!viewBlobId.trim()) return;
		
		viewLoading = true;
		viewError = '';
		viewContent = null;
		
		const AGGREGATOR = 'https://aggregator.walrus-testnet.walrus.space';
		
		try {
			const response = await fetch(`${AGGREGATOR}/v1/blobs/${viewBlobId}`);
			if (!response.ok) throw new Error('File not found or unavailable');
			
			const arrayBuffer = await response.arrayBuffer();
			const type = detectFileType(arrayBuffer);
			const blob = new Blob([arrayBuffer], { type });
			const url = URL.createObjectURL(blob);
			
			viewContent = {
				type: type.startsWith('image/') ? 'image' : 'other',
				url,
				name: 'downloaded_file',
				info: {
					type: type.split('/')[0],
					format: type.split('/')[1] || 'unknown',
					size: formatFileSize(blob.size)
				}
			};
			
		} catch (error) {
			viewError = (error as Error).message;
		} finally {
			viewLoading = false;
		}
	}
</script>

<div in:fade>
	<div class="mb-8">
		<h3 class="text-xl font-bold text-odoben-text mb-4">View File from Blob ID</h3>
		<div class="flex gap-3">
			<input 
				type="text" 
				bind:value={viewBlobId}
				placeholder="Paste Blob ID here..."
				class="flex-1 px-4 py-3 bg-odoben-surface/30 border-2 border-odoben-primary/10 rounded-xl focus:border-odoben-primary focus:ring-0 outline-none transition-colors text-odoben-text placeholder-odoben-text/30"
			/>
			<button 
				class="bg-gradient-to-r from-odoben-accent to-odoben-aqua text-odoben-text px-8 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-odoben-bg/30 transition-all shadow-md disabled:opacity-50"
				onclick={viewFile}
				disabled={viewLoading || !viewBlobId}
			>
				{viewLoading ? 'Loading...' : '👁️ View'}
			</button>
		</div>
	</div>

	{#if viewLoading}
		<div class="text-center py-12">
			<div class="w-12 h-12 border-4 border-odoben-primary/10 border-t-odoben-primary rounded-full animate-spin mx-auto mb-4"></div>
			<p class="text-odoben-text/60">Fetching from Walrus...</p>
		</div>
	{/if}

	{#if viewError}
		<div class="bg-red-500/10 border-2 border-red-500/30 text-red-400 p-4 rounded-xl mb-6">
			❌ Error: {viewError}
		</div>
	{/if}

	{#if viewContent}
		<div class="bg-odoben-surface/50 rounded-xl p-6 border border-odoben-primary/10" transition:slide>
			<h3 class="text-odoben-text font-bold text-lg mb-4">📄 Retrieved File</h3>
			
			<div class="grid grid-cols-3 gap-4 mb-6">
				<div class="bg-odoben-surface/30 p-3 rounded-lg border-l-4 border-odoben-primary">
					<div class="text-xs text-odoben-text/60 uppercase mb-1">Type</div>
					<div class="font-semibold text-odoben-text">{viewContent.info.type}</div>
				</div>
				<div class="bg-odoben-surface/30 p-3 rounded-lg border-l-4 border-odoben-aqua">
					<div class="text-xs text-odoben-text/60 uppercase mb-1">Format</div>
					<div class="font-semibold text-odoben-text">{viewContent.info.format}</div>
				</div>
				<div class="bg-odoben-surface/30 p-3 rounded-lg border-l-4 border-odoben-accent">
					<div class="text-xs text-odoben-text/60 uppercase mb-1">Size</div>
					<div class="font-semibold text-odoben-text">{viewContent.info.size}</div>
				</div>
			</div>

			<div class="bg-odoben-surface/30 p-6 rounded-lg text-center">
				{#if viewContent.type === 'image'}
					<img src={viewContent.url} alt="Retrieved" class="max-w-full h-auto rounded-lg shadow-md mx-auto mb-6" />
				{:else}
					<div class="text-6xl mb-6">📄</div>
				{/if}
				
				<a 
					href={viewContent.url} 
					download={viewContent.name}
					class="inline-block bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all shadow-md"
				>
					⬇️ Download File
				</a>
			</div>
		</div>
	{/if}
</div>
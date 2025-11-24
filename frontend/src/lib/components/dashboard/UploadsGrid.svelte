<script lang="ts">
	import { fade } from 'svelte/transition';
	import { Upload, File, Lock, Globe, DollarSign, Edit, Unlock, FileText, Calendar, Link, Settings, Image, Video, Music, ExternalLink } from 'lucide-svelte';
	import { apiServices } from '$lib/services/apiServices';
	import { toastStore } from '$lib/stores/toastStore';
	import EditPrivacyModal from './EditPrivacyModal.svelte';

	export let uploads: any[] = [];
	export let isLoading = false;

	const AGGREGATOR = 'https://aggregator.walrus-testnet.walrus.space';

	let editingUpload: any = null;

	function getBlobUrl(blobId: string) {
		return `${AGGREGATOR}/v1/${blobId}`;
	}

	function formatFileSize(bytes: number) {
		if (bytes < 1024) return bytes + ' B';
		if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
		return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
	}

	function formatDate(date: string) {
		return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
	}

	async function handleUnlock(upload: any) {
		if (!confirm(`Unlock "${upload.filename}" for ${upload.price} ${upload.currency}?`)) return;

		try {
			// Mock payment proof for now
			const paymentProof = 'mock_proof_' + Date.now();
			const result = await apiServices.unlockUpload(upload._id, paymentProof);
			
			// Update the local upload object with the revealed blobId
			upload.blobId = result.blobId;
			uploads = [...uploads]; // Trigger reactivity

			toastStore.success('File unlocked successfully!');
		} catch (error: any) {
			console.error('Unlock failed:', error);
			toastStore.error('Unlock failed: ' + (error.response?.data?.message || error.message));
		}
	}

	function handleUpdate(updatedUpload: any) {
		const index = uploads.findIndex(u => u._id === updatedUpload._id);
		if (index !== -1) {
			uploads[index] = { ...uploads[index], ...updatedUpload };
			uploads = [...uploads]; // Trigger reactivity
		}
	}

	function copyLink(slug: string) {
		const url = `${window.location.origin}/s/${slug}`;
		navigator.clipboard.writeText(url);
		toastStore.success('Link copied to clipboard!');
	}
</script>

<div class="bg-odoben-surface/30 backdrop-blur-xl border border-odoben-primary/10 rounded-3xl p-8">
	<div class="flex justify-between items-center mb-6">
		<div class="text-sm font-normal text-odoben-text/60 bg-odoben-surface/50 px-3 py-1 rounded-full inline-block border border-odoben-primary/10">
			Total Files: {uploads.length}
		</div>
	</div>

	{#if isLoading}
		<div class="flex justify-center py-12">
			<div class="w-16 h-16 border-4 border-odoben-primary/10 border-t-odoben-primary rounded-full animate-spin"></div>
		</div>
	{:else if uploads.length === 0}
		<div class="text-center py-20">
			<Upload class="w-16 h-16 mx-auto mb-4 opacity-30 text-odoben-text/40" />
			<p class="text-odoben-text/60 text-lg mb-2">No uploads yet</p>
			<p class="text-odoben-text/40 text-sm">Upload your first file to get started</p>
			<a href="/upload" class="mt-6 inline-block px-6 py-3 bg-gradient-to-r from-odoben-accent to-odoben-aqua text-odoben-text rounded-full font-medium hover:shadow-lg hover:shadow-odoben-bg/30 transition-all hover:-translate-y-1 flex items-center gap-2">
				<Upload class="w-5 h-5" />
				Upload Now
			</a>
		</div>
	{:else}
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" in:fade>
			{#each uploads as upload (upload._id)}
				<div class="group bg-odoben-surface/50 hover:bg-odoben-surface/70 border border-odoben-primary/10 rounded-2xl p-6 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-odoben-bg/20 relative overflow-hidden">
					<!-- File Type Icon Background -->
					<div class="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-500 pointer-events-none">
						{#if upload.mimeType.startsWith('image/')}
							<Image class="w-24 h-24 text-odoben-aqua" />
						{:else if upload.mimeType.startsWith('video/')}
							<Video class="w-24 h-24 text-odoben-aqua" />
						{:else if upload.mimeType.startsWith('audio/')}
							<Music class="w-24 h-24 text-odoben-primary" />
						{:else}
							<FileText class="w-24 h-24 text-odoben-text" />
						{/if}
					</div>

					<!-- Header Row: Privacy Badge & Edit Button -->
					<div class="flex justify-between items-center mb-3 relative z-10">
						<div class="flex items-center gap-2">
							{#if upload.visibility === 'private'}
								<span class="text-xs bg-gray-800/80 text-gray-300 px-2 py-1 rounded-md border border-gray-700 flex items-center gap-1">
									<Lock class="w-3 h-3" />
									Private
								</span>
							{:else if upload.visibility === 'paid'}
								<span class="text-xs bg-amber-500/20 text-amber-300 px-2 py-1 rounded-md border border-amber-500/30 flex items-center gap-1">
									<DollarSign class="w-3 h-3" />
									{upload.price} {upload.currency}
								</span>
							{:else}
								<span class="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded-md border border-green-500/30 flex items-center gap-1">
									<Globe class="w-3 h-3" />
									Public
								</span>
							{/if}
						</div>

						<div class="flex gap-1">
							<button 
								class="p-1.5 hover:bg-odoben-primary/10 rounded-lg transition-colors text-odoben-text/60 hover:text-odoben-text"
								title="Copy Link"
								onclick={() => copyLink(upload.slug)}
							>
								<Link class="w-4 h-4" />
							</button>
							<button 
								onclick={() => editingUpload = upload}
								class="p-1.5 hover:bg-odoben-primary/10 rounded-lg transition-colors text-odoben-text/60 hover:text-odoben-text"
								title="Edit Privacy"
								aria-label="Edit Privacy"
							>
								<Edit class="w-4 h-4" />
							</button>
						</div>
					</div>

					<div class="flex justify-between items-start mb-4 relative z-10">
						<div class="flex-1 min-w-0 pr-3">
							<h3 class="font-semibold text-odoben-text truncate mb-1 group-hover:text-odoben-primary transition-colors">
								{upload.filename}
							</h3>
							<p class="text-xs text-odoben-text/60 font-mono truncate flex items-center gap-1">
								{#if upload.blobId === 'PAYMENT_REQUIRED'}
									<Lock class="w-3 h-3" />
									Locked Content
								{:else}
									<FileText class="w-3 h-3" />
									{upload.blobId.slice(0, 20)}...
								{/if}
							</p>
						</div>
						
						{#if upload.blobId === 'PAYMENT_REQUIRED'}
							<button 
								onclick={() => handleUnlock(upload)}
								class="flex-shrink-0 p-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 rounded-lg transition-colors text-amber-300"
								title="Buy File"
							>
								<Unlock class="w-5 h-5" />
							</button>
						{:else}
							<a 
								href={`/s/${upload.slug}`}
								target="_blank"
								class="flex-shrink-0 p-2 bg-odoben-aqua/20 hover:bg-odoben-aqua/30 border border-odoben-aqua/30 rounded-lg transition-colors text-odoben-aqua"
								title="View File"
							>
								<ExternalLink class="w-5 h-5" />
							</a>
						{/if}
					</div>
					
					<div class="flex items-center justify-between text-xs text-odoben-text/60 pt-4 border-t border-odoben-primary/10 relative z-10">
						<span class="flex items-center gap-1">
							<File class="w-4 h-4" />
							{formatFileSize(upload.size)}
						</span>
						<span class="flex items-center gap-1">
							<Calendar class="w-4 h-4" />
							{formatDate(upload.createdAt)}
						</span>
					</div>

					<div class="mt-3 px-3 py-1.5 bg-odoben-surface/30 border border-odoben-primary/10 rounded-lg text-xs text-odoben-text/60 truncate font-mono relative z-10">
						{upload.mimeType}
					</div>
				</div>
			{/each}
		</div>
	{/if}

	{#if editingUpload}
		<EditPrivacyModal 
			upload={editingUpload} 
			onClose={() => editingUpload = null} 
			onUpdate={handleUpdate}
		/>
	{/if}
</div>

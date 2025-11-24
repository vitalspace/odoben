<script lang="ts">
	import { fade } from 'svelte/transition';
	import { createEventDispatcher } from 'svelte';
	import { Eye, Download } from 'lucide-svelte';
	import { apiServices } from '$lib/services/apiServices';
	import { toastStore } from '$lib/stores/toastStore';
	import EditPrivacyModal from './dashboard/EditPrivacyModal.svelte';
	
	let { uploads = $bindable([]), isLoading = $bindable(false), readOnly = false } = $props();
	
	const dispatch = createEventDispatcher();
	
	const AGGREGATOR = 'https://aggregator.walrus-testnet.walrus.space';
	
	// View mode state
	let viewMode = $state<'grid' | 'list' | 'details'>('grid');
	let editingUpload: any = $state(null);
	let downloadingId: string | null = $state(null);
	
	const viewModes = [
		{ id: 'grid', label: 'Grid', icon: '⊞', description: 'Show files in a grid layout' },
		{ id: 'list', label: 'List', icon: '☰', description: 'Show files in a compact list' },
		{ id: 'details', label: 'Details', icon: '📋', description: 'Show detailed information' }
	] as const;

	function getBlobUrl(blobId: string) {
		return `${AGGREGATOR}/v1/blobs/${blobId}`;
	}

	function formatFileSize(bytes: number) {
		if (bytes < 1024) return bytes + ' B';
		if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
		return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
	}

	function formatDate(date: string) {
		return new Date(date).toLocaleDateString('en-US', { 
			month: 'short', 
			day: 'numeric',
			year: 'numeric'
		});
	}

	function copyToClipboard(text: string) {
		navigator.clipboard.writeText(text);
		dispatch('copy', text);
	}

	function copyShareLink(slug: string) {
		const url = `${window.location.origin}/s/${slug}`;
		navigator.clipboard.writeText(url);
		toastStore.success('Share link copied to clipboard!');
	}

	function getFileTypeIcon(mimeType: string) {
		if (mimeType.startsWith('image/'))  return '🖼️';
		if (mimeType.startsWith('video/')) return '🎥';
		if (mimeType.startsWith('audio/')) return '🎵';
		if (mimeType.includes('pdf')) return '📄';
		return '📄';
	}

	function getFileTypeColor(mimeType: string) {
		if (mimeType.startsWith('image/')) return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
		if (mimeType.startsWith('video/')) return 'bg-odoben-aqua/20 text-odoben-aqua border-odoben-aqua/30';
		if (mimeType.startsWith('audio/')) return 'bg-green-500/20 text-green-300 border-green-500/30';
		if (mimeType.includes('pdf')) return 'bg-red-500/20 text-red-300 border-red-500/30';
		return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
	}

	function truncateMiddle(str: string, maxLength: number) {
		if (str.length <= maxLength) return str;
		const start = Math.floor((maxLength - 3) / 2);
		const end = str.length - Math.ceil((maxLength - 3) / 2);
		return str.substring(0, start) + '...' + str.substring(end);
	}

	async function handleUnlock(upload: any) {
		// Implement unlock logic here
		console.log('Unlock file:', upload);
	}

	async function handleUpdate(updatedUpload: any) {
		console.log('Updating upload:', updatedUpload);
		
		// Update the upload in the uploads array with proper reactivity
		uploads = uploads.map(upload => {
			if (upload._id === updatedUpload._id) {
				// Return updated upload with new properties
				return { 
					...upload, 
					...updatedUpload,
					// Ensure specific fields are updated
					visibility: updatedUpload.visibility,
					price: updatedUpload.price,
					currency: updatedUpload.currency
				};
			}
			return upload;
		});
		
		dispatch('update', updatedUpload);
		dispatch('update', updatedUpload);
	}

	async function handleDownload(upload: any) {
		if (downloadingId) return;
		
		try {
			downloadingId = upload._id;
			console.log('🚀 Starting download for:', upload.filename);

			// 1. Fetch data
			const response = await fetch(`${AGGREGATOR}/v1/blobs/${upload.blobId}`);
			if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

			let finalDataBlob;
			const clone = response.clone();
			let isManifest = false;
			let manifestData = null;
			let filename = upload.filename || `download-${Date.now()}`;
			let mimeType = upload.mimeType || 'application/octet-stream';

			try {
				const data = await clone.json();
				if (data.chunks && Array.isArray(data.chunks) && data.totalChunks) {
					isManifest = true;
					manifestData = data;
				}
			} catch (e) { isManifest = false; }

			if (isManifest && manifestData) {
				console.log('📦 Walrus manifest detected:', manifestData);
				if (manifestData.fileName) filename = manifestData.fileName;
				if (manifestData.fileType) mimeType = manifestData.fileType;

				const chunkBlobs = [];
				for (let i = 0; i < manifestData.chunks.length; i++) {
					const chunkId = manifestData.chunks[i];
					const r = await fetch(`${AGGREGATOR}/v1/blobs/${chunkId}`);
					if(!r.ok) throw new Error(`Failed chunk ${chunkId}`);
					chunkBlobs.push(await r.blob());
				}
				finalDataBlob = new Blob(chunkBlobs, { type: mimeType });
			} else {
				console.log('📄 Direct blob file');
				finalDataBlob = await response.blob();
				finalDataBlob = finalDataBlob.slice(0, finalDataBlob.size, mimeType);
			}

			// Ensure extension
			const requiredExt = getRequiredExtension(mimeType);
			if (requiredExt && !filename.toLowerCase().endsWith(requiredExt)) {
				filename += requiredExt;
			}

			console.log(`✅ Data ready. Saving as: ${filename}`);
			saveBlob(finalDataBlob, filename);

		} catch (error) {
			console.error('Download failed:', error);
			toastStore.error('Download failed: ' + (error instanceof Error ? error.message : String(error)));
		} finally {
			downloadingId = null;
		}
	}

	function saveBlob(blob: Blob, fileName: string) {
		if ((window.navigator as any).msSaveOrOpenBlob) {
			(window.navigator as any).msSaveOrOpenBlob(blob, fileName);
			return;
		}

		const url = window.URL.createObjectURL(blob);
		const anchor = document.createElement('a');
		anchor.href = url;
		anchor.download = fileName;
		anchor.rel = 'noopener';
		document.body.appendChild(anchor);
		
		setTimeout(() => {
			anchor.dispatchEvent(new MouseEvent('click', {
				bubbles: true, 
				cancelable: true, 
				view: window 
			}));
			setTimeout(() => {
				document.body.removeChild(anchor);
				window.URL.revokeObjectURL(url);
			}, 100);
		}, 0);
	}

	function getRequiredExtension(mimeType: string): string {
		const mimeMap: { [key: string]: string } = {
			'image/jpeg': '.jpg', 'image/png': '.png', 'image/gif': '.gif', 'image/webp': '.webp',
			'video/mp4': '.mp4', 'video/webm': '.webm', 'audio/mpeg': '.mp3', 'audio/wav': '.wav',
			'audio/ogg': '.ogg', 'application/pdf': '.pdf', 'text/plain': '.txt', 'application/json': '.json'
		};
		return mimeMap[mimeType] || '';
	}
</script>

{#if isLoading}
	<div class="flex items-center justify-center py-12">
		<div class="animate-spin rounded-full h-12 w-12 border-4 border-odoben-primary/20 border-t-odoben-primary"></div>
	</div>
{:else if uploads.length === 0}
	<div class="text-center py-12">
		<div class="text-6xl mb-4">📁</div>
		<p class="text-xl text-odoben-text/60">No files uploaded yet</p>
	</div>
{:else}
	<div>
		<!-- View Mode Switcher -->
		<div class="flex gap-2 mb-6">
			{#each viewModes as mode}
				<button
					onclick={() => viewMode = mode.id}
					class="px-4 py-2 rounded-lg border transition-all {viewMode === mode.id 
						? 'bg-odoben-accent/20 border-odoben-accent/50 text-odoben-primary' 
						: 'bg-odoben-surface/30 border-odoben-primary/10 text-odoben-text/60 hover:bg-odoben-surface/50 hover:text-odoben-text'}"
					title={mode.description}
				>
					<span class="mr-2">{mode.icon}</span>
					{mode.label}
				</button>
			{/each}
		</div>

		<!-- Grid View -->
		{#if viewMode === 'grid'}
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" in:fade>
				{#each uploads as upload (upload._id)}
					<div class="bg-odoben-surface/50 backdrop-blur-sm rounded-xl border border-odoben-primary/10 hover:border-odoben-primary/50 transition-all p-4">
						<!-- Preview -->
						<div class="aspect-video bg-odoben-bg/50 rounded-lg mb-3 flex items-center justify-center text-4xl">
							{getFileTypeIcon(upload.mimeType)}
						</div>
						
						<!-- Info -->
						<div class="space-y-2">
							<h3 class="font-medium text-odoben-text truncate" title={upload.filename}>{upload.filename}</h3>
							<div class="flex items-center gap-2">
								{#if upload.visibility === 'private'}
									<span class="text-[10px] bg-gray-800/80 text-gray-300 px-1.5 py-0.5 rounded border border-gray-700">🔒 Private</span>
								{:else if upload.visibility === 'paid'}
									<span class="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/30">💰 {upload.price} {upload.currency}</span>
								{:else}
									<span class="text-[10px] bg-green-500/20 text-green-300 px-1.5 py-0.5 rounded border border-green-500/30">🌍 Public</span>
								{/if}
							</div>
							<div class="flex items-center gap-4 text-sm text-odoben-text/60">
								<span class="flex items-center gap-1">
									<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
									</svg>
									{formatFileSize(upload.size)}
								</span>
								<span class="flex items-center gap-1">
									<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
									</svg>
									{formatDate(upload.createdAt)}
								</span>
							</div>
						</div>
						
						<!-- Actions -->
						<div class="flex items-center gap-2 mt-3">
							<div class="px-2 py-1 text-xs text-odoben-text/80 bg-odoben-surface/50 rounded border border-odoben-primary/20 font-mono">
								{upload.mimeType.split('/')[1]?.toUpperCase() || 'FILE'}
							</div>
							
							<button 
								onclick={() => copyShareLink(upload.slug)}
								class="p-2 bg-odoben-surface/30 hover:bg-odoben-surface/50 text-odoben-text/60 hover:text-odoben-text rounded-lg border border-odoben-primary/10 transition-colors"
								title="Copy Share Link"
							>
								<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
								</svg>
							</button>

							{#if !readOnly}
								<button 
									onclick={() => editingUpload = upload}
									class="p-2 bg-odoben-surface/30 hover:bg-odoben-surface/50 text-odoben-text/60 hover:text-odoben-text rounded-lg border border-odoben-primary/10 transition-colors"
									title="Edit Privacy"
								>
									<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
									</svg>
								</button>
							{/if}

							{#if upload.blobId === 'PAYMENT_REQUIRED'}
								<button 
									onclick={() => handleUnlock(upload)}
									class="p-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 rounded-lg transition-colors text-amber-300"
									title="Buy File"
								>
									<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
									</svg>
								</button>
							{:else}
								<button 
									onclick={() => handleDownload(upload)}
									disabled={!!downloadingId}
									class="p-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg transition-colors text-green-400 disabled:opacity-50"
									title="Download File"
								>
									{#if downloadingId === upload._id}
										<div class="w-4 h-4 border-2 border-green-400/30 border-t-green-400 rounded-full animate-spin"></div>
									{:else}
										<Download class="w-4 h-4" />
									{/if}
								</button>
								<a 
									href={`/s/${upload.slug}`} 
									target="_blank"
									class="p-2 bg-odoben-aqua/20 hover:bg-odoben-aqua/30 border border-odoben-aqua/30 rounded-lg transition-colors text-odoben-aqua"
									title="View File"
								>
									<Eye class="w-4 h-4" />
								</a>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		{/if}

		<!-- List View -->
		{#if viewMode === 'list'}
			<div class="space-y-3" in:fade>
				{#each uploads as upload (upload._id)}
					<div class="group bg-odoben-surface/50 hover:bg-odoben-surface/70 border border-odoben-primary/10 rounded-xl p-4 transition-all hover:shadow-lg">
						<div class="flex items-center gap-4">
							<!-- File Icon -->
							<div class="text-2xl">
								{getFileTypeIcon(upload.mimeType)}
							</div>
							
							<!-- File Info -->
							<div class="flex-1 min-w-0">
								<div class="flex items-center gap-2 mb-1">
									<h3 class="font-semibold text-odoben-text truncate group-hover:text-odoben-primary transition-colors" title={upload.filename}>
										{truncateMiddle(upload.filename, 30)}
									</h3>
									<!-- Visibility Badge -->
									{#if upload.visibility === 'private'}
										<span class="text-[10px] bg-gray-800/80 text-gray-300 px-1.5 py-0.5 rounded border border-gray-700">🔒 Private</span>
									{:else if upload.visibility === 'paid'}
										<span class="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/30">💰 {upload.price} {upload.currency}</span>
									{:else}
										<span class="text-[10px] bg-green-500/20 text-green-300 px-1.5 py-0.5 rounded border border-green-500/30">🌍 Public</span>
									{/if}
								</div>
								<div class="flex items-center gap-4 text-sm text-odoben-text/60">
									<span class="flex items-center gap-1">
										<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
										</svg>
										{formatFileSize(upload.size)}
									</span>
									<span class="flex items-center gap-1">
										<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
										</svg>
										{formatDate(upload.createdAt)}
									</span>
								</div>
							</div>
							
							<!-- Actions -->
							<div class="flex items-center gap-2">
								<div class="px-2 py-1 text-xs text-odoben-text/80 bg-odoben-surface/50 rounded border border-odoben-primary/20 font-mono">
									{upload.mimeType.split('/')[1]?.toUpperCase() || 'FILE'}
								</div>
								
								<button 
									onclick={() => copyShareLink(upload.slug)}
									class="p-2 bg-odoben-surface/30 hover:bg-odoben-surface/50 text-odoben-text/60 hover:text-odoben-text rounded-lg border border-odoben-primary/10 transition-colors"
									title="Copy Share Link"
								>
									<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
									</svg>
								</button>

								{#if !readOnly}
									<button 
										onclick={() => editingUpload = upload}
										class="p-2 bg-odoben-surface/30 hover:bg-odoben-surface/50 text-odoben-text/60 hover:text-odoben-text rounded-lg border border-odoben-primary/10 transition-colors"
										title="Edit Privacy"
									>
										<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
										</svg>
									</button>
								{/if}

								{#if upload.blobId === 'PAYMENT_REQUIRED'}
									<button 
										onclick={() => handleUnlock(upload)}
										class="p-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 rounded-lg transition-colors text-amber-300"
										title="Buy File"
									>
										<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
										</svg>
									</button>
								{:else}
									<button 
										onclick={() => handleDownload(upload)}
										disabled={!!downloadingId}
										class="p-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg transition-colors text-green-400 disabled:opacity-50"
										title="Download File"
									>
										{#if downloadingId === upload._id}
											<div class="w-4 h-4 border-2 border-green-400/30 border-t-green-400 rounded-full animate-spin"></div>
										{:else}
											<Download class="w-4 h-4" />
										{/if}
									</button>
									<a 
										href={getBlobUrl(upload.blobId)} 
										target="_blank"
										class="p-2 bg-odoben-aqua/20 hover:bg-odoben-aqua/30 border border-odoben-aqua/30 rounded-lg transition-colors text-odoben-aqua"
										title="View File"
									>
										<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
										</svg>
									</a>
								{/if}
							</div>
						</div>
					</div>
				{/each}
			</div>
		{/if}

		<!-- Details View -->
		{#if viewMode === 'details'}
			<div class="overflow-hidden rounded-xl border border-odoben-primary/10" in:fade>
				<table class="w-full">
					<thead class="bg-odoben-surface/50">
						<tr>
							<th class="px-6 py-4 text-left text-sm font-semibold text-odoben-text/80">Name</th>
							<th class="px-6 py-4 text-left text-sm font-semibold text-odoben-text/80">Status</th>
							<th class="px-6 py-4 text-left text-sm font-semibold text-odoben-text/80">Type</th>
							<th class="px-6 py-4 text-left text-sm font-semibold text-odoben-text/80">Size</th>
							<th class="px-6 py-4 text-left text-sm font-semibold text-odoben-text/80">Date</th>
							<th class="px-6 py-4 text-left text-sm font-semibold text-odoben-text/80">Blob ID</th>
							<th class="px-6 py-4 text-left text-sm font-semibold text-odoben-text/80">Actions</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-odoben-primary/10">
						{#each uploads as upload (upload._id)}
							<tr class="hover:bg-odoben-surface/30 transition-colors">
								<td class="px-6 py-4">
									<div class="flex items-center gap-3">
										<div class="text-lg">{getFileTypeIcon(upload.mimeType)}</div>
										<div>
											<div class="font-medium text-odoben-text" title={upload.filename}>{truncateMiddle(upload.filename, 40)}</div>
											<div class="text-sm text-odoben-text/60">{upload.mimeType}</div>
										</div>
									</div>
								</td>
								<td class="px-6 py-4">
									{#if upload.visibility === 'private'}
										<span class="text-xs bg-gray-800/80 text-gray-300 px-2 py-1 rounded-md border border-gray-700 inline-flex items-center gap-1">
											🔒 Private
										</span>
									{:else if upload.visibility === 'paid'}
										<span class="text-xs bg-amber-500/20 text-amber-300 px-2 py-1 rounded-md border border-amber-500/30 inline-flex items-center gap-1">
											💰 {upload.price} {upload.currency}
										</span>
									{:else}
										<span class="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded-md border border-green-500/30 inline-flex items-center gap-1">
											🌍 Public
										</span>
									{/if}
								</td>
								<td class="px-6 py-4">
									<span class="px-2 py-1 text-xs font-mono rounded border {getFileTypeColor(upload.mimeType)}">
										{upload.mimeType.split('/')[1]?.toUpperCase() || 'UNKNOWN'}
									</span>
								</td>
								<td class="px-6 py-4 text-sm text-odoben-text/80">
									{formatFileSize(upload.size)}
								</td>
								<td class="px-6 py-4 text-sm text-odoben-text/80">
									{formatDate(upload.createdAt)}
								</td>
								<td class="px-6 py-4">
									<div class="flex items-center gap-2">
										<code class="text-xs text-odoben-text/60 font-mono bg-odoben-surface/50 px-2 py-1 rounded">
											{#if upload.blobId === 'PAYMENT_REQUIRED'}
												LOCKED
											{:else}
												{upload.blobId.slice(0, 20)}...
											{/if}
										</code>
										{#if upload.blobId !== 'PAYMENT_REQUIRED'}
											<button 
												onclick={() => copyToClipboard(upload.blobId)}
												class="p-1 text-odoben-text/60 hover:text-odoben-primary transition-colors"
												title="Copy Blob ID"
											>
												<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
												</svg>
											</button>
										{/if}
									</div>
								</td>
								<td class="px-6 py-4">
									<div class="flex items-center gap-2">
										<button 
											onclick={() => copyShareLink(upload.slug)}
											class="p-1.5 bg-odoben-surface/30 hover:bg-odoben-surface/50 text-odoben-text/60 hover:text-odoben-text rounded-lg border border-odoben-primary/10 transition-colors"
											title="Copy Share Link"
										>
											<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
											</svg>
										</button>

										{#if !readOnly}
											<button 
												onclick={() => editingUpload = upload}
												class="p-1.5 bg-odoben-surface/30 hover:bg-odoben-surface/50 text-odoben-text/60 hover:text-odoben-text rounded-lg border border-odoben-primary/10 transition-colors"
												title="Edit Privacy"
											>
												<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
												</svg>
											</button>
										{/if}

										{#if upload.blobId === 'PAYMENT_REQUIRED'}
											<button 
												onclick={() => handleUnlock(upload)}
												class="p-1.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 rounded-lg transition-colors text-amber-300"
												title="Buy File"
											>
												<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
												</svg>
											</button>
										{:else}
											<button 
												onclick={() => handleDownload(upload)}
												disabled={!!downloadingId}
												class="p-1.5 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg transition-colors text-green-400 disabled:opacity-50"
												title="Download File"
											>
												{#if downloadingId === upload._id}
													<div class="w-4 h-4 border-2 border-green-400/30 border-t-green-400 rounded-full animate-spin"></div>
												{:else}
													<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
													</svg>
												{/if}
											</button>
											<a 
												href={getBlobUrl(upload.blobId)} 
												target="_blank"
												class="p-1.5 bg-odoben-aqua/20 hover:bg-odoben-aqua/30 border border-odoben-aqua/30 rounded-lg transition-colors text-odoben-aqua"
												title="View File"
											>
												<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
												</svg>
											</a>
										{/if}
									</div>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</div>
{/if}

{#if editingUpload}
	<EditPrivacyModal 
		upload={editingUpload} 
		onClose={() => editingUpload = null} 
		onUpdate={handleUpdate}
	/>
{/if}

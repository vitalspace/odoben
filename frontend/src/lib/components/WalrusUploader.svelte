<script lang="ts">
	import { walletStore } from '$lib/services/walletService';
	import { apiServices } from '$lib/services/apiServices';
	import { toastStore } from '$lib/stores/toastStore';
	import { fade } from 'svelte/transition';

	import FileDropZone from './FileDropZone.svelte';
	import UploadActions from './UploadActions.svelte';

	import MediaPlayer from './MediaPlayer.svelte';
	import AudioWaveformPlayer from './AudioWaveformPlayer.svelte';
	import { reconstructFile, getFileTypeFromMime } from '$lib/utils/walrus';

	const PUBLISHER = 'https://publisher.walrus-testnet.walrus.space';
	const AGGREGATOR = 'https://aggregator.walrus-testnet.walrus.space';
	const MAX_FILE_SIZE = 1024 * 1024 * 1024; // 1GB
	const CHUNK_SIZE = 10 * 1024 * 1024; // 10 MB

	let selectedFile: File | null = $state(null);
	let isDragging = $state(false);
	let isLoading = $state(false);
	let loadingText = $state('');
	let uploadResult: { blobId: string; url: string; slug: string } | null = $state(null);
	let previewUrl: string | null = $state(null);
	let fileInfo: { type: string; format: string; size: string } | null = $state(null);

	let visibility: 'public' | 'private' | 'paid' = $state('private');
	let price = $state(0);
	let currency = $state('SUI');

	async function handleFileSelect(file: File) {
		if (file.size > MAX_FILE_SIZE) {
			toastStore.error('File too large. Max 1GB.');
			return;
		}

		selectedFile = file;
		uploadResult = null;
		previewUrl = null;

		// Create preview for images
		if (file.type.startsWith('image/')) {
			previewUrl = URL.createObjectURL(file);
		}
	}

	// Upload function
	async function uploadToWalrus() {
		if (!selectedFile) return;

		const fileToUpload = selectedFile;

		isLoading = true;
		loadingText = 'Initializing upload...';
		uploadResult = null;

		try {
			const totalChunks = Math.ceil(fileToUpload.size / CHUNK_SIZE);
			const blobIds: string[] = [];

			// Upload chunks
			for (let i = 0; i < totalChunks; i++) {
				const start = i * CHUNK_SIZE;
				const end = Math.min(start + CHUNK_SIZE, fileToUpload.size);
				const chunk = fileToUpload.slice(start, end);

				const progress = Math.round(((i + 1) / totalChunks) * 100);
				loadingText = `Uploading... ${progress}%`;

				const response = await fetch(`${PUBLISHER}/v1/blobs?epochs=5`, {
					method: 'PUT',
					body: chunk
				});

				if (!response.ok) throw new Error(`HTTP error! status: ${response.status} on chunk ${i + 1}`);

				const data = await response.json();
				let chunkId = '';

				if (data.newlyCreated) {
					chunkId = data.newlyCreated.blobObject.blobId;
				} else if (data.alreadyCertified) {
					chunkId = data.alreadyCertified.blobId;
				} else {
					throw new Error('Unexpected response from Walrus');
				}

				blobIds.push(chunkId);
			}

			loadingText = 'Creating manifest...';

			// Create Manifest
			const manifest = {
				fileName: fileToUpload.name,
				fileType: fileToUpload.type,
				fileSize: fileToUpload.size,
				totalChunks: totalChunks,
				chunks: blobIds
				// uploadDate removed to ensure deterministic manifest (same file = same manifest = same blobId)
			};

			// Upload Manifest
			const manifestRes = await fetch(`${PUBLISHER}/v1/blobs?epochs=5`, {
				method: 'PUT',
				body: JSON.stringify(manifest),
				headers: { 'Content-Type': 'application/json' }
			});

			if (!manifestRes.ok) throw new Error('Error uploading manifest');

			const manifestData = await manifestRes.json();
			let blobId = '';

			if (manifestData.newlyCreated) {
				blobId = manifestData.newlyCreated.blobObject.blobId;
			} else if (manifestData.alreadyCertified) {
				blobId = manifestData.alreadyCertified.blobId;
			} else {
				throw new Error('Unexpected response from Walrus for manifest');
			}

			const url = `${AGGREGATOR}/v1/blobs/${blobId}`;

			// Save metadata to backend
			let slug = '';
			if ($walletStore.isConnected && $walletStore.address) {
				try {
					// Check if upload already exists
					const existingUpload = await apiServices.getUploadByBlobId(blobId);
					
					if (existingUpload) {
						console.log('Upload already exists, reusing metadata:', existingUpload);
						slug = existingUpload.slug;
					} else {
						const savedUpload = await apiServices.saveUpload({
							blobId,
							owner: $walletStore.address,
							filename: selectedFile.name,
							mimeType: fileToUpload.type,
							size: fileToUpload.size,
							visibility,
							price: visibility === 'paid' ? price : 0,
							currency
						});
						slug = savedUpload.slug;
					}
				} catch (err) {
					console.error('Failed to save metadata:', err);
				}
			}

			uploadResult = { blobId, url, slug };

			loadingText = 'Waiting for certification...';
			await new Promise((resolve) => setTimeout(resolve, 2000));
		} catch (error) {
			console.error('Upload error:', error);
			toastStore.error('Upload failed: ' + (error as Error).message);
		} finally {
			isLoading = false;
		}
	}

	function clearAll() {
		selectedFile = null;
		uploadResult = null;
		previewUrl = null;
		visibility = 'private';
		price = 0;
	}

	function formatFileSize(bytes: number) {
		if (bytes < 1024) return bytes + ' B';
		if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
		return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
	}
</script>

<div
	class="mx-auto w-full max-w-4xl overflow-hidden rounded-3xl border border-odoben-primary/10 bg-odoben-surface/50 shadow-2xl shadow-odoben-bg/20 backdrop-blur-xl"
>
	<!-- Header -->
	<div
		class="relative border-b border-odoben-primary/10 bg-gradient-to-r from-odoben-bg to-odoben-surface p-8 text-center text-odoben-text backdrop-blur-md"
	>
		<h1 class="mb-2 text-4xl font-bold">🐋 Odoben</h1>
		<p class="text-odoben-text/80">Decentralized storage on Sui</p>
	</div>

	<!-- Content -->
	<div class="p-8">
		<div in:fade>
			{#if !selectedFile}
				<!-- File Upload Drop Zone -->
				<FileDropZone
					bind:isDragging
					maxFileSize={MAX_FILE_SIZE}
					onFileSelected={handleFileSelect}
				/>
			{:else}
				<!-- File Selected - Show Settings and Actions -->
				{#if !uploadResult}
				<div class="mb-8 space-y-6">
					<!-- Privacy Settings -->
					<div class="rounded-xl border border-odoben-primary/10 bg-odoben-bg/30 p-6">
						<h3 class="mb-4 flex items-center gap-2 text-lg font-semibold text-odoben-text">
							🔒 Privacy & Monetization
						</h3>

						<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
							<!-- Visibility -->
							<div class="space-y-2">
								<label for="visibility-select" class="text-sm text-odoben-text/60">Visibility</label
								>
								<select
									id="visibility-select"
									bind:value={visibility}
									class="w-full rounded-lg border border-odoben-primary/20 bg-odoben-bg/50 px-4 py-3 text-odoben-text transition-colors focus:border-odoben-primary focus:outline-none"
								>
									<option value="private">🔒 Private (Only You)</option>
									<option value="public">🌍 Public (Everyone)</option>
									<option value="paid">💰 Paid (Monetized)</option>
								</select>
							</div>

							<!-- Price (if paid) -->
							{#if visibility === 'paid'}
								<div class="space-y-2" in:fade>
									<label for="price-input" class="text-sm text-odoben-text/60">Price (SUI)</label>
									<div class="relative">
										<input
											id="price-input"
											type="number"
											bind:value={price}
											min="0"
											step="0.1"
											class="w-full rounded-lg border border-odoben-primary/20 bg-odoben-bg/50 px-4 py-3 pl-10 text-odoben-text transition-colors focus:border-odoben-primary focus:outline-none"
											placeholder="0.00"
										/>
										<span class="absolute top-1/2 left-4 -translate-y-1/2 text-odoben-text/60"
											>💧</span
										>
									</div>
								</div>
							{/if}
						</div>
					</div>

					<!-- File Preview (Image or Summary) -->
					<div class="rounded-xl border border-odoben-primary/10 bg-odoben-bg/30 p-6">
						<h3 class="mb-4 flex items-center gap-2 text-lg font-semibold text-odoben-text">
							{#if previewUrl}🖼️ Image Preview{:else}📄 File Summary{/if}
						</h3>
						<div class="flex justify-center">
							{#if previewUrl}
								<img
									src={previewUrl}
									alt="File preview"
									class="max-h-64 max-w-full rounded-lg shadow-lg"
								/>
							{:else}
								<div class="flex items-center gap-4 p-4 rounded-xl bg-odoben-bg/50 border border-odoben-primary/10 w-full max-w-md">
									<div class="w-12 h-12 bg-odoben-primary/20 rounded-lg flex items-center justify-center text-2xl">
										{#if selectedFile?.type.startsWith('video/')}🎥
										{:else if selectedFile?.type.startsWith('audio/')}🎵
										{:else}📁{/if}
									</div>
									<div class="flex-1 min-w-0">
										<p class="font-medium text-odoben-text truncate">{selectedFile?.name}</p>
										<p class="text-sm text-odoben-text/60">{formatFileSize(selectedFile?.size || 0)}</p>
									</div>
								</div>
							{/if}
						</div>
					</div>
				</div>

				<!-- Action Buttons and Loading -->
				<UploadActions
					bind:isLoading
					bind:loadingText
					on:upload={uploadToWalrus}
					on:clear={clearAll}
				/>
				{/if}

				<!-- Upload Result -->
				{#if uploadResult}
					<div class="rounded-xl border border-odoben-primary/10 bg-odoben-bg/30 p-6">
						<h3 class="mb-4 flex items-center gap-2 text-lg font-semibold text-odoben-text">
							✅ Upload Successful
						</h3>
						
						<!-- Post-Upload Preview -->
						{#await reconstructFile(uploadResult.blobId)}
							<div class="mb-4 p-4 rounded-lg bg-odoben-bg/50 border border-odoben-primary/10 flex items-center justify-center gap-2 text-odoben-text/60">
								<div class="w-4 h-4 border-2 border-odoben-primary/30 border-t-odoben-primary rounded-full animate-spin"></div>
								Verifying upload...
							</div>
						{:then result}
							<div class="mb-6 rounded-xl overflow-hidden border border-odoben-primary/10 bg-odoben-bg/50">
								{#if getFileTypeFromMime(result.type) === 'image'}
									<img 
										src={result.url} 
										alt="Uploaded file"
										class="w-full h-auto max-h-[40vh] object-contain"
									/>
								{:else if getFileTypeFromMime(result.type) === 'video'}
									<MediaPlayer 
										src={result.url} 
										type="video"
									/>
								{:else if getFileTypeFromMime(result.type) === 'audio'}
									<div class="p-4">
										<AudioWaveformPlayer 
											src={result.url} 
											filename={result.fileName || 'Audio File'}
										/>
									</div>
								{/if}
							</div>
						{:catch error}
							<div class="mb-4 text-sm text-red-400">
								Could not verify upload preview.
							</div>
						{/await}

						<div class="space-y-2">
							<p class="text-odoben-text/80">
								<strong>Blob ID:</strong>
								<code class="rounded bg-odoben-bg/50 px-2 py-1 text-sm">{uploadResult.blobId}</code>
							</p>
							<p class="text-odoben-text/80">
								<strong>Direct URL:</strong>
								<a
									href={uploadResult.url}
									target="_blank"
									class="break-all text-odoben-primary hover:underline">{uploadResult.url}</a
								>
							</p>
							{#if uploadResult.slug}
								<p class="text-odoben-text/80">
									<strong>View Link:</strong>
									<a href="/s/{uploadResult.slug}" class="text-odoben-primary hover:underline"
										>/s/{uploadResult.slug}</a
									>
								</p>
							{/if}
						</div>

						<div class="mt-6 flex justify-center">
							<button 
								onclick={clearAll}
								class="px-6 py-3 bg-odoben-surface border border-odoben-primary/20 rounded-xl text-odoben-text hover:bg-odoben-primary/10 transition-colors flex items-center gap-2"
							>
								<span>🔄</span> Upload Another File
							</button>
						</div>
					</div>
				{/if}
			{/if}
		</div>
	</div>
</div>

<script lang="ts">
	import { fade, scale } from 'svelte/transition';
	import { X, Lock, Globe, DollarSign, FileText } from 'lucide-svelte';
	import { apiServices } from '$lib/services/apiServices';
	import { toastStore } from '$lib/stores/toastStore';

	export let upload: any;
	export let onClose: () => void;
	export let onUpdate: (updatedUpload: any) => void;

	let visibility = upload.visibility || 'private';
	let price = upload.price || 0;
	let currency = upload.currency || 'SUI';
	let filename = upload.filename || '';
	let isLoading = false;

	async function handleSave() {
		try {
			isLoading = true;
			
			const updateData = {
				visibility,
				price: visibility === 'paid' ? price : 0,
				currency,
				filename
			};
			
			const updated = await apiServices.updateUpload(upload.blobId, updateData);
			
			// Create a complete updated upload object
			const updatedUpload = {
				...upload, // Keep original data
				...updated, // Add updated data from API
				visibility,
				price: updateData.price,
				currency,
				filename
			};
			
			console.log('Sending updated upload:', updatedUpload);
			onUpdate(updatedUpload);
			onClose();
		} catch (error) {
			console.error('Failed to update privacy:', error);
			toastStore.error('Failed to update privacy settings');
		} finally {
			isLoading = false;
		}
	}
</script>

<div class="fixed inset-0 z-50 flex items-center justify-center p-4" in:fade>
	<!-- Backdrop -->
	<div 
		class="absolute inset-0 bg-black/80 backdrop-blur-sm"
		onclick={onClose}
		role="button"
		tabindex="0"
		onkeydown={(e) => e.key === 'Escape' && onClose()}
	></div>

	<!-- Modal -->
	<div class="bg-odoben-surface/90 backdrop-blur-xl border border-odoben-primary/10 rounded-3xl p-8 w-full max-w-md shadow-2xl relative" transition:scale>
			<button 
				class="absolute top-4 right-4 text-odoben-text/60 hover:text-odoben-text transition-colors"
				onclick={onClose}
			>
				<X class="w-6 h-6" />
			</button>

			<h2 class="text-2xl font-bold text-odoben-text mb-6">Edit File</h2>

			<div class="space-y-6">
				<!-- Filename Input -->
				<div>
					<label class="block text-sm font-medium text-odoben-text/80 mb-2">
						<FileText class="w-4 h-4 inline mr-1" />
						Filename
					</label>
					<input 
						type="text" 
						bind:value={filename}
						class="w-full bg-odoben-bg/50 border border-odoben-primary/10 rounded-lg px-4 py-3 text-odoben-text focus:outline-none focus:border-odoben-primary transition-colors"
						placeholder="Enter filename..."
					/>
				</div>

				<!-- Visibility Selection -->
				<div>
					<label class="block text-sm font-medium text-odoben-text/80 mb-2">Privacy</label>
					<div class="grid grid-cols-3 gap-3">
						<button 
							class="p-3 rounded-xl border transition-all flex flex-col items-center gap-2 {visibility === 'public' ? 'bg-green-500/20 border-green-500 text-green-400' : 'bg-odoben-surface/50 border-odoben-primary/10 text-odoben-text/60 hover:bg-odoben-surface/80'}"
							onclick={() => visibility = 'public'}
						>
							<Globe class="w-6 h-6" />
							<span class="text-xs font-medium">Public</span>
						</button>
						<button 
							class="p-3 rounded-xl border transition-all flex flex-col items-center gap-2 {visibility === 'private' ? 'bg-gray-700/50 border-gray-500 text-gray-300' : 'bg-odoben-surface/50 border-odoben-primary/10 text-odoben-text/60 hover:bg-odoben-surface/80'}"
							onclick={() => visibility = 'private'}
						>
							<Lock class="w-6 h-6" />
							<span class="text-xs font-medium">Private</span>
						</button>
						<button 
							class="p-3 rounded-xl border transition-all flex flex-col items-center gap-2 {visibility === 'paid' ? 'bg-amber-500/20 border-amber-500 text-amber-400' : 'bg-odoben-surface/50 border-odoben-primary/10 text-odoben-text/60 hover:bg-odoben-surface/80'}"
							onclick={() => visibility = 'paid'}
						>
							<DollarSign class="w-6 h-6" />
							<span class="text-xs font-medium">Paid</span>
						</button>
					</div>
				</div>

				<!-- Paid Settings -->
				{#if visibility === 'paid'}
					<div class="space-y-4 p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl" transition:fade>
						<div>
							<span class="block text-sm font-medium text-amber-200/80 mb-1">Price</span>
							<div class="relative">
								<DollarSign class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500" />
								<input 
									type="number" 
									bind:value={price}
									min="0"
									step="0.1"
									class="w-full bg-black/20 border border-odoben-primary/10 rounded-lg px-4 py-3 text-odoben-text focus:outline-none focus:border-amber-500 transition-colors pl-10"
									placeholder="0.00"
								/>
							</div>
						</div>
						<div>
							<span class="block text-sm font-medium text-amber-200/80 mb-1">Currency</span>
							<select 
								bind:value={currency}
								class="w-full bg-black/20 border border-odoben-primary/10 rounded-lg px-4 py-3 text-odoben-text focus:outline-none focus:border-amber-500 transition-colors"
							>
								<option value="SUI">SUI</option>
								<option value="USDC">USDC</option>
							</select>
						</div>
					</div>
				{/if}

				<!-- Private Settings -->
				{#if visibility === 'private'}
					<div class="space-y-4 p-4 bg-gray-800/30 border border-gray-700/30 rounded-xl" transition:fade>
						<div>
							<span class="block text-sm font-medium text-gray-400 mb-1">Access Password (Optional)</span>
							<div class="relative">
								<input 
									type="password" 
									class="w-full bg-black/20 border border-odoben-primary/10 rounded-lg px-4 py-3 text-odoben-text focus:outline-none focus:border-odoben-primary transition-colors"
									placeholder="Set a password..."
								/>
							</div>
						</div>
					</div>
				{/if}

				<div class="flex gap-3 mt-8">
					<button 
						class="flex-1 py-3 bg-odoben-surface border border-odoben-primary/10 text-odoben-text/80 rounded-lg font-medium hover:bg-odoben-surface/80 transition-colors"
						onclick={onClose}
					>
						Cancel
					</button>
					<button 
						class="px-6 py-2 bg-gradient-to-r from-odoben-accent to-odoben-aqua text-odoben-text rounded-lg font-medium hover:shadow-lg hover:shadow-odoben-bg/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
						onclick={handleSave}
						disabled={isLoading}
					>
						{#if isLoading}
							<div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
							Saving...
						{:else}
							Save Changes
						{/if}
					</button>
				</div>
			</div>
	</div>
</div>

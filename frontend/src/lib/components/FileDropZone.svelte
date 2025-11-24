<script lang="ts">
	let { isDragging = $bindable(false), maxFileSize = 10 * 1024 * 1024, onFileSelected } = $props<{ isDragging?: boolean; maxFileSize?: number; onFileSelected: (file: File) => void }>(); // 10 MiB

	function handleDrop(e: DragEvent) {
		e.preventDefault();
		isDragging = false;

		if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
			onFileSelected(e.dataTransfer.files[0]);
		}
	}
</script>

<div
	role="button"
	tabindex="0"
	class="border-2 border-dashed border-odoben-primary/20 rounded-2xl p-12 text-center cursor-pointer transition-all hover:border-odoben-primary/50 hover:bg-odoben-surface/50 {isDragging ? 'border-odoben-primary bg-odoben-surface/30' : ''}"
	ondragover={(e) => { e.preventDefault(); isDragging = true; }}
	ondragleave={() => isDragging = false}
	ondrop={handleDrop}
	onclick={() => document.getElementById('file-input')?.click()}
	onkeydown={(e) => e.key === 'Enter' && document.getElementById('file-input')?.click()}
>
	<div class="text-6xl mb-4">📁</div>
	<p class="text-xl font-semibold text-odoben-text mb-2">Drop your file here</p>
	<p class="text-odoben-text/60">or click to browse</p>
	<p class="text-sm text-odoben-text/40 mt-4">Max {Math.round(maxFileSize / (1024 * 1024))} MiB</p>
	
	<input
		id="file-input"
		type="file"
		class="hidden"
		onchange={(e) => {
			const files = (e.target as HTMLInputElement).files;
			if (files && files.length > 0) {
				onFileSelected(files[0]);
			}
		}}
	/>
</div>
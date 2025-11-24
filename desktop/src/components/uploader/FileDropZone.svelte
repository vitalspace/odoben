<script lang="ts">
  import { createEventDispatcher } from "svelte";

  let { isDragging = $bindable(false), maxFileSize = 10 * 1024 * 1024 } =
    $props(); // 10 MiB
  const dispatch = createEventDispatcher();

  function handleDragOver(e: DragEvent) {
    e.preventDefault();
    isDragging = true;
  }

  function handleDragLeave() {
    isDragging = false;
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    isDragging = false;

    if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
      dispatch("fileSelected", e.dataTransfer.files[0]);
    }
  }

  function handleClick() {
    document.getElementById("file-input")?.click();
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === "Enter") {
      document.getElementById("file-input")?.click();
    }
  }

  function handleFileInput(e: Event) {
    const files = (e.target as HTMLInputElement).files;
    if (files && files.length > 0) {
      dispatch("fileSelected", files[0]);
    }
  }
</script>

<!-- @ts-ignore - Svelte 5 event handlers are valid but TypeScript doesn't recognize them yet -->
<div
  role="button"
  tabindex="0"
  class="border-2 border-dashed border-blue-500/20 rounded-2xl p-12 text-center cursor-pointer transition-all hover:border-blue-500/50 hover:bg-[#2a2a2a]/50 {isDragging
    ? 'border-blue-500 bg-[#2a2a2a]/30'
    : ''}"
  ondragover={handleDragOver}
  ondragleave={handleDragLeave}
  ondrop={handleDrop}
  onclick={handleClick}
  onkeydown={handleKeyDown}
>
  <div class="text-6xl mb-4">📁</div>
  <p class="text-xl font-semibold text-white mb-2">Drop your file here</p>
  <p class="text-gray-400">or click to browse</p>
  <p class="text-sm text-gray-600 mt-4">
    Max {Math.round(maxFileSize / (1024 * 1024))} MiB
  </p>

  <!-- @ts-ignore - Svelte 5 event handlers are valid but TypeScript doesn't recognize them yet -->
  <input
    id="file-input"
    type="file"
    class="hidden"
    onchange={handleFileInput}
  />
</div>

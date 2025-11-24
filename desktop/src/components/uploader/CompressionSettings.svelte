<script lang="ts">
  import { createEventDispatcher } from "svelte";

  let {
    compressionEnabled = $bindable(true),
    compressionQuality = $bindable(70),
    maxWidth = $bindable(1920),
    originalSize = $bindable(0),
    compressedSize = $bindable(0),
  } = $props();
  const dispatch = createEventDispatcher();

  function formatFileSize(bytes: number) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  function onToggle() {
    compressionEnabled = !compressionEnabled;
    dispatch("toggleCompression");
  }

  function onQualityChange() {
    dispatch("qualityChange", compressionQuality);
  }

  function onMaxWidthChange() {
    dispatch("maxWidthChange", maxWidth);
  }
</script>

<div class="flex items-center gap-3 mb-6">
  <label class="relative inline-flex items-center cursor-pointer">
    <input
      type="checkbox"
      bind:checked={compressionEnabled}
      onchange={onToggle}
      class="sr-only peer"
    />
    <div
      class="w-11 h-6 bg-[#2a2a2a]/30 rounded-full peer peer-checked:bg-blue-500 peer-focus:ring-2 peer-focus:ring-blue-500/50 transition-colors"
    ></div>
    <div
      class="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"
    ></div>
  </label>
  <span class="font-medium text-white/80">Enable Image Compression</span>
</div>

{#if compressionEnabled}
  <div class="space-y-4">
    <!-- Quality Slider -->
    <div>
      <div class="flex justify-between mb-2">
        <span class="font-medium text-white/60">Quality</span>
        <span class="text-blue-400 font-mono">{compressionQuality}%</span>
      </div>
      <input
        type="range"
        min="30"
        max="95"
        bind:value={compressionQuality}
        onchange={onQualityChange}
        class="w-full h-2 bg-[#2a2a2a]/30 rounded-lg appearance-none cursor-pointer accent-blue-500"
      />
    </div>

    <!-- Max Width Slider -->
    <div>
      <div class="flex justify-between mb-2">
        <span class="font-medium text-white/60">Max Width (px)</span>
        <span class="text-blue-400 font-mono">{maxWidth}</span>
      </div>
      <input
        type="range"
        min="640"
        max="3840"
        step="160"
        bind:value={maxWidth}
        onchange={onMaxWidthChange}
        class="w-full h-2 bg-[#2a2a2a]/30 rounded-lg appearance-none cursor-pointer accent-blue-500"
      />
    </div>

    <!-- Size Comparison -->
    <div class="grid grid-cols-2 gap-4 mt-4">
      <div
        class="bg-[#2a2a2a]/30 p-4 rounded-xl text-center border-l-4 border-red-500/50 backdrop-blur-sm"
      >
        <div class="text-xs text-white/60 uppercase mb-1">Original</div>
        <div class="text-xl font-bold text-white">
          {formatFileSize(originalSize)}
        </div>
      </div>
      <div
        class="bg-[#2a2a2a]/30 p-4 rounded-xl text-center border-l-4 border-green-500/50 backdrop-blur-sm"
      >
        <div class="text-xs text-white/60 uppercase mb-1">To Upload</div>
        <div class="text-xl font-bold text-white">
          {formatFileSize(compressedSize)}
        </div>
      </div>
    </div>

    <!-- Reduction Info -->
    {#if compressedSize < originalSize}
      <div
        class="bg-green-500/10 border border-green-500/30 text-green-400 p-3 rounded-xl text-center text-sm font-medium backdrop-blur-sm"
      >
        ✅ Reduction: {(
          ((originalSize - compressedSize) / originalSize) *
          100
        ).toFixed(1)}% saved
      </div>
    {:else}
      <div
        class="bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 p-3 rounded-xl text-center text-sm font-medium backdrop-blur-sm"
      >
        ℹ️ Image already optimized. Uploading original.
      </div>
    {/if}
  </div>
{/if}

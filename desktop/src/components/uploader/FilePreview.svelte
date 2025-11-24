<script lang="ts">
  import { slide } from "svelte/transition";

  let {
    uploadResult = $bindable(null),
    previewUrl = $bindable(null),
    selectedFile = $bindable(null),
  } = $props();

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
  }
</script>

<!-- Upload Result -->
{#if uploadResult}
  <div
    class="bg-green-500/10 border-2 border-green-500/30 rounded-2xl p-6 mb-8 backdrop-blur-sm"
    transition:slide
  >
    <h3 class="text-green-400 font-bold text-lg mb-4">
      ✅ File Uploaded Successfully!
    </h3>

    <div class="space-y-3">
      <div
        class="bg-[#2a2a2a]/30 p-3 rounded-xl backdrop-blur-sm border border-blue-500/10"
      >
        <div class="text-xs text-white/60 uppercase font-semibold mb-1">
          Blob ID
        </div>
        <div class="flex justify-between items-center gap-2">
          <code class="text-sm text-white break-all">{uploadResult.blobId}</code
          >
          <button
            class="text-blue-400 hover:text-blue-300 text-sm font-medium"
            on:click={() => copyToClipboard(uploadResult?.blobId || "")}
            >Copy</button
          >
        </div>
      </div>

      <div
        class="bg-[#2a2a2a]/30 p-3 rounded-xl backdrop-blur-sm border border-blue-500/10"
      >
        <div class="text-xs text-white/60 uppercase font-semibold mb-1">
          Access URL
        </div>
        <div class="flex justify-between items-center gap-2">
          <code class="text-sm text-white break-all truncate"
            >{uploadResult.url}</code
          >
          <button
            class="text-blue-400 hover:text-blue-300 text-sm font-medium"
            on:click={() => copyToClipboard(uploadResult?.url || "")}
            >Copy</button
          >
        </div>
      </div>
    </div>
  </div>
{/if}

<!-- Preview -->
{#if previewUrl}
  <div class="bg-[#2a2a2a]/30 rounded-xl p-6" transition:slide>
    <h3 class="text-white font-bold text-lg mb-4">👁️ Preview</h3>
    <div
      class="bg-[#2a2a2a]/50 p-4 rounded-lg shadow-sm flex justify-center border border-blue-500/10"
    >
      {#if selectedFile?.type.startsWith("image/")}
        <img
          src={previewUrl}
          alt="Preview"
          class="max-w-full h-auto rounded-lg shadow-md"
        />
      {:else}
        <div class="text-center py-8">
          <div class="text-6xl mb-2">📄</div>
          <p class="text-white/60">{selectedFile?.name}</p>
        </div>
      {/if}
    </div>
  </div>
{/if}

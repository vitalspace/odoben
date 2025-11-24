<script lang="ts">
  import { createEventDispatcher } from "svelte";

  let { isLoading = $bindable(false), loadingText = $bindable("") } = $props();
  const dispatch = createEventDispatcher();

  function onUpload() {
    dispatch("upload");
  }

  function onClear() {
    dispatch("clear");
  }
</script>

<div class="flex gap-4 mb-8">
  <button
    class="flex-1 bg-gradient-to-r from-blue-600 to-blue-400 text-white py-3 px-6 rounded-xl font-semibold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/50 transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
    onclick={onUpload}
    disabled={isLoading}
  >
    {#if isLoading}
      <span class="inline-block animate-spin mr-2">⏳</span>
    {/if}
    {isLoading ? loadingText || "Processing..." : "📤 Upload to Walrus"}
  </button>
  <button
    class="px-6 py-3 bg-[#2a2a2a]/30 text-white/80 rounded-xl font-semibold hover:bg-[#2a2a2a]/50 transition-colors border border-blue-500/10"
    onclick={onClear}
    disabled={isLoading}
  >
    🗑️ Clear
  </button>
</div>

{#if isLoading}
  <div class="text-center py-8">
    <div
      class="w-12 h-12 border-4 border-blue-500/10 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"
    ></div>
    <p class="text-white/60 font-medium">{loadingText}</p>
  </div>
{/if}

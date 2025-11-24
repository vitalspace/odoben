<script>
  import { fade, scale } from "svelte/transition";
  import { X, Lock, Globe, DollarSign, FileText } from "lucide-svelte";
  import { apiServices } from "../../lib/services/apiServices.js";
  import { toastStore } from "../../lib/stores/toastStore.js";

  export let upload;
  export let onClose;
  export let onUpdate;

  let visibility = upload.visibility || "private";
  let price = upload.price || 0;
  let currency = upload.currency || "SUI";
  let filename = upload.filename || "";
  let isLoading = false;

  async function handleSave() {
    try {
      isLoading = true;

      const updateData = {
        visibility,
        price: visibility === "paid" ? price : 0,
        currency,
        filename,
      };

      const updated = await apiServices.updateUpload(upload.blobId, updateData);

      // Create a complete updated upload object
      const updatedUpload = {
        ...upload, // Keep original data
        ...updated, // Add updated data from API
        visibility,
        price: updateData.price,
        currency,
        filename,
      };

      console.log("Sending updated upload:", updatedUpload);
      onUpdate(updatedUpload);
      onClose();
    } catch (error) {
      console.error("Failed to update privacy:", error);
      toastStore.error("Failed to update privacy settings");
    } finally {
      isLoading = false;
    }
  }
</script>

<div class="fixed inset-0 z-50 flex items-center justify-center p-4" in:fade>
  <!-- Backdrop -->
  <div
    class="absolute inset-0 bg-black/80 backdrop-blur-sm"
    on:click={onClose}
    role="button"
    tabindex="0"
    on:keydown={(e) => e.key === "Escape" && onClose()}
  ></div>

  <!-- Modal -->
  <div
    class="bg-[#2a2a2a]/90 backdrop-blur-xl border border-white/10 rounded-3xl p-8 w-full max-w-md shadow-2xl relative"
    transition:scale
  >
    <button
      class="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
      on:click={onClose}
    >
      <X class="w-6 h-6" />
    </button>

    <h2 class="text-2xl font-bold text-white mb-6">Edit File</h2>

    <div class="space-y-6">
      <!-- Filename Input -->
      <div>
        <label class="block text-sm font-medium text-gray-300 mb-2">
          <FileText class="w-4 h-4 inline mr-1" />
          Filename
        </label>
        <input
          type="text"
          bind:value={filename}
          class="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
          placeholder="Enter filename..."
        />
      </div>

      <!-- Visibility Selection -->
      <div>
        <label class="block text-sm font-medium text-gray-300 mb-2"
          >Privacy</label
        >
        <div class="grid grid-cols-3 gap-3">
          <button
            class="p-3 rounded-xl border transition-all flex flex-col items-center gap-2 {visibility ===
            'public'
              ? 'bg-green-500/20 border-green-500 text-green-400'
              : 'bg-[#2a2a2a]/50 border-white/10 text-gray-400 hover:bg-[#2a2a2a]/80'}"
            on:click={() => (visibility = "public")}
          >
            <Globe class="w-6 h-6" />
            <span class="text-xs font-medium">Public</span>
          </button>
          <button
            class="p-3 rounded-xl border transition-all flex flex-col items-center gap-2 {visibility ===
            'private'
              ? 'bg-gray-700/50 border-gray-500 text-gray-300'
              : 'bg-[#2a2a2a]/50 border-white/10 text-gray-400 hover:bg-[#2a2a2a]/80'}"
            on:click={() => (visibility = "private")}
          >
            <Lock class="w-6 h-6" />
            <span class="text-xs font-medium">Private</span>
          </button>
          <button
            class="p-3 rounded-xl border transition-all flex flex-col items-center gap-2 {visibility ===
            'paid'
              ? 'bg-amber-500/20 border-amber-500 text-amber-400'
              : 'bg-[#2a2a2a]/50 border-white/10 text-gray-400 hover:bg-[#2a2a2a]/80'}"
            on:click={() => (visibility = "paid")}
          >
            <DollarSign class="w-6 h-6" />
            <span class="text-xs font-medium">Paid</span>
          </button>
        </div>
      </div>

      <!-- Paid Settings -->
      {#if visibility === "paid"}
        <div
          class="space-y-4 p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl"
          transition:fade
        >
          <div>
            <label class="block text-sm font-medium text-amber-200/80 mb-1"
              >Price</label
            >
            <div class="relative">
              <DollarSign
                class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500"
              />
              <input
                type="number"
                bind:value={price}
                min="0"
                step="0.1"
                class="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors pl-10"
                placeholder="0.00"
              />
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-amber-200/80 mb-1"
              >Currency</label
            >
            <select
              bind:value={currency}
              class="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors"
            >
              <option value="SUI">SUI</option>
              <option value="USDC">USDC</option>
            </select>
          </div>
        </div>
      {/if}

      <!-- Private Settings -->
      {#if visibility === "private"}
        <div
          class="space-y-4 p-4 bg-gray-800/30 border border-gray-700/30 rounded-xl"
          transition:fade
        >
          <div>
            <label class="block text-sm font-medium text-gray-400 mb-1"
              >Access Password (Optional)</label
            >
            <div class="relative">
              <input
                type="password"
                class="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="Set a password..."
              />
            </div>
          </div>
        </div>
      {/if}

      <div class="flex gap-3 mt-8">
        <button
          class="flex-1 py-3 bg-[#2a2a2a] border border-white/10 text-gray-300 rounded-lg font-medium hover:bg-[#2a2a2a]/80 transition-colors"
          on:click={onClose}
        >
          Cancel
        </button>
        <button
          class="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          on:click={handleSave}
          disabled={isLoading}
        >
          {#if isLoading}
            <div
              class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
            ></div>
            Saving...
          {:else}
            Save Changes
          {/if}
        </button>
      </div>
    </div>
  </div>
</div>

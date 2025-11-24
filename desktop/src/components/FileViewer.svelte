<script>
  import { fade } from "svelte/transition";
  import { createEventDispatcher } from "svelte";
  import { Eye } from "lucide-svelte";
  import { apiServices } from "../lib/services/apiServices.js";
  import { toastStore } from "../lib/stores/toastStore.js";
  import EditPrivacyModal from "./dashboard/EditPrivacyModal.svelte";
  import Guardian from "./Guardian.svelte"; // Import Guardian

  export let uploads = [];
  export let isLoading = false;
  export let user = null; // Accept user prop
  export let readOnly = false; // New prop to disable editing

  const dispatch = createEventDispatcher();

  const AGGREGATOR = "https://aggregator.walrus-testnet.walrus.space";

  // View mode state
  let viewMode = "grid"; // 'grid' | 'list' | 'details'
  let editingUpload = null;
  let selectedUpload = null;

  const viewModes = [
    {
      id: "grid",
      label: "Grid",
      icon: "⊞",
      description: "Show files in a grid layout",
    },
    {
      id: "list",
      label: "List",
      icon: "☰",
      description: "Show files in a compact list",
    },
    {
      id: "details",
      label: "Details",
      icon: "📋",
      description: "Show detailed information",
    },
  ];

  function getBlobUrl(blobId) {
    return `${AGGREGATOR}/v1/blobs/${blobId}`;
  }

  function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  }

  function formatDate(date) {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  function copyToClipboard(text) {
    navigator.clipboard.writeText(text);
    dispatch("copy", text);
  }

  function copyShareLink(slug) {
    // Assuming we want to share the web link
    const url = `http://localhost:5173/s/${slug}`;
    navigator.clipboard.writeText(url);
    toastStore.success("Share link copied to clipboard!");
  }

  function getFileTypeIcon(mimeType) {
    if (mimeType.startsWith("image/")) return "🖼️";
    if (mimeType.startsWith("video/")) return "🎥";
    if (mimeType.startsWith("audio/")) return "🎵";
    if (mimeType.includes("pdf")) return "📄";
    return "📄";
  }

  function getFileTypeColor(mimeType) {
    if (mimeType.startsWith("image/"))
      return "bg-odoben-aqua/20 text-odoben-aqua border-odoben-aqua/30";
    if (mimeType.startsWith("video/"))
      return "bg-odoben-accent/20 text-odoben-primary border-odoben-accent/30";
    if (mimeType.startsWith("audio/"))
      return "bg-odoben-primary/20 text-odoben-primary border-odoben-primary/30";
    if (mimeType.includes("pdf"))
      return "bg-odoben-accent/20 text-odoben-text border-odoben-accent/30";
    return "bg-odoben-surface text-odoben-text/60 border-odoben-primary/10";
  }

  function truncateMiddle(str, maxLength) {
    if (str.length <= maxLength) return str;
    const start = Math.floor((maxLength - 3) / 2);
    const end = str.length - Math.ceil((maxLength - 3) / 2);
    return str.substring(0, start) + "..." + str.substring(end);
  }

  async function handleUnlock(upload) {
    // Just open the Guardian view, it handles unlocking
    selectedUpload = upload;
  }

  function handleGuardianUnlock(blobId) {
    // Update the upload with the new blobId (unlocked)
    if (selectedUpload) {
      selectedUpload.blobId = blobId;
      // Also update in the main list
      handleUpdate(selectedUpload);
    }
  }

  async function handleUpdate(updatedUpload) {
    console.log("Updating upload:", updatedUpload);

    // Update the upload in the uploads array with proper reactivity
    uploads = uploads.map((upload) => {
      if (upload._id === updatedUpload._id) {
        // Return updated upload with new properties
        return {
          ...upload,
          ...updatedUpload,
          // Ensure specific fields are updated
          visibility: updatedUpload.visibility,
          price: updatedUpload.price,
          currency: updatedUpload.currency,
          blobId: updatedUpload.blobId, // Ensure blobId is updated if unlocked
        };
      }
      return upload;
    });

    dispatch("update", updatedUpload);
  }

  async function downloadFile(upload) {
    // Use Guardian's download logic if possible, or keep this simple one.
    // Actually, Guardian has a robust download. Let's just open Guardian for download too?
    // Or keep this simple one for quick download if already unlocked.
    // If locked, we must use Guardian.
    if (upload.blobId === "PAYMENT_REQUIRED") {
      selectedUpload = upload;
      return;
    }

    try {
      const response = await fetch(getBlobUrl(upload.blobId));
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = upload.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
      toastStore.error("Failed to download file");
    }
  }
</script>

{#if isLoading}
  <div class="flex items-center justify-center py-12">
    <div
      class="animate-spin rounded-full h-12 w-12 border-4 border-odoben-primary/20 border-t-odoben-primary"
    ></div>
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
          on:click={() => (viewMode = mode.id)}
          class="px-4 py-2 rounded-lg border transition-all {viewMode ===
          mode.id
            ? 'bg-odoben-primary/20 border-odoben-primary/50 text-odoben-primary'
            : 'bg-odoben-bg/30 border-odoben-primary/10 text-odoben-text/60 hover:bg-odoben-bg/50 hover:text-odoben-text'}"
          title={mode.description}
        >
          <span class="mr-2">{mode.icon}</span>
          {mode.label}
        </button>
      {/each}
    </div>

    <!-- Grid View -->
    {#if viewMode === "grid"}
      <div
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-40"
        in:fade
      >
        {#each uploads as upload (upload._id)}
          <div
            class="bg-odoben-surface/50 backdrop-blur-sm rounded-xl border border-odoben-primary/10 hover:border-odoben-primary/50 transition-all p-4"
          >
            <!-- Preview -->
            <div
              class="aspect-video bg-odoben-bg/50 rounded-lg mb-3 flex items-center justify-center text-4xl cursor-pointer"
              on:click={() => (selectedUpload = upload)}
            >
              {getFileTypeIcon(upload.mimeType)}
            </div>

            <!-- Info -->
            <div class="space-y-2">
              <h3
                class="font-medium text-odoben-text truncate cursor-pointer hover:text-odoben-primary transition-colors"
                title={upload.filename}
                on:click={() => (selectedUpload = upload)}
              >
                {upload.filename}
              </h3>
              <div class="flex items-center gap-2">
                {#if upload.visibility === "private"}
                  <span
                    class="text-[10px] bg-odoben-surface text-odoben-text/60 px-1.5 py-0.5 rounded border border-odoben-primary/10"
                    >🔒 Private</span
                  >
                {:else if upload.visibility === "paid"}
                  <span
                    class="text-[10px] bg-odoben-accent/20 text-odoben-primary px-1.5 py-0.5 rounded border border-odoben-accent/30"
                    >💰 {upload.price} {upload.currency}</span
                  >
                {:else}
                  <span
                    class="text-[10px] bg-odoben-aqua/20 text-odoben-aqua px-1.5 py-0.5 rounded border border-odoben-aqua/30"
                    >🌍 Public</span
                  >
                {/if}
              </div>
              <div class="flex items-center gap-4 text-sm text-odoben-text/60">
                <span class="flex items-center gap-1">
                  {formatFileSize(upload.size)}
                </span>
                <span class="flex items-center gap-1">
                  {formatDate(upload.createdAt)}
                </span>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex items-center gap-2 mt-3">
              <div
                class="px-2 py-1 text-xs text-odoben-text/60 bg-odoben-bg/50 rounded border border-odoben-primary/20 font-mono"
              >
                {upload.mimeType.split("/")[1]?.toUpperCase() || "FILE"}
              </div>

              <button
                on:click={() => copyShareLink(upload.slug)}
                class="p-2 bg-odoben-bg/30 hover:bg-odoben-bg/50 text-odoben-text/60 hover:text-odoben-text rounded-lg border border-odoben-primary/10 transition-colors"
                title="Copy Share Link"
              >
                <svg
                  class="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                  />
                </svg>
              </button>

              {#if !readOnly}
                <button
                  on:click={() => (editingUpload = upload)}
                  class="p-2 bg-odoben-bg/30 hover:bg-odoben-bg/50 text-odoben-text/60 hover:text-odoben-text rounded-lg border border-odoben-primary/10 transition-colors"
                  title="Edit Privacy"
                >
                  <svg
                    class="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                    />
                  </svg>
                </button>
              {/if}

              {#if upload.blobId === "PAYMENT_REQUIRED"}
                <button
                  on:click={() => handleUnlock(upload)}
                  class="p-2 bg-odoben-accent/20 hover:bg-odoben-accent/30 border border-odoben-accent/30 rounded-lg transition-colors text-odoben-primary"
                  title="Buy File"
                >
                  <svg
                    class="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </button>
              {:else}
                <button
                  on:click={() => (selectedUpload = upload)}
                  class="p-2 bg-odoben-primary/20 hover:bg-odoben-primary/30 border border-odoben-primary/30 rounded-lg transition-colors text-odoben-primary"
                  title="View File"
                >
                  <Eye class="w-4 h-4" />
                </button>
                <button
                  on:click={() => downloadFile(upload)}
                  class="p-2 bg-odoben-aqua/20 hover:bg-odoben-aqua/30 border border-odoben-aqua/30 rounded-lg transition-colors text-odoben-aqua"
                  title="Download File"
                >
                  <svg
                    class="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                </button>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    {/if}

    <!-- List View -->
    {#if viewMode === "list"}
      <div class="space-y-3" in:fade>
        {#each uploads as upload (upload._id)}
          <div
            class="group bg-odoben-surface/50 hover:bg-odoben-surface/70 border border-odoben-primary/10 rounded-xl p-4 transition-all hover:shadow-lg"
          >
            <div class="flex items-center gap-4">
              <!-- File Icon -->
              <div
                class="text-2xl cursor-pointer"
                on:click={() => (selectedUpload = upload)}
              >
                {getFileTypeIcon(upload.mimeType)}
              </div>

              <!-- File Info -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <h3
                    class="font-semibold text-odoben-text truncate group-hover:text-odoben-primary transition-colors cursor-pointer"
                    title={upload.filename}
                    on:click={() => (selectedUpload = upload)}
                  >
                    {truncateMiddle(upload.filename, 30)}
                  </h3>
                  <!-- Visibility Badge -->
                  {#if upload.visibility === "private"}
                    <span
                      class="text-[10px] bg-odoben-surface text-odoben-text/60 px-1.5 py-0.5 rounded border border-odoben-primary/10"
                      >🔒 Private</span
                    >
                  {:else if upload.visibility === "paid"}
                    <span
                      class="text-[10px] bg-odoben-accent/20 text-odoben-primary px-1.5 py-0.5 rounded border border-odoben-accent/30"
                      >💰 {upload.price} {upload.currency}</span
                    >
                  {:else}
                    <span
                      class="text-[10px] bg-odoben-aqua/20 text-odoben-aqua px-1.5 py-0.5 rounded border border-odoben-aqua/30"
                      >🌍 Public</span
                    >
                  {/if}
                </div>
                <div
                  class="flex items-center gap-4 text-sm text-odoben-text/60"
                >
                  <span class="flex items-center gap-1">
                    {formatFileSize(upload.size)}
                  </span>
                  <span class="flex items-center gap-1">
                    {formatDate(upload.createdAt)}
                  </span>
                </div>
              </div>

              <!-- Actions -->
              <div class="flex items-center gap-2">
                <div
                  class="px-2 py-1 text-xs text-odoben-text/60 bg-odoben-bg/50 rounded border border-odoben-primary/20 font-mono"
                >
                  {upload.mimeType.split("/")[1]?.toUpperCase() || "FILE"}
                </div>

                <button
                  on:click={() => copyShareLink(upload.slug)}
                  class="p-2 bg-odoben-bg/30 hover:bg-odoben-bg/50 text-odoben-text/60 hover:text-odoben-text rounded-lg border border-odoben-primary/10 transition-colors"
                  title="Copy Share Link"
                >
                  <svg
                    class="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                    />
                  </svg>
                </button>

                {#if !readOnly}
                  <button
                    on:click={() => (editingUpload = upload)}
                    class="p-2 bg-odoben-bg/30 hover:bg-odoben-bg/50 text-odoben-text/60 hover:text-odoben-text rounded-lg border border-odoben-primary/10 transition-colors"
                    title="Edit Privacy"
                  >
                    <svg
                      class="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                      />
                    </svg>
                  </button>
                {/if}

                {#if upload.blobId === "PAYMENT_REQUIRED"}
                  <button
                    on:click={() => handleUnlock(upload)}
                    class="p-2 bg-odoben-accent/20 hover:bg-odoben-accent/30 border border-odoben-accent/30 rounded-lg transition-colors text-odoben-primary"
                    title="Buy File"
                  >
                    <svg
                      class="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </button>
                {:else}
                  <button
                    on:click={() => (selectedUpload = upload)}
                    class="p-2 bg-odoben-primary/20 hover:bg-odoben-primary/30 border border-odoben-primary/30 rounded-lg transition-colors text-odoben-primary"
                    title="View File"
                  >
                    <Eye class="w-4 h-4" />
                  </button>
                  <button
                    on:click={() => downloadFile(upload)}
                    class="p-2 bg-odoben-aqua/20 hover:bg-odoben-aqua/30 border border-odoben-aqua/30 rounded-lg transition-colors text-odoben-aqua"
                    title="Download File"
                  >
                    <svg
                      class="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                  </button>
                {/if}
              </div>
            </div>
          </div>
        {/each}
      </div>
    {/if}

    <!-- Details View -->
    {#if viewMode === "details"}
      <div
        class="overflow-hidden rounded-xl border border-odoben-primary/10"
        in:fade
      >
        <table class="w-full">
          <thead class="bg-odoben-surface/50">
            <tr>
              <th
                class="px-6 py-4 text-left text-sm font-semibold text-odoben-text/80"
                >Name</th
              >
              <th
                class="px-6 py-4 text-left text-sm font-semibold text-odoben-text/80"
                >Status</th
              >
              <th
                class="px-6 py-4 text-left text-sm font-semibold text-odoben-text/80"
                >Type</th
              >
              <th
                class="px-6 py-4 text-left text-sm font-semibold text-odoben-text/80"
                >Size</th
              >
              <th
                class="px-6 py-4 text-left text-sm font-semibold text-odoben-text/80"
                >Date</th
              >
              <th
                class="px-6 py-4 text-left text-sm font-semibold text-odoben-text/80"
                >Blob ID</th
              >
              <th
                class="px-6 py-4 text-left text-sm font-semibold text-odoben-text/80"
                >Actions</th
              >
            </tr>
          </thead>
          <tbody class="divide-y divide-odoben-primary/10">
            {#each uploads as upload (upload._id)}
              <tr class="hover:bg-odoben-surface/30 transition-colors">
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <div
                      class="text-lg cursor-pointer"
                      on:click={() => (selectedUpload = upload)}
                    >
                      {getFileTypeIcon(upload.mimeType)}
                    </div>
                    <div>
                      <div
                        class="font-medium text-odoben-text cursor-pointer hover:text-odoben-primary transition-colors"
                        title={upload.filename}
                        on:click={() => (selectedUpload = upload)}
                      >
                        {truncateMiddle(upload.filename, 40)}
                      </div>
                      <div class="text-sm text-odoben-text/60">
                        {upload.mimeType}
                      </div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4">
                  {#if upload.visibility === "private"}
                    <span
                      class="text-xs bg-odoben-surface text-odoben-text/60 px-2 py-1 rounded-md border border-odoben-primary/10 inline-flex items-center gap-1"
                    >
                      🔒 Private
                    </span>
                  {:else if upload.visibility === "paid"}
                    <span
                      class="text-xs bg-odoben-accent/20 text-odoben-primary px-2 py-1 rounded-md border border-odoben-accent/30 inline-flex items-center gap-1"
                    >
                      💰 {upload.price}
                      {upload.currency}
                    </span>
                  {:else}
                    <span
                      class="text-xs bg-odoben-aqua/20 text-odoben-aqua px-2 py-1 rounded-md border border-odoben-aqua/30 inline-flex items-center gap-1"
                    >
                      🌍 Public
                    </span>
                  {/if}
                </td>
                <td class="px-6 py-4">
                  <span
                    class="px-2 py-1 text-xs font-mono rounded border {getFileTypeColor(
                      upload.mimeType
                    )}"
                  >
                    {upload.mimeType.split("/")[1]?.toUpperCase() || "UNKNOWN"}
                  </span>
                </td>
                <td class="px-6 py-4 text-sm text-odoben-text/60">
                  {formatFileSize(upload.size)}
                </td>
                <td class="px-6 py-4 text-sm text-odoben-text/60">
                  {formatDate(upload.createdAt)}
                </td>
                <td class="px-6 py-4">
                  <div class="flex items-center gap-2">
                    <code
                      class="text-xs text-odoben-text/60 font-mono bg-odoben-bg/50 px-2 py-1 rounded"
                    >
                      {#if upload.blobId === "PAYMENT_REQUIRED"}
                        LOCKED
                      {:else}
                        {upload.blobId.slice(0, 20)}...
                      {/if}
                    </code>
                    {#if upload.blobId !== "PAYMENT_REQUIRED"}
                      <button
                        on:click={() => copyToClipboard(upload.blobId)}
                        class="p-1 text-odoben-text/60 hover:text-odoben-primary transition-colors"
                        title="Copy Blob ID"
                      >
                        <svg
                          class="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                      </button>
                    {/if}
                  </div>
                </td>
                <td class="px-6 py-4">
                  <div class="flex items-center gap-2">
                    <button
                      on:click={() => copyShareLink(upload.slug)}
                      class="p-1.5 bg-odoben-bg/30 hover:bg-odoben-bg/50 text-odoben-text/60 hover:text-odoben-text rounded-lg border border-odoben-primary/10 transition-colors"
                      title="Copy Share Link"
                    >
                      <svg
                        class="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                        />
                      </svg>
                    </button>

                    {#if !readOnly}
                      <button
                        on:click={() => (editingUpload = upload)}
                        class="p-1.5 bg-odoben-bg/30 hover:bg-odoben-bg/50 text-odoben-text/60 hover:text-odoben-text rounded-lg border border-odoben-primary/10 transition-colors"
                        title="Edit Privacy"
                      >
                        <svg
                          class="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                          />
                        </svg>
                      </button>
                    {/if}

                    {#if upload.blobId === "PAYMENT_REQUIRED"}
                      <button
                        on:click={() => handleUnlock(upload)}
                        class="p-1.5 bg-odoben-accent/20 hover:bg-odoben-accent/30 border border-odoben-accent/30 rounded-lg transition-colors text-odoben-primary"
                        title="Buy File"
                      >
                        <svg
                          class="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                          />
                        </svg>
                      </button>
                    {:else}
                      <button
                        on:click={() => (selectedUpload = upload)}
                        class="p-1.5 bg-odoben-primary/20 hover:bg-odoben-primary/30 border border-odoben-primary/30 rounded-lg transition-colors text-odoben-primary"
                        title="View File"
                      >
                        <svg
                          class="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                      </button>
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
    onClose={() => (editingUpload = null)}
    onUpdate={handleUpdate}
  />
{/if}

{#if selectedUpload}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
    transition:fade
  >
    <!-- Close Button -->
    <button
      class="absolute top-6 right-6 p-2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors z-50"
      on:click={() => (selectedUpload = null)}
    >
      <svg
        class="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    </button>

    <div
      class="w-full h-full p-4 flex items-center justify-center overflow-auto"
    >
      <Guardian
        upload={selectedUpload}
        onUnlock={handleGuardianUnlock}
        {user}
      />
    </div>
  </div>
{/if}

<script>
  import { fade } from "svelte/transition";
  import {
    Key,
    Zap,
    Calendar,
    Clock,
    Copy,
    Trash2,
    CheckCircle,
    XCircle,
  } from "lucide-svelte";
  import axios from "../../lib/services/axios.js";
  import { onMount } from "svelte";

  let apiKeys = [];
  let isLoading = false;
  let newKey = null;
  let isGenerating = false;

  async function loadKeys() {
    isLoading = true;
    try {
      const res = await axios.get("/apikeys");
      apiKeys = res.data;
    } catch (e) {
      console.error(e);
    } finally {
      isLoading = false;
    }
  }

  async function generateKey() {
    isGenerating = true;
    try {
      const res = await axios.post("/apikeys", { name: "Desktop App Key" });
      newKey = res.data.apiKey;
      await loadKeys();
    } catch (e) {
      console.error(e);
    } finally {
      isGenerating = false;
    }
  }

  async function deleteKey(id) {
    if (!confirm("Are you sure? This action cannot be undone.")) return;
    try {
      await axios.delete(`/apikeys/${id}`);
      await loadKeys();
    } catch (e) {
      console.error(e);
    }
  }

  onMount(() => {
    loadKeys();
  });
</script>

<div
  class="bg-odoben-surface/50 backdrop-blur-xl border border-odoben-primary/10 rounded-3xl p-8"
>
  <div class="flex justify-end mb-6">
    <button
      class="px-6 py-3 bg-odoben-primary text-odoben-bg rounded-xl font-medium hover:shadow-lg hover:shadow-odoben-primary/30 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      on:click={generateKey}
      disabled={isGenerating}
    >
      {#if isGenerating}
        <Zap class="w-5 h-5 animate-pulse" />
        Generating...
      {:else}
        <Key class="w-5 h-5" />
        Generate New Key
      {/if}
    </button>
  </div>

  {#if newKey}
    <div
      class="mb-8 p-6 bg-odoben-aqua/10 border border-odoben-aqua/30 rounded-2xl"
      in:fade
    >
      <h3
        class="text-lg font-bold text-odoben-aqua mb-2 flex items-center gap-2"
      >
        <Key class="w-6 h-6 text-odoben-aqua" />
        New API Key Generated!
      </h3>
      <p class="text-odoben-aqua/80 mb-4 text-sm">
        Please copy this key now. You won't be able to see it again.
      </p>
      <div class="flex gap-2">
        <code
          class="flex-1 p-4 bg-odoben-bg/30 border border-odoben-aqua/20 rounded-xl font-mono text-odoben-aqua break-all text-sm backdrop-blur-sm"
        >
          {newKey}
        </code>
        <button
          class="px-6 py-2 bg-odoben-aqua text-odoben-bg rounded-xl hover:bg-odoben-aqua/90 transition-colors font-medium flex items-center gap-2"
          on:click={() => navigator.clipboard.writeText(newKey || "")}
        >
          <Copy class="w-4 h-4" />
          Copy
        </button>
      </div>
      <button
        class="mt-4 text-sm text-odoben-aqua hover:text-odoben-aqua/80 underline flex items-center gap-2"
        on:click={() => (newKey = null)}
      >
        <CheckCircle class="w-4 h-4" />
        I have saved it
      </button>
    </div>
  {/if}

  {#if isLoading}
    <div class="flex justify-center py-8">
      <div
        class="w-8 h-8 border-4 border-odoben-primary/10 border-t-odoben-primary rounded-full animate-spin"
      ></div>
    </div>
  {:else if apiKeys.length === 0}
    <div
      class="text-center py-12 bg-odoben-surface/5 border border-odoben-primary/10 rounded-2xl"
    >
      <Key class="w-16 h-16 mx-auto mb-4 opacity-50 text-odoben-text/40" />
      <p class="text-odoben-text/60 text-lg">No API keys generated yet</p>
      <p class="text-odoben-text/40 text-sm mt-2">
        Generate your first key to get started with the API
      </p>
    </div>
  {:else}
    <div class="space-y-4">
      {#each apiKeys as key (key._id)}
        <div
          class="flex items-center justify-between p-5 bg-odoben-surface/5 hover:bg-odoben-surface/10 rounded-2xl border border-odoben-primary/10 transition-all group"
        >
          <div class="flex-1">
            <div class="font-medium text-odoben-text text-lg mb-1">
              {key.name}
            </div>
            <div class="flex items-center gap-4 text-xs text-odoben-text/60">
              <span class="flex items-center gap-1">
                <Calendar class="w-3 h-3" />
                Created {new Date(key.createdAt).toLocaleDateString()}
              </span>
              {#if key.lastUsedAt}
                <span class="flex items-center gap-1">
                  <Clock class="w-3 h-3" />
                  Last used {new Date(key.lastUsedAt).toLocaleDateString()}
                </span>
              {/if}
            </div>
          </div>
          <button
            class="p-3 text-odoben-accent hover:text-odoben-accent/80 hover:bg-odoben-accent/10 rounded-xl transition-all border border-transparent hover:border-odoben-accent/20"
            on:click={() => deleteKey(key._id)}
            title="Revoke Key"
          >
            <Trash2 class="w-5 h-5" />
          </button>
        </div>
      {/each}
    </div>
  {/if}
</div>

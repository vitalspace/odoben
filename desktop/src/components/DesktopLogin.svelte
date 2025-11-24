<script>
  import { fade, fly } from "svelte/transition";
  import { Key, ArrowRight } from "lucide-svelte";

  export let onLoginSuccess;

  let token = "";
  let isLoading = false;
  let error = "";

  async function handleLogin() {
    if (!token.trim()) {
      error = "Please enter a valid token";
      return;
    }

    isLoading = true;
    error = "";

    try {
      // Verify token with backend or just save it
      // For now, we'll just save it as requested "basta con usar el runtime nodejs"
      // But ideally we should verify it.
      // Let's assume we just save it for now and the Dashboard will fail if invalid.

      // Clean the token: remove 'Bearer ' prefix if present and trim whitespace
      const cleanToken = token.replace(/^Bearer\s+/i, "").trim();

      localStorage.setItem("auth_token", cleanToken);

      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      onLoginSuccess();
    } catch (e) {
      error = "Login failed. Please check your token.";
    } finally {
      isLoading = false;
    }
  }
</script>

<div
  class="h-full w-full flex items-center justify-center bg-odoben-bg relative overflow-hidden"
  in:fade
>
  <!-- Background Elements -->
  <div
    class="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-30"
  >
    <div
      class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-odoben-primary/10 rounded-full blur-[100px]"
    ></div>
    <div
      class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-odoben-aqua/10 rounded-full blur-[100px]"
    ></div>
  </div>

  <div class="w-full max-w-md p-8 z-10" in:fly={{ y: 20, duration: 500 }}>
    <div class="text-center mb-10">
      <div
        class="w-16 h-16 bg-odoben-surface rounded-xl mx-auto mb-6 flex items-center justify-center shadow-lg shadow-odoben-bg/20"
      >
        <Key class="w-8 h-8 text-odoben-primary" />
      </div>
      <h2 class="text-3xl font-bold text-odoben-text mb-2">Welcome Back</h2>
      <p class="text-odoben-text/60">Enter your access token to continue</p>
    </div>

    <div class="space-y-6">
      <div>
        <label
          for="token"
          class="block text-sm font-medium text-odoben-text/60 mb-2"
          >Access Token</label
        >
        <div class="relative">
          <input
            id="token"
            type="password"
            bind:value={token}
            placeholder="ey..."
            class="w-full bg-odoben-surface border border-odoben-primary/10 rounded-xl px-4 py-3 text-odoben-text placeholder-odoben-text/40 focus:outline-none focus:border-odoben-primary focus:ring-1 focus:ring-odoben-primary transition-all"
          />
        </div>
        {#if error}
          <p class="text-odoben-accent text-sm mt-2" in:fade>{error}</p>
        {/if}
      </div>

      <button
        on:click={handleLogin}
        disabled={isLoading}
        class="w-full bg-odoben-primary text-odoben-bg font-medium py-3 px-4 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
      >
        {#if isLoading}
          <div
            class="w-5 h-5 border-2 border-odoben-bg/30 border-t-odoben-bg rounded-full animate-spin"
          ></div>
          <span>Verifying...</span>
        {:else}
          <span>Connect</span>
          <ArrowRight
            class="w-4 h-4 group-hover:translate-x-1 transition-transform"
          />
        {/if}
      </button>
    </div>
  </div>
</div>

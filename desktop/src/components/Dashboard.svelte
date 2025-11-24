<script>
  import { onMount } from "svelte";
  import { Upload, User, Key, Folder, ShoppingBag } from "lucide-svelte";
  import { apiServices } from "../lib/services/apiServices.js";
  import { toastStore } from "../lib/stores/toastStore.js";
  import ProfileCard from "./dashboard/ProfileCard.svelte";
  import FileViewer from "./FileViewer.svelte";
  import ApiKeys from "./dashboard/ApiKeys.svelte";
  import DesktopWalrusUploader from "./DesktopWalrusUploader.svelte";
  import { fade, fly } from "svelte/transition";

  let user = $state(null);
  let uploads = $state([]);
  let purchases = $state([]);
  let isLoadingUser = $state(true);
  let isLoadingUploads = $state(true);
  let isLoadingPurchases = $state(true);
  let isEditing = $state(false);
  let activeTab = $state("uploads"); // 'uploads' | 'purchases' | 'profile' | 'apikeys' | 'upload'
  let address = $state("");

  onMount(() => {
    loadData();
  });

  async function loadData() {
    isLoadingUser = true;
    isLoadingUploads = true;

    try {
      try {
        // Get profile using the token (via updateUser hack or proper endpoint if available)
        user = await apiServices.getProfile();
        if (user) {
          address = user.address;
        }
      } catch (error) {
        console.error("Error loading profile:", error);
        // If profile fails, we might be unauthenticated or token invalid.
        // But App.svelte handles login check.
      } finally {
        isLoadingUser = false;
      }

      if (address) {
        try {
          uploads = await apiServices.getUserUploads(address);
        } catch (error) {
          console.error("Error loading uploads:", error);
        } finally {
          isLoadingUploads = false;
        }

        try {
          purchases = await apiServices.getPurchases(address);
        } catch (error) {
          console.error("Error loading purchases:", error);
        } finally {
          isLoadingPurchases = false;
        }
      } else {
        isLoadingUploads = false;
        isLoadingPurchases = false;
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      isLoadingUser = false;
      isLoadingUploads = false;
    }
  }

  async function handleSaveProfile(event) {
    const updates = event.detail;
    try {
      user = await apiServices.updateUser({
        ...updates,
      });
      isEditing = false;
    } catch (error) {
      console.error("Error updating profile:", error);
      toastStore.error("Failed to update profile");
    }
  }

  let tabs = $state([
    { id: "uploads", label: "My Files", icon: Folder },
    { id: "purchases", label: "Purchases", icon: ShoppingBag },
    { id: "upload", label: "Upload", icon: Upload },
    { id: "profile", label: "Profile", icon: User },
    { id: "apikeys", label: "Developer", icon: Key },
  ]);

  // Reload uploads when switching to uploads tab
  $effect(() => {
    if (activeTab === "uploads" && address) {
      loadUploads();
    }
  });

  async function loadUploads() {
    if (!address) return;
    isLoadingUploads = true;
    try {
      uploads = await apiServices.getUserUploads(address);
    } catch (error) {
      console.error("Error loading uploads:", error);
    } finally {
      isLoadingUploads = false;
    }
  }
</script>

<div
  class="min-h-screen pt-20 pb-12 px-4 sm:px-6 lg:px-8 flex gap-8 max-w-7xl mx-auto"
>
  <!-- Sidebar Navigation -->
  <aside class="w-64 flex-shrink-0 hidden lg:block">
    <div
      class="rounded-2xl border border-odoben-primary/10 bg-odoben-surface/50 p-6 backdrop-blur-md transition-colors hover:bg-odoben-surface/70 sticky top-24"
    >
      <div class="flex items-center gap-3 mb-8 px-2">
        {#if user?.avatar}
          <img
            src={user.avatar}
            alt="Avatar"
            class="w-10 h-10 rounded-full object-cover border-2 border-odoben-primary/30"
          />
        {:else}
          <div
            class="w-10 h-10 rounded-full bg-odoben-surface flex items-center justify-center text-odoben-text shadow-lg shadow-odoben-bg/20"
          >
            <User class="w-5 h-5" />
          </div>
        {/if}
        <div class="overflow-hidden">
          <h3 class="font-bold text-odoben-text truncate">
            {user?.username || "User"}
          </h3>
          <p class="text-xs text-odoben-text/60 truncate font-mono">
            {address?.slice(0, 6)}...{address?.slice(-4)}
          </p>
        </div>
      </div>

      <nav class="space-y-2">
        {#each tabs as tab}
          <button
            class="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium text-left
                        {activeTab === tab.id
              ? 'translate-x-1 border border-odoben-primary/30 bg-gradient-to-r from-odoben-accent/20 to-odoben-aqua/20 text-odoben-text shadow-lg shadow-odoben-bg/20'
              : 'text-odoben-text/60 hover:bg-odoben-primary/5 hover:text-odoben-text'}"
            onclick={() => (activeTab = tab.id)}
          >
            <tab.icon class="w-5 h-5 opacity-80" />
            {tab.label}
          </button>
        {/each}
      </nav>
    </div>
  </aside>

  <!-- Mobile Tabs -->
  <div
    class="lg:hidden fixed bottom-0 left-0 right-0 bg-odoben-bg/90 backdrop-blur-xl border-t border-odoben-primary/10 p-2 z-40 flex justify-around shadow-2xl"
  >
    {#each tabs as tab}
      <button
        class="flex flex-col items-center p-2 rounded-lg transition-colors {activeTab ===
        tab.id
          ? 'text-odoben-primary'
          : 'text-odoben-text/60'}"
        onclick={() => (activeTab = tab.id)}
      >
        <tab.icon class="w-5 h-5 mb-1" />
        <span class="text-xs font-medium">{tab.label}</span>
      </button>
    {/each}
  </div>

  <!-- Main Content -->
  <main class="flex-1 min-w-0 pb-20 lg:pb-0 overflow-y-auto max-h-screen">
    {#if isLoadingUser}
      <div class="flex justify-center py-20">
        <div
          class="w-16 h-16 border-4 border-odoben-primary/10 border-t-odoben-primary rounded-full animate-spin"
        ></div>
      </div>
    {:else}
      <div in:fade={{ duration: 300 }} class="space-y-6">
        <!-- Header -->
        <header class="mb-8">
          <h1 class="text-3xl font-bold text-odoben-text">
            {tabs.find((t) => t.id === activeTab)?.label}
          </h1>
          <p class="text-odoben-text/60 mt-1">
            Manage your {activeTab === "apikeys" ? "API keys" : activeTab}.
          </p>
        </header>

        {#if activeTab === "uploads"}
          <div in:fly={{ y: 20, duration: 300, delay: 100 }}>
            <!-- Stats Row -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div
                class="rounded-2xl border border-odoben-primary/10 bg-odoben-surface/50 p-6 backdrop-blur-md transition-colors hover:bg-odoben-surface/70"
              >
                <div class="text-odoben-text/60 text-sm font-medium mb-1">
                  Total Files
                </div>
                <div class="text-3xl font-bold text-odoben-text">
                  {uploads.length}
                </div>
              </div>
              <div
                class="rounded-2xl border border-odoben-primary/10 bg-odoben-surface/50 p-6 backdrop-blur-md transition-colors hover:bg-odoben-surface/70"
              >
                <div class="text-odoben-text/60 text-sm font-medium mb-1">
                  Storage Used
                </div>
                <div class="text-3xl font-bold text-odoben-text">
                  {(
                    uploads.reduce((acc, curr) => acc + (curr.size || 0), 0) /
                    1024 /
                    1024
                  ).toFixed(2)} MB
                </div>
              </div>
              <div
                class="rounded-2xl border border-[#e8dcc5]/10 bg-odoben-surface/90 p-6 backdrop-blur-md transition-colors hover:bg-odoben-surface/70"
              >
                <div class="text-odoben-text/60 text-sm font-medium mb-1">
                  Plan
                </div>
                <div
                  class="bg-gradient-to-r from-odoben-primary to-odoben-aqua bg-clip-text text-3xl font-bold text-transparent"
                >
                  Free
                </div>
              </div>
            </div>

            <FileViewer {uploads} isLoading={isLoadingUploads} {user} />
          </div>
        {:else if activeTab === "purchases"}
          <div in:fly={{ y: 20, duration: 300, delay: 100 }}>
            <!-- Stats Row -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div
                class="rounded-2xl border border-odoben-primary/10 bg-odoben-surface/50 p-6 backdrop-blur-md transition-colors hover:bg-odoben-surface/70"
              >
                <div class="text-odoben-text/60 text-sm font-medium mb-1">
                  Total Purchases
                </div>
                <div class="text-3xl font-bold text-odoben-text">
                  {purchases.length}
                </div>
              </div>
              <div
                class="rounded-2xl border border-odoben-primary/10 bg-odoben-surface/50 p-6 backdrop-blur-md transition-colors hover:bg-odoben-surface/70"
              >
                <div class="text-odoben-text/60 text-sm font-medium mb-1">
                  Total Spent
                </div>
                <div class="text-3xl font-bold text-odoben-text">
                  {purchases
                    .reduce((acc, p) => acc + (p.price || 0), 0)
                    .toFixed(2)} SUI
                </div>
              </div>
            </div>

            <FileViewer
              uploads={purchases}
              isLoading={isLoadingPurchases}
              {user}
              readOnly={true}
            />
          </div>
        {:else if activeTab === "profile"}
          <div in:fly={{ y: 20, duration: 300, delay: 100 }}>
            <ProfileCard
              {user}
              {isEditing}
              on:edit={() => (isEditing = true)}
              on:cancel={() => (isEditing = false)}
              on:save={handleSaveProfile}
            />
          </div>
        {:else if activeTab === "apikeys"}
          <div in:fly={{ y: 20, duration: 300, delay: 100 }}>
            <ApiKeys />
          </div>
        {:else if activeTab === "upload"}
          <div in:fly={{ y: 20, duration: 300, delay: 100 }}>
            <DesktopWalrusUploader {user} />
          </div>
        {/if}
      </div>
    {/if}
  </main>
</div>

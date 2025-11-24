<script>
  import { fade, fly } from 'svelte/transition';
  import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-svelte';
  import { toastStore } from '../lib/stores/toastStore.js';

  let toasts = [];

  $: toasts = $toastStore;

  function getIcon(type) {
    switch (type) {
      case 'success':
        return CheckCircle;
      case 'error':
        return XCircle;
      case 'warning':
        return AlertTriangle;
      default:
        return Info;
    }
  }

  function getColors(type) {
    switch (type) {
      case 'success':
        return 'bg-green-500/20 border-green-500/30 text-green-300';
      case 'error':
        return 'bg-red-500/20 border-red-500/30 text-red-300';
      case 'warning':
        return 'bg-amber-500/20 border-amber-500/30 text-amber-300';
      default:
        return 'bg-blue-500/20 border-blue-500/30 text-blue-300';
    }
  }
</script>

<div class="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
  {#each toasts as toast (toast.id)}
    <div
      class="flex items-center gap-3 p-4 rounded-xl border backdrop-blur-xl shadow-lg {getColors(toast.type)}"
      in:fly={{ x: 400, duration: 300 }}
      out:fade={{ duration: 200 }}
    >
      <svelte:component this={getIcon(toast.type)} class="w-5 h-5 flex-shrink-0" />
      <p class="text-sm flex-1">{toast.message}</p>
      <button
        class="flex-shrink-0 hover:opacity-70 transition-opacity"
        onclick={() => toastStore.update(toasts => toasts.filter(t => t.id !== toast.id))}
      >
        <X class="w-4 h-4" />
      </button>
    </div>
  {/each}
</div>
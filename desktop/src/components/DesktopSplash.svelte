<script>
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";

  export let onComplete;

  onMount(() => {
    setTimeout(() => {
      onComplete();
    }, 3000);
  });
</script>

<div
  class="h-full w-full flex flex-col items-center justify-center bg-odoben-bg"
  in:fade
>
  <div class="relative w-32 h-32 mb-8">
    <div
      class="absolute inset-0 bg-odoben-primary/20 rounded-full animate-ping"
    ></div>
    <div
      class="relative w-full h-full bg-odoben-surface rounded-2xl flex items-center justify-center shadow-2xl shadow-odoben-bg/20 rotate-3 hover:rotate-0 transition-transform duration-500"
    >
      <span class="text-4xl font-bold text-odoben-primary">O</span>
    </div>
  </div>
  <h1 class="text-3xl font-bold text-odoben-text mb-2 tracking-tight">
    Odoben
  </h1>
  <p class="text-odoben-text/60 text-sm">Desktop Edition</p>

  <div class="mt-12 w-48 h-1 bg-odoben-surface rounded-full overflow-hidden">
    <div class="h-full bg-odoben-aqua animate-progress"></div>
  </div>
</div>

<style>
  @keyframes progress {
    0% {
      width: 0%;
    }
    100% {
      width: 100%;
    }
  }
  .animate-progress {
    animation: progress 2.5s ease-out forwards;
  }
</style>

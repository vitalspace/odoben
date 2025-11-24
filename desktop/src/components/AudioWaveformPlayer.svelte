<script>
  import { onMount, onDestroy } from "svelte";
  import { Play, Pause, Volume2, VolumeX } from "lucide-svelte";

  export let src;
  export let filename = "Audio File";

  let audioElement;
  let canvas;
  let canvasContext;

  let isPlaying = false;
  let currentTime = 0;
  let duration = 0;
  let volume = 1;
  let isMuted = false;

  let audioContext = null;
  let analyser = null;
  let dataArray = null;
  let animationId = null;

  onMount(async () => {
    canvasContext = canvas?.getContext("2d");
  });

  onDestroy(() => {
    if (animationId) {
      cancelAnimationFrame(animationId);
    }
    if (audioContext) {
      audioContext.close();
    }
  });

  function setupAudioContext() {
    if (audioContext) return;

    audioContext = new AudioContext();
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;

    const source = audioContext.createMediaElementSource(audioElement);
    source.connect(analyser);
    analyser.connect(audioContext.destination);

    const bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);

    visualize();
  }

  function visualize() {
    if (!analyser || !dataArray || !canvasContext || !canvas) return;

    animationId = requestAnimationFrame(visualize);

    analyser.getByteFrequencyData(dataArray);

    const width = canvas.width;
    const height = canvas.height;
    const barWidth = (width / dataArray.length) * 2.5;

    canvasContext.clearRect(0, 0, width, height);

    let x = 0;
    for (let i = 0; i < dataArray.length; i++) {
      const barHeight = (dataArray[i] / 255) * height * 0.8;

      // Gradient from aqua to accent
      const gradient = canvasContext.createLinearGradient(
        0,
        height - barHeight,
        0,
        height
      );
      gradient.addColorStop(0, "#7d9c9f");
      gradient.addColorStop(1, "#816558");

      canvasContext.fillStyle = gradient;
      canvasContext.fillRect(x, height - barHeight, barWidth - 2, barHeight);

      x += barWidth;
    }
  }

  function togglePlay() {
    if (!audioElement) return;

    if (audioElement.paused) {
      setupAudioContext();
      audioElement.play();
    } else {
      audioElement.pause();
    }
  }

  function handlePlay() {
    isPlaying = true;
  }

  function handlePause() {
    isPlaying = false;
  }

  function handleTimeUpdate() {
    currentTime = audioElement.currentTime;
  }

  function handleDurationChange() {
    duration = audioElement.duration;
  }

  function toggleMute() {
    if (!audioElement) return;
    audioElement.muted = !audioElement.muted;
    isMuted = audioElement.muted;
  }

  function handleVolumeChange(e) {
    const target = e.target;
    volume = parseFloat(target.value);
    if (audioElement) {
      audioElement.volume = volume;
      isMuted = volume === 0;
    }
  }

  function formatTime(seconds) {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }
</script>

<!-- svelte-ignore a11y-media-has-caption -->
<audio
  bind:this={audioElement}
  {src}
  class="hidden"
  on:play={handlePlay}
  on:pause={handlePause}
  on:timeupdate={handleTimeUpdate}
  on:durationchange={handleDurationChange}
></audio>

<div
  class="audio-player-container bg-gradient-to-br from-odoben-surface/80 to-odoben-bg/80 backdrop-blur-xl border border-odoben-primary/20 rounded-2xl p-6 shadow-2xl"
>
  <!-- Header -->
  <div class="flex items-center gap-4 mb-6">
    <div
      class="w-16 h-16 bg-gradient-to-br from-odoben-primary to-odoben-aqua rounded-xl flex items-center justify-center text-3xl shadow-lg"
    >
      🎵
    </div>
    <div class="flex-1 min-w-0">
      <h3 class="text-lg font-bold text-odoben-text truncate">{filename}</h3>
      <p class="text-sm text-odoben-text/60">
        {formatTime(currentTime)} / {formatTime(duration)}
      </p>
    </div>
  </div>

  <!-- Live Frequency Visualizer -->
  <div
    class="h-24 bg-odoben-bg/30 rounded-xl border border-odoben-primary/10 mb-6 overflow-hidden"
  >
    <canvas bind:this={canvas} width="600" height="96" class="w-full h-full"
    ></canvas>
  </div>

  <!-- Controls -->
  <div class="flex items-center gap-4">
    <!-- Play/Pause Button -->
    <button
      on:click={togglePlay}
      class="w-12 h-12 bg-gradient-to-br from-odoben-primary to-odoben-aqua rounded-full flex items-center justify-center text-white hover:shadow-lg hover:shadow-odoben-primary/30 transition-all hover:scale-105 active:scale-95"
      aria-label={isPlaying ? "Pause" : "Play"}
    >
      {#if isPlaying}
        <Pause size={24} fill="currentColor" />
      {:else}
        <Play size={24} fill="currentColor" class="ml-0.5" />
      {/if}
    </button>

    <!-- Volume Control -->
    <div class="flex items-center gap-3 flex-1">
      <button
        on:click={toggleMute}
        class="text-odoben-text/60 hover:text-odoben-text transition-colors"
        aria-label={isMuted ? "Unmute" : "Mute"}
      >
        {#if isMuted}
          <VolumeX size={20} />
        {:else}
          <Volume2 size={20} />
        {/if}
      </button>

      <div class="flex-1 max-w-32">
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={isMuted ? 0 : volume}
          on:input={handleVolumeChange}
          class="w-full h-1 bg-odoben-text/20 rounded-full appearance-none cursor-pointer volume-slider"
          aria-label="Volume"
        />
      </div>
    </div>

    <!-- Time Display -->
    <div class="text-sm font-mono text-odoben-text/60 tabular-nums">
      {formatTime(currentTime)} / {formatTime(duration)}
    </div>
  </div>
</div>

<style>
  .volume-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: linear-gradient(135deg, #7d9c9f, #816558);
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    transition: transform 0.2s;
  }

  .volume-slider::-webkit-slider-thumb:hover {
    transform: scale(1.2);
  }

  .volume-slider::-moz-range-thumb {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: linear-gradient(135deg, #7d9c9f, #816558);
    cursor: pointer;
    border: none;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    transition: transform 0.2s;
  }

  .volume-slider::-moz-range-thumb:hover {
    transform: scale(1.2);
  }
</style>

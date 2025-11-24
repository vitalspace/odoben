<script lang="ts">
	import { onMount } from 'svelte';
	import { Play, Pause, Volume2, VolumeX, Maximize, Minimize } from 'lucide-svelte';
	import { fade } from 'svelte/transition';

	export let src: string;
	export let type: 'video' | 'audio' = 'video';
	export let poster: string = '';
	export let autoplay: boolean = false;

	let mediaElement: HTMLMediaElement;
	let container: HTMLDivElement;
	
	let isPlaying = false;
	let currentTime = 0;
	let duration = 0;
	let volume = 1;
	let isMuted = false;
	let isFullscreen = false;
	let showControls = true;
	let controlsTimeout: any;

	function togglePlay() {
		if (mediaElement.paused) {
			mediaElement.play();
		} else {
			mediaElement.pause();
		}
	}

	function handlePlay() {
		isPlaying = true;
		hideControlsWithDelay();
	}

	function handlePause() {
		isPlaying = false;
		showControls = true;
		if (controlsTimeout) clearTimeout(controlsTimeout);
	}

	function handleTimeUpdate() {
		currentTime = mediaElement.currentTime;
	}

	function handleDurationChange() {
		duration = mediaElement.duration;
	}

	function formatTime(seconds: number) {
		if (isNaN(seconds)) return '0:00';
		const mins = Math.floor(seconds / 60);
		const secs = Math.floor(seconds % 60);
		return `${mins}:${secs.toString().padStart(2, '0')}`;
	}

	function handleSeek(e: Event) {
		const target = e.target as HTMLInputElement;
		const time = parseFloat(target.value);
		mediaElement.currentTime = time;
	}

	function toggleMute() {
		mediaElement.muted = !mediaElement.muted;
		isMuted = mediaElement.muted;
	}

	function handleVolumeChange(e: Event) {
		const target = e.target as HTMLInputElement;
		volume = parseFloat(target.value);
		mediaElement.volume = volume;
		isMuted = volume === 0;
	}

	function toggleFullscreen() {
		if (!document.fullscreenElement) {
			container.requestFullscreen();
			isFullscreen = true;
		} else {
			document.exitFullscreen();
			isFullscreen = false;
		}
	}

	function handleMouseMove() {
		showControls = true;
		hideControlsWithDelay();
	}

	function hideControlsWithDelay() {
		if (controlsTimeout) clearTimeout(controlsTimeout);
		if (isPlaying) {
			controlsTimeout = setTimeout(() => {
				showControls = false;
			}, 2000);
		}
	}

	onMount(() => {
		if (autoplay) {
			mediaElement.play().catch(() => {
				// Autoplay blocked
				isMuted = true;
				mediaElement.muted = true;
				mediaElement.play();
			});
		}
	});
</script>

<div 
	bind:this={container}
	class="group relative overflow-hidden rounded-xl bg-black border border-odoben-primary/10 shadow-2xl"
	on:mousemove={handleMouseMove}
	on:mouseleave={() => isPlaying && (showControls = false)}
    role="region"
    aria-label="Media Player"
>
	{#if type === 'video'}
		<!-- svelte-ignore a11y-media-has-caption -->
		<video
			bind:this={mediaElement}
			{src}
			{poster}
			class="h-full w-full object-contain"
			on:play={handlePlay}
			on:pause={handlePause}
			on:timeupdate={handleTimeUpdate}
			on:durationchange={handleDurationChange}
			on:click={togglePlay}
		></video>
	{:else}
		<audio
			bind:this={mediaElement}
			{src}
			class="hidden"
			on:play={handlePlay}
			on:pause={handlePause}
			on:timeupdate={handleTimeUpdate}
			on:durationchange={handleDurationChange}
		></audio>
		<!-- Audio Visualizer Placeholder -->
		<div class="flex h-32 w-full items-center justify-center bg-odoben-bg/50">
			<div class="flex items-end gap-1 h-16">
				{#each Array(10) as _, i}
					<div 
						class="w-2 bg-odoben-primary/50 rounded-t-sm transition-all duration-100"
						style="height: {isPlaying ? Math.random() * 100 : 20}%"
					></div>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Controls Overlay -->
	<div 
		class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 {showControls ? 'opacity-100' : 'opacity-0'}"
	>
		<!-- Progress Bar -->
		<div class="mb-4 group/progress relative h-1 cursor-pointer bg-white/20 rounded-full">
			<div 
				class="absolute top-0 left-0 h-full bg-odoben-primary rounded-full"
				style="width: {(currentTime / duration) * 100}%"
			></div>
			<input
				type="range"
				min="0"
				max={duration || 0}
				value={currentTime}
				on:input={handleSeek}
				class="absolute top-[-6px] left-0 w-full h-4 opacity-0 cursor-pointer"
			/>
		</div>

		<div class="flex items-center justify-between gap-4">
			<div class="flex items-center gap-4">
				<!-- Play/Pause -->
				<button 
					on:click={togglePlay}
					class="text-white hover:text-odoben-primary transition-colors"
				>
					{#if isPlaying}
						<Pause size={24} />
					{:else}
						<Play size={24} fill="currentColor" />
					{/if}
				</button>

				<!-- Volume -->
				<div class="flex items-center gap-2 group/volume">
					<button 
						on:click={toggleMute}
						class="text-white hover:text-odoben-primary transition-colors"
					>
						{#if isMuted}
							<VolumeX size={20} />
						{:else}
							<Volume2 size={20} />
						{/if}
					</button>
					<input
						type="range"
						min="0"
						max="1"
						step="0.1"
						value={isMuted ? 0 : volume}
						on:input={handleVolumeChange}
						class="w-0 overflow-hidden group-hover/volume:w-20 transition-all duration-300 h-1 bg-white/20 rounded-full accent-odoben-primary appearance-none cursor-pointer"
					/>
				</div>

				<!-- Time -->
				<div class="text-xs font-mono text-white/80">
					{formatTime(currentTime)} / {formatTime(duration)}
				</div>
			</div>

			<!-- Fullscreen (Video only) -->
			{#if type === 'video'}
				<button 
					on:click={toggleFullscreen}
					class="text-white hover:text-odoben-primary transition-colors"
				>
					{#if isFullscreen}
						<Minimize size={20} />
					{:else}
						<Maximize size={20} />
					{/if}
				</button>
			{/if}
		</div>
	</div>

	<!-- Center Play Button (for initial state or pause) -->
	{#if !isPlaying && type === 'video'}
		<div 
			class="absolute inset-0 flex items-center justify-center pointer-events-none"
			in:fade
		>
			<div class="bg-black/50 rounded-full p-4 backdrop-blur-sm border border-white/10">
				<Play size={48} fill="white" class="text-white ml-1" />
			</div>
		</div>
	{/if}
</div>

<style>
	/* Custom Range Input Styling */
	input[type=range]::-webkit-slider-thumb {
		-webkit-appearance: none;
		height: 12px;
		width: 12px;
		border-radius: 50%;
		background: #ffffff;
		cursor: pointer;
		margin-top: -4px;
	}
</style>

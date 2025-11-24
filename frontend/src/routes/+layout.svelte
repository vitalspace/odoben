<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import Navbar from '$lib/components/Navbar.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import Toast from '$lib/components/Toast.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="min-h-screen bg-odoben-bg text-odoben-text overflow-x-hidden relative selection:bg-odoben-aqua selection:text-odoben-bg flex flex-col">
	<!-- Animated Background Blobs -->
	<div class="fixed inset-0 z-0 pointer-events-none">
		<div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-odoben-primary/10 rounded-full blur-[120px] animate-pulse-slow"></div>
		<div class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-odoben-aqua/10 rounded-full blur-[120px] animate-pulse-slow delay-1000"></div>
		<div class="absolute top-[40%] left-[40%] w-[30%] h-[30%] bg-odoben-accent/10 rounded-full blur-[100px] animate-float"></div>
	</div>

	<Navbar />

	<main class="flex-grow relative z-10">
		{@render children()}
	</main>

	<Footer />

	<Toast />
</div>

<style>
	/* Custom animations */
	@keyframes float {
		0%, 100% { transform: translate(0, 0); }
		50% { transform: translate(-20px, 20px); }
	}
	
	@keyframes pulse-slow {
		0%, 100% { opacity: 0.3; transform: scale(1); }
		50% { opacity: 0.5; transform: scale(1.1); }
	}

	:global(.animate-float) {
		animation: float 10s ease-in-out infinite;
	}

	:global(.animate-pulse-slow) {
		animation: pulse-slow 8s ease-in-out infinite;
	}
</style>

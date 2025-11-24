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

<div
	class="relative flex min-h-screen flex-col overflow-x-hidden bg-odoben-bg text-odoben-text selection:bg-odoben-aqua selection:text-odoben-bg"
>
	<!-- Animated Background Blobs -->
	<div class="pointer-events-none fixed inset-0 z-0">
		<div
			class="animate-pulse-slow absolute top-[-10%] left-[-10%] h-[40%] w-[40%] rounded-full bg-odoben-primary/10 blur-[120px]"
		></div>
		<div
			class="animate-pulse-slow absolute right-[-10%] bottom-[-10%] h-[40%] w-[40%] rounded-full bg-odoben-aqua/10 blur-[120px] delay-1000"
		></div>
		<div
			class="animate-float absolute top-[40%] left-[40%] h-[30%] w-[30%] rounded-full bg-odoben-accent/10 blur-[100px]"
		></div>
	</div>

	<Navbar />

	<main class="relative z-10 flex-grow">
		{@render children()}
	</main>

	<Footer />

	<Toast />
</div>

<style>
	/* Custom animations */
	@keyframes float {
		0%,
		100% {
			transform: translate(0, 0);
		}
		50% {
			transform: translate(-20px, 20px);
		}
	}

	@keyframes pulse-slow {
		0%,
		100% {
			opacity: 0.3;
			transform: scale(1);
		}
		50% {
			opacity: 0.5;
			transform: scale(1.1);
		}
	}

	:global(.animate-float) {
		animation: float 10s ease-in-out infinite;
	}

	:global(.animate-pulse-slow) {
		animation: pulse-slow 8s ease-in-out infinite;
	}
</style>

<script lang="ts">
	import { page } from '$app/stores';
	import { slide } from 'svelte/transition';
	import { Upload } from 'lucide-svelte';
	import { walletStore } from '$lib/services/walletService';
	import { apiServices } from '$lib/services/apiServices';

	let isMenuOpen = $state(false);

	$effect(() => {
		if ($walletStore.isConnected && $walletStore.address) {
			checkUser($walletStore.address);
		}
	});

	async function checkUser(address: string) {
		try {
			await apiServices.getProfile(address);
		} catch (err) {
			// User might not exist, but dashboard will handle creation via loginWithWallet
			console.log('User profile check failed, will be handled by dashboard');
		}
	}

	function toggleMenu() {
		isMenuOpen = !isMenuOpen;
	}

	function closeMenu() {
		isMenuOpen = false;
	}
</script>

<nav class="relative z-50 px-6 py-6 max-w-7xl mx-auto">
	<div class="flex justify-between items-center w-full gap-12">
		<!-- Logo -->
		<a href="/" class="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-odoben-primary to-odoben-aqua hover:opacity-80 transition-opacity">
			Odoben
		</a>

		<!-- Desktop Menu -->
		<div class="hidden md:flex gap-6 items-center">
			<a href="/features" class="text-odoben-text/80 hover:text-odoben-text transition-colors">Features</a>
			<a href="/about" class="text-odoben-text/80 hover:text-odoben-text transition-colors">About</a>
			<a href="/docs" class="text-odoben-text/80 hover:text-odoben-text transition-colors">Docs</a>
			{#if $walletStore.isConnected}
				<a href="/dashboard" class="text-odoben-text/80 hover:text-odoben-text transition-colors">Dashboard</a>
			{/if}
			<a 
				href="/upload" 
				class="px-6 py-2.5 bg-gradient-to-r from-odoben-accent to-odoben-aqua hover:from-odoben-accent/90 hover:to-odoben-aqua/90 rounded-full transition-all hover:scale-105 active:scale-95 text-odoben-text font-semibold shadow-lg shadow-odoben-accent/20 hover:shadow-odoben-accent/40 flex items-center gap-2"
			>
				<Upload class="w-4 h-4" />
				Upload File
			</a>
		</div>

		<!-- Mobile Burger Button -->
		<button 
			class="md:hidden text-odoben-text p-2 focus:outline-none" 
			onclick={toggleMenu}
			aria-label="Toggle menu"
		>
			<div class="w-6 h-5 relative flex flex-col justify-between">
				<span class="w-full h-0.5 bg-odoben-text rounded-full transition-all duration-300 {isMenuOpen ? 'rotate-45 translate-y-2' : ''}"></span>
				<span class="w-full h-0.5 bg-odoben-text rounded-full transition-all duration-300 {isMenuOpen ? 'opacity-0' : ''}"></span>
				<span class="w-full h-0.5 bg-odoben-text rounded-full transition-all duration-300 {isMenuOpen ? '-rotate-45 -translate-y-2.5' : ''}"></span>
			</div>
		</button>
	</div>

	<!-- Mobile Menu -->
	{#if isMenuOpen}
		<div 
			transition:slide={{ duration: 300 }}
			class="md:hidden absolute top-full left-0 w-full bg-odoben-bg/95 backdrop-blur-xl border-b border-odoben-primary/10 shadow-2xl z-50"
		>
			<div class="flex flex-col p-6 gap-4">
				<a href="/features" onclick={closeMenu} class="text-odoben-text/80 hover:text-odoben-text py-2 border-b border-odoben-primary/5">Features</a>
				<a href="/about" onclick={closeMenu} class="text-odoben-text/80 hover:text-odoben-text py-2 border-b border-odoben-primary/5">About</a>
				<a href="/docs" onclick={closeMenu} class="text-odoben-text/80 hover:text-odoben-text py-2 border-b border-odoben-primary/5">Docs</a>
				{#if $walletStore.isConnected}
					<a href="/dashboard" onclick={closeMenu} class="text-odoben-text/80 hover:text-odoben-text py-2 border-b border-odoben-primary/5">Dashboard</a>
				{/if}
				<a 
					href="/upload" 
					onclick={closeMenu}
					class="mt-2 px-6 py-3 bg-gradient-to-r from-odoben-accent to-odoben-aqua text-odoben-text text-center rounded-xl font-bold shadow-lg shadow-odoben-accent/30 flex items-center justify-center gap-2"
				>
					<Upload class="w-5 h-5" />
					Upload File
				</a>
			</div>
		</div>
	{/if}
</nav>

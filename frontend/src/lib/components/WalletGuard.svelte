<script lang="ts">
	import { walletStore, walletService } from '$lib/services/walletService';
	import { onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import { Wallet, ArrowRight } from 'lucide-svelte';

	let { children } = $props();
	let isLoading = $state(true);

	onMount(async () => {
		// Give a small delay to check connection status or waiting for auto-connect
		setTimeout(() => {
			isLoading = false;
		}, 1000);
	});

	async function connect() {
		await walletService.connectWallet();
	}
</script>

{#if isLoading}
	<!-- Loading State -->
	<div class="min-h-screen flex items-center justify-center bg-odoben-bg" out:fade>
		<div class="text-center">
			<div class="relative w-20 h-20 mx-auto mb-8">
				<div class="absolute inset-0 rounded-full border-4 border-odoben-primary/30 animate-ping"></div>
				<div class="absolute inset-0 rounded-full border-4 border-t-odoben-primary border-r-transparent border-b-odoben-aqua border-l-transparent animate-spin"></div>
			</div>
			<h2 class="text-2xl font-bold text-odoben-text mb-2">Initializing...</h2>
			<p class="text-odoben-text/60">Checking wallet connection</p>
		</div>
	</div>
{:else if $walletStore.isConnected}
	<!-- Connected State -->
	<div in:fade>
		{@render children()}
	</div>
{:else}
	<!-- Not Connected State -->
	<div class="min-h-screen flex items-center justify-center bg-odoben-bg p-4 relative overflow-hidden" in:fade>
		<!-- Background Ambience -->
		<div class="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-odoben-primary/10 rounded-full blur-[120px] animate-pulse-slow"></div>
		<div class="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-odoben-aqua/10 rounded-full blur-[120px] animate-pulse-slow delay-1000"></div>

		<div class="w-full max-w-lg relative z-10">
			<!-- Main Card -->
			<div class="bg-odoben-surface/50 backdrop-blur-2xl border border-odoben-primary/10 rounded-3xl p-8 md:p-12 text-center shadow-2xl">
				
				<!-- Icon and Badge Container -->
				<div class="mb-8 flex flex-col items-center gap-4">
					<!-- Icon -->
					<div class="inline-flex justify-center items-center w-20 h-20 rounded-2xl bg-gradient-to-br from-odoben-surface to-odoben-bg border border-odoben-primary/10 shadow-inner">
						<Wallet class="w-10 h-10 text-odoben-primary" />
					</div>

					<!-- Badge -->
					<div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-odoben-accent/10 border border-odoben-accent/20 text-odoben-accent text-xs font-semibold tracking-wider uppercase">
						<span class="relative flex h-2 w-2">
							<span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-odoben-accent opacity-75"></span>
							<span class="relative inline-flex h-2 w-2 rounded-full bg-odoben-accent"></span>
						</span>
						Wallet Required
					</div>
				</div>

				<!-- Title -->
				<h2 class="text-4xl font-bold text-odoben-text mb-4">
					Connect Your <span class="text-transparent bg-clip-text bg-gradient-to-r from-odoben-primary to-odoben-aqua">Wallet</span>
				</h2>

				<!-- Description -->
				<p class="text-odoben-text/60 mb-10 leading-relaxed">
					Connect your Sui wallet to access decentralized storage. Your files, your ownership, secured on-chain.
				</p>

				<!-- Connect Button -->
				<button
					onclick={connect}
					class="w-full py-4 px-8 bg-gradient-to-r from-odoben-accent to-odoben-aqua hover:from-odoben-accent/90 hover:to-odoben-aqua/90 text-odoben-text font-bold rounded-xl shadow-lg shadow-odoben-bg/25 transition-all hover:-translate-y-1 active:translate-y-0 mb-8 group"
				>
					<span class="flex items-center justify-center gap-2">
						Connect Wallet
						<ArrowRight class="w-5 h-5 transition-transform group-hover:translate-x-1" />
					</span>
				</button>

				<!-- Info -->
				<p class="text-xs text-odoben-text/40 font-medium">
					Supports Slush, Sui Wallet, and other standard wallets
				</p>
			</div>

			<!-- Features List -->
			<div class="mt-8 grid grid-cols-1 gap-4 text-left w-full">
				{#each [
					{ text: 'Secure on-chain storage', icon: '🔒' },
					{ text: 'Decentralized ownership', icon: '🕸️' },
					{ text: 'Lightning fast uploads', icon: '⚡' }
				] as feature, i}
					<div 
						in:fly={{ y: 20, delay: 200 + (i * 100) }}
						class="flex items-center gap-4 p-4 rounded-2xl bg-odoben-surface/30 border border-odoben-primary/10 backdrop-blur-sm hover:bg-odoben-surface/50 transition-colors"
					>
						<div class="w-10 h-10 rounded-full bg-odoben-surface/50 flex items-center justify-center text-lg shrink-0 text-odoben-primary">
							{feature.icon}
						</div>
						<span class="text-odoben-text/80 font-medium">{feature.text}</span>
					</div>
				{/each}
			</div>
		</div>
	</div>
{/if}

<style>
	@keyframes pulse-slow {
		0%, 100% { opacity: 0.3; transform: scale(1); }
		50% { opacity: 0.5; transform: scale(1.1); }
	}
	.animate-pulse-slow {
		animation: pulse-slow 8s ease-in-out infinite;
	}
</style>

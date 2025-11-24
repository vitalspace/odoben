<script lang="ts">
	import { onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';

	let mounted = false;

	onMount(() => {
		mounted = true;
	});
</script>

<!-- Hero Section -->
<div class="max-w-7xl mx-auto px-6 pt-20 pb-32">
	<div class="text-center max-w-4xl mx-auto">
		{#if mounted}
			<div class="mb-6 inline-block px-4 py-1.5 rounded-full bg-odoben-surface/50 border border-odoben-primary/10 backdrop-blur-md text-sm text-odoben-primary">
				✨ Decentralized Storage on Sui
			</div>
			
			<h1 class="text-5xl md:text-7xl font-bold mb-6 leading-tight">
				Store Files Forever on <br />
				<span class="bg-clip-text text-transparent bg-gradient-to-r from-odoben-primary via-odoben-aqua to-odoben-accent">
					Walrus Protocol
				</span>
			</h1>

			<p class="text-xl text-odoben-text/60 mb-10 max-w-2xl mx-auto leading-relaxed">
				Secure, permanent, and decentralized storage for your digital assets. 
				Built for the next generation of the web.
			</p>

			<div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
				<a 
					href="/upload"
					class="px-8 py-4 bg-gradient-to-r from-odoben-accent to-odoben-aqua rounded-full font-bold text-lg hover:shadow-lg hover:shadow-odoben-bg/30 transition-all hover:-translate-y-1 active:translate-y-0 text-odoben-text"
				>
					Start Uploading
				</a>
				<a 
					href="https://odoben.xyz/docs" 
					class="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-md rounded-full font-bold text-lg transition-all hover:-translate-y-1"
				>
					Read Docs
				</a>
			</div>
		{/if}
	</div>

	<!-- Glass Cards / Features -->
	<div class="mt-32 grid md:grid-cols-3 gap-8">
		{#each [
			{ title: 'Decentralized', icon: '🕸️', desc: 'Your files live on the Walrus protocol, distributed across nodes. No single point of failure.' },
			{ title: 'Lightning Fast', icon: '⚡', desc: 'Powered by Sui Network for incredible speed and low latency interactions.' },
			{ title: 'Secure & Private', icon: '🔒', desc: 'Cryptographically secured content. You own your data, always.' }
		] as feature, i}
			{#if mounted}
				<div 
					in:fly={{ y: 50, duration: 800, delay: 800 + (i * 200) }}
					class="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl hover:bg-white/10 transition-all hover:-translate-y-2 group"
				>
					<div class="text-4xl mb-6 group-hover:scale-110 transition-transform duration-300">{feature.icon}</div>
					<h3 class="text-2xl font-bold mb-4 text-white">{feature.title}</h3>
					<p class="text-gray-400 leading-relaxed">{feature.desc}</p>
				</div>
			{/if}
		{/each}
	</div>
</div>

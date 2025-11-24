<script lang="ts">
	import { onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';

	let mounted = false;

	onMount(() => {
		mounted = true;
	});

	const features = [
		{
			icon: '🕸️',
			title: 'Decentralized Storage',
			description: 'Your files are stored permanently on the Walrus protocol, distributed across multiple nodes worldwide. No single point of failure, no vendor lock-in.',
			highlights: ['Permanent availability', 'Fault tolerant', 'Censorship resistant']
		},
		{
			icon: '📁',
			title: 'File Management',
			description: 'Upload, download, and organize your digital assets with a beautiful and intuitive interface. Support for all file types including audio, video, images, and documents.',
			highlights: ['Drag & drop upload', 'Batch operations', 'Smart organization']
		},
		{
			icon: '🔒',
			title: 'Privacy Controls',
			description: 'Choose how your files are shared. Make them public for everyone, keep them private, or monetize them with paid access using the Sui blockchain.',
			highlights: ['Public sharing', 'Private storage', 'Paid content']
		},
		{
			icon: '💰',
			title: 'Purchase System',
			description: 'Unlock paid content with secure Sui blockchain transactions. Content creators can monetize their work, and users can access premium files with transparent pricing.',
			highlights: ['Blockchain payments', 'Instant access', 'Transparent pricing']
		},
		{
			icon: '⚡',
			title: 'Lightning Fast',
			description: 'Built on the Sui network for incredible speed and low-latency interactions. Upload large files efficiently with automatic chunking for files over 10MB.',
			highlights: ['Sub-second transactions', 'Optimized chunking', 'CDN delivery']
		},
		{
			icon: '🔧',
			title: 'Developer SDK',
			description: 'Full-featured TypeScript SDK for seamless backend integration. Authenticate with API keys, manage uploads programmatically, and build custom applications.',
			highlights: ['TypeScript support', 'API key authentication', 'Comprehensive docs']
		},
		{
			icon: '💻',
			title: 'Desktop Application',
			description: 'Electron-based desktop client for Windows, macOS, and Linux. Full feature parity with the web app, with native OS integration and offline capabilities.',
			highlights: ['Cross-platform', 'Native integration', 'Offline access']
		},
		{
			icon: '🔐',
			title: 'Cryptographic Security',
			description: 'Your data is cryptographically secured with industry-standard encryption. Content addressing ensures file integrity and prevents tampering.',
			highlights: ['End-to-end encryption', 'Content addressing', 'Tamper-proof']
		}
	];
</script>

<div class="max-w-7xl mx-auto px-6 py-20">
	<!-- Hero Section -->
	<div class="text-center mb-20">
		{#if mounted}
			<div transition:fade={{ duration: 600 }}>
				<h1 class="text-5xl md:text-6xl font-bold mb-6">
					Powerful Features for
					<span class="bg-clip-text text-transparent bg-gradient-to-r from-odoben-primary via-odoben-aqua to-odoben-accent">
						Modern Storage
					</span>
				</h1>
				<p class="text-xl text-odoben-text/60 max-w-3xl mx-auto leading-relaxed">
					Everything you need to store, manage, and share your digital assets on the decentralized web.
					Built with cutting-edge technology for maximum performance and security.
				</p>
			</div>
		{/if}
	</div>

	<!-- Features Grid -->
	<div class="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
		{#each features as feature, i}
			{#if mounted}
				<div 
					in:fly={{ y: 50, duration: 800, delay: i * 100 }}
					class="group p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl hover:bg-white/10 transition-all hover:-translate-y-2 hover:shadow-2xl hover:shadow-odoben-primary/10"
				>
					<!-- Icon -->
					<div class="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300">
						{feature.icon}
					</div>

					<!-- Title -->
					<h3 class="text-2xl font-bold mb-4 text-white">
						{feature.title}
					</h3>

					<!-- Description -->
					<p class="text-gray-400 leading-relaxed mb-6">
						{feature.description}
					</p>

					<!-- Highlights -->
					<div class="flex flex-wrap gap-2">
						{#each feature.highlights as highlight}
							<span class="px-3 py-1 text-sm rounded-full bg-odoben-primary/10 text-odoben-primary border border-odoben-primary/20">
								{highlight}
							</span>
						{/each}
					</div>
				</div>
			{/if}
		{/each}
	</div>

	<!-- Call to Action -->
	{#if mounted}
		<div 
			transition:fade={{ delay: 800, duration: 600 }}
			class="mt-20 text-center p-12 rounded-3xl bg-gradient-to-br from-odoben-primary/10 via-odoben-aqua/10 to-odoben-accent/10 border border-white/10 backdrop-blur-xl"
		>
			<h2 class="text-3xl md:text-4xl font-bold mb-6">
				Ready to Get Started?
			</h2>
			<p class="text-xl text-odoben-text/60 mb-8 max-w-2xl mx-auto">
				Upload your first file to Walrus and experience the future of decentralized storage.
			</p>
			<div class="flex flex-col sm:flex-row gap-4 justify-center">
				<a 
					href="/upload"
					class="px-8 py-4 bg-gradient-to-r from-odoben-accent to-odoben-aqua rounded-full font-bold text-lg hover:shadow-lg hover:shadow-odoben-bg/30 transition-all hover:-translate-y-1 active:translate-y-0 text-odoben-text"
				>
					Start Uploading
				</a>
				<a 
					href="/about"
					class="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-md rounded-full font-bold text-lg transition-all hover:-translate-y-1"
				>
					Learn More
				</a>
			</div>
		</div>
	{/if}
</div>

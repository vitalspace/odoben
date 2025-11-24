<script lang="ts">
	import { onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';

	let mounted = false;

	onMount(() => {
		mounted = true;
	});

	const techStack = [
		{
			category: 'Frontend',
			icon: '🎨',
			technologies: [
				{ name: 'Svelte 5', description: 'Modern reactive framework with runes' },
				{ name: 'TailwindCSS 4', description: 'Utility-first CSS framework' },
				{ name: 'SvelteKit', description: 'Full-stack Svelte framework' },
				{ name: 'TypeScript', description: 'Type-safe JavaScript' }
			]
		},
		{
			category: 'Backend',
			icon: '⚙️',
			technologies: [
				{ name: 'Elysia.js', description: 'Fast web framework for Bun' },
				{ name: 'Bun', description: 'High-performance JavaScript runtime' },
				{ name: 'MongoDB', description: 'NoSQL database' },
				{ name: 'JWT', description: 'Secure authentication' }
			]
		},
		{
			category: 'Blockchain',
			icon: '⛓️',
			technologies: [
				{ name: 'Sui Network', description: 'Layer-1 blockchain platform' },
				{ name: 'Walrus Protocol', description: 'Decentralized storage network' },
				{ name: 'Wallet Standard', description: 'Universal wallet integration' }
			]
		}
	];

	const workflow = [
		{
			step: '01',
			title: 'Connect Wallet',
			description: 'Link your Sui wallet using the Wallet Standard for seamless authentication.',
			icon: '🔐'
		},
		{
			step: '02',
			title: 'Upload Files',
			description: 'Drag and drop files or browse to upload. Files over 10MB are automatically chunked.',
			icon: '📤'
		},
		{
			step: '03',
			title: 'Store on Walrus',
			description: 'Your files are encrypted and distributed across the Walrus protocol nodes.',
			icon: '🕸️'
		},
		{
			step: '04',
			title: 'Set Privacy',
			description: 'Choose public, private, or paid access. Monetize your content on the blockchain.',
			icon: '⚙️'
		},
		{
			step: '05',
			title: 'Share & Access',
			description: 'Generate shareable links or access files through the dashboard or SDK.',
			icon: '🚀'
		}
	];
</script>

<div class="max-w-7xl mx-auto px-6 py-20">
	<!-- Hero Section -->
	<div class="text-center mb-20">
		{#if mounted}
			<div transition:fade={{ duration: 600 }}>
				<div class="mb-6 inline-block px-4 py-1.5 rounded-full bg-odoben-surface/50 border border-odoben-primary/10 backdrop-blur-md text-sm text-odoben-primary">
					🦭 About Odoben
				</div>
				
				<h1 class="text-5xl md:text-6xl font-bold mb-6">
					Democratizing
					<span class="bg-clip-text text-transparent bg-gradient-to-r from-odoben-primary via-odoben-aqua to-odoben-accent">
						Decentralized Storage
					</span>
				</h1>
				
				<p class="text-xl text-odoben-text/60 max-w-3xl mx-auto leading-relaxed">
					Odoben is an open-source platform that makes decentralized storage accessible to everyone. 
					Built on Sui and Walrus, we're creating the future of permanent, secure file storage.
				</p>
			</div>
		{/if}
	</div>

	<!-- Mission Section -->
	{#if mounted}
		<div 
			transition:fly={{ y: 50, duration: 800, delay: 200 }}
			class="mb-20 p-10 rounded-3xl bg-gradient-to-br from-odoben-primary/10 via-odoben-aqua/10 to-odoben-accent/10 border border-white/10 backdrop-blur-xl"
		>
			<h2 class="text-3xl font-bold mb-6 text-center">Our Mission</h2>
			<p class="text-lg text-odoben-text/80 leading-relaxed max-w-4xl mx-auto text-center">
				We believe that data ownership is a fundamental right. Odoben empowers users and developers 
				to store files permanently on a decentralized network, free from censorship and centralized control. 
				Whether you're a content creator, developer, or just someone who values privacy, Odoben provides 
				the tools you need to truly own your digital assets.
			</p>
		</div>
	{/if}

	<!-- How It Works -->
	<div class="mb-20">
		<h2 class="text-4xl font-bold mb-12 text-center">How It Works</h2>
		
		<div class="relative">
			<!-- Connection Line -->
			<div class="hidden lg:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-odoben-primary/20 via-odoben-aqua/20 to-odoben-accent/20"></div>
			
			<div class="space-y-12">
				{#each workflow as item, i}
					{#if mounted}
						<div 
							in:fly={{ x: i % 2 === 0 ? -50 : 50, duration: 800, delay: 400 + (i * 150) }}
							class="relative flex flex-col lg:flex-row items-center gap-8 {i % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'}"
						>
							<!-- Content Card -->
							<div class="flex-1 p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl hover:bg-white/10 transition-all">
								<div class="flex items-start gap-4">
									<div class="text-4xl">{item.icon}</div>
									<div class="flex-1">
										<h3 class="text-2xl font-bold mb-2">{item.title}</h3>
										<p class="text-odoben-text/60 leading-relaxed">{item.description}</p>
									</div>
								</div>
							</div>
							
							<!-- Step Number -->
							<div class="lg:absolute lg:left-1/2 lg:-translate-x-1/2 flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-r from-odoben-accent to-odoben-aqua flex items-center justify-center font-bold text-xl shadow-lg shadow-odoben-accent/30">
								{item.step}
							</div>
							
							<!-- Spacer for alternating layout -->
							<div class="hidden lg:block flex-1"></div>
						</div>
					{/if}
				{/each}
			</div>
		</div>
	</div>

	<!-- Technology Stack -->
	<div class="mb-20">
		<h2 class="text-4xl font-bold mb-12 text-center">Technology Stack</h2>
		
		<div class="grid md:grid-cols-3 gap-8">
			{#each techStack as stack, i}
				{#if mounted}
					<div 
						in:fly={{ y: 50, duration: 800, delay: 600 + (i * 150) }}
						class="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl hover:bg-white/10 transition-all hover:-translate-y-2"
					>
						<div class="text-4xl mb-4">{stack.icon}</div>
						<h3 class="text-2xl font-bold mb-6">{stack.category}</h3>
						
						<div class="space-y-4">
							{#each stack.technologies as tech}
								<div class="pb-4 border-b border-white/5 last:border-0">
									<div class="font-semibold text-odoben-text mb-1">{tech.name}</div>
									<div class="text-sm text-odoben-text/60">{tech.description}</div>
								</div>
							{/each}
						</div>
					</div>
				{/if}
			{/each}
		</div>
	</div>

	<!-- Open Source & Community -->
	{#if mounted}
		<div 
			transition:fade={{ delay: 1000, duration: 600 }}
			class="text-center p-12 rounded-3xl bg-gradient-to-br from-odoben-primary/10 via-odoben-aqua/10 to-odoben-accent/10 border border-white/10 backdrop-blur-xl"
		>
			<h2 class="text-3xl md:text-4xl font-bold mb-6">
				Open Source & Built for Developers
			</h2>
			<p class="text-xl text-odoben-text/60 mb-8 max-w-2xl mx-auto">
				Odoben is fully open-source with a comprehensive TypeScript SDK. Build your own applications 
				on top of decentralized storage or contribute to the platform.
			</p>
			<div class="flex flex-col sm:flex-row gap-4 justify-center">
				<a 
					href="https://github.com"
					target="_blank"
					rel="noopener noreferrer"
					class="px-8 py-4 bg-gradient-to-r from-odoben-accent to-odoben-aqua rounded-full font-bold text-lg hover:shadow-lg hover:shadow-odoben-bg/30 transition-all hover:-translate-y-1 active:translate-y-0 text-odoben-text"
				>
					View on GitHub
				</a>
				<a 
					href="https://docs.walrus.site"
					target="_blank"
					rel="noopener noreferrer"
					class="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-md rounded-full font-bold text-lg transition-all hover:-translate-y-1"
				>
					Read Documentation
				</a>
			</div>
		</div>
	{/if}
</div>

<script lang="ts">
	import { onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';

	let mounted = false;
	let activeTab = $state<'web' | 'desktop' | 'sdk'>('web');

	onMount(() => {
		mounted = true;
	});

	function setTab(tab: 'web' | 'desktop' | 'sdk') {
		activeTab = tab;
		// Scroll to top of content when switching tabs on mobile
		if (window.innerWidth < 768) {
			const content = document.getElementById('doc-content');
			if (content) content.scrollIntoView({ behavior: 'smooth' });
		}
	}
</script>

<div class="max-w-7xl mx-auto px-6 py-12">
	<!-- Hero Section -->
	<div class="text-center mb-16">
		{#if mounted}
			<div transition:fade={{ duration: 600 }}>
				<div class="mb-6 inline-block px-4 py-1.5 rounded-full bg-odoben-surface/50 border border-odoben-primary/10 backdrop-blur-md text-sm text-odoben-primary">
					📚 Documentation
				</div>
				
				<h1 class="text-5xl md:text-6xl font-bold mb-6">
					Getting Started with
					<span class="bg-clip-text text-transparent bg-gradient-to-r from-odoben-primary via-odoben-aqua to-odoben-accent">
						Odoben
					</span>
				</h1>
				
				<p class="text-xl text-odoben-text/60 max-w-3xl mx-auto leading-relaxed">
					Learn how to use the web application, desktop app, and SDK to store your files on the decentralized web.
				</p>
			</div>
		{/if}
	</div>

	<div class="flex flex-col md:flex-row gap-8 md:gap-16">
		<!-- Sidebar Navigation -->
		<aside class="w-full md:w-64 flex-shrink-0">
			<div class="sticky top-24 space-y-2">
				<button
					onclick={() => setTab('web')}
					class="w-full text-left px-6 py-4 rounded-xl font-semibold transition-all flex items-center gap-3 {activeTab === 'web' ? 'bg-gradient-to-r from-odoben-accent/10 to-odoben-aqua/10 text-odoben-primary border border-odoben-primary/20' : 'text-odoben-text/60 hover:text-odoben-text hover:bg-white/5'}"
				>
					<span class="text-xl">🌐</span>
					<span>Web Docs</span>
				</button>
				<button
					onclick={() => setTab('desktop')}
					class="w-full text-left px-6 py-4 rounded-xl font-semibold transition-all flex items-center gap-3 {activeTab === 'desktop' ? 'bg-gradient-to-r from-odoben-accent/10 to-odoben-aqua/10 text-odoben-primary border border-odoben-primary/20' : 'text-odoben-text/60 hover:text-odoben-text hover:bg-white/5'}"
				>
					<span class="text-xl">💻</span>
					<span>App Docs</span>
				</button>
				<button
					onclick={() => setTab('sdk')}
					class="w-full text-left px-6 py-4 rounded-xl font-semibold transition-all flex items-center gap-3 {activeTab === 'sdk' ? 'bg-gradient-to-r from-odoben-accent/10 to-odoben-aqua/10 text-odoben-primary border border-odoben-primary/20' : 'text-odoben-text/60 hover:text-odoben-text hover:bg-white/5'}"
				>
					<span class="text-xl">🔧</span>
					<span>SDK Docs</span>
				</button>
			</div>
		</aside>

		<!-- Main Content -->
		<main id="doc-content" class="flex-1 min-w-0">
			<!-- Web Application Guide -->
			{#if activeTab === 'web'}
				<div in:fade={{ duration: 400 }}>
					<!-- Doc Header -->
					<div class="mb-10">
						<h2 class="text-4xl font-bold mb-4">
							Web Application
							<span class="bg-clip-text text-transparent bg-gradient-to-r from-odoben-primary to-odoben-aqua">
								Guide
							</span>
						</h2>
						<p class="text-lg text-odoben-text/60">
							Master the Odoben web interface. Connect your wallet, manage files, and monetize your content directly from your browser.
						</p>
					</div>

					<!-- Getting Started -->
					<div class="mb-8 p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl">
						<h2 class="text-3xl font-bold mb-6 flex items-center gap-3">
							<span class="text-3xl">🚀</span>
							Getting Started
						</h2>
						
						<div class="space-y-6">
							<div class="flex gap-4">
								<div class="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-odoben-accent to-odoben-aqua flex items-center justify-center font-bold text-odoben-bg">
									1
								</div>
								<div class="flex-1">
									<h3 class="text-xl font-semibold mb-2">Connect Your Wallet</h3>
									<p class="text-odoben-text/60 leading-relaxed">
										Click the "Connect Wallet" button in the top right corner. We support all major Sui wallets including Sui Wallet, Suiet, and Ethos.
									</p>
								</div>
							</div>

							<div class="flex gap-4">
								<div class="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-odoben-accent to-odoben-aqua flex items-center justify-center font-bold text-odoben-bg">
									2
								</div>
								<div class="flex-1">
									<h3 class="text-xl font-semibold mb-2">Setup Profile</h3>
									<p class="text-odoben-text/60 leading-relaxed">
										Once connected, your account is automatically created. You can customize your profile with a username, bio, and avatar in the Dashboard settings.
									</p>
								</div>
							</div>
						</div>
					</div>

					<!-- Core Features -->
					<div class="grid md:grid-cols-2 gap-6 mb-8">
						<!-- Uploading -->
						<div class="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl">
							<h2 class="text-2xl font-bold mb-4 flex items-center gap-3">
								<span class="text-2xl">📤</span>
								Smart Uploads
							</h2>
							<ul class="space-y-3 text-odoben-text/70">
								<li class="flex items-start gap-2">
									<span class="text-odoben-primary">•</span>
									<span><strong>Drag & Drop:</strong> Intuitive interface for uploading single or multiple files.</span>
								</li>
								<li class="flex items-start gap-2">
									<span class="text-odoben-primary">•</span>
									<span><strong>Auto-Chunking:</strong> Large files are automatically split and stored efficiently on Walrus.</span>
								</li>
								<li class="flex items-start gap-2">
									<span class="text-odoben-primary">•</span>
									<span><strong>Deduplication:</strong> Smart hashing prevents duplicate storage costs.</span>
								</li>
							</ul>
						</div>

						<!-- Privacy -->
						<div class="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl">
							<h2 class="text-2xl font-bold mb-4 flex items-center gap-3">
								<span class="text-2xl">🔒</span>
								Privacy Control
							</h2>
							<ul class="space-y-3 text-odoben-text/70">
								<li class="flex items-start gap-2">
									<span class="text-green-400">●</span>
									<span><strong>Public:</strong> Accessible by anyone with the link.</span>
								</li>
								<li class="flex items-start gap-2">
									<span class="text-blue-400">●</span>
									<span><strong>Private:</strong> Encrypted and only accessible by you.</span>
								</li>
								<li class="flex items-start gap-2">
									<span class="text-purple-400">●</span>
									<span><strong>Paid:</strong> Monetize content. Users pay SUI to unlock.</span>
								</li>
							</ul>
						</div>
					</div>

					<!-- Dashboard Guide -->
					<div class="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl">
						<h2 class="text-3xl font-bold mb-6 flex items-center gap-3">
							<span class="text-3xl">📊</span>
							Dashboard Management
						</h2>
						<div class="space-y-4 text-odoben-text/80 leading-relaxed">
							<p>
								The Dashboard is your command center. Here you can:
							</p>
							<div class="grid md:grid-cols-3 gap-4 mt-4">
								<div class="p-4 rounded-xl bg-white/5 border border-white/5">
									<h4 class="font-semibold text-odoben-primary mb-2">My Files</h4>
									<p class="text-sm text-odoben-text/60">View, search, filter, and manage all your uploads. Edit metadata or change privacy settings instantly.</p>
								</div>
								<div class="p-4 rounded-xl bg-white/5 border border-white/5">
									<h4 class="font-semibold text-odoben-primary mb-2">Purchases</h4>
									<p class="text-sm text-odoben-text/60">Access all the premium content you've unlocked. Download files or view transaction history.</p>
								</div>
								<div class="p-4 rounded-xl bg-white/5 border border-white/5">
									<h4 class="font-semibold text-odoben-primary mb-2">Analytics</h4>
									<p class="text-sm text-odoben-text/60">Track views, downloads, and earnings from your paid content (Coming Soon).</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			{/if}

			<!-- Desktop Application Guide -->
			{#if activeTab === 'desktop'}
				<div in:fade={{ duration: 400 }}>
					<!-- Doc Header -->
					<div class="mb-10">
						<h2 class="text-4xl font-bold mb-4">
							Desktop App
							<span class="bg-clip-text text-transparent bg-gradient-to-r from-odoben-primary to-odoben-aqua">
								Guide
							</span>
						</h2>
						<p class="text-lg text-odoben-text/60">
							Experience Odoben natively on your OS. Enhanced performance, system integration, and offline capabilities.
						</p>
					</div>

					<!-- Installation -->
					<div class="mb-8 p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl">
						<h2 class="text-3xl font-bold mb-6 flex items-center gap-3">
							<span class="text-3xl">⬇️</span>
							Installation
						</h2>
						
						<div class="grid md:grid-cols-3 gap-6">
							<div class="p-6 rounded-2xl bg-white/5 border border-white/5 text-center hover:bg-white/10 transition-colors group">
								<div class="text-5xl mb-4 group-hover:scale-110 transition-transform">🪟</div>
								<h3 class="text-xl font-semibold mb-2">Windows</h3>
								<p class="text-sm text-odoben-text/60 mb-6">Windows 10 & 11 (x64)</p>
								<button class="w-full px-4 py-3 bg-odoben-primary/20 hover:bg-odoben-primary/30 rounded-xl font-semibold transition-colors text-odoben-primary">
									Download .exe
								</button>
							</div>
							<div class="p-6 rounded-2xl bg-white/5 border border-white/5 text-center hover:bg-white/10 transition-colors group">
								<div class="text-5xl mb-4 group-hover:scale-110 transition-transform">🍎</div>
								<h3 class="text-xl font-semibold mb-2">macOS</h3>
								<p class="text-sm text-odoben-text/60 mb-6">Apple Silicon & Intel</p>
								<button class="w-full px-4 py-3 bg-odoben-primary/20 hover:bg-odoben-primary/30 rounded-xl font-semibold transition-colors text-odoben-primary">
									Coming Soon
								</button>
							</div>
							<div class="p-6 rounded-2xl bg-white/5 border border-white/5 text-center hover:bg-white/10 transition-colors group">
								<div class="text-5xl mb-4 group-hover:scale-110 transition-transform">🐧</div>
								<h3 class="text-xl font-semibold mb-2">Linux</h3>
								<p class="text-sm text-odoben-text/60 mb-6">Ubuntu, Debian, Fedora</p>
								<button class="w-full px-4 py-3 bg-odoben-primary/20 hover:bg-odoben-primary/30 rounded-xl font-semibold transition-colors text-odoben-primary">
									Coming Soon
								</button>
							</div>
						</div>
					</div>

					<!-- Authentication Flow -->
					<div class="mb-8 p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl">
						<h2 class="text-3xl font-bold mb-6 flex items-center gap-3">
							<span class="text-3xl">🔑</span>
							Secure Authentication
						</h2>
						
						<div class="flex flex-col md:flex-row gap-8 items-center">
							<div class="flex-1 space-y-4">
								<p class="text-odoben-text/80 leading-relaxed">
									The desktop app uses a secure API Key mechanism to link with your web account without exposing your wallet private keys.
								</p>
								<ol class="space-y-4">
									<li class="flex gap-3">
										<span class="flex-shrink-0 w-6 h-6 rounded-full bg-odoben-primary/20 text-odoben-primary flex items-center justify-center text-sm font-bold">1</span>
										<span class="text-odoben-text/70">Log in to the Web Dashboard using your wallet.</span>
									</li>
									<li class="flex gap-3">
										<span class="flex-shrink-0 w-6 h-6 rounded-full bg-odoben-primary/20 text-odoben-primary flex items-center justify-center text-sm font-bold">2</span>
										<span class="text-odoben-text/70">Navigate to <strong>Settings > API Keys</strong>.</span>
									</li>
									<li class="flex gap-3">
										<span class="flex-shrink-0 w-6 h-6 rounded-full bg-odoben-primary/20 text-odoben-primary flex items-center justify-center text-sm font-bold">3</span>
										<span class="text-odoben-text/70">Generate a new key and copy it (starts with <code>sk_</code>).</span>
									</li>
									<li class="flex gap-3">
										<span class="flex-shrink-0 w-6 h-6 rounded-full bg-odoben-primary/20 text-odoben-primary flex items-center justify-center text-sm font-bold">4</span>
										<span class="text-odoben-text/70">Paste the key into the Desktop App login screen.</span>
									</li>
								</ol>
							</div>
							<div class="w-full md:w-1/3 p-6 rounded-2xl bg-yellow-500/5 border border-yellow-500/10">
								<h4 class="text-yellow-400 font-bold mb-2 flex items-center gap-2">
									<span>⚠️</span> Security Note
								</h4>
								<p class="text-sm text-yellow-200/70 leading-relaxed">
									Your API Key grants full access to your Odoben account. Treat it like a password. Never share it or commit it to public repositories.
								</p>
							</div>
						</div>
					</div>
				</div>
			{/if}

			<!-- SDK Documentation -->
			{#if activeTab === 'sdk'}
				<div in:fade={{ duration: 400 }}>
					<!-- Doc Header -->
					<div class="mb-10">
						<h2 class="text-4xl font-bold mb-4">
							Odoben SDK
							<span class="bg-clip-text text-transparent bg-gradient-to-r from-odoben-primary to-odoben-aqua">
								Reference
							</span>
						</h2>
						<p class="text-lg text-odoben-text/60">
							The official TypeScript SDK for building on top of Odoben. Seamlessly integrate decentralized storage and payments into your app.
						</p>
					</div>

					<!-- Installation -->
					<div class="mb-8 p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl">
						<h2 class="text-2xl font-bold mb-6">Installation</h2>
						<div class="grid md:grid-cols-2 gap-4">
							<div class="p-4 rounded-xl bg-gray-900 border border-white/5">
								<div class="text-xs text-odoben-text/40 mb-2 uppercase tracking-wider">npm</div>
								<code class="text-odoben-primary">npm install @bunland/odoben</code>
							</div>
							<div class="p-4 rounded-xl bg-gray-900 border border-white/5">
								<div class="text-xs text-odoben-text/40 mb-2 uppercase tracking-wider">bun</div>
								<code class="text-odoben-primary">bun add @bunland/odoben</code>
							</div>
						</div>
					</div>

					<!-- Class Reference -->
					<div class="space-y-8 mb-8">
						<div class="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl">
							<h2 class="text-2xl font-bold mb-6 text-odoben-aqua">Odoben Class</h2>
							
							<!-- Constructor -->
							<div class="mb-8 border-b border-white/5 pb-8 last:border-0 last:pb-0">
								<h3 class="text-xl font-mono text-white mb-2">constructor(apiKey, baseUrl?)</h3>
								<p class="text-odoben-text/60 mb-4">Initializes a new instance of the Odoben client.</p>
								<div class="overflow-x-auto">
									<table class="w-full text-left text-sm">
										<thead>
											<tr class="text-odoben-text/40 border-b border-white/5">
												<th class="pb-2 font-normal">Parameter</th>
												<th class="pb-2 font-normal">Type</th>
												<th class="pb-2 font-normal">Description</th>
											</tr>
										</thead>
										<tbody class="font-mono">
											<tr class="border-b border-white/5">
												<td class="py-3 text-odoben-accent">apiKey</td>
												<td class="py-3 text-blue-300">string</td>
												<td class="py-3 text-odoben-text/60">Your API key starting with 'sk_'</td>
											</tr>
											<tr>
												<td class="py-3 text-odoben-accent">baseUrl</td>
												<td class="py-3 text-blue-300">string</td>
												<td class="py-3 text-odoben-text/60">Optional custom API URL (default: https://odoben.xyz/api/v1)</td>
											</tr>
										</tbody>
									</table>
								</div>
							</div>

							<!-- connect -->
							<div class="mb-8 border-b border-white/5 pb-8 last:border-0 last:pb-0">
								<h3 class="text-xl font-mono text-white mb-2">connect()</h3>
								<p class="text-odoben-text/60 mb-4">Connects to the API and fetches the authenticated user's profile. Caches the user for subsequent calls.</p>
								<div class="font-mono text-sm text-odoben-text/60">
									Returns: <span class="text-blue-300">Promise&lt;User&gt;</span>
								</div>
							</div>

							<!-- uploadFile -->
							<div class="mb-8 border-b border-white/5 pb-8 last:border-0 last:pb-0">
								<h3 class="text-xl font-mono text-white mb-2">uploadFile(options)</h3>
								<p class="text-odoben-text/60 mb-4">High-level method to upload a file to Walrus and register it with Odoben. Handles chunking and manifest generation automatically.</p>
								
								<h4 class="text-sm font-semibold text-odoben-text/80 mb-2">Options Object</h4>
								<div class="overflow-x-auto mb-4">
									<table class="w-full text-left text-sm">
										<thead>
											<tr class="text-odoben-text/40 border-b border-white/5">
												<th class="pb-2 font-normal">Property</th>
												<th class="pb-2 font-normal">Type</th>
												<th class="pb-2 font-normal">Required</th>
												<th class="pb-2 font-normal">Description</th>
											</tr>
										</thead>
										<tbody class="font-mono">
											<tr class="border-b border-white/5">
												<td class="py-3 text-odoben-accent">file</td>
												<td class="py-3 text-blue-300">File | Blob</td>
												<td class="py-3 text-green-400">Yes</td>
												<td class="py-3 text-odoben-text/60">The file object to upload</td>
											</tr>
											<tr class="border-b border-white/5">
												<td class="py-3 text-odoben-accent">filename</td>
												<td class="py-3 text-blue-300">string</td>
												<td class="py-3 text-green-400">Yes</td>
												<td class="py-3 text-odoben-text/60">Name of the file</td>
											</tr>
											<tr class="border-b border-white/5">
												<td class="py-3 text-odoben-accent">visibility</td>
												<td class="py-3 text-blue-300">'public' | 'private' | 'paid'</td>
												<td class="py-3 text-odoben-text/40">No</td>
												<td class="py-3 text-odoben-text/60">Default: 'private'</td>
											</tr>
											<tr>
												<td class="py-3 text-odoben-accent">price</td>
												<td class="py-3 text-blue-300">number</td>
												<td class="py-3 text-odoben-text/40">No</td>
												<td class="py-3 text-odoben-text/60">Price in MIST (if visibility is 'paid')</td>
											</tr>
										</tbody>
									</table>
								</div>
								<div class="font-mono text-sm text-odoben-text/60">
									Returns: <span class="text-blue-300">Promise&lt;Upload&gt;</span>
								</div>
							</div>

							<!-- getProfile -->
							<div class="mb-8 border-b border-white/5 pb-8 last:border-0 last:pb-0">
								<h3 class="text-xl font-mono text-white mb-2">getProfile()</h3>
								<p class="text-odoben-text/60 mb-4">Gets the authenticated user's profile.</p>
								<div class="font-mono text-sm text-odoben-text/60">
									Returns: <span class="text-blue-300">Promise&lt;User&gt;</span>
								</div>
							</div>

							<!-- updateUser -->
							<div class="mb-8 border-b border-white/5 pb-8 last:border-0 last:pb-0">
								<h3 class="text-xl font-mono text-white mb-2">updateUser(params)</h3>
								<p class="text-odoben-text/60 mb-4">Updates the authenticated user's profile information.</p>
								<div class="font-mono text-sm text-odoben-text/60">
									Returns: <span class="text-blue-300">Promise&lt;User&gt;</span>
								</div>
							</div>

							<!-- listUploads -->
							<div class="mb-8 border-b border-white/5 pb-8 last:border-0 last:pb-0">
								<h3 class="text-xl font-mono text-white mb-2">listUploads()</h3>
								<p class="text-odoben-text/60 mb-4">Lists all uploads belonging to the authenticated user.</p>
								<div class="font-mono text-sm text-odoben-text/60">
									Returns: <span class="text-blue-300">Promise&lt;Upload[]&gt;</span>
								</div>
							</div>

							<!-- getUpload -->
							<div class="mb-8 border-b border-white/5 pb-8 last:border-0 last:pb-0">
								<h3 class="text-xl font-mono text-white mb-2">getUpload(blobId)</h3>
								<p class="text-odoben-text/60 mb-4">Retrieves metadata for a specific upload by its Walrus Blob ID.</p>
								<div class="font-mono text-sm text-odoben-text/60">
									Returns: <span class="text-blue-300">Promise&lt;Upload&gt;</span>
								</div>
							</div>

							<!-- getPurchases -->
							<div class="mb-8 border-b border-white/5 pb-8 last:border-0 last:pb-0">
								<h3 class="text-xl font-mono text-white mb-2">getPurchases()</h3>
								<p class="text-odoben-text/60 mb-4">Retrieves all files purchased by the authenticated user.</p>
								<div class="font-mono text-sm text-odoben-text/60">
									Returns: <span class="text-blue-300">Promise&lt;Upload[]&gt;</span>
								</div>
							</div>

							<!-- unlockUpload -->
							<div class="mb-8 border-b border-white/5 pb-8 last:border-0 last:pb-0">
								<h3 class="text-xl font-mono text-white mb-2">unlockUpload(params)</h3>
								<p class="text-odoben-text/60 mb-4">Unlocks a paid file by providing proof of payment.</p>
								<div class="font-mono text-sm text-odoben-text/60">
									Returns: <span class="text-blue-300">Promise&lt;UnlockResponse&gt;</span>
								</div>
							</div>

						</div>
					</div>

					<!-- Advanced Example -->
					<div class="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl">
						<h2 class="text-3xl font-bold mb-6 flex items-center gap-3">
							<span class="text-3xl">🚀</span>
							Advanced Example
						</h2>
						
						<div class="rounded-xl bg-gray-900 p-4 font-mono text-sm overflow-x-auto">
							<code class="text-purple-400">import</code> <code class="text-white">{'{'} Odoben {'}'}</code> <code class="text-purple-400">from</code> <code class="text-green-300">"@bunland/odoben"</code><code class="text-white">;</code><br /><br />

							<code class="text-green-400">// Initialize client</code><br />
							<code class="text-purple-400">const</code> <code class="text-white">client =</code> <code class="text-purple-400">new</code> <code class="text-yellow-300">Odoben</code><code class="text-white">(</code><code class="text-green-300">"sk_your_api_key"</code><code class="text-white">);</code><br /><br />

							<code class="text-green-400">// Upload a paid file</code><br />
							<code class="text-purple-400">const</code> <code class="text-white">upload =</code> <code class="text-purple-400">await</code> <code class="text-white">client.</code><code class="text-yellow-300">uploadFile</code><code class="text-white">({'{'}  </code><br />
							<code class="text-white">  file: myFile,</code><br />
							<code class="text-white">  filename:</code> <code class="text-green-300">"premium.pdf"</code><code class="text-white">,</code><br />
							<code class="text-white">  visibility:</code> <code class="text-green-300">"paid"</code><code class="text-white">,</code><br />
							<code class="text-white">  price:</code> <code class="text-blue-300">0.001</code> <code class="text-green-400">// 0.001 SUI</code><br />
							<code class="text-white">{'}'});</code><br /><br />

							<code class="text-green-400">// Share the file</code><br />
							<code class="text-purple-400">const</code> <code class="text-white">shareUrl = </code><code class="text-green-300">`https://odoben.xyz/s/</code><code class="text-white">${'{'}upload.slug{'}'}</code><code class="text-green-300">`</code><code class="text-white">;</code><br />
							<code class="text-purple-400">console.log</code><code class="text-white">(</code><code class="text-green-300">"Share URL:"</code><code class="text-white">, shareUrl);</code><br /><br />

							<code class="text-green-400">// Later, unlock the file with payment proof</code><br />
							<code class="text-purple-400">const</code> <code class="text-white">result =</code> <code class="text-purple-400">await</code> <code class="text-white">client.</code><code class="text-yellow-300">unlockUpload</code><code class="text-white">({'{'}  </code><br />
							<code class="text-white">  uploadId: upload._id,</code><br />
							<code class="text-white">  paymentProof:</code> <code class="text-green-300">"transaction_digest_here"</code><br />
							<code class="text-white">{'}'});</code><br /><br />

							<code class="text-purple-400">console.log</code><code class="text-white">(</code><code class="text-green-300">"Unlocked blobId:"</code><code class="text-white">, result.blobId);</code>
						</div>
					</div>
				</div>
			{/if}
		</main>
	</div>

	<!-- Help Section -->
	{#if mounted}
		<div 
			transition:fade={{ delay: 400, duration: 600 }}
			class="mt-16 text-center p-12 rounded-3xl bg-gradient-to-br from-odoben-primary/10 via-odoben-aqua/10 to-odoben-accent/10 border border-white/10 backdrop-blur-xl"
		>
			<h2 class="text-3xl md:text-4xl font-bold mb-6">
				Need Help?
			</h2>
			<p class="text-xl text-odoben-text/60 mb-8 max-w-2xl mx-auto">
				Can't find what you're looking for? Check out our community resources or reach out for support.
			</p>
			<div class="flex flex-col sm:flex-row gap-4 justify-center">
				<a 
					href="https://docs.walrus.site"
					target="_blank"
					rel="noopener noreferrer"
					class="px-8 py-4 bg-gradient-to-r from-odoben-accent to-odoben-aqua rounded-full font-bold text-lg hover:shadow-lg hover:shadow-odoben-bg/30 transition-all hover:-translate-y-1 active:translate-y-0 text-odoben-text"
				>
					Walrus Docs
				</a>
				<a 
					href="https://github.com"
					target="_blank"
					rel="noopener noreferrer"
					class="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-md rounded-full font-bold text-lg transition-all hover:-translate-y-1"
				>
					GitHub Issues
				</a>
			</div>
		</div>
	{/if}
</div>

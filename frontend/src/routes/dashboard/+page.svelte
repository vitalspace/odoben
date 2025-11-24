<script lang="ts">
	import { onMount } from 'svelte';
	import { Upload, User, Key, ShoppingBag } from 'lucide-svelte';
	import { walletStore } from '$lib/services/walletService';
	import { apiServices } from '$lib/services/apiServices';
	import { toastStore } from '$lib/stores/toastStore';
	import ProfileCard from '$lib/components/dashboard/ProfileCard.svelte';
	import FileViewer from '$lib/components/FileViewer.svelte';
	import ApiKeys from '$lib/components/dashboard/ApiKeys.svelte';
	import WalletGuard from '$lib/components/WalletGuard.svelte';
	import { fade, fly } from 'svelte/transition';

	let user: any = null;
	let uploads: any[] = [];
	let isLoadingUser = true;
	let isLoadingUploads = true;
	let purchases: any[] = [];
	let isLoadingPurchases = true;
	let isEditing = false;
	let activeTab = 'uploads'; // 'uploads' | 'profile' | 'apikeys' | 'purchases'
	let debugMode = false; // Enable debug mode

	$: if ($walletStore.isConnected && $walletStore.address) {
		// console.log('=== REACTIVE DEBUG ===');
		// console.log('Wallet connected:', $walletStore.isConnected);
		// console.log('Wallet address:', $walletStore.address);
		apiServices.setWalletAuth($walletStore.address);
		loadData($walletStore.address);
	} else {
		// console.log('=== REACTIVE DEBUG ===');
		// console.log('Wallet not connected or no address');
		// console.log('isConnected:', $walletStore.isConnected);
		// console.log('address:', $walletStore.address);
	}

	async function loadData(address: string) {
		// console.log('=== DASHBOARD DEBUG ===');
		// console.log('Loading data for address:', address);
		isLoadingUser = true;
		isLoadingUploads = true;

		try {
			try {
				const storedToken = localStorage.getItem('auth_token');
				if (!storedToken) {
					console.error('❌ Token not in localStorage after login!');
					toastStore.error('Authentication failed. Please refresh and try again.');
					return;
				}
			} catch (e) {
				console.error('Auto-login failed:', e);
				toastStore.error('Failed to authenticate. Please refresh the page.');
				return;
			}

			try {
				user = await apiServices.getProfile(address);
				// console.log('Profile loaded:', user);
			} catch (error) {
				console.error('Error loading profile:', error);
			} finally {
				isLoadingUser = false;
			}

			try {
				uploads = await apiServices.getUserUploads(address);
				// console.log('Uploads loaded:', uploads.length);
			} catch (error) {
				console.error('Error loading uploads:', error);
			} finally {
				isLoadingUploads = false;
			}

			try {
				purchases = await apiServices.getPurchases(address);
				// console.log('Purchases loaded:', purchases.length);
			} catch (error) {
				console.error('Error loading purchases:', error);
			} finally {
				isLoadingPurchases = false;
			}
		} catch (error) {
			console.error('Error loading dashboard data:', error);
			isLoadingUser = false;
			isLoadingUploads = false;
		}
	}

	// Manual login function for testing
	async function manualLogin() {
		console.log('=== MANUAL LOGIN TEST ===');
		if ($walletStore.address) {
			console.log('Attempting manual login with address:', $walletStore.address);
			try {
				const result = await apiServices.loginWithWallet($walletStore.address);
				console.log('Manual login result:', result);
				console.log(
					'Login successful - check browser DevTools → Application → Cookies for auth_token'
				);
			} catch (error) {
				console.error('Manual login failed:', error);
			}
		} else {
			console.error('No wallet address available');
		}
	}

	async function handleSaveProfile(updates: any) {
		console.log('=== MANUAL TEST DEBUG ===');
		console.log('Manual profile update attempted');
		console.log('Updates:', updates);

		// First ensure we have a login
		if ($walletStore.address) {
			console.log('Auto-login before update...');
			try {
				await apiServices.loginWithWallet($walletStore.address);
				console.log('Auto-login completed, now attempting update...');
			} catch (e) {
				console.error('Auto-login failed:', e);
			}
		} else {
			console.error('No wallet address available for login');
		}

		try {
			user = await apiServices.updateUser({
				...updates
			});
			isEditing = false;
			console.log('Profile updated successfully:', user);
		} catch (error) {
			console.error('Error updating profile:', error);
			toastStore.error('Failed to update profile');
		}
	}

	const tabs = [
		{ id: 'uploads', label: 'My Files', icon: Upload },
		{ id: 'purchases', label: 'Purchases', icon: ShoppingBag },
		{ id: 'profile', label: 'Profile', icon: User },
		{ id: 'apikeys', label: 'Developer', icon: Key }
	];
</script>

<WalletGuard>
	<div class="mx-auto flex min-h-screen max-w-7xl gap-8 px-4 pt-20 pb-12 sm:px-6 lg:px-8">
		<!-- Sidebar Navigation -->
		<aside class="hidden w-64 flex-shrink-0 lg:block">
			<div
				class="sticky top-24 rounded-3xl border border-odoben-primary/10 bg-odoben-surface/50 p-6 backdrop-blur-xl"
			>
				<div class="mb-8 flex items-center gap-3 px-2">
					{#if user?.avatar}
						<img
							src={user.avatar}
							alt="Avatar"
							class="h-10 w-10 rounded-full border-2 border-odoben-primary/30 object-cover"
						/>
					{:else}
						<div
							class="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-odoben-accent to-odoben-aqua text-odoben-text shadow-lg shadow-odoben-bg/20"
						>
							<User class="h-5 w-5" />
						</div>
					{/if}
					<div class="overflow-hidden">
						<h3 class="truncate font-bold text-odoben-text">{user?.username || 'User'}</h3>
						<p class="truncate font-mono text-xs text-odoben-text/60">
							{$walletStore.address?.slice(0, 6)}...{$walletStore.address?.slice(-4)}
						</p>
					</div>
				</div>

				{#if debugMode}
					<div class="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4">
						<h4 class="mb-2 font-bold text-red-400">🔧 Debug Mode</h4>
						<button
							class="w-full rounded-lg bg-red-500/20 px-3 py-2 text-sm font-medium text-red-300 transition-colors hover:bg-red-500/30"
							onclick={manualLogin}
						>
							🔑 Manual Login Test
						</button>
						<p class="mt-2 text-xs text-red-300/60">
							Use this to test login if automatic flow fails
						</p>
					</div>
				{/if}

				<nav class="space-y-2">
					{#each tabs as tab}
						<button
							class="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left font-medium transition-all duration-200
							{activeTab === tab.id
								? 'translate-x-1 border border-odoben-primary/30 bg-gradient-to-r from-odoben-accent/20 to-odoben-aqua/20 text-odoben-text shadow-lg shadow-odoben-bg/20'
								: 'text-odoben-text/60 hover:bg-odoben-primary/5 hover:text-odoben-text'}"
							onclick={() => (activeTab = tab.id)}
						>
							<tab.icon class="h-5 w-5 opacity-80" />
							{tab.label}
						</button>
					{/each}
				</nav>
			</div>
		</aside>

		<!-- Mobile Tabs -->
		<div
			class="fixed right-0 bottom-0 left-0 z-40 flex justify-around border-t border-odoben-primary/10 bg-odoben-bg/90 p-2 shadow-2xl backdrop-blur-xl lg:hidden"
		>
			{#each tabs as tab}
				<button
					class="flex flex-col items-center rounded-lg p-2 transition-colors {activeTab === tab.id
						? 'text-odoben-primary'
						: 'text-odoben-text/50'}"
					onclick={() => (activeTab = tab.id)}
				>
					<tab.icon class="mb-1 h-5 w-5" />
					<span class="text-xs font-medium">{tab.label}</span>
				</button>
			{/each}
		</div>

		<!-- Main Content -->
		<main class="min-w-0 flex-1 pb-20 lg:pb-0">
			{#if isLoadingUser}
				<div class="flex justify-center py-20">
					<div
						class="h-16 w-16 animate-spin rounded-full border-4 border-odoben-primary/10 border-t-odoben-primary"
					></div>
				</div>
			{:else}
				<div in:fade={{ duration: 300 }} class="space-y-6">
					<!-- Header -->
					<header class="mb-8">
						<h1 class="text-3xl font-bold text-odoben-text">
							{tabs.find((t) => t.id === activeTab)?.label}
						</h1>
						<p class="mt-1 text-odoben-text/60">
							Manage your {activeTab === 'apikeys' ? 'API keys' : activeTab}.
						</p>
					</header>

					{#if activeTab === 'uploads'}
						<div in:fly={{ y: 20, duration: 300, delay: 100 }}>
							<!-- Stats Row -->
							<div class="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
								<div
									class="rounded-2xl border border-odoben-primary/10 bg-odoben-surface/50 p-6 backdrop-blur-md transition-colors hover:bg-odoben-surface/70"
								>
									<div class="mb-1 text-sm font-medium text-odoben-text/60">Total Files</div>
									<div class="text-3xl font-bold text-odoben-text">{uploads.length}</div>
								</div>
								<div
									class="rounded-2xl border border-odoben-primary/10 bg-odoben-surface/50 p-6 backdrop-blur-md transition-colors hover:bg-odoben-surface/70"
								>
									<div class="mb-1 text-sm font-medium text-odoben-text/60">Storage Used</div>
									<div class="text-3xl font-bold text-odoben-text">
										{(
											uploads.reduce((acc, curr) => acc + (curr.size || 0), 0) /
											1024 /
											1024
										).toFixed(2)} MB
									</div>
								</div>
								<div
									class="rounded-2xl border border-odoben-primary/10 bg-odoben-surface/50 p-6 backdrop-blur-md transition-colors hover:bg-odoben-surface/70"
								>
									<div class="mb-1 text-sm font-medium text-odoben-text/60">Plan</div>
									<div
										class="bg-gradient-to-r from-odoben-primary to-odoben-aqua bg-clip-text text-3xl font-bold text-transparent"
									>
										Free
									</div>
								</div>
							</div>

							<FileViewer {uploads} isLoading={isLoadingUploads} />
						</div>
					{:else if activeTab === 'purchases'}
						<div in:fly={{ y: 20, duration: 300, delay: 100 }}>
							<!-- Stats Row -->
							<div class="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
								<div
									class="rounded-2xl border border-odoben-primary/10 bg-odoben-surface/50 p-6 backdrop-blur-md transition-colors hover:bg-odoben-surface/70"
								>
									<div class="mb-1 text-sm font-medium text-odoben-text/60">Total Purchases</div>
									<div class="text-3xl font-bold text-odoben-text">{purchases.length}</div>
								</div>
								<div
									class="rounded-2xl border border-odoben-primary/10 bg-odoben-surface/50 p-6 backdrop-blur-md transition-colors hover:bg-odoben-surface/70"
								>
									<div class="mb-1 text-sm font-medium text-odoben-text/60">Total Spent</div>
									<div class="text-3xl font-bold text-odoben-text">
										{purchases.reduce((acc, p) => acc + (p.price || 0), 0).toFixed(2)} SUI
									</div>
								</div>
							</div>

							<FileViewer uploads={purchases} isLoading={isLoadingPurchases} readOnly={true} />
						</div>
					{:else if activeTab === 'profile'}
						<div in:fly={{ y: 20, duration: 300, delay: 100 }}>
							<ProfileCard
								{user}
								{isEditing}
								onEdit={() => (isEditing = true)}
								onCancel={() => (isEditing = false)}
								onSave={handleSaveProfile}
							/>
						</div>
					{:else if activeTab === 'apikeys'}
						<div in:fly={{ y: 20, duration: 300, delay: 100 }}>
							<ApiKeys />
						</div>
					{/if}
				</div>
			{/if}
		</main>
	</div>
</WalletGuard>

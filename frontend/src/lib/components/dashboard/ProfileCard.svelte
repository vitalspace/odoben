<script lang="ts">
	import { fade } from 'svelte/transition';
	import { Edit, Save, User, X } from 'lucide-svelte';

	let { user = $bindable<any>(), isEditing = $bindable<boolean>(false), onEdit, onCancel, onSave } = $props();

	let editForm = $state({
		username: '',
		bio: '',
		avatar: '',
		banner: ''
	});

	// Sync editForm when user changes
	$effect(() => {
		if (user) {
			editForm.username = user.username || '';
			editForm.bio = user.bio || '';
			editForm.avatar = user.avatar || '';
			editForm.banner = user.banner || '';
		}
	});

	function handleSave() {
		if (onSave) {
			onSave(editForm);
		}
	}

	function handleCancel() {
		if (onCancel) {
			onCancel();
		}
		// Reset form
		if (user) {
			editForm.username = user.username || '';
			editForm.bio = user.bio || '';
			editForm.avatar = user.avatar || '';
			editForm.banner = user.banner || '';
		}
	}
</script>

<div class="bg-odoben-surface/50 backdrop-blur-xl border border-odoben-primary/10 rounded-3xl overflow-hidden">
	<!-- Banner -->
	<div class="h-48 bg-gradient-to-r from-odoben-accent/30 to-odoben-aqua/30 relative">
		{#if user?.banner}
			<img src={user.banner} alt="Banner" class="w-full h-full object-cover opacity-40" />
		{/if}
		{#if isEditing}
			<div class="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity">
				<input 
					type="text" 
					bind:value={editForm.banner} 
					placeholder="Banner URL" 
					class="bg-odoben-bg/90 backdrop-blur-md px-4 py-2 rounded-xl w-64 text-sm text-odoben-text border border-odoben-primary/20 shadow-lg"
				/>
			</div>
		{/if}
	</div>

	<div class="px-8 pb-8 relative">
		<!-- Avatar -->
		<div class="absolute -top-16 left-8">
			<div class="w-32 h-32 rounded-full border-4 border-odoben-bg bg-gradient-to-br from-odoben-accent to-odoben-aqua overflow-hidden relative group shadow-2xl shadow-odoben-bg/50">
				{#if user?.avatar}
					<img src={user.avatar} alt="Avatar" class="w-full h-full object-cover" />
				{:else}
					<div class="w-full h-full flex items-center justify-center text-odoben-text text-4xl">
						<User class="w-8 h-8" />
					</div>
				{/if}
				
				{#if isEditing}
					<div class="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
						<input 
							type="text" 
							bind:value={editForm.avatar} 
							placeholder="Avatar URL" 
							class="absolute inset-0 opacity-0 cursor-pointer"
						/>
						<span class="text-odoben-text text-xs font-bold bg-black/50 px-3 py-1.5 rounded-lg backdrop-blur-sm">Change URL</span>
					</div>
				{/if}
			</div>
		</div>

		<!-- Actions -->
		<div class="flex justify-end pt-4 mb-4">
			{#if isEditing}
				<div class="flex gap-2" in:fade>
					<button 
						class="px-4 py-2 bg-odoben-surface/50 text-odoben-text/80 rounded-xl font-medium hover:bg-odoben-surface/80 transition-colors border border-odoben-primary/10 flex items-center gap-2"
						onclick={handleCancel}
					>
						<X class="w-4 h-4" />
						Cancel
					</button>
					<button 
						class="px-4 py-2 bg-gradient-to-r from-odoben-accent to-odoben-aqua text-odoben-text rounded-xl font-medium hover:shadow-lg hover:shadow-odoben-bg/30 transition-all hover:-translate-y-0.5 flex items-center gap-2"
						onclick={handleSave}
					>
						<Save class="w-4 h-4" />
						Save Changes
					</button>
				</div>
			{:else}
				<button 
					class="px-4 py-2 border border-odoben-primary/20 text-odoben-text/80 rounded-xl font-medium hover:bg-odoben-primary/10 transition-colors flex items-center gap-2"
					onclick={() => onEdit && onEdit()}
				>
					<Edit class="w-4 h-4" />
					Edit Profile
				</button>
			{/if}
		</div>

		<!-- Info -->
		<div class="mt-4">
			{#if isEditing}
				<div class="space-y-4 max-w-md">
					<div>
						<label for="username-input" class="block text-sm font-medium text-odoben-text/60 mb-1">Username</label>
						<input 
							id="username-input"
							type="text" 
							bind:value={editForm.username}
							class="w-full px-4 py-2 bg-odoben-surface/30 border border-odoben-primary/10 rounded-xl focus:ring-2 focus:ring-odoben-primary focus:border-transparent outline-none text-odoben-text placeholder-odoben-text/30"
							placeholder="Display Name"
						/>
					</div>
					<div>
						<label for="bio-input" class="block text-sm font-medium text-odoben-text/60 mb-1">Bio</label>
						<textarea 
							id="bio-input"
							bind:value={editForm.bio}
							class="w-full px-4 py-2 bg-odoben-surface/30 border border-odoben-primary/10 rounded-xl focus:ring-2 focus:ring-odoben-primary focus:border-transparent outline-none text-odoben-text placeholder-odoben-text/30"
							rows="3"
							placeholder="Tell us about yourself..."
						></textarea>
					</div>
				</div>
			{:else}
				<h1 class="text-3xl font-bold text-odoben-text mb-1">{user?.username || 'Unnamed User'}</h1>
				<p class="text-sm text-odoben-text/60 font-mono mb-4 bg-odoben-surface/30 inline-block px-3 py-1 rounded-lg border border-odoben-primary/10">{user?.address}</p>
				<p class="text-gray-300 leading-relaxed max-w-2xl">
					{user?.bio || 'No bio yet.'}
				</p>
			{/if}
		</div>
	</div>
</div>

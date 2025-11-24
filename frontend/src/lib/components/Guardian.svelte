<script lang="ts">
    import { fade, scale } from 'svelte/transition';
    import { onMount } from 'svelte';
    import { apiServices } from '$lib/services/apiServices';
    import { walletStore, walletService } from '$lib/services/walletService';
    import { toastStore } from '$lib/stores/toastStore';
    import { reconstructFile, getBlobUrl } from '$lib/utils/walrus';
    import MediaPlayer from './MediaPlayer.svelte';
    import AudioWaveformPlayer from './AudioWaveformPlayer.svelte';
    import { Transaction } from '@mysten/sui/transactions';

    export let upload: any;
    export let onUnlock: (blobId: string) => void;

    let isLoading = false;
    let isOwner = false;
    let hasSlush = false;
    let isDownloading = false;
    let contentUrl: string | null = null;
    let isReconstructing = false;

    const AGGREGATOR = 'https://aggregator.walrus-testnet.walrus.space';

    $: isOwner = $walletStore.address === upload.owner;

    onMount(() => {
        hasSlush = !!walletService.getSlushWallet();
    });

    // Carga inicial para visualización
    async function loadContent() {
        if (!upload || !upload.blobId || upload.blobId === 'PAYMENT_REQUIRED') return;
        isReconstructing = true;
        try {
            const result = await reconstructFile(upload.blobId);
            contentUrl = result.url;
        } catch (error) {
            console.error('Error loading preview:', error);
            contentUrl = getBlobUrl(upload.blobId);
        } finally {
            isReconstructing = false;
        }
    }

    $: if (upload?.blobId && upload.blobId !== 'PAYMENT_REQUIRED') {
        loadContent();
    }

    function formatFileSize(bytes: number) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }

    function getFileType(upload: any) {
        const mime = upload.mimeType || '';
        const name = upload.filename?.toLowerCase() || '';
        if (mime.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp|svg)$/.test(name)) return 'image';
        if (mime.startsWith('video/') || /\.(mp4|webm|ogg|mov)$/.test(name)) return 'video';
        if (mime.startsWith('audio/') || /\.(mp3|wav|ogg|m4a)$/.test(name)) return 'audio';
        return 'other';
    }

    async function handleUnlock() {
        if (!confirm(`Unlock "${upload.filename}" for ${upload.price} ${upload.currency}?`)) return;
        
        isLoading = true;
        try {
            // 1. Ensure Wallet Connection
            if (!$walletStore.isConnected) {
                const connected = await walletService.connectWallet();
                if (!connected) {
                    toastStore.error('Please connect your wallet to pay.');
                    isLoading = false;
                    return;
                }
            }

            // 2. Ensure Backend Session (Login)
            // We try to login to ensure we have a valid session for the backend check (sender === address)
            try {
                await apiServices.loginWithWallet($walletStore.address);
            } catch (e) {
                console.error("Login failed during unlock:", e);
                // We continue, maybe the token is already valid? 
                // If not, the unlock call will fail with 401, which we catch below.
            }

            // 3. Prepare Transaction
            const tx = new Transaction();
            
            // Convert price to MIST. Assuming upload.price is in SUI if it's small (like 0.01)
            // If it's already huge, it might be MIST, but the UI shows "0.01 SUI".
            // Safer to assume SUI for now based on the screenshot.
            const priceInMist = BigInt(Math.round(Number(upload.price) * 1_000_000_000));
            
            const [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(priceInMist)]);
            tx.transferObjects([coin], tx.pure.address(upload.owner));

            // 4. Execute Transaction
            const result = await walletService.signAndExecuteTransaction(tx);
            
            if (!result || !result.digest) {
                throw new Error('Transaction failed or rejected');
            }

            console.log('Payment sent, digest:', result.digest);

            // 5. Submit Proof to Backend
            const paymentProof = result.digest;
            const unlockResult = await apiServices.unlockUpload(upload._id, paymentProof);
            onUnlock(unlockResult.blobId);
            
        } catch (error: any) {
            console.error('Unlock failed:', error);
            toastStore.error('Unlock failed: ' + (error.response?.data?.message || error.message));
        } finally {
            isLoading = false;
        }
    }

    // --- FUNCIÓN PRINCIPAL DE DESCARGA ---
    async function handleDownload() {
        try {
            isDownloading = true;
            console.log('🚀 Iniciando descarga forzada...');

            // 1. Obtener datos
            const response = await fetch(`${AGGREGATOR}/v1/blobs/${upload.blobId}`);
            if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);

            let finalDataBlob;
            const clone = response.clone();
            let isManifest = false;
            let manifestData = null;
            let filename = upload.filename || `download-${Date.now()}`;
            let mimeType = upload.mimeType || 'application/octet-stream';

            try {
                const data = await clone.json();
                if (data.chunks && Array.isArray(data.chunks) && data.totalChunks) {
                    isManifest = true;
                    manifestData = data;
                }
            } catch (e) { isManifest = false; }

            if (isManifest && manifestData) {
                console.log('📦 Manifiesto Walrus detectado:', manifestData);
                if (manifestData.fileName) filename = manifestData.fileName;
                if (manifestData.fileType) mimeType = manifestData.fileType;

                const chunkBlobs = [];
                for (let i = 0; i < manifestData.chunks.length; i++) {
                    const chunkId = manifestData.chunks[i];
                    const r = await fetch(`${AGGREGATOR}/v1/blobs/${chunkId}`);
                    if(!r.ok) throw new Error(`Fallo chunk ${chunkId}`);
                    chunkBlobs.push(await r.blob());
                }
                finalDataBlob = new Blob(chunkBlobs, { type: mimeType });
            } else {
                console.log('📄 Archivo directo (Simple Blob)');
                finalDataBlob = await response.blob();
                finalDataBlob = finalDataBlob.slice(0, finalDataBlob.size, mimeType);
            }

            // Asegurar extensión
            const requiredExt = getRequiredExtension(mimeType);
            if (requiredExt && !filename.toLowerCase().endsWith(requiredExt)) {
                filename += requiredExt;
            }

            console.log(`✅ Datos listos. Forzando guardado como: ${filename}`);
            
            // 2. DISPARAR GUARDADO
            saveBlob(finalDataBlob, filename);

        } catch (error) {
            console.error('Download failed:', error);
            toastStore.error('Error en descarga: ' + (error instanceof Error ? error.message : String(error)));
        } finally {
            isDownloading = false;
        }
    }

    // --- FUNCIÓN AUXILIAR "FILE SAVER" ---
    function saveBlob(blob: Blob, fileName: string) {
        // Compatibilidad IE
        if ((window.navigator as any).msSaveOrOpenBlob) {
            (window.navigator as any).msSaveOrOpenBlob(blob, fileName);
            return;
        }

        const url = window.URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        
        anchor.href = url;
        anchor.download = fileName;
        anchor.rel = 'noopener';
        
        document.body.appendChild(anchor);
        
        // Usar MouseEvent y setTimeout para asegurar compatibilidad
        setTimeout(() => {
            anchor.dispatchEvent(new MouseEvent('click', {
                bubbles: true, 
                cancelable: true, 
                view: window 
            }));
            
            // Limpieza diferida
            setTimeout(() => {
                document.body.removeChild(anchor);
                window.URL.revokeObjectURL(url);
            }, 100);
        }, 0);
    }

    function getRequiredExtension(mimeType: string): string {
        const mimeMap: { [key: string]: string } = {
            'image/jpeg': '.jpg', 'image/png': '.png', 'image/gif': '.gif', 'image/webp': '.webp',
            'video/mp4': '.mp4', 'video/webm': '.webm', 'audio/mpeg': '.mp3', 'audio/wav': '.wav',
            'audio/ogg': '.ogg', 'application/pdf': '.pdf', 'text/plain': '.txt', 'application/json': '.json'
        };
        return mimeMap[mimeType] || '';
    }
</script>

<div class="min-h-screen flex items-center justify-center p-4">
    <div class="w-full max-w-lg bg-odoben-surface/50 backdrop-blur-xl border border-odoben-primary/10 rounded-3xl p-8 shadow-2xl text-center relative" in:scale>
        {#if isOwner}
            <div class="absolute top-4 right-4 bg-odoben-primary/20 text-odoben-primary text-xs px-2 py-1 rounded-full border border-odoben-primary/30">
                👑 Owner View
            </div>
        {/if}

        {#if getFileType(upload) !== 'audio'}
            <div class="text-6xl mb-6">
                {#if getFileType(upload) === 'image'}🖼️
                {:else if getFileType(upload) === 'video'}🎥
                {:else}📁{/if}
            </div>
            <h1 class="text-2xl font-bold text-odoben-text mb-2 break-words overflow-wrap-anywhere">{upload.filename}</h1>
            <p class="text-odoben-text/60 mb-8 flex items-center justify-center gap-4 text-sm">
                <span>{formatFileSize(upload.size)}</span>
                <span>•</span>
                <span>{new Date(upload.createdAt).toLocaleDateString()}</span>
            </p>
        {/if}

        {#if upload.blobId === 'PAYMENT_REQUIRED'}
            <div class="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6 mb-8">
                <div class="text-amber-400 text-lg font-semibold mb-2">🔒 Premium Content</div>
                <p class="text-odoben-text/80 mb-6">This file is locked. Pay to access the content.</p>
                <div class="text-3xl font-bold text-odoben-text mb-6">
                    {upload.price} <span class="text-lg font-normal text-odoben-text/60">{upload.currency}</span>
                </div>
                {#if !hasSlush}
                    <div class="bg-odoben-bg/50 rounded-xl p-4 border border-odoben-primary/10 mb-4">
                        <p class="text-sm text-odoben-text/80 mb-3">You need a Sui wallet to purchase this file.</p>
                        <a href="https://slushwallet.com" target="_blank" class="block w-full py-3 bg-odoben-text text-odoben-bg rounded-lg font-bold hover:bg-odoben-primary transition-colors">Install Slush Wallet</a>
                    </div>
                {:else}
                    <button onclick={handleUnlock} disabled={isLoading} class="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-bold text-lg hover:shadow-lg transition-all hover:-translate-y-1 disabled:opacity-50">
                        {isLoading ? 'Processing...' : 'Unlock Access'}
                    </button>
                {/if}
            </div>
        {:else}
            <div class="bg-green-500/10 border border-green-500/20 rounded-2xl p-6 mb-8">
                <div class="text-green-400 text-lg font-semibold mb-4 flex items-center gap-2">
                    {#if isReconstructing}
                        <div class="w-4 h-4 border-2 border-green-400/30 border-t-green-400 rounded-full animate-spin"></div>
                        Loading content...
                    {:else}
                        ✅ File Accessible
                    {/if}
                </div>
                
                {#if getFileType(upload) === 'image'}
                    <div class="mb-6 rounded-xl overflow-hidden border border-odoben-primary/10 bg-odoben-bg/50">
                        <img src={contentUrl || getBlobUrl(upload.blobId)} alt={upload.filename} class="w-full h-auto max-h-[60vh] object-contain"/>
                    </div>
                {:else if getFileType(upload) === 'video'}
                    <div class="mb-6 rounded-xl overflow-hidden border border-odoben-primary/10 bg-odoben-bg/50">
                        <MediaPlayer src={contentUrl || getBlobUrl(upload.blobId)} type="video"/>
                    </div>
                {:else if getFileType(upload) === 'audio'}
                    <div class="mb-6">
                        <AudioWaveformPlayer src={contentUrl || getBlobUrl(upload.blobId)} filename={upload.filename}/>
                    </div>
                {/if}

                <button onclick={handleDownload} disabled={isDownloading} class="block w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-green-500/20 transition-all hover:-translate-y-1 disabled:opacity-70">
                    {#if isDownloading}
                        <div class="flex items-center justify-center gap-2">
                            <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            Downloading...
                        </div>
                    {:else}
                        Download File
                    {/if}
                </button>
            </div>
        {/if}
        
        <div class="mt-8 pt-6 border-t border-odoben-primary/10 text-center">
            <p class="text-xs text-odoben-text/40">Powered by <span class="text-odoben-primary font-semibold">Odoben</span> & Walrus Protocol</p>
        </div>
    </div>
</div>

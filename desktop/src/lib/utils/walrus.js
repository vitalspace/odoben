const AGGREGATOR = 'https://aggregator.walrus-testnet.walrus.space';

export function getBlobUrl(blobId) {
	return `${AGGREGATOR}/v1/blobs/${blobId}`;
}

export async function reconstructFile(blobId) {
	try {
		// 1. Try to fetch as manifest
		const response = await fetch(getBlobUrl(blobId));
		if (!response.ok) throw new Error('Failed to fetch content');

		const clone = response.clone();
		try {
			const data = await response.json();

			// Check if it's a manifest
			if (data.chunks && Array.isArray(data.chunks) && data.fileType) {
				console.log('Manifest detected, reconstructing...', data);

				const chunkBlobs = [];
				const total = data.chunks.length;

				for (let i = 0; i < total; i++) {
					const chunkId = data.chunks[i];
					const chunkRes = await fetch(`${AGGREGATOR}/v1/blobs/${chunkId}`);
					if (!chunkRes.ok) throw new Error(`Failed to fetch chunk ${i}`);
					chunkBlobs.push(await chunkRes.blob());
				}

				const finalBlob = new Blob(chunkBlobs, { type: data.fileType });
				return {
					url: URL.createObjectURL(finalBlob),
					type: data.fileType,
					blob: finalBlob,
                    fileName: data.fileName // Add filename if available in manifest
				};
			}
		} catch (e) {
			// Not JSON, ignore
		}

		// Fallback to direct URL
		return {
			url: getBlobUrl(blobId),
			type: 'unknown' // We don't know the type if it's a direct blob without metadata
		};
	} catch (error) {
		console.error('Error reconstructing file:', error);
		return {
			url: getBlobUrl(blobId),
			type: 'unknown'
		};
	}
}

export function getFileTypeFromMime(mimeType) {
    if (!mimeType) return 'other';
	if (mimeType.startsWith('image/')) return 'image';
	if (mimeType.startsWith('video/')) return 'video';
	if (mimeType.startsWith('audio/')) return 'audio';
	return 'other';
}

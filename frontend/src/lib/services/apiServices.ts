import axios from './axios';

let currentWalletAddress: string | null = null;

// Store and retrieve JWT token in localStorage
const TOKEN_KEY = 'auth_token';

const setToken = (token: string): void => {
	if (typeof window !== 'undefined') {
		localStorage.setItem(TOKEN_KEY, token);
	}
};

const clearToken = (): void => {
	if (typeof window !== 'undefined') {
		localStorage.removeItem(TOKEN_KEY);
	}
};

export const apiServices = {
	async loginWithWallet(address: string) {
		const response = await axios.post('/login-wallet', { address });

		// Store the token in localStorage
		if (response.data.token) {
			setToken(response.data.token);
		} else {
			console.warn('No token in login response');
		}

		return response.data;
	},

	setWalletAuth(address: string) {
		currentWalletAddress = address;
	},

	clearWalletAuth() {
		currentWalletAddress = null;
		clearToken();
	},

	async getProfile(address: string) {
		const response = await axios.post('/profile', { address });
		return response.data;
	},

	async updateUser(data: { username?: string; bio?: string; avatar?: string; banner?: string }) {
		try {
			const response = await axios.put('/update-user', data);
			return response.data;
		} catch (error: any) {
			console.error('Error updating user:', error);
			throw error;
		}
	},

	async saveUpload(data: {
		blobId: string;
		owner: string;
		filename: string;
		mimeType: string;
		size: number;
		visibility?: 'public' | 'private' | 'paid';
		price?: number;
		currency?: string;
	}) {
		const response = await axios.post('/uploads', data);
		return response.data;
	},

	async getUserUploads(address: string) {
		const response = await axios.get(`/uploads/${address}`);
		return response.data;
	},

	async updateUpload(
		blobId: string,
		data: { visibility?: 'public' | 'private' | 'paid'; price?: number; currency?: string }
	) {
		const response = await axios.put(`/uploads/${blobId}`, data);
		return response.data;
	},

	async unlockUpload(uploadId: string, paymentProof?: string) {
		const response = await axios.post('/uploads/unlock', { uploadId, paymentProof });
		return response.data;
	},

	async getUploadBySlug(slug: string) {
		const response = await axios.get(`/uploads/share/${slug}`);
		return response.data;
	},

	async getUploadByBlobId(blobId: string) {
		try {
			const response = await axios.get(`/uploads/blob/${blobId}`);
			return response.data;
		} catch (error) {
			return null;
		}
	},

	async getPurchases(address: string) {
		const response = await axios.get(`/uploads/purchases/${address}`);
		return response.data;
	}
};

import axios from './axios';

export const apiServices = {
  async loginWithWallet(address) {
    // Not used in desktop token auth, but kept for compatibility if needed
    const response = await axios.post('/login-wallet', { address });
    return response.data;
  },

  async getProfile(address) {
    // If address is not provided, maybe we can get it from the token?
    // Backend `profile` endpoint expects address in body.
    // But if we are authenticated with API Key, we are associated with a user.
    // We might need an endpoint to "get my profile".
    // The backend `profile` endpoint: `const { address } = ctx.body as IUser;`
    // It seems it requires address.
    // But `updateUser` uses `authenticateUser(ctx)` to get address.
    
    // If we don't have the address, we might be stuck.
    // However, if we use an API Key, we can call an endpoint that uses `authenticateUser`.
    // `updateUser` returns the user profile!
    // Maybe we can call `updateUser` with empty updates to get the profile?
    // Or we can assume the user knows their address? No.
    
    // Let's try to call `updateUser` with empty body to get the user?
    // `const updates = ctx.body as Partial<IUser>;`
    // `const user = await User.findOneAndUpdate({ address }, updates, ...)`
    // If updates is empty, it just returns the user.
    
    const response = await axios.put('/update-user', {});
    return response.data;
  },

  async updateUser(data) {
    const response = await axios.put('/update-user', data);
    return response.data;
  },

  async saveUpload(data) {
    const response = await axios.post('/uploads', data);
    return response.data;
  },

  async getUserUploads(address) {
    // We need the address.
    // If we got the profile first, we have the address.
    const response = await axios.get(`/uploads/${address}`);
    return response.data;
  },

  async updateUpload(blobId, data) {
    const response = await axios.put(`/uploads/${blobId}`, data);
    return response.data;
  },

  async unlockUpload(uploadId, paymentProof) {
    const response = await axios.post('/uploads/unlock', { uploadId, paymentProof });
    return response.data;
  },

  async getUploadBySlug(slug) {
    const response = await axios.get(`/uploads/share/${slug}`);
    return response.data;
  }
};

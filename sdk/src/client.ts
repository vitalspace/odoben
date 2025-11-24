import type {
  User,
  Upload,
  UpdateUserParams,
  UploadParams,
  UpdateUploadParams,
  UnlockParams,
  UnlockResponse,
  WalrusUploadOptions,
} from "./types";

const DEFAULT_PUBLISHER = "https://publisher.walrus-testnet.walrus.space";
const DEFAULT_AGGREGATOR = "https://aggregator.walrus-testnet.walrus.space";
const CHUNK_SIZE = 10 * 1024 * 1024; // 10 MB

export class Odoben {
  private apiKey: string;
  private baseUrl: string;
  public user?: User;

  constructor(apiKey: string, baseUrl: string = "http://localhost:4000/api/v1") {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl.replace(/\/$/, ""); // Remove trailing slash
  }

  private async request<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const headers = {
      "Content-Type": "application/json",
      "x-api-key": this.apiKey,
      ...options.headers,
    };

    try {
      const response = await fetch(url, { ...options, headers });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      return response.json() as Promise<T>;
    } catch (error: any) {
      // If network error and using production, try localhost
      if (error instanceof TypeError && this.baseUrl.includes("odoben.xyz")) {
        console.warn(
          `⚠️  Could not connect to ${this.baseUrl}, falling back to http://localhost:4000/api/v1`
        );
        this.baseUrl = "http://localhost:4000/api/v1";
        // Retry the request with localhost
        return this.request<T>(path, options);
      }

      // Re-throw other errors
      throw error;
    }
  }

  /**
   * Connect to the API and fetch the authenticated user's profile.
   * Stores the user in `this.user` for future use.
   */
  private async connect(): Promise<User> {
    this.user = await this.getProfile();
    return this.user;
  }

  // User Methods
  /**
   * Get a user's profile by address. If no address is provided, returns the authenticated user's profile.
   * @param address The wallet address of the user (optional)
   */
  public async getProfile(): Promise<User> {
    // If address is provided, fetch specific profile (bypass cache or check if matches)
    if (this.user) {
      return this.user;
    }

    // Fetch authenticated user and cache it
    const user = await this.request<User>("/profile", {
      method: "POST",
      body: JSON.stringify({}),
    });
    this.user = user;
    return user;
  }

  /**
   * Update the authenticated user's profile
   * @param params Fields to update
   */
  public async updateUser(params: UpdateUserParams): Promise<User> {
    return this.request<User>("/update-user", {
      method: "PUT",
      body: JSON.stringify(params),
    });
  }

  // Upload Methods
  /**
   * Register a new upload metadata
   * @param params Upload metadata
   */
  public async createUpload(params: UploadParams): Promise<Upload> {
    if (!params.owner) {
      params.owner = (await this.getProfile()).address;
    }
    return this.request<Upload>("/uploads", {
      method: "POST",
      body: JSON.stringify(params),
    });
  }

  /**
   * List uploads for a specific address
   * @param address The wallet address to list uploads for
   */
  public async listUploads(): Promise<Upload[]> {
    return this.request<Upload[]>(`/uploads/${(await this.getProfile()).address}`);
  }

  /**
   * Get upload details by Blob ID
   * @param blobId The Walrus Blob ID
   */
  public async getUpload(blobId: string): Promise<Upload> {
    return this.request<Upload>(`/uploads/blob/${blobId}`);
  }

  /**
   * Get upload details by Slug
   * @param slug The unique slug
   */
  public async getUploadBySlug(slug: string): Promise<Upload> {
    return this.request<Upload>(`/uploads/share/${slug}`);
  }

  /**
   * Update an existing upload's metadata
   * @param blobId The Blob ID of the upload to update
   * @param params Fields to update
   */
  public async updateUpload(
    blobId: string,
    params: UpdateUploadParams
  ): Promise<Upload> {
    return this.request<Upload>(`/uploads/${blobId}`, {
      method: "PUT",
      body: JSON.stringify(params),
    });
  }

  /**
   * Unlock a paid file
   * @param params Unlock parameters including uploadId and paymentProof
   */
  public async unlockUpload(params: UnlockParams): Promise<UnlockResponse> {
    return this.request<UnlockResponse>("/uploads/unlock", {
      method: "POST",
      body: JSON.stringify(params),
    });
  }

  /**
   * Get all purchases for the authenticated user
   * @returns List of purchased uploads with purchase metadata
   */
  public async getPurchases(): Promise<Upload[]> {
    return this.request<Upload[]>(`/uploads/purchases/${(await this.getProfile()).address}`);
  }

  /**
   * Upload a file to Walrus and register it with the backend
   * @param options Upload options including the file blob
   */
  public async uploadFile(options: WalrusUploadOptions): Promise<Upload> {
    let {
      file,
      filename,
      owner,
      visibility = "private",
      price = 0,
      currency = "SUI",
      publisherUrl = DEFAULT_PUBLISHER,
      aggregatorUrl = DEFAULT_AGGREGATOR,
    } = options;

    // If owner is not provided, fetch it from the authenticated user's profile
    if (!owner) {
      owner = (await this.getProfile()).address;
    }

    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
    const blobIds: string[] = [];

    // 1. Upload Chunks
    for (let i = 0; i < totalChunks; i++) {
      const start = i * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, file.size);
      const chunk = (file as any).slice(start, end);

      const response = await fetch(`${publisherUrl}/v1/blobs?epochs=5`, {
        method: "PUT",
        body: chunk,
      });

      if (!response.ok) {
        throw new Error(
          `Failed to upload chunk ${i + 1}/${totalChunks}: ${
            response.statusText
          }`
        );
      }

      const data: any = await response.json();
      let chunkId = "";

      if (data.newlyCreated) {
        chunkId = data.newlyCreated.blobObject.blobId;
      } else if (data.alreadyCertified) {
        chunkId = data.alreadyCertified.blobId;
      } else {
        throw new Error("Unexpected response from Walrus Publisher");
      }

      blobIds.push(chunkId);
    }

    // 2. Create and Upload Manifest
    const manifest = {
      fileName: filename,
      fileType: file.type,
      fileSize: file.size,
      totalChunks: totalChunks,
      chunks: blobIds,
    };

    const manifestRes = await fetch(`${publisherUrl}/v1/blobs?epochs=5`, {
      method: "PUT",
      body: JSON.stringify(manifest),
      headers: { "Content-Type": "application/json" },
    });

    if (!manifestRes.ok) {
      throw new Error(`Failed to upload manifest: ${manifestRes.statusText}`);
    }

    const manifestData: any = await manifestRes.json();
    let blobId = "";

    if (manifestData.newlyCreated) {
      blobId = manifestData.newlyCreated.blobObject.blobId;
    } else if (manifestData.alreadyCertified) {
      blobId = manifestData.alreadyCertified.blobId;
    } else {
      throw new Error("Unexpected response from Walrus Publisher for manifest");
    }

    // 3. Register with Backend
    // Check if it already exists first (optional optimization, but good practice)
    try {
      const existing = await this.getUpload(blobId);
      if (existing) {
        return existing;
      }
    } catch (e) {
      // Ignore 404
    }

    return this.createUpload({
      blobId,
      owner,
      filename,
      mimeType: file.type,
      size: file.size,
      visibility,
      price: visibility === "paid" ? price : 0,
      currency,
    });
  }
}

# Odoben SDK

A Bun-compatible SDK for interacting with the Odoben backend API.

## Installation

```bash
bun add @bunland/odoben
# or
npm install @bunland/odoben
```

## Usage

First, you need an API Key. You can generate one using the desktop app or via the API if you have access.

```typescript
import { Odoben } from "@bunland/odoben";

// By default, the SDK connects to https://odoben.xyz/api/v1
const client = new Odoben("sk_your_api_key_here");

// You can also specify the URL explicitly
const httpsClient = new Odoben(
  "sk_your_api_key_here",
  "https://odoben.xyz/api/v1"
);

// For local development
const localClient = new Odoben(
  "sk_your_api_key_here",
  "http://localhost:4000/api/v1"
);

// 1. Connect (Optional but recommended)
// Fetches user profile once and caches it for subsequent calls
const user = await client.connect();
console.log("Logged in as:", user.address);

// 2. List My Uploads (Uses cached user)
const uploads = await client.listUploads();
console.log("My uploads:", uploads);

// 3. Upload a File (Uses cached user)
const file = new Blob(["Hello World"], { type: "text/plain" });

const upload = await client.uploadFile({
  file,
  filename: "hello.txt",
  visibility: "public", // "public", "private", or "paid"
});
console.log("Uploaded:", upload);

// 4. Get Purchases
const purchases = await client.getPurchases();
console.log("My purchases:", purchases);

// 5. Unlock a Paid File
const unlocked = await client.unlockUpload({
  uploadId: "upload_id_here",
  paymentProof: "tx_digest_here",
});
```

## Methods

- `connect()`: Fetches and caches the authenticated user's profile. Recommended to call this first.

### User

- `getProfile()`: Get authenticated user's profile (uses cache if available)
- `updateUser(params: UpdateUserParams)`: Update user profile (username, email, avatar, banner, bio)

### Uploads

- `uploadFile(options: WalrusUploadOptions)`: Uploads file to Walrus (chunks >10MB) and registers metadata
- `createUpload(params: UploadParams)`: Register metadata manually (advanced)
- `listUploads()`: List uploads for authenticated user
- `getUpload(blobId: string)`: Get upload by Blob ID
- `getUploadBySlug(slug: string)`: Get upload by slug
- `updateUpload(blobId: string, params: UpdateUploadParams)`: Update upload metadata
- `unlockUpload(params: UnlockParams)`: Unlock a paid file with payment proof
- `getPurchases()`: Get all purchases for authenticated user

## Testing

The SDK includes a comprehensive test suite to verify all endpoints and functionality.

### Setup

1. **Create test environment file:**

   ```bash
   cp .env.test.example .env.test
   ```

2. **Configure test environment** (`.env.test`):

   ```bash
   TEST_API_KEY=your_api_key_here
   TEST_BASE_URL=https://odoben.xyz/api/v1
   TEST_USER_ADDRESS=your_wallet_address_here
   ```

   > **Note:** For local development, use `http://localhost:4000/api/v1`.

3. **Ensure backend is running (for local development):**
   ```bash
   # In backend directory
   bun run dev
   ```

### Running Tests

```bash
# Run all tests
bun test

# Run tests with verbose output
bun test --verbose

# Run specific test file
bun test src/sdk.test.ts
```

### Test Coverage

The test suite covers:

- ✅ **User Profile Methods** - `connect()`, `getProfile()`, `updateUser()`
- ✅ **Upload Metadata** - `createUpload()`, `listUploads()`, `getUpload()`, `getUploadBySlug()`, `updateUpload()`
- ✅ **Purchases** - `getPurchases()`
- ✅ **Payment & Unlock** - `unlockUpload()` (402 flow, payment validation)
- ✅ **Error Handling** - Invalid API keys, 404s, 403s, unauthorized access
- ✅ **Integration Workflows** - Complete upload lifecycle, visibility controls

### Expected Test Output

```
✅ Connected user: 0x1234...
✅ Retrieved cached profile
✅ Updated user profile
✅ Created upload: test_blob_1234
✅ Listed 5 uploads
✅ Fetched upload by blobId
✅ Complete workflow test passed
...
```

## License

MIT

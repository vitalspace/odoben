import { describe, test, expect, beforeAll } from "bun:test";
import { Odoben } from "./client";
import type { Upload, User } from "./types";

// Test Configuration
const TEST_API_KEY = process.env.TEST_API_KEY || "sk_5e276e1aeb6c446d51009fc576ae328973a883ab3936b813";
const TEST_BASE_URL = process.env.TEST_BASE_URL || "https://odoben.xyz/api/v1";
const TEST_USER_ADDRESS = process.env.TEST_USER_ADDRESS || "";

// Shared test state
let client: Odoben;
let testUser: User;
let testUpload: Upload;

describe("Odoben SDK", () => {
  beforeAll(async () => {
    if (!TEST_API_KEY) {
      throw new Error(
        "TEST_API_KEY is required. Please set it in .env.test or environment variables."
      );
    }
    client = new Odoben(TEST_API_KEY, TEST_BASE_URL);
  });

  describe("User Profile Methods", () => {
    test("getProfile() - should authenticate and fetch user profile", async () => {
      testUser = await client.getProfile();

      expect(testUser).toBeDefined();
      expect(testUser.address).toBeDefined();
      expect(typeof testUser.address).toBe("string");
      expect(testUser.createdAt).toBeDefined();

      console.log("✅ Connected user:", testUser.address);
    });

    test("getProfile() - should return cached user profile", async () => {
      const profile = await client.getProfile();

      expect(profile).toBeDefined();
      expect(profile.address).toBe(testUser.address);
      expect(profile).toEqual(testUser);

      console.log("✅ Retrieved cached profile");
    });

    test("updateUser() - should update user profile fields", async () => {
      const timestamp = Date.now();
      const updates = {
        username: `testuser_${timestamp}`,
        bio: `Test bio updated at ${timestamp}`,
        email: `test_${timestamp}@example.com`,
      };

      const updatedUser = await client.updateUser(updates);

      expect(updatedUser).toBeDefined();
      expect(updatedUser.username).toBe(updates.username);
      expect(updatedUser.bio).toBe(updates.bio);
      expect(updatedUser.email).toBe(updates.email);

      console.log("✅ Updated user profile:", updates);
    });
  });

  describe("Upload Metadata Methods", () => {
    test("createUpload() - should create a new upload with private visibility", async () => {
      const timestamp = Date.now();
      const uploadParams = {
        blobId: `test_blob_${timestamp}`,
        filename: `test_file_${timestamp}.txt`,
        mimeType: "text/plain",
        size: 1024,
        visibility: "private" as const,
      };

      testUpload = await client.createUpload(uploadParams);

      expect(testUpload).toBeDefined();
      expect(testUpload.blobId).toBe(uploadParams.blobId);
      expect(testUpload.filename).toBe(uploadParams.filename);
      expect(testUpload.mimeType).toBe(uploadParams.mimeType);
      expect(testUpload.size).toBe(uploadParams.size);
      expect(testUpload.visibility).toBe("private");
      expect(testUpload.owner).toBe(testUser.address);
      expect(testUpload.slug).toBeDefined();
      expect(testUpload._id).toBeDefined();

      console.log("✅ Created upload:", testUpload.blobId);
    });

    test("createUpload() - should create upload with public visibility", async () => {
      const timestamp = Date.now();
      const uploadParams = {
        blobId: `test_blob_public_${timestamp}`,
        filename: `public_file_${timestamp}.txt`,
        mimeType: "text/plain",
        size: 2048,
        visibility: "public" as const,
      };

      const upload = await client.createUpload(uploadParams);

      expect(upload.visibility).toBe("public");
      expect(upload.price).toBe(0);

      console.log("✅ Created public upload");
    });

    test("createUpload() - should create upload with paid visibility", async () => {
      const timestamp = Date.now();
      const uploadParams = {
        blobId: `test_blob_paid_${timestamp}`,
        filename: `paid_file_${timestamp}.txt`,
        mimeType: "text/plain",
        size: 4096,
        visibility: "paid" as const,
        price: 0.01, // 0.01 SUI
        currency: "SUI",
      };

      const upload = await client.createUpload(uploadParams);

      expect(upload.visibility).toBe("paid");
      expect(upload.price).toBe(0.01);
      expect(upload.currency).toBe("SUI");

      console.log("✅ Created paid upload with price:", upload.price);
    });

    test("createUpload() - should return existing upload if blobId already exists", async () => {
      const duplicateParams = {
        blobId: testUpload.blobId,
        filename: "duplicate.txt",
        mimeType: "text/plain",
        size: 512,
      };

      const duplicate = await client.createUpload(duplicateParams);

      expect(duplicate._id).toBe(testUpload._id);
      expect(duplicate.blobId).toBe(testUpload.blobId);
      // Should return original, not create new one
      expect(duplicate.filename).toBe(testUpload.filename);

      console.log("✅ Duplicate upload handled correctly");
    });

    test("listUploads() - should list all uploads for authenticated user", async () => {
      const uploads = await client.listUploads();

      expect(Array.isArray(uploads)).toBe(true);
      expect(uploads.length).toBeGreaterThan(0);

      // Should include our test upload
      const found = uploads.find((u) => u.blobId === testUpload.blobId);
      expect(found).toBeDefined();

      console.log(`✅ Listed ${uploads.length} uploads`);
    });

    test("getUpload() - should fetch upload by blobId", async () => {
      const upload = await client.getUpload(testUpload.blobId);

      expect(upload).toBeDefined();
      expect(upload.blobId).toBe(testUpload.blobId);
      expect(upload._id).toBe(testUpload._id);
      expect(upload.filename).toBe(testUpload.filename);

      console.log("✅ Fetched upload by blobId");
    });

    test("getUploadBySlug() - should fetch upload by slug", async () => {
      const upload = await client.getUploadBySlug(testUpload.slug);

      expect(upload).toBeDefined();
      expect(upload.slug).toBe(testUpload.slug);
      expect(upload.blobId).toBe(testUpload.blobId);
      expect(upload._id).toBe(testUpload._id);

      console.log("✅ Fetched upload by slug");
    });

    test("updateUpload() - should update upload metadata", async () => {
      const updates = {
        filename: `updated_${testUpload.filename}`,
        visibility: "public" as const,
      };

      const updated = await client.updateUpload(testUpload.blobId, updates);

      expect(updated.filename).toBe(updates.filename);
      expect(updated.visibility).toBe("public");
      expect(updated.blobId).toBe(testUpload.blobId);

      // Update our test reference
      testUpload = updated;

      console.log("✅ Updated upload metadata");
    });

    test("updateUpload() - should update paid upload price", async () => {
      const timestamp = Date.now();
      const paidUpload = await client.createUpload({
        blobId: `test_blob_price_update_${timestamp}`,
        filename: `price_test_${timestamp}.txt`,
        mimeType: "text/plain",
        size: 1024,
        visibility: "paid",
        price: 0.01,
        currency: "SUI",
      });

      const updated = await client.updateUpload(paidUpload.blobId, {
        price: 0.05,
      });

      expect(updated.price).toBe(0.05);
      expect(updated.visibility).toBe("paid");

      console.log("✅ Updated paid upload price");
    });

    test("getPurchases() - should fetch user's purchased files", async () => {
      const purchases = await client.getPurchases();

      expect(Array.isArray(purchases)).toBe(true);
      // Purchases may be empty if user hasn't bought anything
      console.log(`✅ Fetched ${purchases.length} purchases`);

      if (purchases.length > 0) {
        const purchase = purchases[0];
        if (purchase) {
          expect(purchase.blobId).toBeDefined();
          expect(purchase.filename).toBeDefined();
          // Should have purchase metadata
          expect((purchase as any).purchaseDate).toBeDefined();
        }
      }
    });
  });

  describe("Payment & Unlock Methods", () => {
    let paidUpload: Upload;

    beforeAll(async () => {
      // Create a paid upload for unlock tests
      const timestamp = Date.now();
      paidUpload = await client.createUpload({
        blobId: `test_blob_unlock_${timestamp}`,
        filename: `unlock_test_${timestamp}.txt`,
        mimeType: "text/plain",
        size: 1024,
        visibility: "paid",
        price: 0.01,
        currency: "SUI",
      });
    });

    test("unlockUpload() - should return 402 payment required without proof", async () => {
      try {
        await client.unlockUpload({
          uploadId: paidUpload._id,
        });
        // Should not reach here
        expect(true).toBe(false);
      } catch (error: any) {
        expect(error.message).toContain("Payment Required");
        console.log("✅ Correctly returned payment required error");
      }
    });

    test("unlockUpload() - should reject invalid payment proof", async () => {
      try {
        await client.unlockUpload({
          uploadId: paidUpload._id,
          paymentProof: "invalid_transaction_digest",
        });
        // Should not reach here
        expect(true).toBe(false);
      } catch (error: any) {
        expect(error.message).toMatch(
          /Invalid Payment Proof|Transaction not found/i
        );
        console.log("✅ Correctly rejected invalid payment proof");
      }
    });

    test("unlockUpload() - should reject unlock attempt on private upload with test proof", async () => {
      // Create a private upload (like in verify_fix.ts)
      const timestamp = Date.now();
      const privateUpload = await client.createUpload({
        blobId: `test_blob_private_unlock_${timestamp}`,
        filename: `private_unlock_test_${timestamp}.txt`,
        mimeType: "text/plain",
        size: 1024,
        visibility: "private",
      });

      try {
        // Try to unlock private upload with test_proof (like verify_fix.ts)
        await client.unlockUpload({
          uploadId: privateUpload._id,
          paymentProof: "test_proof",
        });
        // Should not reach here
        expect(true).toBe(false);
      } catch (error: any) {
        // Should fail due to invalid payment proof
        expect(error.message).toMatch(
          /Invalid Payment Proof|Transaction not found|Payment Required/i
        );
        console.log("✅ Correctly rejected unlock on private upload with test proof");
      }
    });

    // Note: Testing with real payment proof would require actual blockchain transactions
    // This is skipped in automated tests but can be tested manually
    test.skip("unlockUpload() - should unlock with valid payment proof", async () => {
      // This test requires a real transaction on Sui testnet
      // Manual testing required
    });
  });

  describe("Error Handling", () => {
    test("should handle invalid API key", async () => {
      try {
        const invalidClient = new Odoben("invalid_key", TEST_BASE_URL);
        await invalidClient.getProfile();
        expect(true).toBe(false); // Should not reach here
      } catch (error: any) {
        expect(error.message).toMatch(/Unauthorized|401|Invalid API Key/i);
        console.log("✅ Correctly handled invalid API key");
      }
    });

    test("should handle non-existent upload", async () => {
      try {
        await client.getUpload("non_existent_blob_id");
        expect(true).toBe(false); // Should not reach here
      } catch (error: any) {
        expect(error.message).toMatch(/not found|404/i);
        console.log("✅ Correctly handled non-existent upload");
      }
    });

    test("should handle non-existent slug", async () => {
      try {
        await client.getUploadBySlug("non_existent_slug");
        expect(true).toBe(false); // Should not reach here
      } catch (error: any) {
        expect(error.message).toMatch(/not found|404/i);
        console.log("✅ Correctly handled non-existent slug");
      }
    });

    test("should handle unauthorized upload update", async () => {
      // Create a client with a different API key (if available)
      // For now, we'll test updating with missing blobId
      try {
        await client.updateUpload("non_existent_blob", {
          filename: "test.txt",
        });
        expect(true).toBe(false); // Should not reach here
      } catch (error: any) {
        expect(error.message).toMatch(/not found|404|Forbidden|403/i);
        console.log("✅ Correctly handled unauthorized update");
      }
    });
  });

  describe("File Upload Methods", () => {
    test("uploadFile() - should handle missing owner parameter gracefully", async () => {
      const blob = new Blob(["Hello Walrus!"], { type: "text/plain" });

      try {
        // This should work - owner gets fetched from profile
        await client.uploadFile({
          file: blob,
          filename: "test.txt",
        });
        // May succeed or fail depending on Walrus network, but shouldn't crash
      } catch (error: any) {
        // Expected to fail in test environment (no Walrus server)
        expect(error.message).toMatch(/Failed to upload|connect|network|server/i);
        console.log("✅ uploadFile handled missing server gracefully");
      }
    });
  });

  describe("Integration Tests", () => {
    test("complete workflow - create, update, fetch, list", async () => {
      const timestamp = Date.now();

      // 1. Create upload
      const upload = await client.createUpload({
        blobId: `integration_test_${timestamp}`,
        filename: `integration_${timestamp}.txt`,
        mimeType: "text/plain",
        size: 2048,
        visibility: "private",
      });

      expect(upload).toBeDefined();
      console.log("  1. Created upload");

      // 2. Update upload
      const updated = await client.updateUpload(upload.blobId, {
        visibility: "public",
        filename: `updated_integration_${timestamp}.txt`,
      });

      expect(updated.visibility).toBe("public");
      expect(updated.filename).toContain("updated");
      console.log("  2. Updated upload");

      // 3. Fetch by blobId
      const fetchedById = await client.getUpload(upload.blobId);
      expect(fetchedById.blobId).toBe(upload.blobId);
      console.log("  3. Fetched by blobId");

      // 4. Fetch by slug
      const fetchedBySlug = await client.getUploadBySlug(upload.slug);
      expect(fetchedBySlug.slug).toBe(upload.slug);
      console.log("  4. Fetched by slug");

      // 5. List uploads (should include this one)
      const uploads = await client.listUploads();
      const found = uploads.find((u) => u.blobId === upload.blobId);
      expect(found).toBeDefined();
      console.log("  5. Found in list");

      console.log("✅ Complete workflow test passed");
    });

    test("visibility controls - public, private, paid", async () => {
      const timestamp = Date.now();

      // Create uploads with different visibility
      const privateUpload = await client.createUpload({
        blobId: `visibility_private_${timestamp}`,
        filename: "private.txt",
        mimeType: "text/plain",
        size: 1024,
        visibility: "private",
      });

      const publicUpload = await client.createUpload({
        blobId: `visibility_public_${timestamp}`,
        filename: "public.txt",
        mimeType: "text/plain",
        size: 1024,
        visibility: "public",
      });

      const paidUpload = await client.createUpload({
        blobId: `visibility_paid_${timestamp}`,
        filename: "paid.txt",
        mimeType: "text/plain",
        size: 1024,
        visibility: "paid",
        price: 0.02,
        currency: "SUI",
      });

      expect(privateUpload.visibility).toBe("private");
      expect(publicUpload.visibility).toBe("public");
      expect(paidUpload.visibility).toBe("paid");
      expect(paidUpload.price).toBe(0.02);

      console.log("✅ All visibility types work correctly");
    });
  });
});

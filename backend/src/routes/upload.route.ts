import { Elysia, t } from "elysia";
import { Upload } from "../models/Upload";
import { Purchase } from "../models/Purchase";
import { authenticateUser } from "../utils/auth";
import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";

const suiClient = new SuiClient({
  url: getFullnodeUrl("testnet"),
});

// Simple slug generator
function generateSlug(length = 10) {
  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let slug = "";
  for (let i = 0; i < length; i++) {
    slug += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return slug;
}

export const uploadRoutes = new Elysia({ prefix: "/uploads" })
  .post(
    "/",
    async (ctx) => {
      const { body, set } = ctx;
      try {
        const address = await authenticateUser(ctx);
        if (!address) {
          set.status = 401;
          return { message: "Unauthorized" };
        }

        const {
          blobId,
          owner,
          filename,
          mimeType,
          size,
          visibility,
          price,
          currency,
        } = body;

        // Ensure the uploader is the authenticated user
        if (owner !== address) {
          set.status = 403;
          return { message: "Forbidden: You can only upload for yourself" };
        }

        const existingUpload = await Upload.findOne({ blobId });
        if (existingUpload) {
          if (existingUpload.owner === address) {
            set.status = 200;
            return existingUpload.toObject();
          }
          set.status = 409;
          return { message: "Upload already exists" };
        }

        let slug = generateSlug();
        // Ensure slug uniqueness (simple retry)
        while (await Upload.findOne({ slug })) {
          slug = generateSlug();
        }

        const newUpload = new Upload({
          blobId,
          owner,
          filename,
          mimeType,
          size,
          visibility: visibility || "private",
          price: price || 0,
          currency: currency || "SUI",
          slug,
        });

        await newUpload.save();

        set.status = 201;
        return newUpload.toObject();
      } catch (error) {
        set.status = 500;
        return { message: "Internal server error", error };
      }
    },
    {
      body: t.Object({
        blobId: t.String(),
        owner: t.String(),
        filename: t.String(),
        mimeType: t.String(),
        size: t.Number(),
        visibility: t.Optional(
          t.Union([
            t.Literal("public"),
            t.Literal("private"),
            t.Literal("paid"),
          ])
        ),
        price: t.Optional(t.Number()),
        currency: t.Optional(t.String()),
      }),
    }
  )
  .get("/:address", async (ctx) => {
    const {
      params: { address },
      set,
    } = ctx;
    try {
      const currentUser = await authenticateUser(ctx);

      let query: any = { owner: address };

      // If not the owner, hide private files
      if (currentUser !== address) {
        query.visibility = { $ne: "private" };
      }

      const uploads = await Upload.find(query).sort({
        createdAt: -1,
      });

      // Read-repair: Generate slug for legacy files if missing
      for (const upload of uploads) {
        if (!upload.slug) {
          let slug = generateSlug();
          while (await Upload.findOne({ slug })) {
            slug = generateSlug();
          }
          upload.slug = slug;
          await upload.save();
        }
      }

      // Mask blobId for paid files if not owner AND not purchased
      const maskedUploads = await Promise.all(
        uploads.map(async (upload) => {
          if (upload.visibility === "paid" && upload.owner !== currentUser) {
            // Check if purchased
            const purchase = await Purchase.findOne({
              uploadId: upload._id,
              buyerAddress: currentUser,
            });

            if (!purchase) {
              return {
                ...upload.toObject(),
                blobId: "PAYMENT_REQUIRED",
              };
            }
          }
          return upload;
        })
      );

      return maskedUploads;
    } catch (error) {
      set.status = 500;
      return { message: "Internal server error", error };
    }
  })
  .get("/purchases/:address", async (ctx) => {
    const {
      params: { address },
      set,
    } = ctx;
    try {
      const currentUser = await authenticateUser(ctx);
      if (currentUser !== address) {
        set.status = 403;
        return { message: "Forbidden: You can only view your own purchases" };
      }

      // Find all purchases by this user
      const purchases = await Purchase.find({ buyerAddress: address }).sort({
        createdAt: -1,
      });

      // Get the corresponding uploads
      const uploadIds = purchases.map((p) => p.uploadId);
      const uploads = await Upload.find({ _id: { $in: uploadIds } });

      // Map purchases to uploads to preserve purchase date if needed,
      // or just return uploads. Let's return uploads with purchase info.
      const purchasedFiles = uploads.map((upload) => {
        const purchase = purchases.find(
          (p) => p.uploadId.toString() === upload._id.toString()
        );
        return {
          ...upload.toObject(),
          purchaseDate: purchase?.createdAt,
          paymentProof: purchase?.paymentProof,
        };
      });

      return purchasedFiles;
    } catch (error) {
      set.status = 500;
      return { message: "Internal server error", error };
    }
  })
  .get("/blob/:blobId", async (ctx) => {
    const {
      params: { blobId },
      set,
    } = ctx;
    try {
      const upload = await Upload.findOne({ blobId });

      if (!upload) {
        set.status = 404;
        return { message: "Upload not found" };
      }

      return upload.toObject();
    } catch (error) {
      set.status = 500;
      return { message: "Internal server error", error };
    }
  })
  .get("/share/:slug", async (ctx) => {
    const {
      params: { slug },
      set,
    } = ctx;
    try {
      const currentUser = await authenticateUser(ctx);
      const upload = await Upload.findOne({ slug });

      if (!upload) {
        set.status = 404;
        return { message: "Upload not found" };
      }

      // Access control logic
      if (upload.visibility === "private" && upload.owner !== currentUser) {
        set.status = 403;
        return { message: "Access Denied: Private file" };
      }

      // Mask blobId for paid files if not owner AND not purchased
      if (upload.visibility === "paid" && upload.owner !== currentUser) {
        const purchase = await Purchase.findOne({
          uploadId: upload._id,
          buyerAddress: currentUser,
        });

        if (!purchase) {
          return {
            ...upload.toObject(),
            blobId: "PAYMENT_REQUIRED",
          };
        }
      }

      return upload.toObject();
    } catch (error) {
      set.status = 500;
      return { message: "Internal server error", error };
    }
  })
  .post(
    "/unlock",
    async (ctx) => {
      const { body, set } = ctx;
      try {
        const address = await authenticateUser(ctx);
        if (!address) {
          set.status = 401;
          return { message: "Unauthorized" };
        }

        const { uploadId, paymentProof } = body;

        let upload;
        try {
          upload = await Upload.findById(uploadId);
        } catch (error: any) {
          if (error.name === 'CastError') {
            set.status = 400;
            return { message: "Invalid upload ID format" };
          }
          throw error;
        }
        if (!upload) {
          set.status = 404;
          return { message: "Upload not found" };
        }

        // --- FLUJO DE PAGO (SUI x402 STYLE) ---

        // Paso A: Si no envía prueba, devolvemos 402 con los datos para que pague
        if (!paymentProof) {
          set.status = 402;
          return {
            message: "Payment Required",
            invoice: {
              amount: upload.price, // Ej: 1000000000 (MIST)
              currency: upload.currency, // Ej: "SUI" o Type Tag
              recipient: upload.owner, // La dirección que debe recibir los fondos
              network: "sui:testnet",
            },
          };
        }

        // Check if already purchased
        const existingPurchase = await Purchase.findOne({
          uploadId: upload._id,
          buyerAddress: address,
        });

        if (existingPurchase) {
          return { blobId: upload.blobId, message: "Already purchased" };
        }

        // Paso B: Validar la prueba en la Blockchain
        try {
          console.log(`Verifying tx: ${paymentProof} for user ${address}`);

          // 1. Buscamos la transacción en la red con reintentos
          let txBlock;
          let retries = 10; // Increased retries
          while (retries > 0) {
            try {
              txBlock = await suiClient.getTransactionBlock({
                digest: paymentProof,
                options: {
                  showEffects: true,
                  showBalanceChanges: true,
                  showInput: true,
                },
              });
              if (txBlock) break;
            } catch (err) {
              console.log(`Tx not found yet, retrying... (${retries} left)`);
              retries--;
              if (retries === 0) {
                console.error("Final retry failed:", err);
                throw err;
              }
              await new Promise((r) => setTimeout(r, 2000)); // Wait 2s
            }
          }

          if (!txBlock) throw new Error("Transaction not found after retries");

          // 2. Verificamos que la transacción fue exitosa
          if (txBlock.effects?.status.status !== "success") {
            set.status = 400;
            return { message: "Payment transaction failed on-chain" };
          }

          // 3. Verificamos que el pagador sea el usuario autenticado
          const sender = txBlock.transaction?.data.sender;
          if (sender !== address) {
            set.status = 403;
            return {
              message: `Payment wallet (${sender}) does not match user session (${address})`,
            };
          }

          // 4. Verificamos que el receptor (upload.owner) recibió la cantidad correcta
          const payment = txBlock.balanceChanges?.find((change) => {
            const owner = change.owner as any;
            return (
              owner.AddressOwner === upload.owner &&
              BigInt(change.amount) > BigInt(0)
            );
          });

          if (!payment) {
            console.error(
              "Balance changes:",
              JSON.stringify(txBlock.balanceChanges, null, 2)
            );
            set.status = 402;
            return {
              message:
                "No payment detected to the content owner in this transaction",
            };
          }

          // 5. Verificamos el monto y moneda
          const paidAmount = BigInt(payment.amount);
          // Ensure price is treated as MIST (integer)
          const requiredAmount = BigInt(
            Math.round(upload.price * 1_000_000_000)
          );

          // Allow small margin of error or exact match? Exact match preferred.
          // Note: upload.price in DB might be "0.01" (SUI), so we convert to MIST.

          if (paidAmount < requiredAmount) {
            set.status = 402;
            return {
              message: "Insufficient payment",
              received: payment.amount,
              expected: requiredAmount.toString(),
            };
          }

          // SAVE PURCHASE
          const newPurchase = new Purchase({
            uploadId: upload._id,
            buyerAddress: address,
            paymentProof: paymentProof,
            price: upload.price,
            currency: upload.currency,
          });
          await newPurchase.save();
        } catch (e) {
          console.error("Sui validation error details:", e);
          set.status = 400;
          return {
            message: "Invalid Payment Proof or Transaction not found",
            details: String(e),
          };
        }

        // --- FIN VALIDACIÓN ---

        // Si todo pasó, entregamos el contenido
        return { blobId: upload.blobId };
      } catch (error) {
        set.status = 500;
        return { message: "Internal server error", error };
      }
    },
    {
      body: t.Object({
        uploadId: t.String(),
        paymentProof: t.Optional(t.String()),
      }),
    }
  )
  .put(
    "/:blobId",
    async (ctx) => {
      const {
        params: { blobId },
        body,
        set,
      } = ctx;
      try {
        const address = await authenticateUser(ctx);
        if (!address) {
          set.status = 401;
          return { message: "Unauthorized" };
        }

        const upload = await Upload.findOne({ blobId });
        if (!upload) {
          set.status = 404;
          return { message: "Upload not found" };
        }

        if (upload.owner !== address) {
          set.status = 403;
          return { message: "Forbidden: You can only edit your own files" };
        }

        const { visibility, price, currency } = body;

        if (visibility) upload.visibility = visibility;
        if (price !== undefined) upload.price = price;
        if (currency) upload.currency = currency;
        if (body.filename) upload.filename = body.filename;

        // Lazy migration: Generate slug if missing
        if (!upload.slug) {
          let slug = generateSlug();
          while (await Upload.findOne({ slug })) {
            slug = generateSlug();
          }
          upload.slug = slug;
        }

        await upload.save();

        return upload.toObject();
      } catch (error) {
        set.status = 500;
        return { message: "Internal server error", error };
      }
    },
    {
      body: t.Object({
        visibility: t.Optional(
          t.Union([
            t.Literal("public"),
            t.Literal("private"),
            t.Literal("paid"),
          ])
        ),
        price: t.Optional(t.Number()),
        currency: t.Optional(t.String()),
        filename: t.Optional(t.String()),
      }),
    }
  );

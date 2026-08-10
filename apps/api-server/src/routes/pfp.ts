import { Router } from "express";
import { uploadPfp } from "../lib/s3";
import { uploadLimiter, clientIp } from "../lib/rateLimit";
import { PFP_MAX_BYTES } from "@repo/types/limits";

export const pfpRouter: Router = Router()

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"])

/**
 * Presign stays public so signup can upload an avatar before auth,
 * but is tightly rate-limited by IP and capped at PFP_MAX_BYTES.
 */
pfpRouter.post("/get-url", uploadLimiter, async (req, res) => {
    try {
        const { fileType } = req.body as { fileType?: string }

        if (!fileType || !ALLOWED_TYPES.has(fileType)) {
            res.status(400).json({ error: "Unsupported file type" })
            return
        }

        const { publicUrl, key, uploadUrl } = await uploadPfp(clientIp(req), fileType)
        res.json({ publicUrl, key, uploadUrl, maxBytes: PFP_MAX_BYTES })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: "Something went wrong :(. Please try again later" })
    }
})

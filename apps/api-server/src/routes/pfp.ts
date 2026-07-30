import { Router } from "express";
import { uploadPfp } from "../lib/s3";

export const pfpRouter: Router = Router()

pfpRouter.post("/get-url", async (req, res) => {
    const { fileType, fileName } = req.body

    if (!["image/jpeg", "image/png", "image/webp"].includes(fileType)) {
        res.status(400).json({ error: "Unsupported file type" })

    }
    const { publicUrl, key, uploadUrl } = await uploadPfp(fileName, fileType)
    res.json({ publicUrl, key, uploadUrl })
})
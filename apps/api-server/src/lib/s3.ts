import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { IAM_USER_ACCESS_KEY, IAM_USER_SECRET_ACCESS_KEY, S3_BUCKET_NAME, S3_BUCKET_REGION } from "../config";
import { randomUUID } from "crypto";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({
    region: S3_BUCKET_REGION,
    credentials: {
        accessKeyId: IAM_USER_ACCESS_KEY,
        secretAccessKey: IAM_USER_SECRET_ACCESS_KEY
    }
})

const BUCKET_NAME = S3_BUCKET_NAME

export const uploadPfp = async (userKey: string, fileType: string) => {
    const ext = fileType.split("/")[1]
    const safeKey = userKey.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 64) || "anon"
    const key = `avatars/${safeKey}-${randomUUID()}.${ext}`
    const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        ContentType: fileType,
    })

    // Short TTL so leaked/abused URLs die quickly
    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 60 })

    const publicUrl = `https://${BUCKET_NAME}.s3.${S3_BUCKET_REGION}.amazonaws.com/${key}`
    return { uploadUrl, key, publicUrl }
}

// s3.upload.ts (Cloudflare R2)

import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "./s3.config";
import { Express } from "express";

export const uploadToR2 = async (
  file: Express.Multer.File
) => {

  const key = `property/${Date.now()}-${file.originalname}`;

  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    }),
  );

  /// 🔥 IMPORTANT: Use CDN URL (NOT R2 URL)
  return `${process.env.R2_PUBLIC_URL}/${key}`;
};
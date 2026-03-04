import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "./s3.config";

export const uploadToS3 = async (
  file: Express.Multer.File,
) => {

  const key = `property/${Date.now()}-${file.originalname}`;

  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    }),
  );

  return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
};
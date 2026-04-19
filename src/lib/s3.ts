import "server-only";

import { randomUUID } from "node:crypto";

import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

function getEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} 환경 변수가 설정되지 않았습니다.`);
  }

  return value;
}

let s3Client: S3Client | null = null;

export function getS3Client() {
  if (s3Client) {
    return s3Client;
  }

  s3Client = new S3Client({
    region: getEnv("S3_REGION"),
    credentials: {
      accessKeyId: getEnv("AWS_ACCESS_KEY_ID"),
      secretAccessKey: getEnv("AWS_SECRET_ACCESS_KEY"),
    },
  });

  return s3Client;
}

export function buildS3PublicUrl(objectKey: string) {
  const bucket = getEnv("S3_BUCKET_NAME");
  const region = getEnv("S3_REGION");
  return `https://${bucket}.s3.${region}.amazonaws.com/${objectKey}`;
}

export async function uploadImageToS3(file: File) {
  const bucket = getEnv("S3_BUCKET_NAME");
  const client = getS3Client();
  const extension = file.name.includes(".")
    ? file.name.slice(file.name.lastIndexOf("."))
    : "";
  const objectKey = `uploads/${new Date().toISOString().slice(0, 10)}/${randomUUID()}${extension}`;
  const body = Buffer.from(await file.arrayBuffer());

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: objectKey,
      Body: body,
      ContentType: file.type,
    }),
  );

  return {
    bucket,
    objectKey,
    publicUrl: buildS3PublicUrl(objectKey),
    fileSizeBytes: body.byteLength,
  };
}

export async function deleteImageFromS3(input: {
  bucket: string;
  objectKey: string;
}) {
  const client = getS3Client();

  await client.send(
    new DeleteObjectCommand({
      Bucket: input.bucket,
      Key: input.objectKey,
    }),
  );
}

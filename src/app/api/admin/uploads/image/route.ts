import { NextResponse } from "next/server";

import { getAdminSession } from "@/lib/admin-auth";
import { ensureAdminUser } from "@/lib/admin-users";
import { prisma } from "@/lib/prisma";
import { uploadImageToS3 } from "@/lib/s3";

const allowedMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export async function POST(request: Request) {
  const session = await getAdminSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const altText = String(formData.get("altText") ?? "").trim();

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "파일이 필요합니다." }, { status: 400 });
  }

  if (!allowedMimeTypes.has(file.type)) {
    return NextResponse.json(
      { error: "지원하지 않는 이미지 형식입니다." },
      { status: 400 },
    );
  }

  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json(
      { error: "이미지 크기는 10MB 이하여야 합니다." },
      { status: 400 },
    );
  }

  const adminUser = await ensureAdminUser(session.email);
  const uploaded = await uploadImageToS3(file);

  const asset = await prisma.mediaAsset.create({
    data: {
      bucketName: uploaded.bucket,
      objectKey: uploaded.objectKey,
      publicUrl: uploaded.publicUrl,
      mimeType: file.type,
      fileSizeBytes: BigInt(uploaded.fileSizeBytes),
      altText: altText || null,
      uploadedById: adminUser.id,
    },
  });

  return NextResponse.json({
    assetId: asset.id,
    url: asset.publicUrl,
    altText: asset.altText ?? "",
  });
}

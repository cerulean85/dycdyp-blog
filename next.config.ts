import type { NextConfig } from "next";

const s3BucketName = process.env.S3_BUCKET_NAME;
const s3Region = process.env.S3_REGION ?? "ap-northeast-2";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "earthling-cube-s3.s3.ap-northeast-2.amazonaws.com",
      },
      ...(s3BucketName
        ? [
            {
              protocol: "https" as const,
              hostname: `${s3BucketName}.s3.${s3Region}.amazonaws.com`,
            },
          ]
        : []),
    ],
  },
};

export default nextConfig;

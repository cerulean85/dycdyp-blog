import { ImageResponse } from "next/og";

import { siteConfig } from "@/lib/site";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background:
            "linear-gradient(135deg, #f5e7cf 0%, #f7f1e8 45%, #d6eef5 100%)",
          color: "#1c1917",
          padding: "64px",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 24,
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: "#57534e",
            }}
          >
            Editorial Blog
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 16,
              maxWidth: 920,
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: 82,
                fontWeight: 700,
                lineHeight: 1.05,
              }}
            >
              {siteConfig.name}
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 34,
                lineHeight: 1.45,
                color: "#44403c",
              }}
            >
              투자, AI, 문화, 인문을 다루는 AI 보조형 편집 블로그
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 12,
              fontSize: 22,
              color: "#44403c",
            }}
          >
            <span>Investment</span>
            <span>•</span>
            <span>AI</span>
            <span>•</span>
            <span>Culture</span>
            <span>•</span>
            <span>Humanities</span>
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 22,
              color: "#57534e",
            }}
          >
            {siteConfig.siteUrl.replace(/^https?:\/\//, "")}
          </div>
        </div>
      </div>
    ),
    size,
  );
}

import { ImageResponse } from "next/og";

import { SITE_TAGLINE, SITE_TITLE } from "@/lib/site";

export const alt = SITE_TITLE;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#EBC547",
          backgroundImage: "radial-gradient(#101010 1.6px, transparent 1.6px)",
          backgroundSize: "24px 24px",
          padding: "48px",
        }}
      >
        <div
          style={{
            display: "flex",
            width: "100%",
            height: "100%",
            border: "8px solid #101010",
            background: "#F6EFDF",
            boxShadow: "18px 18px 0 #101010",
            padding: "44px",
            gap: "36px",
          }}
        >
          <div
            style={{
              width: 220,
              height: 220,
              border: "8px solid #101010",
              background: "#F6EFDF",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              padding: "18px",
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: 84,
                height: 84,
                background: "#B6FF3B",
                borderRight: "8px solid #101010",
                borderBottom: "8px solid #101010",
              }}
            />
            <div
              style={{
                marginTop: 28,
                width: "100%",
                height: 18,
                border: "6px solid #101010",
                background: "#F6EFDF",
              }}
            />
            <div style={{ display: "flex", fontSize: 92, fontWeight: 900, color: "#101010", lineHeight: 1 }}>100</div>
            <div
              style={{
                width: "100%",
                height: 34,
                border: "6px solid #101010",
                background: "#FF6A2E",
              }}
            />
          </div>

          <div style={{ display: "flex", flex: 1, flexDirection: "column", justifyContent: "center", gap: 18 }}>
            <div
              style={{
                alignSelf: "flex-start",
                border: "6px solid #101010",
                background: "#FF6A2E",
                color: "#101010",
                fontSize: 24,
                fontWeight: 900,
                letterSpacing: 4,
                padding: "10px 18px",
              }}
            >
              УКРАЇНСЬКОЮ
            </div>
            <div style={{ fontSize: 84, fontWeight: 900, color: "#101010", lineHeight: 0.95, letterSpacing: -2 }}>Стоденка</div>
            <div style={{ fontSize: 42, fontWeight: 900, color: "#101010", lineHeight: 1.1 }}>{SITE_TAGLINE}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: "#2B2B2B", lineHeight: 1.35, maxWidth: 720 }}>
              Щоденний інфопост, календар і 100-денна програма з турніком українською.
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}

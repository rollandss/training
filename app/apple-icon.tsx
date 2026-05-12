import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#EBC547",
          padding: 18,
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            border: "8px solid #101010",
            background: "#F6EFDF",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: 14,
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: 56,
              height: 56,
              background: "#B6FF3B",
              borderRight: "6px solid #101010",
              borderBottom: "6px solid #101010",
            }}
          />
          <div
            style={{
              marginTop: 18,
              width: "100%",
              height: 12,
              border: "5px solid #101010",
              background: "#F6EFDF",
            }}
          />
          <div style={{ display: "flex", fontSize: 58, fontWeight: 900, color: "#101010", lineHeight: 1 }}>100</div>
          <div
            style={{
              width: "100%",
              height: 22,
              border: "5px solid #101010",
              background: "#FF6A2E",
            }}
          />
        </div>
      </div>
    ),
    size,
  );
}

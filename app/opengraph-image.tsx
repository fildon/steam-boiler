import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          backgroundColor: "#0f172a",
          gap: 16,
        }}
      >
        <span style={{ color: "#ffffff", fontSize: 80, fontWeight: 700, letterSpacing: "-2px" }}>
          Steam Boiler
        </span>
        <span style={{ color: "#94a3b8", fontSize: 28 }}>
          Explore your Steam library
        </span>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}

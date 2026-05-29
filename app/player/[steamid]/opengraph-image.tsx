import { ImageResponse } from "next/og";
import { getPlayerSummary } from "@/lib/steam-api";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const fallbackJsx = (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "100%", height: "100%", backgroundColor: "#0f172a", gap: 16 }}>
    <span style={{ color: "#ffffff", fontSize: 80, fontWeight: 700 }}>Steam Boiler</span>
    <span style={{ color: "#94a3b8", fontSize: 28 }}>Explore your Steam library</span>
  </div>
);

export default async function Image({
  params,
}: {
  params: Promise<{ steamid: string }>;
}) {
  const { steamid } = await params;
  if (!/^\d{17}$/.test(steamid)) return new ImageResponse(fallbackJsx, { width: 1200, height: 630 });

  const profile = await getPlayerSummary(steamid);
  if (!profile) return new ImageResponse(fallbackJsx, { width: 1200, height: 630 });

  const avatarData = await fetch(profile.avatarfull).then((r) => r.arrayBuffer());
  const avatarSrc = `data:image/jpeg;base64,${Buffer.from(avatarData).toString("base64")}`;

  return new ImageResponse(
    (
      <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", backgroundColor: "#0f172a", alignItems: "center" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 28, flex: 1 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={avatarSrc} width={200} height={200} style={{ borderRadius: 9999 }} alt="" />
          <span style={{ color: "#ffffff", fontSize: 52, fontWeight: 700 }}>{profile.personaname}</span>
          <span style={{ color: "#94a3b8", fontSize: 24 }}>Steam library stats</span>
        </div>
        <span style={{ color: "#475569", fontSize: 20, paddingBottom: 40 }}>Steam Boiler</span>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}

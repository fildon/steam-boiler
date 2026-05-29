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
  params: Promise<{ steamid1: string; steamid2: string }>;
}) {
  const { steamid1, steamid2 } = await params;
  const validId = (id: string) => /^\d{17}$/.test(id);
  if (!validId(steamid1) || !validId(steamid2)) return new ImageResponse(fallbackJsx, { width: 1200, height: 630 });

  const [profile1, profile2] = await Promise.all([
    getPlayerSummary(steamid1),
    getPlayerSummary(steamid2),
  ]);
  if (!profile1 || !profile2) return new ImageResponse(fallbackJsx, { width: 1200, height: 630 });

  const [avatar1Data, avatar2Data] = await Promise.all([
    fetch(profile1.avatarfull).then((r) => r.arrayBuffer()),
    fetch(profile2.avatarfull).then((r) => r.arrayBuffer()),
  ]);
  const avatar1Src = `data:image/jpeg;base64,${Buffer.from(avatar1Data).toString("base64")}`;
  const avatar2Src = `data:image/jpeg;base64,${Buffer.from(avatar2Data).toString("base64")}`;

  return new ImageResponse(
    (
      <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", backgroundColor: "#0f172a", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 64, flex: 1 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20, width: 280 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={avatar1Src} width={160} height={160} style={{ borderRadius: 9999 }} alt="" />
            <span style={{ color: "#ffffff", fontSize: 32, fontWeight: 600, maxWidth: 280, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {profile1.personaname}
            </span>
          </div>

          <span style={{ color: "#3b82f6", fontSize: 52, fontWeight: 700 }}>vs</span>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20, width: 280 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={avatar2Src} width={160} height={160} style={{ borderRadius: 9999 }} alt="" />
            <span style={{ color: "#ffffff", fontSize: 32, fontWeight: 600, maxWidth: 280, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {profile2.personaname}
            </span>
          </div>
        </div>

        <span style={{ color: "#475569", fontSize: 20, paddingBottom: 40 }}>Steam Boiler</span>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}

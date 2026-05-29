"use client";

import dynamic from "next/dynamic";
import type { OwnedGame } from "@/lib/steam-api";

const RandomGameBanner = dynamic(() => import("./RandomGameBanner"), { ssr: false });

export function RandomGameBannerWrapper({ games }: { games: OwnedGame[] }) {
  return <RandomGameBanner games={games} />;
}

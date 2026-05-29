"use client";

import dynamic from "next/dynamic";
import type { OwnedGame } from "@/lib/steam-api";

const RandomGameBanner = dynamic(() => import("./RandomGameBanner"), {
  ssr: false,
  loading: () => (
    <div className="bg-slate-800 border border-slate-700 rounded-lg px-5 py-4 h-[68px]" />
  ),
});

export function RandomGameBannerWrapper({ games }: { games: OwnedGame[] }) {
  return <RandomGameBanner games={games} />;
}

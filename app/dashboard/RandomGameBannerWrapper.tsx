"use client";

import dynamic from "next/dynamic";
import type { OwnedGame } from "@/lib/steam-api";

const RandomGameBanner = dynamic(() => import("./RandomGameBanner"), {
  ssr: false,
  loading: () => (
    <div className="bg-slate-800 border border-slate-700 rounded-lg px-5 py-4 flex items-center gap-4">
      <div className="shrink-0 w-24 h-9 rounded bg-slate-700" />
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="h-4 w-32 rounded bg-slate-700 mb-0.5" />
        <div className="h-6 w-48 rounded bg-slate-700" />
        <div className="h-5 w-24 rounded bg-slate-700" />
      </div>
      <div className="shrink-0 w-20 h-9 rounded-lg bg-slate-700" />
    </div>
  ),
});

export function RandomGameBannerWrapper({ games, label }: { games: OwnedGame[]; label?: string }) {
  return <RandomGameBanner games={games} label={label} />;
}

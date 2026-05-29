"use client";

import { useState } from "react";
import type { OwnedGame, AchievementStats } from "@/lib/steam-api";

type SortKey = "playtime" | "last_played" | "achievements";
type SortDir = "asc" | "desc";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "playtime", label: "Hours played" },
  { key: "last_played", label: "Recently played" },
  { key: "achievements", label: "Achievements" },
];

function sortGames(
  games: OwnedGame[],
  achievements: Record<number, AchievementStats>,
  key: SortKey,
  dir: SortDir
): OwnedGame[] {
  const sorted = [...games].sort((a, b) => {
    switch (key) {
      case "playtime":
        return b.playtime_forever - a.playtime_forever;
      case "last_played":
        return b.rtime_last_played - a.rtime_last_played;
      case "achievements": {
        const pctA = achievementPct(achievements[a.appid]);
        const pctB = achievementPct(achievements[b.appid]);
        return pctB - pctA;
      }
    }
  });
  return dir === "asc" ? sorted.reverse() : sorted;
}

function achievementPct(stats: AchievementStats | undefined): number {
  if (!stats || stats.total === 0) return -1;
  return stats.achieved / stats.total;
}

function formatLastPlayed(ts: number): string {
  if (ts === 0) return "Never";
  return new Date(ts * 1000).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function GameTable({
  games,
  achievements,
}: {
  games: OwnedGame[];
  achievements: Record<number, AchievementStats>;
}) {
  const [sortKey, setSortKey] = useState<SortKey>("playtime");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  const sorted = sortGames(games, achievements, sortKey, sortDir);

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Library</h2>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 mr-1">Sort by</span>
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              onClick={() => handleSort(opt.key)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                sortKey === opt.key
                  ? "bg-blue-600 border-blue-600 text-white"
                  : "border-slate-600 text-slate-400 hover:text-white hover:border-slate-400"
              }`}
            >
              {opt.label}
              {sortKey === opt.key && (
                <span className="ml-1">{sortDir === "desc" ? "↓" : "↑"}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-slate-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-800 text-slate-400 text-xs uppercase">
            <tr>
              <th className="px-4 py-3 text-left w-10">#</th>
              <th className="px-4 py-3 text-left">Game</th>
              <th className="px-4 py-3 text-right">Hours</th>
              <th className="px-4 py-3 text-right">Last played</th>
              <th className="px-4 py-3 text-right">Achievements</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {sorted.map((game, i) => {
              const ach = achievements[game.appid];
              return (
                <tr key={game.appid} className="hover:bg-slate-800/50 transition-colors">
                  <td className="px-4 py-3 text-slate-500">{i + 1}</td>
                  <td className="px-4 py-3">
                    <a
                      href={`https://store.steampowered.com/app/${game.appid}/`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 hover:text-blue-400 transition-colors"
                    >
                      {game.img_icon_url && (
                        <img
                          src={`https://media.steampowered.com/steamcommunity/public/images/apps/${game.appid}/${game.img_icon_url}.jpg`}
                          alt=""
                          className="w-8 h-8 rounded"
                        />
                      )}
                      <span>{game.name}</span>
                    </a>
                  </td>
                  <td className="px-4 py-3 text-right text-slate-300">
                    {game.playtime_forever === 0
                      ? <span className="text-slate-600">—</span>
                      : (game.playtime_forever / 60).toFixed(1)}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-400 text-xs">
                    {formatLastPlayed(game.rtime_last_played)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {ach ? (
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-slate-300 text-xs">
                          {ach.achieved} / {ach.total}
                        </span>
                        <div className="w-16 h-1 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${(ach.achieved / ach.total) * 100}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <span className="text-slate-600">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

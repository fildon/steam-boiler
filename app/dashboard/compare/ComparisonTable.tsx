"use client";

import { useState } from "react";
import type { SharedGame } from "@/lib/comparison";

export type { SharedGame };

type SortKey = "difference" | "my_hours" | "friend_hours";
type SortDir = "asc" | "desc";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "difference", label: "Difference" },
  { key: "my_hours", label: "Your hours" },
  { key: "friend_hours", label: "Their hours" },
];

function sortGames(games: SharedGame[], key: SortKey, dir: SortDir): SharedGame[] {
  const sorted = [...games].sort((a, b) => {
    switch (key) {
      case "difference": return Math.abs(b.differenceMinutes) - Math.abs(a.differenceMinutes);
      case "my_hours": return b.myMinutes - a.myMinutes;
      case "friend_hours": return b.friendMinutes - a.friendMinutes;
    }
  });
  return dir === "asc" ? sorted.reverse() : sorted;
}

function fmt(minutes: number): string {
  if (minutes === 0) return "—";
  return (minutes / 60).toFixed(1);
}

export function ComparisonTable({ games, friendName }: { games: SharedGame[]; friendName: string }) {
  const [sortKey, setSortKey] = useState<SortKey>("difference");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  const sorted = sortGames(games, sortKey, sortDir);

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Shared games</h2>
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
              <th className="px-4 py-3 text-right">Your hrs</th>
              <th className="px-4 py-3 text-right">{friendName}&apos;s hrs</th>
              <th className="px-4 py-3 text-right">Winner</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {sorted.map((game, i) => (
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
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={`https://media.steampowered.com/steamcommunity/public/images/apps/${game.appid}/${game.img_icon_url}.jpg`}
                        alt=""
                        className="w-8 h-8 rounded"
                      />
                    )}
                    <span>{game.name}</span>
                  </a>
                </td>
                <td className="px-4 py-3 text-right text-slate-300">{fmt(game.myMinutes)}</td>
                <td className="px-4 py-3 text-right text-slate-300">{fmt(game.friendMinutes)}</td>
                <td className="px-4 py-3 text-right">
                  {game.winner === "me" && (
                    <span className="text-xs font-medium text-blue-400">You</span>
                  )}
                  {game.winner === "friend" && (
                    <span className="text-xs font-medium text-slate-300">{friendName}</span>
                  )}
                  {game.winner === "tie" && (
                    <span className="text-xs text-slate-600">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

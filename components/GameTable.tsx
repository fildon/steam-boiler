"use client";

import { useState } from "react";
import type { OwnedGame } from "@/lib/steam-api";

type SortKey = "playtime" | "last_played";
type SortDir = "asc" | "desc";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "playtime", label: "Hours played" },
  { key: "last_played", label: "Recently played" },
];

function sortGames(games: OwnedGame[], key: SortKey, dir: SortDir): OwnedGame[] {
  const sorted = [...games].sort((a, b) => {
    switch (key) {
      case "playtime":
        return b.playtime_forever - a.playtime_forever;
      case "last_played":
        return b.rtime_last_played - a.rtime_last_played;
    }
  });
  return dir === "asc" ? sorted.reverse() : sorted;
}

function formatLastPlayed(ts: number | undefined): string {
  if (!ts) return "Never";
  return new Date(ts * 1000).toLocaleDateString("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function GameTable({ games }: { games: OwnedGame[] }) {
  const [sortKey, setSortKey] = useState<SortKey>("playtime");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [query, setQuery] = useState("");
  const [hideUnplayed, setHideUnplayed] = useState(false);

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  const hasLastPlayed = games.some((g) => g.rtime_last_played > 0);

  const sorted = sortGames(games, sortKey, sortDir);
  const filtered = sorted.filter((g) => {
    if (hideUnplayed && g.playtime_forever === 0) return false;
    if (query && !g.name.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">Library</h2>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 mr-1">Sort by</span>
          {SORT_OPTIONS.filter((opt) => opt.key !== "last_played" || hasLastPlayed).map((opt) => (
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

      <div className="flex items-center gap-3 mb-4">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter by name…"
          className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-slate-500"
        />
        <button
          onClick={() => setHideUnplayed((h) => !h)}
          className={`text-xs px-3 py-1.5 rounded-full border transition-colors whitespace-nowrap ${
            hideUnplayed
              ? "bg-blue-600 border-blue-600 text-white"
              : "border-slate-600 text-slate-400 hover:text-white hover:border-slate-400"
          }`}
        >
          Hide unplayed
        </button>
      </div>

      <div className="rounded-lg border border-slate-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-800 text-slate-400 text-xs uppercase">
            <tr>
              <th className="px-4 py-3 text-left w-10">#</th>
              <th className="px-4 py-3 text-left">Game</th>
              <th className="px-4 py-3 text-right">Hours</th>
              {hasLastPlayed && <th className="px-4 py-3 text-right">Last played</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                  No games match your filter.
                </td>
              </tr>
            ) : (
              filtered.map((game, i) => (
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
                  <td className="px-4 py-3 text-right text-slate-300">
                    {game.playtime_forever === 0
                      ? <span className="text-slate-600">—</span>
                      : (game.playtime_forever / 60).toFixed(1)}
                  </td>
                  {hasLastPlayed && (
                    <td className="px-4 py-3 text-right text-slate-400 text-xs">
                      {formatLastPlayed(game.rtime_last_played)}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import type { OwnedGame } from "@/lib/steam-api";

function pickRandom(games: OwnedGame[]): OwnedGame {
  return games[Math.floor(Math.random() * games.length)];
}

export function RandomGameBanner({ games }: { games: OwnedGame[] }) {
  const [game, setGame] = useState<OwnedGame | null>(null);

  // Only pick a random game client-side to avoid SSR/hydration mismatch
  useEffect(() => {
    setGame(pickRandom(games));
  }, [games]);

  const shuffle = useCallback(() => {
    setGame((current) => {
      let next = pickRandom(games);
      while (next.appid === current?.appid && games.length > 1) {
        next = pickRandom(games);
      }
      return next;
    });
  }, [games]);

  if (!game) return null;

  const hours = (game.playtime_forever / 60).toFixed(1);

  const storeUrl = `https://store.steampowered.com/app/${game.appid}/`;

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg px-5 py-4 flex items-center gap-4">
      <a href={storeUrl} target="_blank" rel="noopener noreferrer" className="shrink-0">
        <img
          src={`https://cdn.cloudflare.steamstatic.com/steam/apps/${game.appid}/capsule_184x69.jpg`}
          alt=""
          className="w-24 h-9 rounded object-cover hover:opacity-80 transition-opacity"
        />
      </a>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-400 uppercase tracking-wide mb-0.5">Play something random</p>
        <a
          href={storeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-white truncate hover:text-blue-400 transition-colors block"
        >
          {game.name}
        </a>
        <p className="text-sm text-slate-400">
          {game.playtime_forever === 0 ? "Never played" : `${hours} hrs played`}
        </p>
      </div>
      <button
        onClick={shuffle}
        className="shrink-0 text-sm font-medium text-slate-300 hover:text-white bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg transition-colors"
      >
        Shuffle
      </button>
    </div>
  );
}

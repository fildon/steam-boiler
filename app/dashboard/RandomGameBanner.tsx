"use client";

import { useState, useCallback, useRef } from "react";
import type { OwnedGame } from "@/lib/steam-api";

function pickRandom(games: OwnedGame[]): OwnedGame {
  return games[Math.floor(Math.random() * games.length)];
}

function capsuleUrl(appid: number) {
  return `https://cdn.cloudflare.steamstatic.com/steam/apps/${appid}/capsule_184x69.jpg`;
}

export default function RandomGameBanner({ games, label = "Play something random", tooltip }: { games: OwnedGame[]; label?: string; tooltip?: string }) {
  const [game, setGame] = useState<OwnedGame>(() => pickRandom(games));
  // Ref to cancel any in-flight image preload if shuffle is clicked again
  const pendingRef = useRef<HTMLImageElement | null>(null);

  const shuffle = useCallback(() => {
    let next = pickRandom(games);
    while (next.appid === game.appid && games.length > 1) {
      next = pickRandom(games);
    }

    // Cancel the previous preload so only the latest shuffle wins
    if (pendingRef.current) {
      pendingRef.current.onload = null;
      pendingRef.current.onerror = null;
    }

    const img = new Image();
    const settle = () => { pendingRef.current = null; setGame(next); };
    img.onload = settle;
    img.onerror = settle; // switch even if the image 404s
    img.src = capsuleUrl(next.appid);
    pendingRef.current = img;
  }, [games, game]);

  const hours = (game.playtime_forever / 60).toFixed(1);
  const storeUrl = `https://store.steampowered.com/app/${game.appid}/`;

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg px-5 py-4 flex items-center gap-4">
      <a href={storeUrl} target="_blank" rel="noopener noreferrer" className="shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={capsuleUrl(game.appid)}
          alt=""
          width={184}
          height={69}
          className="w-24 h-9 rounded object-cover hover:opacity-80 transition-opacity"
        />
      </a>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1 mb-0.5">
          <p className="text-xs text-slate-400 uppercase tracking-wide">{label}</p>
          {tooltip && (
            <span className="relative group">
              <span className="text-xs text-slate-500 border border-slate-600 rounded-full w-4 h-4 flex items-center justify-center cursor-default select-none leading-none">?</span>
              <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-5 w-56 rounded bg-slate-700 px-2 py-1.5 text-xs text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity z-10 normal-case tracking-normal">
                {tooltip}
              </span>
            </span>
          )}
        </div>
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

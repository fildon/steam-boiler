"use client";

import { useEffect, useState } from "react";

interface SessionState {
  isLoggedIn: boolean;
  steamId: string | null;
}

export function CompareSection({ steamid, personaname }: { steamid: string; personaname: string }) {
  const [session, setSession] = useState<SessionState | null>(null);

  useEffect(() => {
    fetch("/api/session")
      .then((r) => r.json())
      .then(setSession)
      .catch(() => setSession({ isLoggedIn: false, steamId: null }));
  }, []);

  if (!session) return null;

  if (session.isLoggedIn && session.steamId && session.steamId !== steamid) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-lg px-5 py-4 flex items-center justify-between gap-4">
        <p className="text-sm text-slate-300">Compare your library with {personaname}</p>
        <a
          href={`/compare/${session.steamId}/${steamid}`}
          className="shrink-0 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Compare →
        </a>
      </div>
    );
  }

  if (!session.isLoggedIn) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-lg px-5 py-4 flex items-center justify-between gap-4">
        <p className="text-sm text-slate-300">Sign in to compare your library with {personaname}</p>
        <a
          href="/api/auth/login"
          className="shrink-0 text-sm font-medium bg-slate-600 hover:bg-slate-500 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Sign in
        </a>
      </div>
    );
  }

  return null;
}

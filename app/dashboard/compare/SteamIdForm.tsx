"use client";

import { useState } from "react";

export function SteamIdForm({ currentSteamId }: { currentSteamId?: string }) {
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    const data = new FormData(e.currentTarget);
    const id = (data.get("steamid") as string).trim();
    if (!/^\d{17}$/.test(id)) {
      e.preventDefault();
      setError("Enter a 17-digit Steam ID (e.g. 76561197999972766).");
    } else {
      setError("");
    }
  }

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg px-5 py-4">
      <p className="text-sm font-medium text-white mb-3">Compare with a friend</p>
      <form method="GET" action="/dashboard/compare" onSubmit={handleSubmit} className="flex gap-3">
        <input
          type="text"
          name="steamid"
          defaultValue={currentSteamId ?? ""}
          placeholder="17-digit Steam ID"
          className="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-3 py-1.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-slate-400"
        />
        <button
          type="submit"
          className="text-sm font-medium px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
        >
          Compare
        </button>
      </form>
      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
      <p className="mt-2 text-xs text-slate-500">
        Find your Steam ID at{" "}
        <a href="https://steamid.io" target="_blank" rel="noopener noreferrer" className="underline hover:text-slate-400">
          steamid.io
        </a>
      </p>
    </div>
  );
}

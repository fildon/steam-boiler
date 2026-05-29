"use client";

import { useState } from "react";

export function CompareNav({ defaultId1, defaultId2 }: { defaultId1: string; defaultId2: string }) {
  const [id1, setId1] = useState(defaultId1);
  const [id2, setId2] = useState(defaultId2);
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const t1 = id1.trim();
    const t2 = id2.trim();
    if (!/^\d{17}$/.test(t1) || !/^\d{17}$/.test(t2)) {
      setError("Both Steam IDs must be 17 digits.");
      return;
    }
    setError("");
    window.location.href = `/compare/${t1}/${t2}`;
  }

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg px-5 py-4">
      <p className="text-sm font-medium text-white mb-3">Compare other players</p>
      <form onSubmit={handleSubmit} className="flex gap-3 flex-wrap">
        <input
          type="text"
          value={id1}
          onChange={(e) => setId1(e.target.value)}
          placeholder="Steam ID 1"
          className="flex-1 min-w-32 bg-slate-900 border border-slate-600 rounded-lg px-3 py-1.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-slate-400"
        />
        <input
          type="text"
          value={id2}
          onChange={(e) => setId2(e.target.value)}
          placeholder="Steam ID 2"
          className="flex-1 min-w-32 bg-slate-900 border border-slate-600 rounded-lg px-3 py-1.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-slate-400"
        />
        <button
          type="submit"
          className="text-sm font-medium px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
        >
          Compare
        </button>
      </form>
      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
    </div>
  );
}

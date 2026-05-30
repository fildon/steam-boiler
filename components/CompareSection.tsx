interface CompareSectionProps {
  steamid: string;
  personaname: string;
  isLoggedIn: boolean;
  sessionSteamId: string | null;
}

export function CompareSection({ steamid, personaname, isLoggedIn, sessionSteamId }: CompareSectionProps) {
  if (isLoggedIn && sessionSteamId && sessionSteamId !== steamid) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-lg px-5 py-4 flex items-center justify-between gap-4">
        <p className="text-sm text-slate-300">Compare your library with {personaname}</p>
        <a
          href={`/compare/${sessionSteamId}/${steamid}`}
          className="shrink-0 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Compare →
        </a>
      </div>
    );
  }

  if (!isLoggedIn) {
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

export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getPlayerSummary, getOwnedGames } from "@/lib/steam-api";
import { RandomGameBannerWrapper } from "./RandomGameBannerWrapper";
import { GameTable } from "./GameTable";

export default async function Dashboard() {
  const session = await getSession();
  if (!session.isLoggedIn || !session.steamId) redirect("/");

  const [profile, games] = await Promise.all([
    getPlayerSummary(session.steamId),
    getOwnedGames(session.steamId),
  ]);

  if (!profile) redirect("/");

  const totalHours = Math.round(games.reduce((sum, g) => sum + g.playtime_forever, 0) / 60);
  const unplayedGames = games.filter((g) => g.playtime_forever === 0);
  const neverPlayed = unplayedGames.length;

  // eslint-disable-next-line react-hooks/purity
  const twoYearsAgo = Date.now() / 1000 - 2 * 365.25 * 24 * 3600;
  const forgottenGames = games.filter(
    (g) => g.playtime_forever >= 480 && g.rtime_last_played > 0 && g.rtime_last_played < twoYearsAgo,
  );

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <header className="border-b border-slate-700 px-6 py-4 flex items-center justify-between">
        <span className="font-bold text-lg text-white">Steam Boiler</span>
        <a href="/api/auth/logout" className="text-sm text-slate-400 hover:text-white transition-colors">
          Sign out
        </a>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10 flex flex-col gap-10">
        {/* Profile card */}
        <div className="flex items-center gap-5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={profile.avatarfull} alt="avatar" className="w-20 h-20 rounded-full" />
          <div>
            <h1 className="text-2xl font-bold">{profile.personaname}</h1>
            <p className="text-slate-400 text-sm mt-1">
              {games.length} games &middot; {totalHours.toLocaleString()} hours total
            </p>
          </div>
        </div>

        {/* Quick links */}
        <div className="flex justify-end gap-6 -mt-6">
          <a href={`/player/${session.steamId}`} className="text-sm text-slate-400 hover:text-slate-300 transition-colors">
            Share your stats →
          </a>
          <a href="/dashboard/friends" className="text-sm text-slate-400 hover:text-slate-300 transition-colors">
            Friends leaderboard →
          </a>
          <a href="/dashboard/compare" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
            Compare with a friend →
          </a>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-4">
          <Stat label="Games owned" value={games.length.toLocaleString()} />
          <Stat label="Hours played" value={totalHours.toLocaleString()} />
          <Stat label="Never played" value={neverPlayed.toLocaleString()} />
        </div>

        {/* Random unplayed game picker */}
        {unplayedGames.length > 0 && <RandomGameBannerWrapper games={unplayedGames} label="A random game you haven't played" />}

        {/* Forgotten games */}
        {forgottenGames.length > 0 && (
          <RandomGameBannerWrapper games={forgottenGames} label="A game you loved in the past" />
        )}

        <GameTable games={games} />
      </main>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-slate-800 rounded-lg px-5 py-4">
      <p className="text-slate-400 text-xs uppercase tracking-wide mb-1">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}

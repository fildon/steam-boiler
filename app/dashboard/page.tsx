import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { getPlayerSummary, getSteamLevel, getOwnedGames } from "@/lib/steam-api";
import { RandomGameBanner } from "./RandomGameBanner";
import { GameTable } from "./GameTable";

export default async function Dashboard() {
  const session = await getSession();
  if (!session.isLoggedIn || !session.steamId) redirect("/");

  const [profile, level, games] = await Promise.all([
    getPlayerSummary(session.steamId),
    getSteamLevel(session.steamId),
    getOwnedGames(session.steamId),
  ]);

  if (!profile) redirect("/");

  const totalHours = Math.round(games.reduce((sum, g) => sum + g.playtime_forever, 0) / 60);
  const neverPlayed = games.filter((g) => g.playtime_forever === 0).length;

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <header className="border-b border-slate-700 px-6 py-4 flex items-center justify-between">
        <span className="font-bold text-lg text-white">Steam Boiler</span>
        <Link href="/api/auth/logout" className="text-sm text-slate-400 hover:text-white transition-colors">
          Sign out
        </Link>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10 flex flex-col gap-10">
        {/* Profile card */}
        <div className="flex items-center gap-5">
          <img src={profile.avatarfull} alt="avatar" className="w-20 h-20 rounded-full" />
          <div>
            <h1 className="text-2xl font-bold">{profile.personaname}</h1>
            <p className="text-slate-400 text-sm mt-1">
              Level {level} &middot; {games.length} games &middot; {totalHours.toLocaleString()} hours total
            </p>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-4">
          <Stat label="Games owned" value={games.length.toLocaleString()} />
          <Stat label="Hours played" value={totalHours.toLocaleString()} />
          <Stat label="Never played" value={neverPlayed.toLocaleString()} />
        </div>

        {/* Random game picker */}
        {games.length > 0 && <RandomGameBanner games={games} />}

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

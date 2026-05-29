import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { getPlayerSummary, getSteamLevel, getOwnedGames, getPlayerAchievements, type AchievementStats } from "@/lib/steam-api";
import { RandomGameBannerWrapper } from "./RandomGameBannerWrapper";
import { GameTable } from "./GameTable";

const ACHIEVEMENT_CONCURRENCY = 20;
// Cap the number of games we fetch achievements for to avoid function timeouts.
// Games beyond this cap show "—" in the achievements column.
const ACHIEVEMENT_GAME_LIMIT = 100;

async function fetchAllAchievements(
  steamId: string,
  appIds: number[]
): Promise<Record<number, AchievementStats>> {
  const limited = appIds.slice(0, ACHIEVEMENT_GAME_LIMIT);
  const result: Record<number, AchievementStats> = {};
  for (let i = 0; i < limited.length; i += ACHIEVEMENT_CONCURRENCY) {
    const batch = limited.slice(i, i + ACHIEVEMENT_CONCURRENCY);
    const stats = await Promise.all(batch.map((id) => getPlayerAchievements(steamId, id)));
    batch.forEach((id, idx) => {
      if (stats[idx]) result[id] = stats[idx]!;
    });
  }
  return result;
}

export default async function Dashboard() {
  const session = await getSession();
  if (!session.isLoggedIn || !session.steamId) redirect("/");

  const [profile, level, games] = await Promise.all([
    getPlayerSummary(session.steamId),
    getSteamLevel(session.steamId),
    getOwnedGames(session.steamId),
  ]);

  if (!profile) redirect("/");

  const playedAppIds = games.filter((g) => g.playtime_forever > 0).map((g) => g.appid);
  const achievements = await fetchAllAchievements(session.steamId, playedAppIds);

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
          {/* eslint-disable-next-line @next/next/no-img-element */}
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
        {games.length > 0 && <RandomGameBannerWrapper games={games} />}

        <GameTable games={games} achievements={achievements} />
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

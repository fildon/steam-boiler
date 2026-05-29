import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { getPlayerSummary, getSteamLevel, getOwnedGames } from "@/lib/steam-api";
import { RandomGameBanner } from "./RandomGameBanner";

export default async function Dashboard() {
  const session = await getSession();
  if (!session.isLoggedIn || !session.steamId) redirect("/");

  const [profile, level, games] = await Promise.all([
    getPlayerSummary(session.steamId),
    getSteamLevel(session.steamId),
    getOwnedGames(session.steamId),
  ]);

  if (!profile) redirect("/");

  const sortedGames = [...games].sort((a, b) => b.playtime_forever - a.playtime_forever);
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

        {/* Games table */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Library by playtime</h2>
          <div className="rounded-lg border border-slate-700 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-800 text-slate-400 text-xs uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">#</th>
                  <th className="px-4 py-3 text-left">Game</th>
                  <th className="px-4 py-3 text-right">Hours</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {sortedGames.map((game, i) => (
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
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

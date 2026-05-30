export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import Link from "next/link";
import { getPlayerSummary, getOwnedGames } from "@/lib/steam-api";
import { getSession } from "@/lib/session";
import { GameTable } from "@/components/GameTable";
import { Stat } from "@/components/Stat";
import { CompareSection } from "@/components/CompareSection";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ steamid: string }>;
}) {
  const { steamid } = await params;
  const profile = await getPlayerSummary(steamid);
  if (!profile) return {};
  return {
    title: `${profile.personaname} | Steam Boiler`,
    description: `View ${profile.personaname}'s Steam library stats.`,
  };
}

export default async function PlayerPage({
  params,
}: {
  params: Promise<{ steamid: string }>;
}) {
  const { steamid } = await params;

  if (!/^\d{17}$/.test(steamid)) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <p className="text-slate-400">Invalid Steam ID.</p>
      </div>
    );
  }

  const [profile, games, session] = await Promise.all([
    getPlayerSummary(steamid),
    getOwnedGames(steamid),
    getSession(),
  ]);

  if (!profile) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <p className="text-slate-400">Steam profile not found.</p>
      </div>
    );
  }

  const totalHours = Math.round(games.reduce((s, g) => s + g.playtime_forever, 0) / 60);
  const neverPlayed = games.filter((g) => g.playtime_forever === 0).length;
  const privateLibrary = games.length === 0;

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <header className="border-b border-slate-700 px-6 py-4">
        <Link href="/" className="font-bold text-lg text-white hover:text-slate-300 transition-colors">
          Steam Boiler
        </Link>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10 flex flex-col gap-10">
        <div className="flex items-center gap-5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={profile.avatarfull} alt="avatar" className="w-20 h-20 rounded-full" />
          <div>
            <h1 className="text-2xl font-bold">{profile.personaname}</h1>
            {!privateLibrary && (
              <p className="text-slate-400 text-sm mt-1">
                {games.length} games &middot; {totalHours.toLocaleString()} hours total
              </p>
            )}
          </div>
        </div>

        <CompareSection
          steamid={steamid}
          personaname={profile.personaname}
          isLoggedIn={session.isLoggedIn ?? false}
          sessionSteamId={session.steamId ?? null}
        />

        {privateLibrary ? (
          <p className="text-slate-400">This player&apos;s game library is private.</p>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-4">
              <Stat label="Games owned" value={games.length.toLocaleString()} />
              <Stat label="Hours played" value={totalHours.toLocaleString()} />
              <Stat label="Never played" value={neverPlayed.toLocaleString()} />
            </div>

            <GameTable games={games} />
          </>
        )}
      </main>
    </div>
  );
}

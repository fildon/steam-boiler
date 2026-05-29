import Link from "next/link";
import { getPlayerSummary, getOwnedGames, type PlayerSummary } from "@/lib/steam-api";
import { computeComparison } from "@/lib/comparison";
import { ComparisonTable } from "@/app/dashboard/compare/ComparisonTable";
import { CompareNav } from "@/app/compare/CompareNav";

function ProfileCard({ profile, totalHours, gameCount, label }: {
  profile: PlayerSummary; totalHours: number; gameCount: number; label: string;
}) {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg px-5 py-4 flex items-center gap-4">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={profile.avatarfull} alt="" className="w-14 h-14 rounded-full shrink-0" />
      <div className="min-w-0">
        <p className="text-xs text-slate-400 uppercase tracking-wide mb-0.5">{label}</p>
        <a href={`/player/${profile.steamid}`} className="font-semibold text-white hover:text-blue-400 transition-colors truncate block">
          {profile.personaname}
        </a>
        <p className="text-sm text-slate-400">{gameCount} games · {totalHours.toLocaleString()} hrs</p>
      </div>
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

export default async function PublicComparePage({
  params,
}: {
  params: Promise<{ steamid1: string; steamid2: string }>;
}) {
  const { steamid1, steamid2 } = await params;

  const validId = (id: string) => /^\d{17}$/.test(id);
  if (!validId(steamid1) || !validId(steamid2)) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <p className="text-slate-400">Invalid Steam ID in URL.</p>
      </div>
    );
  }

  const [profile1, games1, profile2, games2] = await Promise.all([
    getPlayerSummary(steamid1),
    getOwnedGames(steamid1),
    getPlayerSummary(steamid2),
    getOwnedGames(steamid2),
  ]);

  if (!profile1 || !profile2) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <p className="text-slate-400">One or both Steam profiles could not be found.</p>
      </div>
    );
  }

  const private1 = games1.length === 0;
  const private2 = games2.length === 0;
  const comparison = (!private1 && !private2) ? computeComparison(games1, games2) : null;
  const hours1 = Math.round(games1.reduce((s, g) => s + g.playtime_forever, 0) / 60);
  const hours2 = Math.round(games2.reduce((s, g) => s + g.playtime_forever, 0) / 60);

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <header className="border-b border-slate-700 px-6 py-4">
        <Link href="/" className="font-bold text-lg text-white hover:text-slate-300 transition-colors">
          Steam Boiler
        </Link>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10 flex flex-col gap-10">
        <div className="grid grid-cols-2 gap-4">
          <ProfileCard profile={profile1} totalHours={hours1} gameCount={games1.length} label="Player 1" />
          <ProfileCard profile={profile2} totalHours={hours2} gameCount={games2.length} label="Player 2" />
        </div>

        {(private1 || private2) && (
          <p className="text-slate-400">
            {private1 && private2
              ? "Both players' game libraries are private."
              : `${(private1 ? profile1 : profile2).personaname}'s game library is private.`}
          </p>
        )}

        {comparison && (
          <>
            <div className="grid grid-cols-3 gap-4">
              <Stat label="Games in common" value={comparison.shared.length.toLocaleString()} />
              <Stat label={`Only ${profile1.personaname} owns`} value={comparison.myExclusiveCount.toLocaleString()} />
              <Stat label={`Only ${profile2.personaname} owns`} value={comparison.friendExclusiveCount.toLocaleString()} />
            </div>

            {comparison.shared.length === 0 ? (
              <p className="text-slate-400">These players share no games in common.</p>
            ) : (
              <ComparisonTable games={comparison.shared} friendName={profile2.personaname} />
            )}
          </>
        )}

        <CompareNav defaultId1={steamid1} defaultId2={steamid2} />
      </main>
    </div>
  );
}

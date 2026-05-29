export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getPlayerSummary, getOwnedGames, type OwnedGame, type PlayerSummary } from "@/lib/steam-api";
import { SteamIdForm } from "./SteamIdForm";
import { ComparisonTable, type SharedGame } from "./ComparisonTable";

interface ComparisonResult {
  shared: SharedGame[];
  myExclusiveCount: number;
  friendExclusiveCount: number;
  myTotalHours: number;
  friendTotalHours: number;
}

function computeComparison(myGames: OwnedGame[], friendGames: OwnedGame[]): ComparisonResult {
  const friendMap = new Map(friendGames.map((g) => [g.appid, g]));
  const myMap = new Map(myGames.map((g) => [g.appid, g]));

  const shared: SharedGame[] = [];
  let myExclusiveCount = 0;

  for (const game of myGames) {
    const friendGame = friendMap.get(game.appid);
    if (friendGame) {
      const diff = game.playtime_forever - friendGame.playtime_forever;
      shared.push({
        appid: game.appid,
        name: game.name,
        img_icon_url: game.img_icon_url,
        myMinutes: game.playtime_forever,
        friendMinutes: friendGame.playtime_forever,
        differenceMinutes: diff,
        winner: diff > 0 ? "me" : diff < 0 ? "friend" : "tie",
      });
    } else {
      myExclusiveCount++;
    }
  }

  const friendExclusiveCount = friendGames.filter((g) => !myMap.has(g.appid)).length;
  const myTotalHours = Math.round(myGames.reduce((s, g) => s + g.playtime_forever, 0) / 60);
  const friendTotalHours = Math.round(friendGames.reduce((s, g) => s + g.playtime_forever, 0) / 60);

  return { shared, myExclusiveCount, friendExclusiveCount, myTotalHours, friendTotalHours };
}

function ProfileCard({ profile, totalHours, gameCount, label }: {
  profile: PlayerSummary; totalHours: number; gameCount: number; label: string;
}) {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg px-5 py-4 flex items-center gap-4">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={profile.avatarfull} alt="" className="w-14 h-14 rounded-full shrink-0" />
      <div className="min-w-0">
        <p className="text-xs text-slate-400 uppercase tracking-wide mb-0.5">{label}</p>
        <p className="font-semibold text-white truncate">{profile.personaname}</p>
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

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ steamid?: string }>;
}) {
  const session = await getSession();
  if (!session.isLoggedIn || !session.steamId) redirect("/");

  const { steamid: friendId } = await searchParams;
  const validId = friendId && /^\d{17}$/.test(friendId) ? friendId : null;

  let myProfile: PlayerSummary | null = null;
  let myGames: OwnedGame[] = [];
  let friendProfile: PlayerSummary | null = null;
  let friendGames: OwnedGame[] = [];
  let profileNotFound = false;

  if (validId) {
    [myProfile, myGames, friendProfile, friendGames] = await Promise.all([
      getPlayerSummary(session.steamId),
      getOwnedGames(session.steamId),
      getPlayerSummary(validId),
      getOwnedGames(validId),
    ]);
    if (!myProfile) redirect("/");
    profileNotFound = friendProfile === null;
  }

  const comparison = validId && myProfile && friendProfile
    ? computeComparison(myGames, friendGames)
    : null;

  const friendName = friendProfile?.personaname ?? "Friend";
  const friendPrivate = validId && friendProfile !== null && friendGames.length === 0;

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <header className="border-b border-slate-700 px-6 py-4 flex items-center justify-between">
        <a href="/dashboard" className="font-bold text-lg text-white hover:text-slate-300 transition-colors">
          Steam Boiler
        </a>
        <a href="/api/auth/logout" className="text-sm text-slate-400 hover:text-white transition-colors">
          Sign out
        </a>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10 flex flex-col gap-10">
        <SteamIdForm currentSteamId={validId ?? undefined} />

        {validId && profileNotFound && (
          <p className="text-slate-400">No Steam profile found for that ID. Double-check the number and try again.</p>
        )}

        {validId && friendPrivate && friendProfile && myProfile && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <ProfileCard profile={myProfile} totalHours={Math.round(myGames.reduce((s, g) => s + g.playtime_forever, 0) / 60)} gameCount={myGames.length} label="You" />
              <ProfileCard profile={friendProfile} totalHours={0} gameCount={0} label="Friend" />
            </div>
            <p className="text-slate-400">
              {friendName}&apos;s game library is private. Ask them to set their game details to public in their Steam privacy settings.
            </p>
          </>
        )}

        {comparison && myProfile && friendProfile && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <ProfileCard profile={myProfile} totalHours={comparison.myTotalHours} gameCount={myGames.length} label="You" />
              <ProfileCard profile={friendProfile} totalHours={comparison.friendTotalHours} gameCount={friendGames.length} label="Friend" />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <Stat label="Games in common" value={comparison.shared.length.toLocaleString()} />
              <Stat label="Only you own" value={comparison.myExclusiveCount.toLocaleString()} />
              <Stat label="Only they own" value={comparison.friendExclusiveCount.toLocaleString()} />
            </div>

            {comparison.shared.length === 0 ? (
              <p className="text-slate-400">You share no games in common.</p>
            ) : (
              <ComparisonTable games={comparison.shared} friendName={friendName} />
            )}
          </>
        )}
      </main>
    </div>
  );
}

export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getPlayerSummary, getPlayerSummaries, getFriendList, getOwnedGames, type PlayerSummary } from "@/lib/steam-api";

const FRIEND_CAP = 100;
const BATCH_SIZE = 20;

async function fetchTotalMinutesBatched(steamIds: string[]): Promise<Map<string, number>> {
  const result = new Map<string, number>();
  for (let i = 0; i < steamIds.length; i += BATCH_SIZE) {
    const batch = steamIds.slice(i, i + BATCH_SIZE);
    const games = await Promise.all(batch.map((id) => getOwnedGames(id)));
    batch.forEach((id, idx) => {
      result.set(id, games[idx].reduce((sum, g) => sum + g.playtime_forever, 0));
    });
  }
  return result;
}

interface RankedPlayer {
  steamId: string;
  profile: PlayerSummary;
  totalHours: number | null; // null = private library
  isMe: boolean;
}

export default async function FriendsPage() {
  const session = await getSession();
  if (!session.isLoggedIn || !session.steamId) redirect("/");
  const myId = session.steamId;

  const [myProfile, friendIds] = await Promise.all([
    getPlayerSummary(myId),
    getFriendList(myId),
  ]);
  if (!myProfile) redirect("/");

  const privateFriendList = friendIds.length === 0;
  const capped = friendIds.length > FRIEND_CAP;
  const cappedIds = friendIds.slice(0, FRIEND_CAP);

  let players: RankedPlayer[] = [];

  if (!privateFriendList) {
    const [myMinutes, friendProfiles, minutesMap] = await Promise.all([
      getOwnedGames(myId).then((g) => g.reduce((s, x) => s + x.playtime_forever, 0)),
      getPlayerSummaries(cappedIds),
      fetchTotalMinutesBatched(cappedIds),
    ]);

    const profileMap = new Map(friendProfiles.map((p) => [p.steamid, p]));

    const friendPlayers: RankedPlayer[] = cappedIds.flatMap((id) => {
      const profile = profileMap.get(id);
      if (!profile) return [];
      const minutes = minutesMap.get(id) ?? 0;
      return [{ steamId: id, profile, totalHours: minutes === 0 ? null : Math.round(minutes / 60), isMe: false } satisfies RankedPlayer];
    });

    players = [
      { steamId: myId, profile: myProfile, totalHours: Math.round(myMinutes / 60), isMe: true },
      ...friendPlayers,
    ];

    players.sort((a, b) => {
      if (a.totalHours === null && b.totalHours === null) return 0;
      if (a.totalHours === null) return 1;
      if (b.totalHours === null) return -1;
      return b.totalHours - a.totalHours;
    });
  }

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

      <main className="max-w-4xl mx-auto px-6 py-10 flex flex-col gap-8">
        <div>
          <h1 className="text-2xl font-bold">Friends leaderboard</h1>
          <p className="text-slate-400 text-sm mt-1">Ranked by total hours played</p>
        </div>

        {privateFriendList ? (
          <p className="text-slate-400">
            Your friend list is private. Set it to public in{" "}
            <a href="https://steamcommunity.com/my/edit/settings" target="_blank" rel="noopener noreferrer" className="underline hover:text-slate-300">
              Steam privacy settings
            </a>{" "}
            to use this feature.
          </p>
        ) : (
          <>
            <div className="rounded-lg border border-slate-700 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-800 text-slate-400 text-xs uppercase">
                  <tr>
                    <th className="px-4 py-3 text-left w-10">#</th>
                    <th className="px-4 py-3 text-left">Player</th>
                    <th className="px-4 py-3 text-right">Total hours</th>
                    <th className="px-4 py-3 w-24"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {players.map((player, i) => (
                    <tr
                      key={player.steamId}
                      className={player.isMe
                        ? "bg-blue-950 border-l-2 border-blue-500"
                        : "hover:bg-slate-800/50 transition-colors"}
                    >
                      <td className="px-4 py-3 text-slate-500 font-medium">{i + 1}</td>
                      <td className="px-4 py-3">
                        <a
                          href={`/player/${player.steamId}`}
                          className="flex items-center gap-3 hover:text-blue-400 transition-colors"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={player.profile.avatarfull} alt="" className="w-8 h-8 rounded-full shrink-0" />
                          <span className={player.isMe ? "font-semibold text-blue-300" : ""}>
                            {player.profile.personaname}
                            {player.isMe && <span className="ml-2 text-xs text-blue-400">(you)</span>}
                          </span>
                        </a>
                      </td>
                      <td className="px-4 py-3 text-right text-slate-300">
                        {player.totalHours === null
                          ? <span className="text-slate-600">Private</span>
                          : player.totalHours.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {!player.isMe && (
                          <a
                            href={`/compare/${myId}/${player.steamId}`}
                            className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                          >
                            Compare →
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {capped && (
              <p className="text-xs text-slate-500">
                Showing {FRIEND_CAP} of {friendIds.length} friends. Only the first {FRIEND_CAP} are ranked.
              </p>
            )}
          </>
        )}
      </main>
    </div>
  );
}

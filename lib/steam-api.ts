const BASE = "https://api.steampowered.com";

export interface PlayerSummary {
  steamid: string;
  personaname: string;
  avatarfull: string;
  profileurl: string;
  personastate: number;
}

export interface OwnedGame {
  appid: number;
  name: string;
  playtime_forever: number; // minutes
  playtime_2weeks?: number; // minutes, only present if played recently
  rtime_last_played: number; // unix timestamp, 0 if never played
  img_icon_url: string;
}

function key() {
  const k = process.env.STEAM_API_KEY;
  if (!k) throw new Error("STEAM_API_KEY is not set");
  return k;
}

export async function getPlayerSummary(steamId: string): Promise<PlayerSummary | null> {
  const res = await fetch(
    `${BASE}/ISteamUser/GetPlayerSummaries/v2/?key=${key()}&steamids=${steamId}`,
    { next: { revalidate: 60 } }
  );
  const data = await res.json();
  return data.response.players?.[0] ?? null;
}

export async function getPlayerSummaries(steamIds: string[]): Promise<PlayerSummary[]> {
  if (steamIds.length === 0) return [];
  const chunks: string[][] = [];
  for (let i = 0; i < steamIds.length; i += 100) chunks.push(steamIds.slice(i, i + 100));
  const results = await Promise.all(
    chunks.map((chunk) =>
      fetch(`${BASE}/ISteamUser/GetPlayerSummaries/v2/?key=${key()}&steamids=${chunk.join(",")}`, { next: { revalidate: 60 } })
        .then((r) => r.json())
        .then((d) => (d.response.players ?? []) as PlayerSummary[])
    )
  );
  return results.flat();
}

export async function getFriendList(steamId: string): Promise<string[]> {
  const res = await fetch(
    `${BASE}/ISteamUser/GetFriendList/v1/?key=${key()}&steamid=${steamId}&relationship=friend`,
    { next: { revalidate: 60 } }
  );
  if (!res.ok) return [];
  const data = await res.json();
  return (data.friendslist?.friends ?? []).map((f: { steamid: string }) => f.steamid);
}

export async function getOwnedGames(steamId: string): Promise<OwnedGame[]> {
  const res = await fetch(
    `${BASE}/IPlayerService/GetOwnedGames/v1/?key=${key()}&steamid=${steamId}&include_appinfo=true&include_played_free_games=true`,
    { next: { revalidate: 60 } }
  );
  const data = await res.json();
  return data.response.games ?? [];
}

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

export async function getSteamLevel(steamId: string): Promise<number> {
  const res = await fetch(
    `${BASE}/IPlayerService/GetSteamLevel/v1/?key=${key()}&steamid=${steamId}`,
    { next: { revalidate: 60 } }
  );
  const data = await res.json();
  return data.response.player_level ?? 0;
}

export async function getOwnedGames(steamId: string): Promise<OwnedGame[]> {
  const res = await fetch(
    `${BASE}/IPlayerService/GetOwnedGames/v1/?key=${key()}&steamid=${steamId}&include_appinfo=true&include_played_free_games=true`,
    { next: { revalidate: 60 } }
  );
  const data = await res.json();
  return data.response.games ?? [];
}

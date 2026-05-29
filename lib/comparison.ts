import type { OwnedGame } from "@/lib/steam-api";

export interface SharedGame {
  appid: number;
  name: string;
  img_icon_url: string;
  myMinutes: number;
  friendMinutes: number;
  differenceMinutes: number;
  winner: "me" | "friend" | "tie";
}

export interface ComparisonResult {
  shared: SharedGame[];
  myExclusiveCount: number;
  friendExclusiveCount: number;
  myTotalHours: number;
  friendTotalHours: number;
}

export function computeComparison(myGames: OwnedGame[], friendGames: OwnedGame[]): ComparisonResult {
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

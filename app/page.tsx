import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await getSession();
  if (session.isLoggedIn) redirect("/dashboard");

  return (
    <main className="min-h-screen bg-slate-900 flex flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-4xl font-bold text-white tracking-tight">Steam Boiler</h1>
      <p className="text-slate-400 text-lg text-center max-w-md">
        Analyse your Steam library — playtime, achievements, games, and more.
      </p>
      <a
        href="/api/auth/login"
        className="flex items-center gap-3 bg-[#1b2838] hover:bg-[#2a475e] border border-slate-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
      >
        <SteamIcon />
        Sign in with Steam
      </a>
    </main>
  );
}

function SteamIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.188.006l2.861-4.142V8.91c0-2.495 2.028-4.524 4.524-4.524 2.494 0 4.524 2.031 4.524 4.527s-2.03 4.525-4.524 4.525h-.105l-4.076 2.911c0 .051.004.101.004.153 0 1.872-1.515 3.387-3.386 3.387-1.641 0-3.016-1.173-3.331-2.727L.436 15.27C1.862 20.307 6.486 24 11.979 24c6.627 0 11.999-5.373 11.999-12S18.606 0 11.979 0zM7.54 18.21l-1.473-.61c.262.543.714.999 1.314 1.25 1.297.539 2.793-.076 3.332-1.375.263-.63.264-1.319.005-1.949s-.75-1.121-1.377-1.383c-.624-.26-1.29-.249-1.878-.03l1.522.63c.956.396 1.409 1.497 1.013 2.454-.396.957-1.497 1.41-2.458 1.013zm11.415-9.303c0-1.662-1.353-3.015-3.015-3.015-1.665 0-3.015 1.353-3.015 3.015 0 1.665 1.35 3.015 3.015 3.015 1.663 0 3.015-1.35 3.015-3.015zm-5.273-.005c0-1.252 1.013-2.266 2.265-2.266 1.249 0 2.266 1.014 2.266 2.266 0 1.251-1.017 2.265-2.266 2.265-1.253 0-2.265-1.014-2.265-2.265z" />
    </svg>
  );
}

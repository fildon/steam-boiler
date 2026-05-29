# Steam Boiler

A web app that analyses your Steam account — playtime, achievements, library stats, and more.

Built with Next.js 14 (App Router), TypeScript, Tailwind CSS, and the Steam Web API.

## Setup

1. **Get a Steam API key** at https://steamcommunity.com/dev/apikey
2. Copy `.env.example` to `.env.local` and fill in the values:

```
STEAM_API_KEY=        # from step 1
SESSION_SECRET=       # any random string, min 32 characters
NEXT_PUBLIC_BASE_URL= # e.g. http://localhost:3000
```

3. Install dependencies and run:

```bash
npm install
npm run dev
```

Open http://localhost:3000 and sign in with Steam.

## Deploying to Netlify

The app is deployed at `steam-boiler.rupertmckay.com` via Netlify.

1. Push to GitHub and connect the repo in the Netlify dashboard
2. Build settings are in `netlify.toml` — Netlify picks them up automatically
3. Set these environment variables in **Netlify → Site → Environment variables**:
   - `STEAM_API_KEY`
   - `SESSION_SECRET`
   - `NEXT_PUBLIC_BASE_URL` → `https://steam-boiler.rupertmckay.com`
4. Add a custom domain in **Netlify → Site → Domain management** → add `steam-boiler.rupertmckay.com`
5. In your DNS provider, add a `CNAME` record: `steam-boiler` → `<your-netlify-site>.netlify.app`

Netlify provisions HTTPS automatically once the DNS propagates.

> **Steam API key domain** — if your Steam API key was registered to `localhost`, you may need to re-register it at https://steamcommunity.com/dev/apikey with the production domain.

## Architecture

- **Auth** — Steam OpenID 2.0, verified server-side; session stored in an encrypted cookie via `iron-session`
- **Data** — All Steam API calls are made server-side (API key never exposed to the client)
- **Pages** — Server components; data is fetched at request time

---

## TODO

Features not yet implemented:

### Achievements
- [ ] Per-game achievement completion rates
- [ ] Rarest achievements unlocked
- [ ] Games with 0% vs 100% completion
- [ ] Overall completion percentage across library

### Playtime analysis
- [ ] Playtime over time (chart)
- [ ] Recently played games section
- [ ] Most played by genre / category

### Library analysis
- [ ] Genre breakdown (requires SteamSpy or store scraping)
- [ ] Estimated library value
- [ ] Unplayed games list with "% of library never touched"
- [ ] Tags/categories from Steam store

### Friends & social
- [ ] Friend list with levels and game counts
- [ ] Shared games between you and a friend
- [ ] Head-to-head playtime comparison

### UX / polish
- [ ] Loading skeletons while data fetches
- [ ] Error handling for private profiles
- [ ] Pagination / virtual scroll for large libraries
- [ ] Search/filter within library table
- [ ] Dark/light mode toggle
- [ ] Mobile layout improvements

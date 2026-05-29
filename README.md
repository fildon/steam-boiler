# Steam Boiler

A web app that analyses your Steam account — playtime, library stats, and more.

Built with Next.js 15 (App Router), TypeScript, Tailwind CSS, and the Steam Web API.

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

The app is deployed at `steam-boiler.rupertmckay.com` via Netlify. `netlify.toml` at the repo root contains the build configuration.

### 1. Connect the repo

Push to GitHub, then in the Netlify dashboard create a new site from that repo. Netlify will detect `netlify.toml` and configure the build automatically.

### 2. Set environment variables

In **Netlify → Site → Environment variables**, add:

| Variable | Value |
|---|---|
| `STEAM_API_KEY` | From https://steamcommunity.com/dev/apikey |
| `SESSION_SECRET` | Random 32+ char string — generate with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `NEXT_PUBLIC_BASE_URL` | `https://steam-boiler.rupertmckay.com` |

### 3. Add the custom domain

In **Netlify → Site → Domain management**, add `steam-boiler.rupertmckay.com`.

Netlify will show two DNS records to add — do both in **Squarespace → Domains → rupertmckay.com → DNS Settings**:

**CNAME** — routes traffic to Netlify:
| Field | Value |
|---|---|
| Type | `CNAME` |
| Host | `steam-boiler` |
| Data | `<your-netlify-site>.netlify.app` |

**TXT** — proves domain ownership so Netlify can provision the SSL certificate:
| Field | Value |
|---|---|
| Type | `TXT` |
| Host | as shown in Netlify (e.g. `_netlify`) |
| Data | the challenge value shown in Netlify |

Once both records are saved, click **Verify** in Netlify. DNS propagation usually takes a few minutes with Squarespace. Netlify provisions HTTPS via Let's Encrypt automatically after verification.

### 4. Update the Steam API key domain

Steam API keys are registered to a domain. Update yours at https://steamcommunity.com/dev/apikey — change the domain to `steam-boiler.rupertmckay.com`. The key itself stays the same.

## Architecture

- **Auth** — Steam OpenID 2.0, verified server-side; session stored in an encrypted cookie via `iron-session`
- **Data** — All Steam API calls are made server-side (API key never exposed to the client)
- **Pages** — Server components; data is fetched at request time

---

## TODO

- [ ] **Search / filter** — client-side text input above the game table to filter by name; toggle to hide unplayed games
- [ ] **Forgotten games** — surface games with 60+ minutes played but not touched in 2+ years, shown as a section near the random-picker
- [ ] **Friend comparison** — accept a second public Steam ID and show shared games, games unique to each library, and head-to-head hour counts

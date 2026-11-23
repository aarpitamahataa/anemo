# ANEMO · anime streetwear demo sites

Two demo storefronts for **Anemo**, a four-design, four-realm anime tee brand. Static HTML, CSS and JS, with no build step.
Built as an assignment prototype.

| Demo | What it is |
|---|---|
| [`demo1/`](demo1/index.html) | **Manga Edition**: ink, halftone dots and manga-page backgrounds |
| [`demo2/`](demo2/index.html) | **Night Sky Edition**: dark glass, glow, starry hill |
| [`mockups/`](mockups/index.html) | Screenshot gallery of every section, desktop and mobile |

Open [`index.html`](index.html) for a start page that links to all three.

## Story flow
Landing (Order now) → choose a realm (2×2 grid) → look closer (scribble notes) → scroll-driven crate opening → reviews → FAQ → final navigation.
The shop ("Loadout") and product pages follow a Respawned-style layout, and there is a login / sign-up / profile page.

## Realms and tees
Blood Lily · Cosmic · Celestial · Cloudy, with one limited tee design per realm (₹1,999). Prices, ratings and reviews are placeholders.

## Run locally
Open `index.html` through any static server (a plain `file://` open also works in a normal browser):

```bash
node serve.js 8765     # then visit http://localhost:8765
```

## Accounts (Supabase)
`config.js` holds the Supabase project URL and the **publishable** key. It is designed to be public, and the data is protected by row-level security in [`schema.sql`](schema.sql).

- Tables: `user_progress`, `reviews`, `orders`, `anemo_profiles`.
- Sign-up sends a confirmation email. In Supabase, add your hosted site address under Authentication → URL Configuration (Site URL and Redirect URLs) so the email link returns to it.
- Leave both values in `config.js` blank to run in local demo mode, with everything saved in the browser only.

## Editing
The shop, product and account pages are generated from `tpl/`. After editing a template, run `./build.sh`.

## Credits and usage
Backgrounds and reference images are used for this academic assignment only. Manga pages, anime artwork and the unboxing photo belong to their respective owners and are not licensed for commercial use. Replace them before any real launch.

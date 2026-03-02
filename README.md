# H5 App (UniApp + Vite + TanStack Query + Tailwind)

H5 app built with **UniApp** (Vue 3), **Vite**, **TanStack Query** (@tanstack/vue-query), and **Tailwind CSS v4**.

## Setup

```bash
cd h5-app
npm install
```

## Updating UniApp to the latest version

From the **h5-app** directory, run the official version manager in a **real terminal** (it will prompt for package manager):

```bash
cd h5-app
npx @dcloudio/uvm@latest
```

- Choose **npm** (or yarn/pnpm if you use that).
- The tool updates all `@dcloudio/*` compiler packages to the latest stable.

**Other options:**

- Latest **Alpha**: `npx @dcloudio/uvm@latest alpha`
- **Specific version**: `npx @dcloudio/uvm@latest 3.2.12.20211029` (replace with the version you want)

After updating, run `npm install` (or your package manager’s install), then `npm run dev:h5` again.

## Run (H5)

```bash
npm run dev:h5
```

Then open the URL shown in the terminal (e.g. http://localhost:5173).

### Multi-page and navigation

The app has two pages (index, register). If you see "单页面工程" or navigateTo errors after adding pages:

1. Stop the dev server (Ctrl+C).
2. Run again: `npm run dev:h5`.

So the compiler picks up all entries in `pages.json`. On H5, the Join button uses hash navigation so the register page can open even when the router was built as single-page.

### Register API (api-server)

The **Join** button opens the register page; submitting calls the backend **api-server** in this repo:

- **Backend:** `api-server` (see repo root `api-server/`)
- **Endpoint:** `POST /api/auth/register` — body: `{ role, phone_number, password }` (role: `MERCHANT` | `COMPANION` | `CUSTOMER`)
- **Dev:** Vite proxies `/api` and `/health` to `http://localhost:4000`. Run the api-server on port 4000 (e.g. `cd api-server && npm run dev`) so register works without extra config.
- **Override:** set `VITE_API_BASE_URL` in `.env` if the API runs elsewhere (see `.env.example`).

## Build (H5)

```bash
npm run build:h5
```

Output is in `dist/build/h5`.

## Stack

- **UniApp** – Vue 3–based cross‑platform framework (H5, mini‑programs, App)
- **Vite** – Build tool (from `uni-preset-vue#vite-ts`)
- **TanStack Query** – Data fetching, caching, and sync (see index page demo)
- **Tailwind CSS v4** – Utility CSS via `@import "tailwindcss"` and `@tailwindcss/postcss`

## Project layout

- `src/main.ts` – App entry, Vue Query plugin, Tailwind CSS import
- `src/App.vue` – Root component
- `src/pages.json` – Pages and tabBar
- `src/pages/index/index.vue` – Index page (Tailwind + `useQuery` demo)
- `src/tailwind.css` – Tailwind entry
- `postcss.config.js` – PostCSS with `@tailwindcss/postcss`

## Other platforms

You can run or build other targets, for example:

- `npm run dev:mp-weixin` – WeChat mini program
- `npm run build:mp-weixin` – Build WeChat mini program

See `package.json` scripts for all platforms.

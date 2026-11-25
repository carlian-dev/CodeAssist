# AGENTS.md

CodeAssist is a **frontend-only** prototype: React 19 + Vite 8 + Tailwind v4. Students submit code, instructors grade it, and "BLINK" is a mock AI helper. There is no backend.

## Commands

- `npm install` — npm is the package manager (`package-lock.json`).
- `npm run dev` — Vite dev server (default http://localhost:5173).
- `npm run build` — production build to `dist/` (gitignored; never edit it).
- `npm run preview` — serve the built app.
- There are **no test, lint, or typecheck scripts** and no ESLint config (despite one stray `eslint-disable` comment). Verify changes with `npm run build` plus a manual dev-server pass.

## Architecture

- Entry: `src/main.jsx` nests `BrowserRouter > StoreProvider > AuthProvider > App`. Routes and role guards live in `src/App.jsx`.
- Route map: `/login`, `/student`, `/student/section/:sectionId`, `/student/activity/:activityId`, `/student/materials`, `/instructor`, `/instructor/section/:sectionId`, `/instructor/section/:sectionId/materials`, `/instructor/activity/new`, `/instructor/activity/:activityId`, plus `/playground` shared by both roles.
- No API calls. All state is seeded from `src/data/seed.js` into localStorage key `codeassist:db:v6`; session lives in `codeassist:session:v1`. "Reset demo" on the login page reseeds. `createActivities` accepts `base.testCases` with output cases and code checks.
- Mutate data only via `useStore()` actions: `submitActivity`, `gradeSubmission`, `createActivities`, `updateActivity`, `resetDemo`. Never write to `db` directly.
- `useAuth()` exposes `user`, `login(id)`, `logout()`. Login is a demo-account picker — no passwords or real auth.
- BLINK is fake: `src/lib/blink.js` uses `setTimeout` and regex heuristics for problem generation, student hints, instructor feedback, and submission analysis. Do not assume an LLM/API or add network calls there casually.
- Test cases live on activities as `testCases`. Output tests are `{ input, expectedOutput }`; code checks are `{ type: 'code', check, label }` with rules in `src/lib/codeChecks.js`. `src/lib/judge.js` simulates output pass/fail in the browser because there is no code-execution backend.
- Domain selectors: `src/lib/selectors.js`. Date/status formatting: `src/lib/format.js`.
- Reuse shared primitives in `src/components/ui.jsx` (`cx`, `Button`, `Card`, `Badge`, `Field`, `Input`, `Textarea`, `Select`, `Toggle`, `ProgressBar`, `EmptyState`, `Stat`) and `<Icon name="..." />` from `src/components/icons.jsx` instead of adding a UI library.

## Conventions and gotchas

- Tailwind v4 is loaded via the `@tailwindcss/vite` plugin; there is **no `tailwind.config.js`**. Theme tokens live in `src/index.css` under `@theme`; global styles use `@layer base`.
- Code style: no semicolons, single quotes, 2-space indent, function components + hooks. Relative imports only — no path aliases.
- Persisted DB has `version: 6`, and `loadDb()` only reseeds when the stored version matches. If you change the data shape in `seed.js`, bump both the version and `DB_KEY` (`codeassist:db:v6`), otherwise existing browsers keep stale data.
- Seed assumes one instructor (`ins-1`) and 10 students across sections `t151`–`t155`; `createActivities` hardcodes `createdBy: 'ins-1'`.
- New IDs use `<prefix>-<base36 timestamp>-<random>` via `makeId` in `src/store/store.jsx`.
- Student activity pages must also verify `activity.sectionId === user.sectionId`; mismatches render `EmptyState`.
- `.agents/skills/` is vendored UI/design guidance pinned by `skills-lock.json` hashes. Load skills through the skill tool; do not hand-edit those files.

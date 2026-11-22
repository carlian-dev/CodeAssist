# Blink — CodeAssist mascot pack

Blink is a living text cursor. Everything here is generated from one source (`react/Blink.jsx`), so every file matches.

## What's inside

| Folder | Use it for |
|---|---|
| `react/` | **Animated React component** (`Blink.jsx` + `Blink.css`, TypeScript types, a demo) |
| `svg/` | Static SVGs (`blink-full-*`, `blink-face-*`) and self-animating SVGs (`blink-animated-*`, work in a plain `<img>`) |
| `png/` | Transparent PNGs: full body (512, plus a 1024 happy) and square face avatars (256, 512) |
| `animated/` | Looping animated WebPs (320×352, 3.2 s, transparent) for places that only take images |
| `preview.png` | One-page overview of all moods |

Moods: `happy` (idle, waving), `thinking` (loading), `celebrate` (success), `oops` (error).

## React quick start (React 18+)

1. Copy `react/Blink.jsx` and `react/Blink.css` into your project, e.g. `src/components/`.
2. Use it:

```jsx
import Blink from './components/Blink';

<Blink />                              {/* idle, waving */}
<Blink mood="thinking" size={120} />   {/* loading state */}
<Blink mood="celebrate" />             {/* success */}
<Blink mood="oops" />                  {/* error */}
<Blink variant="face" size={40} />     {/* avatar next to chat messages */}
<Blink animated={false} />             {/* static */}
```

Props: `mood`, `variant` (`full` | `face`), `size` (width in px), `animated`, `title` (accessible label), plus any normal SVG props (`className`, `style`, `onClick`).

`react/BlinkDemo.jsx` shows Blink reacting to idle / loading / success / error states.

Animations respect `prefers-reduced-motion` and switch off automatically.

## Without React

```html
<img src="svg/blink-animated-happy.svg" width="200" alt="Blink" />
<img src="animated/blink-thinking.webp" width="160" alt="Blink is thinking" />
```

## Palette

Cyan `#38E1F5` · Blue `#3B82F6` · Indigo `#6366F1` · Amber `#FBBF24` · Pink `#F472B6` · Navy `#0B1B4A`

Name, tagline and character are placeholders until you finalize them. Before you file for trademark or design protection, have an IP lawyer run a clearance search.

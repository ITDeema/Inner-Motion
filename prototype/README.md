# معمار (Mi'mar) — interactive UI prototype

Arabic-first (RTL) front-end prototype of an environmental site-analysis and architectural decision-support platform:
select a parcel on the map → simulated analysis → dashboard that turns sun, wind, heat and context into design decisions.

**UI/UX only.** There is no backend, authentication, real map data or real environmental calculation. All figures are
illustrative mock data (loosely based on Riyadh climate averages) and the interface says so.

## Run

No build step or dependencies. Serve the folder with any static server and open `index.html`:

```bash
cd prototype
python3 -m http.server 8000
# http://localhost:8000
```

## Pages (hash routes)

| Route | Page |
| --- | --- |
| `#landing` | Landing page |
| `#signup`, `#signin`, `#logout` | Account screens (visual only, no validation) |
| `#home` | Workspace home |
| `#map` | Parcel selection map (search, coordinates, layers, zoom, current location) |
| `#analyzing` | Staged analysis loading sequence |
| `#dashboard` | Results: overview, sun, wind, heat, context, recommendations, site plan, top 3 decisions |
| `#history`, `#saved` | Previous and saved analyses (save / delete with undo) |
| `#profile` | Profile, preferences (simple/technical view, theme), language, notifications, account |

The language switcher is a placeholder: choosing English shows a "coming soon" notice and the interface stays Arabic.

## Structure

```
index.html        page shell (fonts, scripts)
styles.css        design system tokens (light + dark) and all component styles
js/icons.js       inline stroke icon set
js/data.js        mock data, solar-position and thermal-comfort helpers
js/core.js        state, hash router, navigation shell, toasts, modals, logo
js/charts.js      hand-built SVG charts (sun path, wind rose, thermal calendar, …)
js/pages-*.js     landing/auth and workspace pages
js/map.js         vector parcel map with pan/zoom and selection
js/analysis.js    analysis loading sequence
js/dashboard.js   results dashboard and site plan
```

Per-viewer conveniences (saved items, deleted items, view mode, theme) are kept in `localStorage` when available.

# GAA Run List

A React + TypeScript + Vite app for tracking auction run lists by date and lane —
add vehicles, edit their info, and jot down CF (Carfax), BB (Black Book), RET
(Retail), Sell, Buy, and Bought notes on each one.

## Getting started

```bash
npm install
npm run dev
```

Then open the printed local URL (usually http://localhost:5173).

## Building for production

```bash
npm run build
npm run preview
```

## Project structure

```
src/
  types.ts                     Shared TypeScript types
  data/seedVehicles.ts         Seed data for the first day (July 1, 2026)
  utils/date.ts                Date parsing/formatting/calendar-grid helpers
  utils/vehicle.ts              Sorting, formatting, and vehicle factory helpers
  hooks/usePersistedAppState.ts  Loads/saves state to localStorage, debounced
  components/
    DateNav.tsx                 Prev/next auction-date arrows + calendar trigger
    CalendarPopover.tsx          Month-view date picker with data indicators
    Controls.tsx                 Search, view toggle, sort, bought filter, add button
    VehicleList.tsx              Flat or lane-grouped vehicle list
    VehicleCard.tsx               Single vehicle row in the list
    DetailPage.tsx                Full-page vehicle detail/edit/notes view
    FormFields.tsx                 Small Stat / EditField building blocks
  App.tsx                        Top-level state and composition
  main.tsx                       React entry point
  index.css                      Global styles
```

## Notes

- Data (vehicles, days, notes) is stored in the browser's `localStorage`, so it
  persists across reloads on the same device/browser but isn't shared between
  devices or synced anywhere.
- Seed data is only used the very first time the app runs in a browser with no
  saved state yet.

git init
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/NickStanislawski/auction-notes.git
git push -u origin main
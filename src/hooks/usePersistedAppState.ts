import { useEffect, useRef, useState } from "react";
import type { AppState, DayEntry } from "../types";
import { INITIAL_STATE } from "../data/seedVehicles";

// NOTE ON GITHUB PAGES: localStorage is scoped per-ORIGIN (protocol + host),
// not per path. All of your project pages (username.github.io/repo-a,
// username.github.io/repo-b, etc.) share the same origin, so they also share
// the same localStorage bucket. If this key ever collides with another repo
// (or an older deployment of this one), you'll see "someone else's" data.
// Keep this key unique/specific to this app to avoid that.
const STORAGE_KEY = "gaa-run-list-app::v1";

interface UsePersistedAppState {
  days: DayEntry[];
  setDays: React.Dispatch<React.SetStateAction<DayEntry[]>>;
  activeDate: string;
  setActiveDate: React.Dispatch<React.SetStateAction<string>>;
  hydrated: boolean;
  savedFlash: boolean;
}

/**
 * Loads/saves { days, activeDate } to localStorage, debounced, with a brief
 * "Saved" flash whenever a write completes. Falls back to the bundled seed
 * data the first time the app runs on a given browser.
 *
 * IMPORTANT: once something has been saved to localStorage, it normally takes
 * full precedence over INITIAL_STATE forever — so updating seedVehicles.ts
 * later (e.g. adding new dates) would silently have no effect for anyone who
 * already has saved state. To avoid that, on load we merge in any seed date
 * that isn't already present in the saved data, while leaving all existing
 * saved days (and any edits made to them) untouched.
 */
export function usePersistedAppState(): UsePersistedAppState {
  const [days, setDays] = useState<DayEntry[]>(INITIAL_STATE.days);
  const [activeDate, setActiveDate] = useState<string>(INITIAL_STATE.activeDate);
  const [hydrated, setHydrated] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const saveTimer = useRef<number | null>(null);

  // Load once on mount
  useEffect(() => {
    let loadedDays: DayEntry[] = INITIAL_STATE.days;
    let loadedActiveDate: string = INITIAL_STATE.activeDate;

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: AppState = JSON.parse(raw);
        if (parsed.days && parsed.days.length) {
          loadedDays = parsed.days;
          loadedActiveDate = parsed.activeDate || parsed.days[0].date;
        }
      }
    } catch {
      // nothing saved yet, or it was corrupt — fall back to seed data
    }

    // Merge in any seed day not already present in the saved data, so that
    // new dates added to seedVehicles.ts always show up, even on a browser
    // that already has older saved state.
    const existingDates = new Set(loadedDays.map((d) => d.date));
    const missingSeedDays = INITIAL_STATE.days.filter((d) => !existingDates.has(d.date));
    if (missingSeedDays.length) {
      loadedDays = [...loadedDays, ...missingSeedDays];
    }

    setDays(loadedDays);
    setActiveDate(loadedActiveDate);
    setHydrated(true);
  }, []);

  // Persist on every change, after initial load
  useEffect(() => {
    if (!hydrated) return;
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ days, activeDate }));
        setSavedFlash(true);
        window.setTimeout(() => setSavedFlash(false), 1200);
      } catch (e) {
        console.error("Failed to save GAA run list state", e);
      }
    }, 500);
  }, [days, activeDate, hydrated]);

  return { days, setDays, activeDate, setActiveDate, hydrated, savedFlash };
}
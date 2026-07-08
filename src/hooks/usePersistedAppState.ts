import { useEffect, useRef, useState } from "react";
import type { AppState, DayEntry } from "../types";
import { INITIAL_STATE } from "../data/seedVehicles";

const STORAGE_KEY = "gaa-app-state-v2";

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
 */
export function usePersistedAppState(): UsePersistedAppState {
  const [days, setDays] = useState<DayEntry[]>(INITIAL_STATE.days);
  const [activeDate, setActiveDate] = useState<string>(INITIAL_STATE.activeDate);
  const [hydrated, setHydrated] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const saveTimer = useRef<number | null>(null);

  // Load once on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: AppState = JSON.parse(raw);
        if (parsed.days && parsed.days.length) {
          setDays(parsed.days);
          setActiveDate(parsed.activeDate || parsed.days[0].date);
        }
      }
    } catch {
      // nothing saved yet, or it was corrupt — start from seed data
    }
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

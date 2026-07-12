import { useCallback, useEffect, useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";
import type { AppState, DayEntry, PurchaseStatus, Vehicle } from "../types";
import { supabase } from "../lib/supabaseClient";
import { INITIAL_STATE } from "../data/seedVehicles";

function storageKey(userId: string) {
  return `gaa-run-list-app::v2::${userId}`;
}

// --- Supabase row <-> Vehicle mapping -------------------------------------

interface VehicleRow {
  id: string;
  day_id: string;
  lane: string | null;
  run: string | null;
  year: string | null;
  make: string | null;
  model: string | null;
  miles: string | null;
  cr: string | null;
  mmr: string | null;
  flag: string | null;
  color: string | null;
  vin: string | null;
  cf: string | null;
  bb: string | null;
  ret: string | null;
  buy: string | null;
  went_down_line: boolean | null;
  final_bid_price: string | null;
  purchase_status: string | null;
}

function rowToVehicle(row: VehicleRow): Vehicle {
  return {
    id: row.id,
    lane: row.lane ?? "",
    run: row.run ?? "",
    year: row.year ?? "",
    make: row.make ?? "",
    model: row.model ?? "",
    miles: row.miles ?? "",
    cr: row.cr ?? "",
    mmr: row.mmr ?? "",
    flag: row.flag ?? "",
    color: row.color ?? "",
    vin: row.vin ?? "",
    cf: row.cf ?? "",
    bb: row.bb ?? "",
    ret: row.ret ?? "",
    buy: row.buy ?? "",
    wentDownLine: row.went_down_line ?? false,
    finalBidPrice: row.final_bid_price ?? "",
    purchaseStatus: (row.purchase_status as PurchaseStatus) ?? "not_purchased",
  };
}

function vehicleToRow(v: Vehicle, dayId: string, userId: string) {
  return {
    id: v.id,
    day_id: dayId,
    user_id: userId,
    lane: String(v.lane ?? ""),
    run: String(v.run ?? ""),
    year: String(v.year ?? ""),
    make: v.make,
    model: v.model,
    miles: String(v.miles ?? ""),
    cr: String(v.cr ?? ""),
    mmr: String(v.mmr ?? ""),
    flag: v.flag,
    color: v.color,
    vin: v.vin,
    cf: v.cf,
    bb: v.bb,
    ret: v.ret,
    buy: v.buy,
    went_down_line: v.wentDownLine,
    final_bid_price: v.finalBidPrice,
    purchase_status: v.purchaseStatus,
  };
}

interface UseCloudPersistedAppState {
  days: DayEntry[];
  setDays: React.Dispatch<React.SetStateAction<DayEntry[]>>;
  activeDate: string;
  setActiveDate: React.Dispatch<React.SetStateAction<string>>;
  hydrated: boolean;
  savedFlash: boolean;
  loadingDay: boolean;
  ensureDayLoaded: (date: string) => void;
  deleteVehicleRemote: (vehicleId: string) => void;
}

/**
 * Local-first state for the run list, backed by Supabase.
 *
 * - On login, the cached copy in localStorage renders immediately (no
 *   spinner), then the lightweight `days` table (just dates) is fetched in
 *   the background to pick up anything added from another device.
 * - Opening a date fetches its vehicles from Supabase only the first time;
 *   after that it's served from local state/localStorage instantly.
 * - Edits write to local state + localStorage immediately (snappy), and are
 *   pushed to Supabase in the background, debounced.
 *
 * This is last-write-wins — it doesn't attempt to merge conflicting edits
 * made on two devices at nearly the same time.
 */
export function useCloudPersistedAppState(user: User | null): UseCloudPersistedAppState {
  const [days, setDays] = useState<DayEntry[]>(INITIAL_STATE.days);
  const [activeDate, setActiveDate] = useState<string>(INITIAL_STATE.activeDate);
  const [hydrated, setHydrated] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const [loadingDay, setLoadingDay] = useState(false);

  const dayIdsRef = useRef<Map<string, string>>(new Map()); // date -> Supabase days.id
  const loadedDatesRef = useRef<Set<string>>(new Set()); // dates whose vehicles are already fetched
  const saveTimer = useRef<number | null>(null);

  // Load the cached copy instantly, then reconcile the day list in the background.
  useEffect(() => {
    if (!user) {
      setHydrated(false);
      setDays(INITIAL_STATE.days);
      setActiveDate(INITIAL_STATE.activeDate);
      return;
    }

    dayIdsRef.current = new Map();
    loadedDatesRef.current = new Set();

    let cachedDays: DayEntry[] = INITIAL_STATE.days;
    let cachedActiveDate: string = INITIAL_STATE.activeDate;
    try {
      const raw = localStorage.getItem(storageKey(user.id));
      if (raw) {
        const parsed: AppState = JSON.parse(raw);
        if (parsed.days && parsed.days.length) {
          cachedDays = parsed.days;
          cachedActiveDate = parsed.activeDate || cachedDays[0].date;
          cachedDays.forEach((d) => {
            if (d.vehicles.length > 0) loadedDatesRef.current.add(d.date);
          });
        }
      }
    } catch {
      // corrupt or missing cache — fall back to defaults, cloud fetch below still runs
    }

    setDays(cachedDays);
    setActiveDate(cachedActiveDate);
    setHydrated(true);

    // Background: pull the day list so the calendar's "has data" dots reflect
    // every device, not just this browser's cache.
    (async () => {
      const { data, error } = await supabase.from("days").select("id, date").eq("user_id", user.id);
      if (error || !data) return;

      data.forEach((row) => dayIdsRef.current.set(row.date, row.id));

      setDays((prev) => {
        const existingDates = new Set(prev.map((d) => d.date));
        const missing = data
          .filter((row) => !existingDates.has(row.date))
          .map((row) => ({ date: row.date, vehicles: [] as Vehicle[] }));
        return missing.length ? [...prev, ...missing] : prev;
      });
    })();
  }, [user]);

  // Fetch a specific day's vehicles from Supabase the first time it's opened.
  const ensureDayLoaded = useCallback(
    (date: string) => {
      if (!user) return;
      if (loadedDatesRef.current.has(date)) return;
      loadedDatesRef.current.add(date); // mark eagerly so a second call doesn't double-fetch

      (async () => {
        setLoadingDay(true);
        try {
          let dayId = dayIdsRef.current.get(date);
          if (!dayId) {
            const { data, error } = await supabase
              .from("days")
              .select("id")
              .eq("user_id", user.id)
              .eq("date", date)
              .maybeSingle();
            if (error || !data) return; // no cloud row for this date yet
            const fetchedId = data.id as string;
            dayId = fetchedId;
            dayIdsRef.current.set(date, fetchedId);
          }

          const { data: vehicleRows, error: vehErr } = await supabase
            .from("vehicles")
            .select("*")
            .eq("day_id", dayId);
          if (vehErr || !vehicleRows) return;

          const vehicles = (vehicleRows as VehicleRow[]).map(rowToVehicle);
          setDays((prev) => {
            const exists = prev.find((d) => d.date === date);
            if (exists) return prev.map((d) => (d.date === date ? { ...d, vehicles } : d));
            return [...prev, { date, vehicles }];
          });
        } finally {
          setLoadingDay(false);
        }
      })();
    },
    [user]
  );

  // Delete immediately on Supabase (upserts alone can't express a delete).
  const deleteVehicleRemote = useCallback(
    (vehicleId: string) => {
      if (!user) return;
      supabase
        .from("vehicles")
        .delete()
        .eq("id", vehicleId)
        .then(({ error }) => {
          if (error) console.error("Failed to delete vehicle from Supabase", error);
        });
    },
    [user]
  );

  // Cache to localStorage immediately, and push the active day up to
  // Supabase in the background, debounced.
  useEffect(() => {
    if (!hydrated || !user) return;
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(async () => {
      try {
        localStorage.setItem(storageKey(user.id), JSON.stringify({ days, activeDate }));
        setSavedFlash(true);
        window.setTimeout(() => setSavedFlash(false), 1200);
      } catch (e) {
        console.error("Failed to cache run list state locally", e);
      }

      const day = days.find((d) => d.date === activeDate);
      if (!day) return;

      try {
        let dayId = dayIdsRef.current.get(activeDate);
        if (!dayId) {
          const { data, error } = await supabase
            .from("days")
            .upsert({ user_id: user.id, date: activeDate }, { onConflict: "user_id,date" })
            .select("id")
            .single();
          if (error || !data) return;
          const fetchedId = data.id as string;
          dayId = fetchedId;
          dayIdsRef.current.set(activeDate, fetchedId);
        }

        if (day.vehicles.length > 0) {
          const rows = day.vehicles.map((v) => vehicleToRow(v, dayId!, user.id));
          const { error } = await supabase.from("vehicles").upsert(rows, { onConflict: "id" });
          if (error) console.error("Failed to sync vehicles to Supabase", error);
        }
      } catch (e) {
        console.error("Failed to sync run list state to Supabase", e);
      }
    }, 600);
  }, [days, activeDate, hydrated, user]);

  return {
    days,
    setDays,
    activeDate,
    setActiveDate,
    hydrated,
    savedFlash,
    loadingDay,
    ensureDayLoaded,
    deleteVehicleRemote,
  };
}

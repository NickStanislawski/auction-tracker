import { useEffect, useMemo, useState } from "react";
import type { SortDir, SortKey, Vehicle, ViewMode } from "./types";
import { useAuth } from "./hooks/useAuth";
import { useCloudPersistedAppState } from "./hooks/useCloudPersistedAppState";
import { compareVehicles, blankVehicle } from "./utils/vehicle";
import { parseDateStr } from "./utils/date";
import DateNav from "./components/DateNav";
import Controls from "./components/Controls";
import VehicleList from "./components/VehicleList";
import DetailPage from "./components/DetailPage";
import LoginScreen from "./components/LoginScreen";

export default function App() {
  const { user, authLoading, authError, signIn, signUp, signOut } = useAuth();
  const { days, setDays, activeDate, setActiveDate, hydrated, savedFlash, loadingDay, ensureDayLoaded, deleteVehicleRemote } =
    useCloudPersistedAppState(user);

  const [query, setQuery] = useState("");
  const [view, setView] = useState<ViewMode>("lane");
  const [sortBy, setSortBy] = useState<SortKey>("lane");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [boughtOnly, setBoughtOnly] = useState(false);
  const [activeOnly, setActiveOnly] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [calendarViewDate, setCalendarViewDate] = useState<Date>(parseDateStr(activeDate));

  const activeDay = days.find((d) => d.date === activeDate) || { date: activeDate, vehicles: [] as Vehicle[] };

  // Fetch the initial active date's vehicles once we're hydrated and know who's logged in.
  // Later switches are handled inside switchDate itself.
  useEffect(() => {
    if (hydrated && user) ensureDayLoaded(activeDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, user]);

  const switchDate = (dateStr: string) => {
    setDays((prev) => (prev.find((d) => d.date === dateStr) ? prev : [...prev, { date: dateStr, vehicles: [] }]));
    setActiveDate(dateStr);
    setCalendarViewDate(parseDateStr(dateStr));
    setQuery("");
    setSelectedId(null);
    ensureDayLoaded(dateStr);
  };

  const updateVehicle = (vehicleId: string, field: keyof Vehicle, value: string | boolean) => {
    setDays((prev) =>
      prev.map((d) => {
        if (d.date !== activeDate) return d;

        // Marking a run as "went down the line" implies every earlier run in
        // that same lane already went down too, since a lane auctions its
        // runs in order. So catch those up automatically instead of making
        // someone click through every earlier vehicle by hand.
        if (field === "wentDownLine" && value === true) {
          const target = d.vehicles.find((v) => v.id === vehicleId);
          if (!target) return d;
          const targetLane = String(target.lane);
          const targetRun = parseFloat(String(target.run));

          return {
            ...d,
            vehicles: d.vehicles.map((v) => {
              if (v.id === vehicleId) return { ...v, wentDownLine: true };
              if (v.wentDownLine) return v;
              if (String(v.lane) !== targetLane) return v;
              const vRun = parseFloat(String(v.run));
              if (Number.isNaN(vRun) || Number.isNaN(targetRun) || vRun > targetRun) return v;
              return { ...v, wentDownLine: true };
            }),
          };
        }

        return { ...d, vehicles: d.vehicles.map((v) => (v.id !== vehicleId ? v : { ...v, [field]: value })) };
      })
    );
  };

  const addVehicle = () => {
    const v = blankVehicle();
    setDays((prev) => {
      const exists = prev.find((d) => d.date === activeDate);
      if (exists) return prev.map((d) => (d.date !== activeDate ? d : { ...d, vehicles: [v, ...d.vehicles] }));
      return [...prev, { date: activeDate, vehicles: [v] }];
    });
    setQuery("");
    setBoughtOnly(false);
    setActiveOnly(false);
    setSelectedId(v.id);
  };

  const toggleExpanded = (vehicleId: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(vehicleId)) next.delete(vehicleId);
      else next.add(vehicleId);
      return next;
    });
  };

  const deleteVehicle = (vehicleId: string) => {
    setDays((prev) =>
      prev.map((d) => (d.date !== activeDate ? d : { ...d, vehicles: d.vehicles.filter((v) => v.id !== vehicleId) }))
    );
    deleteVehicleRemote(vehicleId);
    setSelectedId(null);
  };

  // Imports vehicles parsed from an uploaded Excel/CSV run list. If the file
  // had a date in its title, that becomes the target day (creating it if
  // needed); otherwise it lands on whatever day is currently active. Vehicles
  // are merged by VIN: a VIN that already exists on that day keeps its id and
  // any notes/bought status you've already entered, but gets its auction
  // fields (lane, run, miles, CR, MMR, etc.) refreshed from the file. New
  // VINs are appended.
  const importVehicles = (importedDate: string | null, vehicles: Vehicle[]) => {
    const targetDate = importedDate || activeDate;
    ensureDayLoaded(targetDate);

    setDays((prev) => {
      const existing = prev.find((d) => d.date === targetDate);
      if (!existing) {
        return [...prev, { date: targetDate, vehicles }];
      }

      const merged = [...existing.vehicles];
      vehicles.forEach((incoming) => {
        const idx = incoming.vin ? merged.findIndex((v) => v.vin === incoming.vin) : -1;
        if (idx >= 0) {
          const current = merged[idx];
          merged[idx] = {
            ...incoming,
            id: current.id,
            cf: current.cf,
            bb: current.bb,
            ret: current.ret,
            buy: current.buy,
            wentDownLine: current.wentDownLine,
            finalBidPrice: current.finalBidPrice,
            purchaseStatus: current.purchaseStatus,
          };
        } else {
          merged.push(incoming);
        }
      });

      return prev.map((d) => (d.date === targetDate ? { ...d, vehicles: merged } : d));
    });

    setActiveDate(targetDate);
    setCalendarViewDate(parseDateStr(targetDate));
    setQuery("");
    setBoughtOnly(false);
    setActiveOnly(false);
    setSelectedId(null);
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return activeDay.vehicles.filter((v) => {
      if (boughtOnly && v.purchaseStatus !== "bought" && v.purchaseStatus !== "bought_if") return false;
      if (activeOnly && v.wentDownLine) return false;
      if (!q) return true;
      return (
        (v.make || "").toLowerCase().includes(q) ||
        (v.model || "").toLowerCase().includes(q) ||
        (v.vin || "").toLowerCase().includes(q) ||
        (v.color || "").toLowerCase().includes(q) ||
        String(v.lane).includes(q) ||
        String(v.run).includes(q)
      );
    });
  }, [activeDay, query, boughtOnly, activeOnly]);

  const sorted = useMemo(
    () => [...filtered].sort((a, b) => compareVehicles(a, b, sortBy, sortDir)),
    [filtered, sortBy, sortDir]
  );

  const lanes = useMemo<[string, Vehicle[]][]>(() => {
    const map = new Map<string, Vehicle[]>();
    sorted.forEach((v) => {
      const key = v.lane === "" || v.lane === null || v.lane === undefined ? "Unassigned" : String(v.lane);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(v);
    });
    return [...map.entries()].sort((a, b) => {
      const an = parseFloat(a[0]);
      const bn = parseFloat(b[0]);
      if (Number.isNaN(an) && Number.isNaN(bn)) return 0;
      if (Number.isNaN(an)) return 1;
      if (Number.isNaN(bn)) return -1;
      return an - bn;
    });
  }, [sorted]);

  const selected = activeDay.vehicles.find((v) => v.id === selectedId) || null;
  const selectedIndex = sorted.findIndex((v) => v.id === selectedId);
  const prevVehicle = selectedIndex > 0 ? sorted[selectedIndex - 1] : null;
  const nextVehicle = selectedIndex >= 0 && selectedIndex < sorted.length - 1 ? sorted[selectedIndex + 1] : null;
  const boughtCount = activeDay.vehicles.filter((v) => v.purchaseStatus === "bought").length;

  const datesWithData = useMemo(
    () => new Set(days.filter((d) => d.vehicles.length > 0).map((d) => d.date)),
    [days]
  );
  const sortedDataDates = useMemo(() => [...datesWithData].sort(), [datesWithData]);
  const prevDataDate = useMemo(() => {
    const earlier = sortedDataDates.filter((d) => d < activeDate);
    return earlier.length ? earlier[earlier.length - 1] : null;
  }, [sortedDataDates, activeDate]);
  const nextDataDate = useMemo(() => {
    const later = sortedDataDates.filter((d) => d > activeDate);
    return later.length ? later[0] : null;
  }, [sortedDataDates, activeDate]);

  // Reset edit state whenever the selected vehicle changes; auto-edit brand-new blanks
  useEffect(() => {
    if (!selectedId) {
      setEditMode(false);
      return;
    }
    const v = activeDay.vehicles.find((x) => x.id === selectedId);
    const isBlank = !!v && !v.make && !v.model && !v.vin && !v.year;
    setEditMode(isBlank);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  // Prev/Next/Escape keyboard nav while a vehicle is open (but not while editing)
  useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent) => {
      if (editMode) return;
      if (e.key === "ArrowRight" && nextVehicle) setSelectedId(nextVehicle.id);
      if (e.key === "ArrowLeft" && prevVehicle) setSelectedId(prevVehicle.id);
      if (e.key === "Escape") setSelectedId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected, nextVehicle, prevVehicle, editMode]);

  const toggleSortDir = () => setSortDir((d) => (d === "asc" ? "desc" : "asc"));

  // Bought only / Active only are mutually exclusive — turning one on turns the other off.
  const toggleBoughtOnly = (next: boolean) => {
    setBoughtOnly(next);
    if (next) setActiveOnly(false);
  };
  const toggleActiveOnly = (next: boolean) => {
    setActiveOnly(next);
    if (next) setBoughtOnly(false);
  };

  if (authLoading) return null;
  if (!user) return <LoginScreen signIn={signIn} signUp={signUp} authError={authError} />;
  if (!hydrated) return null;

  if (selected) {
    return (
      <div className="gaa-app">
        <DetailPage
          vehicle={selected}
          prevVehicle={prevVehicle}
          nextVehicle={nextVehicle}
          editMode={editMode}
          setEditMode={setEditMode}
          onSelect={setSelectedId}
          onClose={() => setSelectedId(null)}
          onUpdate={updateVehicle}
          onDelete={deleteVehicle}
          savedFlash={savedFlash}
        />
      </div>
    );
  }

  return (
    <div className="gaa-app">
      <div className="gaa-header" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <div>
          <div className="gaa-eyebrow">Run List</div>
          <div className="gaa-sub">
            {loadingDay ? (
              "Loading vehicles…"
            ) : (
              <>
                {activeDay.vehicles.length} vehicles · {new Set(activeDay.vehicles.map((v) => v.lane)).size} lanes ·{" "}
                <b>{boughtCount}</b> bought
              </>
            )}
          </div>
        </div>
        <button
          onClick={signOut}
          title={user.email ?? undefined}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: 12.5,
            color: "#8a8f98",
            fontWeight: 500,
            padding: 0,
            flexShrink: 0,
            marginTop: 2,
          }}
        >
          Sign out
        </button>
      </div>

      <DateNav
        activeDate={activeDate}
        prevDataDate={prevDataDate}
        nextDataDate={nextDataDate}
        datesWithData={datesWithData}
        calendarViewDate={calendarViewDate}
        setCalendarViewDate={setCalendarViewDate}
        onSwitchDate={switchDate}
      />

      <Controls
        query={query}
        setQuery={setQuery}
        view={view}
        setView={setView}
        sortBy={sortBy}
        setSortBy={setSortBy}
        sortDir={sortDir}
        toggleSortDir={toggleSortDir}
        boughtOnly={boughtOnly}
        setBoughtOnly={toggleBoughtOnly}
        activeOnly={activeOnly}
        setActiveOnly={toggleActiveOnly}
        onAddVehicle={addVehicle}
        onImportVehicles={importVehicles}
      />

      <VehicleList
        view={view}
        sorted={sorted}
        lanes={lanes}
        onSelect={setSelectedId}
        onAddVehicle={addVehicle}
        onUpdate={updateVehicle}
        expandedIds={expandedIds}
        onToggleExpanded={toggleExpanded}
      />
    </div>
  );
}
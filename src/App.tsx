import { useEffect, useMemo, useState } from "react";
import type { SortDir, SortKey, Vehicle, ViewMode } from "./types";
import { usePersistedAppState } from "./hooks/usePersistedAppState";
import { compareVehicles, blankVehicle } from "./utils/vehicle";
import { parseDateStr } from "./utils/date";
import DateNav from "./components/DateNav";
import Controls from "./components/Controls";
import VehicleList from "./components/VehicleList";
import DetailPage from "./components/DetailPage";

export default function App() {
  const { days, setDays, activeDate, setActiveDate, hydrated, savedFlash } = usePersistedAppState();

  const [query, setQuery] = useState("");
  const [view, setView] = useState<ViewMode>("lane");
  const [sortBy, setSortBy] = useState<SortKey>("lane");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [boughtOnly, setBoughtOnly] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [calendarViewDate, setCalendarViewDate] = useState<Date>(parseDateStr(activeDate));

  const activeDay = days.find((d) => d.date === activeDate) || { date: activeDate, vehicles: [] as Vehicle[] };

  const switchDate = (dateStr: string) => {
    setDays((prev) => (prev.find((d) => d.date === dateStr) ? prev : [...prev, { date: dateStr, vehicles: [] }]));
    setActiveDate(dateStr);
    setCalendarViewDate(parseDateStr(dateStr));
    setQuery("");
    setSelectedId(null);
  };

  const updateVehicle = (vehicleId: string, field: keyof Vehicle, value: string | boolean) => {
    setDays((prev) =>
      prev.map((d) =>
        d.date !== activeDate
          ? d
          : { ...d, vehicles: d.vehicles.map((v) => (v.id !== vehicleId ? v : { ...v, [field]: value })) }
      )
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
    setSelectedId(v.id);
  };

  const deleteVehicle = (vehicleId: string) => {
    setDays((prev) =>
      prev.map((d) => (d.date !== activeDate ? d : { ...d, vehicles: d.vehicles.filter((v) => v.id !== vehicleId) }))
    );
    setSelectedId(null);
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return activeDay.vehicles.filter((v) => {
      if (boughtOnly && !v.bought) return false;
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
  }, [activeDay, query, boughtOnly]);

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
  const boughtCount = activeDay.vehicles.filter((v) => v.bought).length;

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
      <div className="gaa-header">
        <div className="gaa-eyebrow">Run List</div>
        <div className="gaa-sub">
          {activeDay.vehicles.length} vehicles · {new Set(activeDay.vehicles.map((v) => v.lane)).size} lanes ·{" "}
          <b>{boughtCount}</b> bought
        </div>
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
        setBoughtOnly={setBoughtOnly}
        onAddVehicle={addVehicle}
      />

      <VehicleList view={view} sorted={sorted} lanes={lanes} onSelect={setSelectedId} onAddVehicle={addVehicle} />
    </div>
  );
}

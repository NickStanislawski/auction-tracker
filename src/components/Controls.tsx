import { ArrowUpDown, Plus, Search } from "lucide-react";
import type { SortDir, SortKey, Vehicle, ViewMode } from "../types";
import { SORT_OPTIONS } from "../utils/vehicle";
import ImportButton from "./ImportButton";

interface ControlsProps {
  query: string;
  setQuery: (q: string) => void;
  view: ViewMode;
  setView: (v: ViewMode) => void;
  sortBy: SortKey;
  setSortBy: (s: SortKey) => void;
  sortDir: SortDir;
  toggleSortDir: () => void;
  boughtOnly: boolean;
  setBoughtOnly: (b: boolean) => void;
  onAddVehicle: () => void;
  onImportVehicles: (date: string | null, vehicles: Vehicle[]) => void;
}

export default function Controls({
  query,
  setQuery,
  view,
  setView,
  sortBy,
  setSortBy,
  sortDir,
  toggleSortDir,
  boughtOnly,
  setBoughtOnly,
  onAddVehicle,
  onImportVehicles,
}: ControlsProps) {
  return (
    <div className="gaa-controls">
      <div className="gaa-search">
        <Search />
        <input
          type="text"
          placeholder="Search make, model, VIN, color, lane..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <div className="gaa-tabs">
        <button className={`gaa-tab ${view === "lane" ? "active" : ""}`} onClick={() => setView("lane")}>
          By Lane
        </button>
        <button className={`gaa-tab ${view === "all" ? "active" : ""}`} onClick={() => setView("all")}>
          All Vehicles
        </button>
      </div>
      <div className="gaa-sort">
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortKey)}>
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              Sort: {o.label}
            </option>
          ))}
        </select>
        <button onClick={toggleSortDir} title={sortDir === "asc" ? "Ascending" : "Descending"}>
          <ArrowUpDown size={15} />
        </button>
      </div>
      <button className={`gaa-chip ${boughtOnly ? "active" : ""}`} onClick={() => setBoughtOnly(!boughtOnly)}>
        Bought only
      </button>
      <ImportButton onImport={onImportVehicles} />
      <button className="gaa-add-btn" onClick={onAddVehicle}>
        <Plus size={15} /> Add Vehicle
      </button>
    </div>
  );
}

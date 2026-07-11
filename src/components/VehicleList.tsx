import { Plus } from "lucide-react";
import type { Vehicle, ViewMode } from "../types";
import VehicleCard from "./VehicleCard";

interface VehicleListProps {
  view: ViewMode;
  sorted: Vehicle[];
  lanes: [string, Vehicle[]][];
  onSelect: (id: string) => void;
  onAddVehicle: () => void;
  onUpdate: (id: string, field: keyof Vehicle, value: string | boolean) => void;
  expandedIds: Set<string>;
  onToggleExpanded: (id: string) => void;
}

export default function VehicleList({
  view,
  sorted,
  lanes,
  onSelect,
  onAddVehicle,
  onUpdate,
  expandedIds,
  onToggleExpanded,
}: VehicleListProps) {
  if (sorted.length === 0) {
    return (
      <div className="gaa-body">
        <div className="gaa-empty">
          No vehicles for this day yet.
          <div>
            <button className="gaa-add-btn" onClick={onAddVehicle}>
              <Plus size={15} /> Add Vehicle
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="gaa-body">
      {view === "all" &&
        sorted.map((v) => (
          <VehicleCard
            key={v.id}
            vehicle={v}
            onClick={() => onSelect(v.id)}
            onUpdate={onUpdate}
            expanded={expandedIds.has(v.id)}
            onToggleExpanded={() => onToggleExpanded(v.id)}
          />
        ))}

      {view === "lane" &&
        lanes.map(([laneKey, vs]) => (
          <div key={laneKey}>
            <div className="lane-heading">
              <div className="lane-badge">{laneKey}</div>
              <div className="lane-heading-text">{laneKey === "Unassigned" ? "Unassigned" : `Lane ${laneKey}`}</div>
              <div className="lane-heading-count">
                {vs.length} {vs.length === 1 ? "vehicle" : "vehicles"}
              </div>
            </div>
            {vs.map((v) => (
              <VehicleCard
                key={v.id}
                vehicle={v}
                onClick={() => onSelect(v.id)}
                onUpdate={onUpdate}
                expanded={expandedIds.has(v.id)}
                onToggleExpanded={() => onToggleExpanded(v.id)}
              />
            ))}
          </div>
        ))}
    </div>
  );
}
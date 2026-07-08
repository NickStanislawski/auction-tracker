import type { Vehicle } from "../types";
import { crTone, displayNum, money } from "../utils/vehicle";

interface VehicleCardProps {
  vehicle: Vehicle;
  onClick: () => void;
}

export default function VehicleCard({ vehicle: v, onClick }: VehicleCardProps) {
  return (
    <div className="vehicle-card" onClick={onClick}>
      <div className="vehicle-run">
        {v.run || "—"}
        <span>run</span>
      </div>
      <div>
        <div className="vehicle-main-line">
          {v.year || "—"} {v.make || "New vehicle"} {v.model}
          {v.bought && <span className="bought-tag">Bought</span>}
        </div>
        <div className="vehicle-meta">
          <span>{displayNum(v.miles)} mi</span>
          <span>{v.color || "—"}</span>
          <span>{v.vin ? v.vin.slice(-8) : "no vin"}</span>
        </div>
      </div>
      <div className="vehicle-side">
        <span className={`cr-chip ${crTone(v.cr)}`}>CR {v.cr || "—"}</span>
        <span className="mmr-value">{money(v.mmr)}</span>
      </div>
    </div>
  );
}

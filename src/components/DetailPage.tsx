import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Check,
  ChevronLeft,
  Flag as FlagIcon,
  Gauge,
  Palette,
  Pencil,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import type { Vehicle } from "../types";
import { crTone, displayNum, money } from "../utils/vehicle";
import { EditField, Stat } from "./FormFields";

interface DetailPageProps {
  vehicle: Vehicle;
  prevVehicle: Vehicle | null;
  nextVehicle: Vehicle | null;
  editMode: boolean;
  setEditMode: (v: boolean | ((m: boolean) => boolean)) => void;
  onSelect: (id: string) => void;
  onClose: () => void;
  onUpdate: (id: string, field: keyof Vehicle, value: string | boolean) => void;
  onDelete: (id: string) => void;
  savedFlash: boolean;
}

export default function DetailPage({
  vehicle: selected,
  prevVehicle,
  nextVehicle,
  editMode,
  setEditMode,
  onSelect,
  onClose,
  onUpdate,
  onDelete,
  savedFlash,
}: DetailPageProps) {
  const [deleteArmed, setDeleteArmed] = useState(false);

  const update = (field: keyof Vehicle, value: string | boolean) => onUpdate(selected.id, field, value);

  return (
    <div className="detail-page">
      <div className="detail-topbar">
        <button className="detail-back" onClick={onClose}>
          <ChevronLeft size={18} />
        </button>
        <div>
          <div className="detail-title">
            {selected.year || "Year"} {selected.make || "Make"} {selected.model || "Model"}
          </div>
          <div className="detail-title-sub">{selected.vin || "No VIN yet"}</div>
        </div>
        <div className="detail-nav">
          <button disabled={!prevVehicle} onClick={() => prevVehicle && onSelect(prevVehicle.id)}>
            <ArrowLeft size={14} /> Prev
          </button>
          <button disabled={!nextVehicle} onClick={() => nextVehicle && onSelect(nextVehicle.id)}>
            Next <ArrowRight size={14} />
          </button>
        </div>
      </div>

      <div className="detail-body">
        <div className="detail-grid">
          <div>
            <div className="panel-head">
              <h3>Vehicle info</h3>
              <button className={`edit-toggle ${editMode ? "done" : ""}`} onClick={() => setEditMode((m) => !m)}>
                {editMode ? (
                  <>
                    <Check size={13} /> Done
                  </>
                ) : (
                  <>
                    <Pencil size={13} /> Edit
                  </>
                )}
              </button>
            </div>

            {editMode ? (
              <div className="detail-stats">
                <EditField className="span-2" label="Make" value={selected.make} onChange={(v) => update("make", v)} />
                <EditField className="span-2" label="Model / Trim" value={selected.model} onChange={(v) => update("model", v)} />
                <EditField label="Lane" value={selected.lane} onChange={(v) => update("lane", v)} />
                <EditField label="Run #" value={selected.run} onChange={(v) => update("run", v)} />
                <EditField label="Year" value={selected.year} onChange={(v) => update("year", v)} />
                <EditField label="Miles" value={selected.miles} onChange={(v) => update("miles", v)} />
                <EditField label="CR" value={selected.cr} onChange={(v) => update("cr", v)} />
                <EditField label="MMR" value={selected.mmr} onChange={(v) => update("mmr", v)} />
                <EditField label="Color" value={selected.color} onChange={(v) => update("color", v)} />
                <EditField label="Flag" value={selected.flag} onChange={(v) => update("flag", v)} />
                <EditField className="span-2" label="VIN" value={selected.vin} onChange={(v) => update("vin", v)} />
              </div>
            ) : (
              <div className="detail-stats">
                <Stat className="span-2" label="Make" value={selected.make || "—"} />
                <Stat className="span-2" label="Model / Trim" value={selected.model || "—"} />
                <Stat label="Lane" value={selected.lane || "—"} />
                <Stat label="Run #" value={selected.run || "—"} />
                <Stat icon={Calendar} label="Year" value={selected.year || "—"} />
                <Stat icon={Gauge} label="Miles" value={displayNum(selected.miles)} />
                <Stat label="CR" value={selected.cr || "—"} tone={crTone(selected.cr)} />
                <Stat label="MMR" value={money(selected.mmr)} tone="accent" />
                <Stat icon={Palette} label="Color" value={selected.color || "—"} />
                <Stat icon={FlagIcon} label="Flag" value={selected.flag || "—"} />
                <Stat className="span-2" label="VIN" value={selected.vin || "—"} />
              </div>
            )}
          </div>

          <div className="detail-form">
            <div className="bought-row">
              <button
                className={`bought-toggle ${selected.bought ? "on" : ""}`}
                onClick={() => update("bought", !selected.bought)}
                aria-pressed={selected.bought}
              >
                <span className="knob">{selected.bought && <Check />}</span>
              </button>
              <div style={{ flex: 1 }}>
                <div className="field-label" style={{ marginBottom: 4 }}>
                  Bought
                </div>
                <input
                  className="field-input"
                  placeholder="Price paid (optional)"
                  value={selected.boughtPrice}
                  onChange={(e) => update("boughtPrice", e.target.value)}
                />
              </div>
            </div>

            <div className="field-group">
              <label className="field-label">
                CF <span className="field-hint">Carfax</span>
              </label>
              <textarea
                className="field-textarea"
                value={selected.cf}
                onChange={(e) => update("cf", e.target.value)}
                placeholder="Accident history, owners, service records..."
              />
            </div>
            <div className="field-group">
              <label className="field-label">
                BB <span className="field-hint">Black Book</span>
              </label>
              <input className="field-input" value={selected.bb} onChange={(e) => update("bb", e.target.value)} placeholder="Black Book value" />
            </div>
            <div className="field-group">
              <label className="field-label">
                RET <span className="field-hint">Retail</span>
              </label>
              <input className="field-input" value={selected.ret} onChange={(e) => update("ret", e.target.value)} placeholder="Retail value" />
            </div>
            <div className="field-group">
              <label className="field-label">Sell</label>
              <input className="field-input" value={selected.sell} onChange={(e) => update("sell", e.target.value)} placeholder="Target sell price" />
            </div>
            <div className="field-group">
              <label className="field-label">Buy</label>
              <input className="field-input" value={selected.buy} onChange={(e) => update("buy", e.target.value)} placeholder="Max buy price" />
            </div>
          </div>
        </div>

        <div className="danger-zone">
          {!deleteArmed ? (
            <button className="delete-link" onClick={() => setDeleteArmed(true)}>
              <Trash2 size={13} /> Delete this vehicle
            </button>
          ) : (
            <div className="delete-confirm">
              <p>Delete this vehicle? This can't be undone.</p>
              <div className="delete-confirm-buttons">
                <button className="confirm-no" onClick={() => setDeleteArmed(false)}>
                  Cancel
                </button>
                <button className="confirm-yes" onClick={() => onDelete(selected.id)}>
                  Yes, delete it
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="detail-footer-note">
          <span>Notes saved to this browser</span>
          <span className="saved-flash" style={{ opacity: savedFlash ? 1 : 0 }}>
            Saved
          </span>
        </div>
      </div>
    </div>
  );
}

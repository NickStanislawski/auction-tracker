import { Check, ChevronDown } from "lucide-react";
import { useState, type CSSProperties } from "react";
import type { Vehicle } from "../types";
import { crTone, displayNum, money } from "../utils/vehicle";

interface VehicleCardProps {
  vehicle: Vehicle;
  onClick: () => void;
  onUpdate: (id: string, field: keyof Vehicle, value: string | boolean) => void;
}

const labelStyle: CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.04em",
  color: "#8a8f98",
  display: "block",
  marginBottom: 6,
};

const hintStyle: CSSProperties = {
  fontWeight: 400,
  textTransform: "none",
  letterSpacing: "normal",
  color: "#b0b4bb",
  marginLeft: 4,
};

const inputStyle: CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: "9px 11px",
  fontSize: 13.5,
  borderRadius: 8,
  border: "1px solid #e2e4e9",
  background: "#fafafa",
  color: "inherit",
  outline: "none",
};

export default function VehicleCard({ vehicle: v, onClick, onUpdate }: VehicleCardProps) {
  const [expanded, setExpanded] = useState(false);

  const update = (field: keyof Vehicle, value: string | boolean) => onUpdate(v.id, field, value);

  return (
    <div className="vehicle-card" style={{ display: "flex", flexDirection: "column", width: "100%", boxSizing: "border-box" }}>
      {/* Top row — click anywhere here to open the full detail page */}
      <div
        onClick={onClick}
        style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", cursor: "pointer" }}
      >
        <div className="vehicle-run">
          {v.run || "—"}
          <span>run</span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
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
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <span className={`cr-chip ${crTone(v.cr)}`}>CR {v.cr || "—"}</span>
          <span className="mmr-value">{money(v.mmr)}</span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setExpanded((x) => !x);
          }}
          aria-expanded={expanded}
          aria-label={expanded ? "Collapse details" : "Expand details"}
          title={expanded ? "Collapse details" : "Expand details"}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 6,
            flexShrink: 0,
            opacity: 0.6,
            transform: expanded ? "rotate(180deg)" : "none",
            transition: "transform 0.15s ease",
          }}
        >
          <ChevronDown size={16} />
        </button>
      </div>

      {/* Expanded panel — full width regardless of any parent flex/align-items settings */}
      {expanded && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            alignSelf: "stretch",
            width: "100%",
            boxSizing: "border-box",
            marginTop: 14,
            paddingTop: 14,
            borderTop: "1px solid #ececef",
            cursor: "default",
          }}
        >
          {/* Quick facts row — quiet, matches existing meta text style */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "4px 14px",
              fontSize: 12.5,
              color: "#9aa0a8",
              marginBottom: 16,
            }}
          >
            <span>
              Lane <strong style={{ color: "#6b7178", fontWeight: 600 }}>{v.lane || "—"}</strong>
            </span>
            <span>
              Flag <strong style={{ color: "#6b7178", fontWeight: 600 }}>{v.flag || "—"}</strong>
            </span>
            <span>
              VIN <strong style={{ color: "#6b7178", fontWeight: 600 }}>{v.vin || "—"}</strong>
            </span>
          </div>

          {/* Bought toggle + price paid */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <button
              onClick={() => update("bought", !v.bought)}
              aria-pressed={v.bought}
              style={{
                width: 38,
                height: 22,
                borderRadius: 999,
                border: "none",
                cursor: "pointer",
                position: "relative",
                background: v.bought ? "#2563eb" : "#d8dbe0",
                transition: "background 0.15s ease",
                flexShrink: 0,
                padding: 0,
              }}
            >
              <span
                style={{
                  position: "absolute",
                  top: 2,
                  left: v.bought ? 18 : 2,
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  background: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "left 0.15s ease",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.25)",
                }}
              >
                {v.bought && <Check size={11} color="#2563eb" />}
              </span>
            </button>
            <div style={{ flex: "1 1 220px", minWidth: 180 }}>
              <span style={labelStyle}>Bought</span>
              <input
                style={inputStyle}
                placeholder="Price paid (optional)"
                value={v.boughtPrice}
                onChange={(e) => update("boughtPrice", e.target.value)}
              />
            </div>
          </div>

          {/* Carfax — always full width, it's the longest field */}
          <div style={{ marginBottom: 16 }}>
            <span style={labelStyle}>
              CF<span style={hintStyle}>Carfax</span>
            </span>
            <textarea
              style={{ ...inputStyle, minHeight: 64, resize: "vertical", fontFamily: "inherit", lineHeight: 1.5 }}
              value={v.cf}
              onChange={(e) => update("cf", e.target.value)}
              placeholder="Accident history, owners, service records..."
            />
          </div>

          {/* Value fields — responsive grid: multiple columns on desktop, stacks on mobile */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              gap: 12,
            }}
          >
            <div>
              <span style={labelStyle}>
                BB<span style={hintStyle}>Black Book</span>
              </span>
              <input style={inputStyle} value={v.bb} onChange={(e) => update("bb", e.target.value)} placeholder="Black Book value" />
            </div>
            <div>
              <span style={labelStyle}>
                RET<span style={hintStyle}>Retail</span>
              </span>
              <input style={inputStyle} value={v.ret} onChange={(e) => update("ret", e.target.value)} placeholder="Retail value" />
            </div>
            <div>
              <span style={labelStyle}>Sell</span>
              <input style={inputStyle} value={v.sell} onChange={(e) => update("sell", e.target.value)} placeholder="Target sell price" />
            </div>
            <div>
              <span style={labelStyle}>Buy</span>
              <input style={inputStyle} value={v.buy} onChange={(e) => update("buy", e.target.value)} placeholder="Max buy price" />
            </div>
          </div>

          <button
            onClick={onClick}
            style={{
              marginTop: 16,
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 13,
              color: "#2563eb",
              fontWeight: 500,
              padding: 0,
            }}
          >
            Open full details →
          </button>
        </div>
      )}
    </div>
  );
}
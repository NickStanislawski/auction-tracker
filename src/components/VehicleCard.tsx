import { Check, ChevronDown } from "lucide-react";
import { type CSSProperties } from "react";
import type { PurchaseStatus, Vehicle } from "../types";
import { crTone, displayNum, formatMoneyInput, money } from "../utils/vehicle";

interface VehicleCardProps {
  vehicle: Vehicle;
  onClick: () => void;
  onUpdate: (id: string, field: keyof Vehicle, value: string | boolean) => void;
  expanded: boolean;
  onToggleExpanded: () => void;
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

const PURCHASE_OPTIONS: { value: PurchaseStatus; label: string }[] = [
  { value: "not_purchased", label: "Not Purchased" },
  { value: "bought", label: "Bought" },
  { value: "bought_if", label: "Bought If" },
];

function purchaseTagLabel(status: PurchaseStatus): string | null {
  if (status === "bought") return "Bought";
  if (status === "bought_if") return "Bought If";
  return null;
}

export default function VehicleCard({ vehicle: v, onClick, onUpdate, expanded, onToggleExpanded }: VehicleCardProps) {
  const update = (field: keyof Vehicle, value: string | boolean) => onUpdate(v.id, field, value);

  const tagLabel = purchaseTagLabel(v.purchaseStatus);

  const hasMmr = v.mmr !== "" && v.mmr !== null && v.mmr !== undefined;
  const hasBb = !!v.bb.trim();
  const hasRet = !!v.ret.trim();
  const hasBuy = !!v.buy.trim();
  const hasValuesLine = hasMmr || hasBb || hasRet || hasBuy;

  return (
    <div
      className={`vehicle-card${v.wentDownLine ? " vehicle-card--down" : ""}`}
      style={{ display: "flex", flexDirection: "column", width: "100%", boxSizing: "border-box" }}
    >
      {/* Top row — click anywhere here to expand/collapse the quick-view panel */}
      <div
        onClick={onToggleExpanded}
        style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", cursor: "pointer" }}
      >
        <div className="vehicle-run">
          {v.run || "—"}
          <span>run</span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="vehicle-main-line">
            {v.year || "—"} {v.make || "New vehicle"} {v.model}
            {tagLabel && <span className="bought-tag">{tagLabel}</span>}
          </div>
          {hasValuesLine && (
            <div className="vehicle-values-line">
              {hasMmr && (
                <span>
                  MMR <strong>{money(v.mmr)}</strong>
                </span>
              )}
              {hasBb && (
                <span>
                  BB <strong>{money(v.bb)}</strong>
                </span>
              )}
              {hasRet && (
                <span>
                  RET <strong>{money(v.ret)}</strong>
                </span>
              )}
              {hasBuy && (
                <span>
                  MAX <strong>{money(v.buy)}</strong>
                </span>
              )}
            </div>
          )}
          <div className="vehicle-meta">
            <span>{displayNum(v.miles)} mi</span>
            <span>{v.color || "—"}</span>
            <span>{v.vin ? v.vin.slice(-8) : "no vin"}</span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <span className={`cr-chip ${crTone(v.cr)}`}>CR {v.cr || "—"}</span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleExpanded();
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

      {/* Collapsed-state footer link — expanded state has its own copy of this below */}
      {!expanded && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          style={{
            marginTop: 1,
            alignSelf: "flex-start",
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
      )}

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

          {/* Went down the line toggle + final bid price */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
            <button
              onClick={() => update("wentDownLine", !v.wentDownLine)}
              aria-pressed={v.wentDownLine}
              style={{
                width: 38,
                height: 22,
                borderRadius: 999,
                border: "none",
                cursor: "pointer",
                position: "relative",
                background: v.wentDownLine ? "#2563eb" : "#d8dbe0",
                transition: "background 0.15s ease",
                flexShrink: 0,
                padding: 0,
              }}
            >
              <span
                style={{
                  position: "absolute",
                  top: 2,
                  left: v.wentDownLine ? 18 : 2,
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
                {v.wentDownLine && <Check size={11} color="#2563eb" />}
              </span>
            </button>
            <div style={{ flex: "1 1 auto" }}>
              <span style={{ fontSize: 13.5 }}>Went down the line</span>
            </div>
          </div>

          {v.wentDownLine && (
            <div style={{ marginBottom: 16 }}>
              <span style={labelStyle}>Final bid price</span>
              <input
                style={inputStyle}
                value={v.finalBidPrice}
                onChange={(e) => update("finalBidPrice", e.target.value)}
                placeholder="Final bid price (optional)"
                inputMode="decimal"
              />
            </div>
          )}

          {/* Purchase status — mutually exclusive three-way picker */}
          <div style={{ marginBottom: 16 }}>
            <span style={labelStyle}>Purchase status</span>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))",
                gap: 8,
              }}
            >
              {PURCHASE_OPTIONS.map((opt) => {
                const active = v.purchaseStatus === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => update("purchaseStatus", opt.value)}
                    style={{
                      padding: "8px 10px",
                      fontSize: 13,
                      fontWeight: 500,
                      borderRadius: 8,
                      border: active ? "1px solid #2563eb" : "1px solid #e2e4e9",
                      background: active ? "#eff4ff" : "#fafafa",
                      color: active ? "#2563eb" : "#4b5058",
                      cursor: "pointer",
                      transition: "all 0.12s ease",
                    }}
                  >
                    {opt.label}
                  </button>
                );
              })}
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
              <input
                style={inputStyle}
                value={v.bb}
                onChange={(e) => update("bb", e.target.value)}
                onBlur={(e) => update("bb", formatMoneyInput(e.target.value))}
                placeholder="Black Book value"
              />
            </div>
            <div>
              <span style={labelStyle}>
                RET<span style={hintStyle}>Retail</span>
              </span>
              <input
                style={inputStyle}
                value={v.ret}
                onChange={(e) => update("ret", e.target.value)}
                onBlur={(e) => update("ret", formatMoneyInput(e.target.value))}
                placeholder="Retail value"
              />
            </div>
            <div>
              <span style={labelStyle}>Buy</span>
              <input
                style={inputStyle}
                value={v.buy}
                onChange={(e) => update("buy", e.target.value)}
                onBlur={(e) => update("buy", formatMoneyInput(e.target.value))}
                placeholder="Max buy price"
              />
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
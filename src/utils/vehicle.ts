import type { CrTone, SortDir, SortKey, Vehicle } from "../types";

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "lane", label: "Lane" },
  { value: "run", label: "Run #" },
  { value: "year", label: "Year" },
  { value: "make", label: "Make" },
  { value: "miles", label: "Miles" },
  { value: "cr", label: "CR" },
  { value: "mmr", label: "MMR" },
  { value: "color", label: "Color" },
];

export const NUMERIC_SORT_KEYS: SortKey[] = ["lane", "run", "year", "miles", "cr", "mmr"];

export function makeId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

export function blankVehicle(): Vehicle {
  return {
    id: makeId("v"),
    lane: "",
    run: "",
    year: "",
    make: "",
    model: "",
    miles: "",
    cr: "",
    mmr: "",
    flag: "",
    color: "",
    vin: "",
    cf: "",
    bb: "",
    ret: "",
    buy: "",
    wentDownLine: false,
    finalBidPrice: "",
    purchaseStatus: "not_purchased",
  };
}

export function crTone(cr: string | number): CrTone {
  const n = typeof cr === "number" ? cr : parseFloat(cr);
  if (Number.isNaN(n)) return "neutral";
  if (n < 3) return "low";
  if (n < 4) return "mid";
  return "high";
}

export function money(n: string | number): string {
  if (n === "" || n === null || n === undefined) return "—";
  const num = typeof n === "number" ? n : Number(String(n).replace(/[$,\s]/g, ""));
  if (Number.isNaN(num)) return "—";
  return "$" + num.toLocaleString();
}

// Formats a free-typed value (e.g. "15200" or "15,200") into a "$15,200"
// string for storage, so BB/RET/Buy always read back as a $ figure. Meant to
// be called onBlur so the person can still type freely while focused. If the
// value isn't a parseable number (or is empty), it's left untouched.
export function formatMoneyInput(v: string): string {
  const trimmed = v.trim();
  if (trimmed === "") return "";
  const num = Number(trimmed.replace(/[$,\s]/g, ""));
  if (Number.isNaN(num)) return v;
  return "$" + num.toLocaleString();
}

export function displayNum(n: string | number): string {
  const num = Number(n);
  if (n === "" || n === null || n === undefined || Number.isNaN(num)) return "—";
  return num.toLocaleString();
}

export function compareVehicles(a: Vehicle, b: Vehicle, key: SortKey, dir: SortDir): number {
  const mult = dir === "asc" ? 1 : -1;
  if (NUMERIC_SORT_KEYS.includes(key)) {
    const an = parseFloat(String(a[key]));
    const bn = parseFloat(String(b[key]));
    const aNan = Number.isNaN(an);
    const bNan = Number.isNaN(bn);
    if (aNan && bNan) return 0;
    if (aNan) return 1;
    if (bNan) return -1;
    return (an - bn) * mult;
  }
  const as = String(a[key] ?? "").toLowerCase();
  const bs = String(b[key] ?? "").toLowerCase();
  if (as < bs) return -1 * mult;
  if (as > bs) return 1 * mult;
  return 0;
}
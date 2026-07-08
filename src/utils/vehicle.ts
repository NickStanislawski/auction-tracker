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
    sell: "",
    buy: "",
    bought: false,
    boughtPrice: "",
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
  const num = Number(n);
  if (n === "" || n === null || n === undefined || Number.isNaN(num)) return "—";
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

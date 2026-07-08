import * as XLSX from "xlsx";
import type { Vehicle } from "../types";
import { makeId } from "./vehicle";
import { toDateStr } from "./date";

// Maps normalized (lowercased/trimmed) header text -> Vehicle field.
// Add more aliases here if a dealer's export uses different column names.
const HEADER_MAP: Record<string, keyof Vehicle> = {
  "ln#": "lane",
  "ln #": "lane",
  lane: "lane",
  run: "run",
  "run#": "run",
  "run #": "run",
  yr: "year",
  year: "year",
  make: "make",
  "model/trim": "model",
  model: "model",
  miles: "miles",
  mileage: "miles",
  grade: "cr",
  cr: "cr",
  condition: "cr",
  mmr: "mmr",
  lights: "flag",
  flag: "flag",
  color: "color",
  vin: "vin",
};

export interface ImportResult {
  date: string | null;
  vehicles: Vehicle[];
  sheetName: string;
}

function normalizeHeader(h: unknown): string {
  return String(h ?? "").trim().toLowerCase();
}

function normNum(v: unknown): string | number {
  if (v === "" || v === undefined || v === null) return "";
  const n = Number(v);
  return Number.isNaN(n) ? String(v).trim() : n;
}

function findHeaderRow(rows: unknown[][]): number {
  const scanLimit = Math.min(rows.length, 15);
  for (let i = 0; i < scanLimit; i++) {
    const row = (rows[i] || []).map(normalizeHeader);
    const hasVin = row.includes("vin");
    const hasMakeOrModel = row.includes("make") || row.includes("model/trim") || row.includes("model");
    if (hasVin && hasMakeOrModel) return i;
  }
  return -1;
}

// Looks for something like "July 8th, 2026" in the rows above the header
// and converts it to a "YYYY-MM-DD" string.
function extractDate(rows: unknown[][], headerRowIdx: number): string | null {
  const dateRegex = /([A-Za-z]+)\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(\d{4})/;
  for (let i = 0; i < headerRowIdx; i++) {
    const text = (rows[i] || []).map((c) => String(c ?? "")).join(" ");
    const match = text.match(dateRegex);
    if (match) {
      const [, monthName, day, year] = match;
      const d = new Date(`${monthName} ${day}, ${year}`);
      if (!Number.isNaN(d.getTime())) return toDateStr(d);
    }
  }
  return null;
}

export function parseRunListWorkbook(buffer: ArrayBuffer): ImportResult {
  const wb = XLSX.read(buffer, { type: "array" });
  const sheetName = wb.SheetNames.find((n) => /run\s*list/i.test(n)) || wb.SheetNames[0];
  const sheet = wb.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" }) as unknown[][];

  const headerRowIdx = findHeaderRow(rows);
  if (headerRowIdx === -1) {
    throw new Error("Couldn't find a header row with VIN/Make/Model columns in this file.");
  }

  const headers = (rows[headerRowIdx] || []).map(normalizeHeader);
  const colMap: Partial<Record<keyof Vehicle, number>> = {};
  headers.forEach((h, idx) => {
    const field = HEADER_MAP[h];
    if (field && colMap[field] === undefined) colMap[field] = idx;
  });
  if (colMap.vin === undefined) {
    throw new Error("Couldn't find a VIN column in this file.");
  }

  const date = extractDate(rows, headerRowIdx);

  const vehicles: Vehicle[] = [];
  for (let i = headerRowIdx + 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.every((c) => c === "" || c === undefined || c === null)) continue;

    const get = (field: keyof Vehicle) => {
      const idx = colMap[field];
      return idx === undefined ? "" : row[idx];
    };

    const vin = String(get("vin") ?? "").trim();
    const make = String(get("make") ?? "").trim();
    const model = String(get("model") ?? "").trim();
    if (!vin && !make && !model) continue; // skip blank / stray rows

    vehicles.push({
      id: makeId("v"),
      lane: normNum(get("lane")),
      run: normNum(get("run")),
      year: normNum(get("year")),
      make,
      model,
      miles: normNum(get("miles")),
      cr: normNum(get("cr")),
      mmr: normNum(get("mmr")),
      flag: String(get("flag") ?? "").trim(),
      color: String(get("color") ?? "").trim(),
      vin,
      cf: "",
      bb: "",
      ret: "",
      sell: "",
      buy: "",
      bought: false,
      boughtPrice: "",
    });
  }

  return { date, vehicles, sheetName };
}

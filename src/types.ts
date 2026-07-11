export type PurchaseStatus = "not_purchased" | "bought" | "bought_if";

export interface Vehicle {
  id: string;
  lane: string | number;
  run: string | number;
  year: string | number;
  make: string;
  model: string;
  miles: string | number;
  cr: string | number;
  mmr: string | number;
  flag: string;
  color: string;
  vin: string;
  // Notes fields
  cf: string;
  bb: string;
  ret: string;
  buy: string;
  // Auction / purchase tracking
  wentDownLine: boolean;
  finalBidPrice: string;
  purchaseStatus: PurchaseStatus;
}

export interface DayEntry {
  date: string; // "YYYY-MM-DD"
  vehicles: Vehicle[];
}

export type SortKey = "lane" | "run" | "year" | "make" | "miles" | "cr" | "mmr" | "color";
export type SortDir = "asc" | "desc";
export type ViewMode = "lane" | "all";
export type CrTone = "low" | "mid" | "high" | "neutral";

export interface AppState {
  days: DayEntry[];
  activeDate: string;
}
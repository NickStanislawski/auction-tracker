import { Upload } from "lucide-react";
import { useRef, useState } from "react";
import type { Vehicle } from "../types";
import { parseRunListWorkbook } from "../utils/importRunList";

interface ImportButtonProps {
  onImport: (date: string | null, vehicles: Vehicle[]) => void;
}

export default function ImportButton({ onImport }: ImportButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setBusy(true);
    setError(null);
    try {
      const buffer = await file.arrayBuffer();
      const { date, vehicles } = parseRunListWorkbook(buffer);
      if (!vehicles.length) {
        setError("No vehicle rows found in that file.");
        return;
      }
      onImport(date, vehicles);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't read that file.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div style={{ position: "relative" }}>
      <button className="gaa-chip" disabled={busy} onClick={() => inputRef.current?.click()}>
        <Upload size={14} /> {busy ? "Importing…" : "Import Excel"}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept=".xls,.xlsx,.csv"
        style={{ display: "none" }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
      {error && (
        <div style={{ color: "#dc2626", fontSize: 12, marginTop: 4, maxWidth: 220 }}>{error}</div>
      )}
    </div>
  );
}

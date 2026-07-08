import type { LucideIcon } from "lucide-react";

interface EditFieldProps {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  className?: string;
}

export function EditField({ label, value, onChange, className = "" }: EditFieldProps) {
  return (
    <div className={className}>
      <span className="edit-field-label">{label}</span>
      <input className="edit-field-input" value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

interface StatProps {
  icon?: LucideIcon | null;
  label: string;
  value: string | number;
  tone?: string;
  className?: string;
}

export function Stat({ icon: Icon, label, value, tone, className = "" }: StatProps) {
  return (
    <div className={`stat-box ${className}`}>
      <div className="stat-label">
        {Icon && <Icon size={12} />}
        {label}
      </div>
      <div className={`stat-value ${tone ? `tone-${tone}` : ""}`}>{value}</div>
    </div>
  );
}

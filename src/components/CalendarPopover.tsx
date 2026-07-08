import { ChevronLeft, ChevronRight } from "lucide-react";
import { buildMonthGrid, monthLabel, toDateStr, WEEKDAYS } from "../utils/date";

interface CalendarPopoverProps {
  viewDate: Date;
  activeDate: string;
  datesWithData: Set<string>;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onSelectDate: (date: string) => void;
  onClose: () => void;
  onJumpToToday: () => void;
}

export default function CalendarPopover({
  viewDate,
  activeDate,
  datesWithData,
  onPrevMonth,
  onNextMonth,
  onSelectDate,
  onClose,
  onJumpToToday,
}: CalendarPopoverProps) {
  return (
    <>
      <div className="calendar-scrim" onClick={onClose} />
      <div className="calendar-pop">
        <div className="cal-head">
          <button onClick={onPrevMonth}>
            <ChevronLeft size={14} />
          </button>
          <span className="cal-month">{monthLabel(viewDate)}</span>
          <button onClick={onNextMonth}>
            <ChevronRight size={14} />
          </button>
        </div>
        <div className="cal-weekdays">
          {WEEKDAYS.map((w) => (
            <span key={w}>{w}</span>
          ))}
        </div>
        <div className="cal-grid">
          {buildMonthGrid(viewDate.getFullYear(), viewDate.getMonth()).map((cellDate, i) => {
            if (!cellDate) return <div key={i} className="cal-cell empty" />;
            const ds = toDateStr(cellDate);
            const hasData = datesWithData.has(ds);
            const isActive = ds === activeDate;
            return (
              <div key={ds} className={`cal-cell ${isActive ? "active" : ""}`} onClick={() => onSelectDate(ds)}>
                {cellDate.getDate()}
                {hasData && <span className="dot" />}
              </div>
            );
          })}
        </div>
        <button className="cal-today-btn" onClick={onJumpToToday}>
          Jump to today
        </button>
      </div>
    </>
  );
}

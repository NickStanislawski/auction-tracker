import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { formatLabel, toDateStr } from "../utils/date";
import CalendarPopover from "./CalendarPopover";

interface DateNavProps {
  activeDate: string;
  prevDataDate: string | null;
  nextDataDate: string | null;
  datesWithData: Set<string>;
  calendarViewDate: Date;
  setCalendarViewDate: (d: Date) => void;
  onSwitchDate: (date: string) => void;
}

export default function DateNav({
  activeDate,
  prevDataDate,
  nextDataDate,
  datesWithData,
  calendarViewDate,
  setCalendarViewDate,
  onSwitchDate,
}: DateNavProps) {
  const [calendarOpen, setCalendarOpen] = useState(false);

  const closeCalendar = () => setCalendarOpen(false);

  const selectDate = (ds: string) => {
    onSwitchDate(ds);
    setCalendarOpen(false);
  };

  return (
    <div className="date-nav">
      <button
        className="date-step"
        disabled={!prevDataDate}
        onClick={() => prevDataDate && onSwitchDate(prevDataDate)}
        title={prevDataDate ? `Previous auction: ${formatLabel(prevDataDate)}` : "No earlier auction data"}
      >
        <ChevronLeft size={16} />
      </button>
      <button className="date-label-btn" onClick={() => setCalendarOpen((o) => !o)}>
        <CalendarDays size={15} />
        {formatLabel(activeDate)}
        <ChevronDown size={14} />
      </button>
      <button
        className="date-step"
        disabled={!nextDataDate}
        onClick={() => nextDataDate && onSwitchDate(nextDataDate)}
        title={nextDataDate ? `Next auction: ${formatLabel(nextDataDate)}` : "No later auction data"}
      >
        <ChevronRight size={16} />
      </button>

      {calendarOpen && (
        <CalendarPopover
          viewDate={calendarViewDate}
          activeDate={activeDate}
          datesWithData={datesWithData}
          onPrevMonth={() => setCalendarViewDate(new Date(calendarViewDate.getFullYear(), calendarViewDate.getMonth() - 1, 1))}
          onNextMonth={() => setCalendarViewDate(new Date(calendarViewDate.getFullYear(), calendarViewDate.getMonth() + 1, 1))}
          onSelectDate={selectDate}
          onClose={closeCalendar}
          onJumpToToday={() => selectDate(toDateStr(new Date()))}
        />
      )}
    </div>
  );
}

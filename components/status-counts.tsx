import type { CalendarStatus } from "@/app/app/calendar/actions";
import { Badge } from "@/components/ui/badge";
import { CALENDAR_STATUS_ORDER, CALENDAR_STATUS_UI } from "@/lib/calendar-status";
import { cn } from "@/lib/utils";

type Props = {
  counts: Partial<Record<CalendarStatus, number>> | Map<string, number>;
  className?: string;
};

/** Day-status counters with full Ukrainian labels and the same colours as the calendar. */
export function StatusCounts({ counts, className }: Props) {
  const get = (s: CalendarStatus) => (counts instanceof Map ? counts.get(s) : counts[s]) ?? 0;
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {CALENDAR_STATUS_ORDER.map((status) => (
        <Badge key={status} className={CALENDAR_STATUS_UI[status].pickerClassName}>
          {CALENDAR_STATUS_UI[status].label}
          <span className="tabular-nums">{get(status)}</span>
        </Badge>
      ))}
    </div>
  );
}

import type { CalendarStatus } from "@/app/app/calendar/actions";

export const CALENDAR_STATUS_UI: Record<
  CalendarStatus,
  {
    label: string;
    short: string;
    hint?: string;
    cellClassName: string;
    pickerClassName: string;
  }
> = {
  TRAINING: {
    label: "Тренування",
    short: "Т",
    cellClassName: "border-primary bg-primary text-primary-foreground",
    pickerClassName: "bg-primary text-primary-foreground",
  },
  STRETCHING: {
    label: "Розтяжка",
    short: "Р",
    hint: "Легка активність/мобільність",
    cellClassName: "border-accent bg-accent text-accent-foreground",
    pickerClassName: "bg-accent text-accent-foreground",
  },
  REST: {
    label: "Відпочинок",
    short: "В",
    cellClassName: "border-secondary bg-secondary text-secondary-foreground",
    pickerClassName: "bg-secondary text-secondary-foreground",
  },
  SICK: {
    label: "Хвороба",
    short: "Х",
    cellClassName: "border-destructive bg-destructive text-primary-foreground",
    pickerClassName: "bg-destructive text-primary-foreground",
  },
};

export const CALENDAR_STATUS_ORDER: CalendarStatus[] = ["TRAINING", "STRETCHING", "REST", "SICK"];

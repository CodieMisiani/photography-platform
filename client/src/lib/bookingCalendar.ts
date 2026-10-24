export type CalendarMonth = {
  year: number;
  month: number;
};

export type CalendarDay = {
  date: string;
  day: number;
};

export function getNairobiToday(now: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Nairobi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((item) => item.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}`;
}

export function getCalendarMonth(date: string): CalendarMonth {
  const [year, month] = date.split("-").map(Number);
  return { year, month: month - 1 };
}

export function getMonthStart(month: CalendarMonth): string {
  return formatDate(month.year, month.month + 1, 1);
}

export function getMonthEnd(month: CalendarMonth): string {
  const lastDay = new Date(Date.UTC(month.year, month.month + 1, 0)).getUTCDate();
  return formatDate(month.year, month.month + 1, lastDay);
}

export function getMonthGridDays(month: CalendarMonth): Array<CalendarDay | null> {
  const firstWeekday = new Date(Date.UTC(month.year, month.month, 1)).getUTCDay();
  const lastDay = new Date(Date.UTC(month.year, month.month + 1, 0)).getUTCDate();
  const days: Array<CalendarDay | null> = Array.from({ length: firstWeekday }, () => null);
  for (let day = 1; day <= lastDay; day += 1) {
    days.push({ date: formatDate(month.year, month.month + 1, day), day });
  }
  return days;
}

export function previousMonth(month: CalendarMonth): CalendarMonth {
  const date = new Date(Date.UTC(month.year, month.month - 1, 1));
  return { year: date.getUTCFullYear(), month: date.getUTCMonth() };
}

export function nextMonth(month: CalendarMonth): CalendarMonth {
  const date = new Date(Date.UTC(month.year, month.month + 1, 1));
  return { year: date.getUTCFullYear(), month: date.getUTCMonth() };
}

export function formatFullDate(date: string): string {
  const [year, month, day] = date.split("-").map(Number);
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "UTC",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

export function formatMonthLabel(month: CalendarMonth): string {
  return new Intl.DateTimeFormat("en", {
    timeZone: "UTC",
    month: "long",
    year: "numeric",
  }).format(new Date(Date.UTC(month.year, month.month, 1)));
}

function formatDate(year: number, month: number, day: number): string {
  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

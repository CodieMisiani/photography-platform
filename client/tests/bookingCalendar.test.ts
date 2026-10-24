import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  formatFullDate,
  getCalendarMonth,
  getMonthEnd,
  getMonthGridDays,
  getMonthStart,
  getNairobiToday,
  nextMonth,
  previousMonth,
} from "../src/lib/bookingCalendar.ts";

describe("booking calendar date-only helpers", () => {
  it("uses Nairobi's date even when UTC is still the previous day", () => {
    assert.equal(getNairobiToday(new Date("2026-03-13T22:30:00.000Z")), "2026-03-14");
  });

  it("returns date-only boundaries, including leap February", () => {
    const february = { year: 2028, month: 1 };
    assert.equal(getMonthStart(february), "2028-02-01");
    assert.equal(getMonthEnd(february), "2028-02-29");
    assert.equal(getMonthGridDays(february).filter(Boolean).length, 29);
  });

  it("navigates across the December to January year boundary", () => {
    const december = getCalendarMonth("2026-12-14");
    assert.deepEqual(nextMonth(december), { year: 2027, month: 0 });
    assert.deepEqual(previousMonth({ year: 2027, month: 0 }), december);
  });

  it("pads the first week with the correct Sunday-first weekday count", () => {
    const days = getMonthGridDays({ year: 2026, month: 3 });
    assert.equal(days[0], null);
    assert.equal(days[1], null);
    assert.equal(days[2], null);
    assert.deepEqual(days[3], { date: "2026-04-01", day: 1 });
  });

  it("formats a full, stable date label", () => {
    assert.equal(formatFullDate("2026-03-14"), "Saturday, 14 March 2026");
  });

  it("returns identical values under distinct process time zones", () => {
    const originalTimezone = process.env.TZ;
    try {
      process.env.TZ = "America/Los_Angeles";
      const losAngeles = {
        today: getNairobiToday(new Date("2026-03-13T22:30:00.000Z")),
        grid: getMonthGridDays({ year: 2026, month: 2 }),
        label: formatFullDate("2026-03-14"),
      };
      process.env.TZ = "Pacific/Auckland";
      const auckland = {
        today: getNairobiToday(new Date("2026-03-13T22:30:00.000Z")),
        grid: getMonthGridDays({ year: 2026, month: 2 }),
        label: formatFullDate("2026-03-14"),
      };
      assert.deepEqual(auckland, losAngeles);
    } finally {
      if (originalTimezone === undefined) delete process.env.TZ;
      else process.env.TZ = originalTimezone;
    }
  });
});

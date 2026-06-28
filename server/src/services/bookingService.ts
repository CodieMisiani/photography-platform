import type { BookingRow, BookingStatus, CalendarBlockRow } from "../types/domain.js";
import { db } from "../db/knex.js";
import { AppError } from "../utils/AppError.js";

export async function createBooking(payload: Omit<BookingRow, "id" | "status">) {
  const [created] = await db<BookingRow>("bookings")
    .insert({ ...payload, status: "pending" })
    .returning("*");
  return created;
}

export async function listBookings() {
  return db<BookingRow>("bookings").select("*").orderBy("event_date", "asc");
}

export async function updateBookingStatus(id: string, status: BookingStatus) {
  const [updated] = await db<BookingRow>("bookings").where({ id }).update({ status }).returning("*");
  if (!updated) {
    throw new AppError(404, "Booking not found", "BOOKING_NOT_FOUND");
  }
  return updated;
}

export async function listAvailability(from?: string, to?: string) {
  const blocksQuery = db<CalendarBlockRow>("calendar_blocks").select("blocked_date", "reason");
  const bookingsQuery = db<BookingRow>("bookings")
    .select("event_date")
    .where({ status: "confirmed" });

  if (from) {
    blocksQuery.where("blocked_date", ">=", from);
    bookingsQuery.where("event_date", ">=", from);
  }
  if (to) {
    blocksQuery.where("blocked_date", "<=", to);
    bookingsQuery.where("event_date", "<=", to);
  }

  const [blocks, confirmedBookings] = await Promise.all([blocksQuery, bookingsQuery]);

  return {
    unavailable_dates: [
      ...blocks.map((block) => ({
        date: block.blocked_date,
        reason: block.reason,
        source: "calendar_block" as const,
      })),
      ...confirmedBookings.map((booking) => ({
        date: booking.event_date,
        reason: "Confirmed booking",
        source: "booking" as const,
      })),
    ],
  };
}

export async function createCalendarBlock(payload: Omit<CalendarBlockRow, "id">) {
  const [created] = await db<CalendarBlockRow>("calendar_blocks").insert(payload).returning("*");
  return created;
}

export async function deleteCalendarBlock(id: string) {
  const deleted = await db<CalendarBlockRow>("calendar_blocks").where({ id }).delete();
  if (!deleted) {
    throw new AppError(404, "Calendar block not found", "CALENDAR_BLOCK_NOT_FOUND");
  }
}

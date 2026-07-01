import type { Request, Response } from "express";
import {
  createBooking,
  createCalendarBlock,
  deleteCalendarBlock,
  listAvailability,
  listBookings,
  listCalendarBlocks,
  updateBooking,
  updateBookingStatus,
} from "../services/bookingService.js";

export async function createPublicBooking(req: Request, res: Response) {
  res.status(201).json({ booking: await createBooking(req.body) });
}

export async function listAdminBookings(_req: Request, res: Response) {
  res.status(200).json({ bookings: await listBookings() });
}

export async function patchBookingStatus(req: Request, res: Response) {
  res.status(200).json({
    booking: await updateBookingStatus(String(req.params.id), req.body.status),
  });
}

export async function patchBooking(req: Request, res: Response) {
  res.status(200).json({
    booking: await updateBooking(String(req.params.id), req.body),
  });
}

export async function getAvailability(req: Request, res: Response) {
  res.status(200).json(await listAvailability(req.query.from as string, req.query.to as string));
}

export async function createBlock(req: Request, res: Response) {
  res.status(201).json({ block: await createCalendarBlock(req.body) });
}

export async function listBlocks(_req: Request, res: Response) {
  res.status(200).json({ blocks: await listCalendarBlocks() });
}

export async function removeBlock(req: Request, res: Response) {
  await deleteCalendarBlock(String(req.params.id));
  res.status(204).send();
}

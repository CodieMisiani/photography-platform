import type { Request, Response } from "express";
import {
  createQuoteRequest,
  listQuoteRequests,
  updateQuoteRequest,
  updateQuoteStatus,
} from "../services/quoteService.js";

export async function createPublicQuote(req: Request, res: Response) {
  res.status(201).json({ quote: await createQuoteRequest(req.body) });
}

export async function listAdminQuotes(_req: Request, res: Response) {
  res.status(200).json({ quotes: await listQuoteRequests() });
}

export async function patchQuoteStatus(req: Request, res: Response) {
  res.status(200).json({
    quote: await updateQuoteStatus(String(req.params.id), req.body.status),
  });
}

export async function patchQuote(req: Request, res: Response) {
  res.status(200).json({
    quote: await updateQuoteRequest(String(req.params.id), req.body),
  });
}

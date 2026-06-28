import type { Request, Response } from "express";
import {
  applyDarajaCallback,
  createInvoice,
  findInvoiceByNumber,
  getInvoiceStatus,
  listInvoices,
  startInvoicePayment,
} from "../services/invoiceService.js";

export async function listAdminInvoices(_req: Request, res: Response) {
  res.status(200).json({ invoices: await listInvoices() });
}

export async function createAdminInvoice(req: Request, res: Response) {
  res.status(201).json({ invoice: await createInvoice(req.body) });
}

export async function lookupInvoice(req: Request, res: Response) {
  res.status(200).json({ invoice: await findInvoiceByNumber(String(req.params.invoiceNo)) });
}

export async function payInvoice(req: Request, res: Response) {
  res.status(202).json(await startInvoicePayment(String(req.params.id), req.body.phone));
}

export async function invoiceStatus(req: Request, res: Response) {
  res.status(200).json(await getInvoiceStatus(String(req.params.id)));
}

export async function darajaWebhook(req: Request, res: Response) {
  await applyDarajaCallback(req.body);
  res.status(200).json({ ok: true });
}

import type { Request, Response } from "express";
import {
  applyDarajaCallback,
  createInvoice,
  deleteInvoice,
  findInvoiceByNumber,
  getInvoiceStatus,
  findInvoiceById,
  listInvoices,
  startInvoicePayment,
  updateInvoice,
} from "../services/invoiceService.js";
import { notificationService } from "../services/notifications/NotificationService.js";
import { generateInvoicePdf, invoicePdfFilename } from "../services/invoicePdfService.js";
import { AppError } from "../utils/AppError.js";

export async function listAdminInvoices(_req: Request, res: Response) {
  res.status(200).json({ invoices: await listInvoices() });
}

export async function createAdminInvoice(req: Request, res: Response) {
  res.status(201).json({ invoice: await createInvoice(req.body) });
}

export async function patchAdminInvoice(req: Request, res: Response) {
  res.status(200).json({ invoice: await updateInvoice(String(req.params.id), req.body) });
}

export async function removeAdminInvoice(req: Request, res: Response) {
  await deleteInvoice(String(req.params.id));
  res.status(204).send();
}

export async function exportAdminInvoicePdf(req: Request, res: Response) {
  const invoice = await findInvoiceById(String(req.params.id));
  try {
    const pdf = await generateInvoicePdf(invoice);
    res
      .status(200)
      .set({
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${invoicePdfFilename(invoice.invoice_no)}"`,
        "Content-Length": String(pdf.length),
        "Cache-Control": "private, no-store",
      })
      .send(pdf);
  } catch (error) {
    console.error("[invoices] PDF export failed", error);
    throw new AppError(500, "Could not generate invoice PDF", "INVOICE_PDF_GENERATION_FAILED");
  }
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
  const invoice = await applyDarajaCallback(req.body);
  if (invoice.status === "paid") notificationService.sendInvoicePaidConfirmation(invoice).catch((error: unknown) => console.error("[notifications] Payment confirmation failed", error));
  res.status(200).json({ ok: true });
}

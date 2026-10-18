import PDFDocument from "pdfkit";
import type { InvoiceLineItemRow, InvoiceRow } from "../types/domain.js";

type InvoiceForPdf = InvoiceRow & { line_items: InvoiceLineItemRow[] };

const margin = 48;
const pageBottom = 780;
const money = new Intl.NumberFormat("en-KE", {
  style: "currency",
  currency: "KES",
  maximumFractionDigits: 0,
});

export async function generateInvoicePdf(invoice: InvoiceForPdf) {
  const document = new PDFDocument({ size: "A4", margin, info: { Title: `Invoice ${invoice.invoice_no}`, Author: "Malume Photography" } });
  const chunks: Buffer[] = [];

  document.on("data", (chunk: Buffer) => chunks.push(chunk));
  const completed = new Promise<Buffer>((resolve, reject) => {
    document.on("end", () => resolve(Buffer.concat(chunks)));
    document.on("error", reject);
  });

  drawPageFrame(document, invoice.invoice_no);
  drawInvoiceHeader(document, invoice);
  drawLineItems(document, invoice.line_items, invoice.invoice_no);
  drawInvoiceSummary(document, invoice);
  document.end();

  return completed;
}

export function invoicePdfFilename(invoiceNo: string) {
  const safeInvoiceNo = invoiceNo.replace(/[^A-Za-z0-9_-]/g, "_").slice(0, 80) || "invoice";
  return `${safeInvoiceNo}.pdf`;
}

function drawPageFrame(document: PDFKit.PDFDocument, invoiceNo: string) {
  const { width, height } = document.page;
  const contentY = document.y;
  document.save();
  document.strokeColor("#D8D4CE").lineWidth(0.5).moveTo(margin, 64).lineTo(width - margin, 64).stroke();
  document.font("Helvetica").fontSize(8).fillColor("#716D68");
  document.text(`Invoice ${printable(invoiceNo)}`, margin, height - margin - 12, { width: width - margin * 2, align: "right" });
  document.restore();
  document.y = contentY;
}

function drawInvoiceHeader(document: PDFKit.PDFDocument, invoice: InvoiceForPdf) {
  document.font("Helvetica-Bold").fontSize(20).fillColor("#171514").text("MALUME PHOTOGRAPHY", margin, 84);
  document.font("Helvetica").fontSize(9).fillColor("#716D68").text("INVOICE", margin, 112, { characterSpacing: 2 });

  document.font("Helvetica-Bold").fontSize(12).fillColor("#171514").text(printable(invoice.invoice_no), 330, 86, { width: 217, align: "right" });
  document.font("Helvetica").fontSize(9).fillColor("#716D68").text(`Status: ${statusLabel(invoice.status)}`, 330, 108, { width: 217, align: "right" });

  document.moveDown(4);
  document.font("Helvetica-Bold").fontSize(9).fillColor("#716D68").text("BILLED TO");
  document.font("Helvetica-Bold").fontSize(13).fillColor("#171514").text(printable(invoice.client_name), { width: 300 });
  document.font("Helvetica").fontSize(10).fillColor("#45413D").text(printable(invoice.phone), { width: 300 });
  document.moveDown(2);
}

function drawLineItems(document: PDFKit.PDFDocument, lineItems: InvoiceLineItemRow[], invoiceNo: string) {
  const columns = { description: margin, quantity: 340, unitPrice: 408, total: 490 };
  const widths = { description: 282, quantity: 52, unitPrice: 75, total: 57 };
  let tableHeaderNeeded = true;

  for (const item of lineItems) {
    if (tableHeaderNeeded) {
      drawTableHeader(document, columns, widths);
      tableHeaderNeeded = false;
    }

    const description = printable(item.description);
    document.font("Helvetica").fontSize(9);
    const rowHeight = Math.max(28, document.heightOfString(description, { width: widths.description - 8, lineGap: 2 }) + 14);
    if (document.y + rowHeight > pageBottom) {
      document.addPage();
      drawPageFrame(document, invoiceNo);
      document.y = 84;
      tableHeaderNeeded = true;
      drawTableHeader(document, columns, widths);
      tableHeaderNeeded = false;
    }

    const rowY = document.y;
    const unitPrice = Number(item.unit_price);
    document.fillColor("#171514").text(description, columns.description, rowY + 7, { width: widths.description - 8, lineGap: 2 });
    document.text(String(item.quantity), columns.quantity, rowY + 7, { width: widths.quantity, align: "right" });
    document.text(formatMoney(unitPrice), columns.unitPrice, rowY + 7, { width: widths.unitPrice, align: "right" });
    document.text(formatMoney(item.quantity * unitPrice), columns.total, rowY + 7, { width: widths.total, align: "right" });
    document.strokeColor("#E4E0DB").lineWidth(0.5).moveTo(margin, rowY + rowHeight).lineTo(547, rowY + rowHeight).stroke();
    document.y = rowY + rowHeight + 4;
  }

  if (lineItems.length === 0) {
    drawTableHeader(document, columns, widths);
    document.font("Helvetica").fontSize(9).fillColor("#716D68").text("No itemized lines were recorded for this invoice.", margin, document.y + 10);
    document.moveDown(3);
  }
}

function drawTableHeader(document: PDFKit.PDFDocument, columns: Record<string, number>, widths: Record<string, number>) {
  if (document.y + 28 > pageBottom) {
    document.addPage();
    drawPageFrame(document, "");
    document.y = 84;
  }
  const y = document.y;
  document.rect(margin, y, 499, 24).fill("#F0EDE8");
  document.font("Helvetica-Bold").fontSize(8).fillColor("#45413D");
  document.text("DESCRIPTION", columns.description + 6, y + 8, { width: widths.description - 8 });
  document.text("QTY", columns.quantity, y + 8, { width: widths.quantity, align: "right" });
  document.text("UNIT PRICE", columns.unitPrice, y + 8, { width: widths.unitPrice, align: "right" });
  document.text("TOTAL", columns.total, y + 8, { width: widths.total, align: "right" });
  document.y = y + 30;
}

function drawInvoiceSummary(document: PDFKit.PDFDocument, invoice: InvoiceForPdf) {
  const requiredHeight = invoice.mpesa_ref || invoice.paid_at ? 130 : 86;
  if (document.y + requiredHeight > pageBottom) {
    document.addPage();
    drawPageFrame(document, invoice.invoice_no);
    document.y = 84;
  }

  const y = document.y + 10;
  document.strokeColor("#171514").lineWidth(1).moveTo(330, y).lineTo(547, y).stroke();
  document.font("Helvetica-Bold").fontSize(10).fillColor("#171514").text("INVOICE TOTAL", 330, y + 14);
  document.font("Helvetica-Bold").fontSize(15).text(formatMoney(Number(invoice.amount)), 330, y + 29, { width: 217, align: "right" });
  document.font("Helvetica").fontSize(9).fillColor("#45413D").text(`Payment status: ${statusLabel(invoice.status)}`, 330, y + 55, { width: 217, align: "right" });

  if (invoice.mpesa_ref) {
    document.text(`M-Pesa reference: ${printable(invoice.mpesa_ref)}`, margin, y + 18, { width: 260 });
  }
  if (invoice.paid_at) {
    document.text(`Paid: ${formatDate(invoice.paid_at)}`, margin, y + 36, { width: 260 });
  }
}

function formatMoney(value: number) {
  return money.format(Number.isFinite(value) ? value : 0);
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : new Intl.DateTimeFormat("en-KE", { day: "2-digit", month: "short", year: "numeric" }).format(date);
}

function statusLabel(status: InvoiceRow["status"]) {
  return status.slice(0, 1).toUpperCase() + status.slice(1);
}

function printable(value: string) {
  return value.normalize("NFKC").replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, " ");
}

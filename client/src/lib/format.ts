/**
 * Formatting utilities for Kenya localization.
 *
 * - `formatKES` formats whole shilling amounts with `KSh` prefix and comma thousands.
 * - `formatDate` formats a Date or ISO string as `DD/MM/YYYY` in Africa/Nairobi timezone.
 * - `formatPhone` normalises phone numbers to E.164 display `+254 7XX XXX XXX`.
 */

export function formatKES(amount: number): string {
  const rounded = Math.round(amount);
  return `KSh ${rounded.toLocaleString("en-KE")}`;
}

export function formatDate(input: string | Date): string {
  const d = typeof input === "string" ? new Date(input) : input;
  // Use en-GB to get day-first formatting and Africa/Nairobi timezone
  try {
    return d.toLocaleDateString("en-GB", { timeZone: "Africa/Nairobi" });
  } catch (err) {
    // Fallback to manual formatting
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }
}

export function formatPhone(raw: string): string {
  // Remove non-digit characters
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("254") && digits.length === 12) {
    // +2547XXXXXXXX -> +254 7XX XXX XXX
    const parts = [
      digits.slice(0, 3),
      digits.slice(3, 6),
      digits.slice(6, 9),
      digits.slice(9),
    ];
    return `+${parts[0]} ${parts[1]} ${parts[2]} ${parts[3]}`.trim();
  }
  if (digits.startsWith("0") && digits.length === 10) {
    // 07XXXXXXXX -> +254 7XX XXX XXX
    const local = digits.slice(1);
    const parts = ["254", local.slice(0, 3), local.slice(3, 6), local.slice(6)];
    return `+${parts[0]} ${parts[1]} ${parts[2]} ${parts[3]}`.trim();
  }
  if (digits.startsWith("7") && digits.length === 9) {
    const parts = [
      "254",
      digits.slice(0, 3),
      digits.slice(3, 6),
      digits.slice(6),
    ];
    return `+${parts[0]} ${parts[1]} ${parts[2]} ${parts[3]}`.trim();
  }
  // Fallback: return original input
  return raw;
}

export default { formatKES, formatDate, formatPhone };

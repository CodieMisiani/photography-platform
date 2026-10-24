export function isValidImageUrl(value: string): boolean {
  if (typeof value !== "string" || value.length > 2000) return false;
  const trimmed = value.trim();
  if (!trimmed) return false;

  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

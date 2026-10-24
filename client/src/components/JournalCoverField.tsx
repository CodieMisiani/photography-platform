import { isValidImageUrl } from "../lib/imageUrl";

type JournalCoverFieldProps = {
  id: string;
  label: string;
  mode: "upload" | "url";
  file: File | null;
  url: string;
  error?: string;
  onModeChange: (mode: "upload" | "url") => void;
  onFileChange: (file: File | null) => void;
  onUrlChange: (url: string) => void;
};

export default function JournalCoverField({
  id,
  label,
  mode,
  file,
  url,
  error,
  onModeChange,
  onFileChange,
  onUrlChange,
}: JournalCoverFieldProps) {
  const inputId = `${id}-input`;
  const errorId = `${id}-error`;
  const displayError = error || (url.trim() && !isValidImageUrl(url)
    ? "Cover URL must be a valid http or https image URL."
    : "");

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <label
          className="block text-[0.7rem] font-semibold uppercase tracking-[0.25em] text-grey"
          htmlFor={inputId}
        >
          {label}
        </label>
        <button
          type="button"
          aria-pressed={mode === "url"}
          onClick={() => onModeChange(mode === "url" ? "upload" : "url")}
          className="text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-accent underline"
        >
          {mode === "url" ? "Use upload instead" : "Use a URL instead"}
        </button>
      </div>
      {mode === "upload" ? (
        <input
          id={inputId}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(event) => onFileChange(event.target.files?.[0] ?? null)}
          className="w-full border border-dashed border-ink bg-paper p-8 text-[0.75rem] font-semibold uppercase tracking-[0.2em]"
        />
      ) : (
        <input
          id={inputId}
          type="url"
          value={url}
          onChange={(event) => onUrlChange(event.target.value)}
          aria-invalid={Boolean(displayError)}
          aria-describedby={displayError ? errorId : undefined}
          className="w-full border border-grey-light bg-paper px-4 py-3 text-sm text-text-primary focus:border-accent focus:outline-none"
          placeholder="https://example.com/cover.jpg"
        />
      )}
      {displayError ? (
        <p id={errorId} role="alert" className="mt-2 text-sm text-red-700">
          {displayError}
        </p>
      ) : null}
      {mode === "upload" && file ? (
        <p className="mt-2 text-sm text-grey">{file.name}</p>
      ) : null}
    </div>
  );
}

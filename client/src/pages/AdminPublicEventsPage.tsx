import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import AdminShell from "../components/layout/AdminShell";
import Button from "../components/ui/Button";
import AdminEmptyState from "../components/ui/AdminEmptyState";
import FormField from "../components/ui/FormField";
import StatusText from "../components/ui/StatusText";
import { api, type ApiPublicEvent } from "../lib/api";

type EventFormState = {
  title: string;
  venue: string;
  event_date: string;
  ticket_url: string;
  image_url: string;
  image_public_id: string | null;
  price: string;
  is_published: boolean;
};

const emptyForm: EventFormState = {
  title: "",
  venue: "",
  event_date: "",
  ticket_url: "",
  image_url: "",
  image_public_id: null,
  price: "0",
  is_published: false,
};

export default function AdminPublicEventsPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState<File | null>(null);
  const localPreviewUrl = useFilePreview(file);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "uploading" | "success" | "error"
  >("idle");
  const [uploadError, setUploadError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const events = useQuery({
    queryKey: ["admin-public-events"],
    queryFn: api.publicEvents.listAdmin,
  });
  const createMutation = useMutation({
    mutationFn: async () => {
      const uploaded = await uploadSelectedEventFile(
        file,
        setUploadStatus,
        setUploadError,
      );
      return api.publicEvents.create(toPayload(form, uploaded));
    },
    onSuccess: async () => {
      setForm(emptyForm);
      setFile(null);
      setUploadStatus("idle");
      await queryClient.invalidateQueries({ queryKey: ["admin-public-events"] });
    },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Omit<ApiPublicEvent, "id">> }) =>
      api.publicEvents.update(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-public-events"] }),
  });
  const deleteMutation = useMutation({
    mutationFn: api.publicEvents.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-public-events"] }),
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    createMutation.mutate();
  }

  return (
    <AdminShell>
      <div className="mx-auto max-w-6xl">
        <header className="mb-12">
          <p className="mb-2 text-[0.75rem] font-semibold uppercase tracking-[0.3em] text-grey">
            Public Programming
          </p>
          <h1 className="font-display text-5xl font-semibold uppercase tracking-[-0.04em]">
            Events
          </h1>
        </header>

        <form className="mb-12 border border-grey-light bg-grey-faint p-8" onSubmit={handleSubmit}>
          <h2 className="mb-8 text-2xl font-display font-semibold uppercase">Create Event</h2>
          <EventFields
            form={form}
            onChange={setForm}
            onFileChange={(nextFile) => {
              setFile(nextFile);
              setUploadStatus("idle");
              setUploadError("");
            }}
            uploadStatus={uploadStatus}
            uploadError={uploadError}
            previewUrl={localPreviewUrl}
          />
          <Button type="submit" disabled={createMutation.isPending} className="mt-8">
            {createMutation.isPending ? "Creating" : "Create Event"}
          </Button>
        </form>

        <section className="border-t border-grey-light">
          {events.isLoading ? <p className="border-b border-grey-light py-8 text-sm text-grey">Loading events</p> : null}
          {!events.isLoading && !events.isError && (events.data?.events ?? []).length === 0 ? (
            <AdminEmptyState
              icon="star"
              title="No events listed"
              message="Add your first public event."
              actionLabel="Add Event"
              onAction={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            />
          ) : null}
          {(events.data?.events ?? []).map((event) => (
            <article key={event.id} className="border-b border-grey-light py-8 transition-colors duration-150 hover:bg-paper-warm">
              {editingId === event.id ? (
                <EditEventPanel
                  event={event}
                  onCancel={() => setEditingId(null)}
                  onSave={async (payload, uploaded) => {
                    await updateMutation.mutateAsync({
                      id: event.id,
                      payload: {
                        ...payload,
                        image_url: uploaded?.url ?? payload.image_url,
                        image_public_id: uploaded?.public_id ?? payload.image_public_id,
                      },
                    });
                    setEditingId(null);
                  }}
                  isSaving={updateMutation.isPending}
                />
              ) : (
                <div className="grid gap-4 md:grid-cols-12 md:items-center">
                  <div className="h-24 bg-grey-faint md:col-span-2">
                    {event.image_url ? (
                      <img src={event.image_url} alt={event.title} className="h-full w-full object-cover grayscale" />
                    ) : null}
                  </div>
                  <div className="md:col-span-4">
                    <h2 className="text-sm font-semibold uppercase tracking-[0.08em]">{event.title}</h2>
                    <p className="text-sm text-grey">{event.venue}</p>
                  </div>
                  <div className="md:col-span-2 text-sm">{event.event_date}</div>
                  <div className="md:col-span-1"><StatusText status={event.is_published ? "Published" : "Draft"} /></div>
                  <div className="flex flex-wrap gap-3 md:col-span-3 md:justify-end">
                    <Button onClick={() => setEditingId(event.id)}>Edit</Button>
                    <Button onClick={() => updateMutation.mutate({ id: event.id, payload: { is_published: !event.is_published } })}>
                      {event.is_published ? "Unpublish" : "Publish"}
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => {
                        if (
                          window.confirm(
                            "Delete this public event permanently? This also removes its Cloudinary image when available.",
                          )
                        ) {
                          deleteMutation.mutate(event.id);
                        }
                      }}
                      disabled={deleteMutation.isPending}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              )}
            </article>
          ))}
        </section>
      </div>
    </AdminShell>
  );
}

function EditEventPanel({
  event,
  onCancel,
  onSave,
  isSaving,
}: {
  event: ApiPublicEvent;
  onCancel: () => void;
  onSave: (
    payload: Omit<ApiPublicEvent, "id">,
    uploaded: UploadedMedia | null,
  ) => Promise<void>;
  isSaving: boolean;
}) {
  const [form, setForm] = useState<EventFormState>({
    title: event.title,
    venue: event.venue,
    event_date: event.event_date.slice(0, 10),
    ticket_url: event.ticket_url ?? "",
    image_url: event.image_url ?? "",
    image_public_id: event.image_public_id,
    price: event.price,
    is_published: event.is_published,
  });
  const [file, setFile] = useState<File | null>(null);
  const localPreviewUrl = useFilePreview(file);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "uploading" | "success" | "error"
  >("idle");
  const [uploadError, setUploadError] = useState("");

  async function handleSubmit(submitEvent: FormEvent<HTMLFormElement>) {
    submitEvent.preventDefault();
    const uploaded = await uploadSelectedEventFile(
      file,
      setUploadStatus,
      setUploadError,
    );
    await onSave(toPayload(form, uploaded), uploaded);
  }

  return (
    <form className="border border-grey-light bg-grey-faint p-6" onSubmit={handleSubmit}>
      <EventFields
        form={form}
        onChange={setForm}
        onFileChange={(nextFile) => {
          setFile(nextFile);
          setUploadStatus("idle");
          setUploadError("");
        }}
        uploadStatus={uploadStatus}
        uploadError={uploadError}
        previewUrl={localPreviewUrl}
      />
      <div className="mt-8 flex flex-wrap gap-3">
        <Button type="submit" disabled={isSaving}>{isSaving ? "Saving" : "Save Event"}</Button>
        <Button type="button" variant="neutral" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}

function EventFields({
  form,
  onChange,
  onFileChange,
  uploadStatus,
  uploadError,
  previewUrl,
}: {
  form: EventFormState;
  onChange: (value: EventFormState) => void;
  onFileChange: (file: File | null) => void;
  uploadStatus?: "idle" | "uploading" | "success" | "error";
  uploadError?: string;
  previewUrl?: string;
}) {
  const setField = (field: keyof EventFormState, value: string | boolean) => {
    onChange({ ...form, [field]: value });
  };
  const resolvedPreviewUrl = previewUrl || form.image_url;

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <FormField id="eventTitle" label="Title" required value={form.title} onChange={(event) => setField("title", event.target.value)} />
      <FormField id="venue" label="Venue" required value={form.venue} onChange={(event) => setField("venue", event.target.value)} />
      <FormField id="eventDate" label="Date" type="date" required value={form.event_date} onChange={(event) => setField("event_date", event.target.value)} />
      <FormField id="price" label="Price" type="number" min="0" required value={form.price} onChange={(event) => setField("price", event.target.value)} />
      <div className="md:col-span-2">
        <FormField id="ticketUrl" label="Ticket URL" type="url" value={form.ticket_url} onChange={(event) => setField("ticket_url", event.target.value)} />
      </div>
      <div className="md:col-span-2">
        <FormField id="imageUrl" label="Image URL" type="url" value={form.image_url} onChange={(event) => setField("image_url", event.target.value)} />
      </div>
      <div className="md:col-span-2">
        <label className="mb-3 block text-[0.7rem] font-semibold uppercase tracking-[0.25em] text-grey" htmlFor="eventImage">
          Upload Image
        </label>
        <input
          id="eventImage"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(event) => onFileChange(event.target.files?.[0] ?? null)}
          className="w-full border border-dashed border-ink bg-paper p-8 text-[0.75rem] font-semibold uppercase tracking-[0.2em]"
        />
        {uploadStatus === "uploading" ? <UploadNote message="Uploading image" /> : null}
        {uploadStatus === "success" ? <UploadNote message="Image uploaded successfully" /> : null}
        {uploadStatus === "error" ? (
          <UploadNote message={uploadError || "Image upload failed"} tone="error" />
        ) : null}
        {resolvedPreviewUrl ? (
          <img
            src={resolvedPreviewUrl}
            alt={previewUrl ? "Selected event preview" : "Current event preview"}
            className="mt-4 h-32 w-48 object-cover grayscale"
          />
        ) : null}
      </div>
      <label className="flex items-center gap-3 text-[0.75rem] font-semibold uppercase tracking-[0.2em] text-grey">
        <input type="checkbox" checked={form.is_published} onChange={(event) => setField("is_published", event.target.checked)} />
        Publish now
      </label>
    </div>
  );
}

type UploadedMedia = Awaited<ReturnType<typeof api.publicEvents.upload>>;

function useFilePreview(file: File | null) {
  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : ""), [file]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return previewUrl;
}

function toPayload(
  form: EventFormState,
  uploaded?: UploadedMedia | null,
): Omit<ApiPublicEvent, "id"> {
  return {
    title: form.title,
    venue: form.venue,
    event_date: form.event_date,
    ticket_url: form.ticket_url || null,
    image_url: (uploaded?.url ?? form.image_url) || null,
    image_public_id: uploaded?.public_id ?? form.image_public_id,
    price: Number(form.price).toFixed(2),
    is_published: form.is_published,
  };
}

async function uploadSelectedEventFile(
  file: File | null,
  setStatus: (status: "idle" | "uploading" | "success" | "error") => void,
  setError: (message: string) => void,
) {
  if (!file) {
    return null;
  }

  setStatus("uploading");
  setError("");
  try {
    const uploaded = await api.publicEvents.upload(file);
    setStatus("success");
    return uploaded;
  } catch (error) {
    setStatus("error");
    setError(error instanceof Error ? error.message : "Image upload failed");
    throw error;
  }
}

function UploadNote({
  message,
  tone = "info",
}: {
  message: string;
  tone?: "info" | "error";
}) {
  return (
    <p
      className={`mt-3 text-[0.75rem] font-semibold uppercase tracking-[0.2em] ${
        tone === "error" ? "text-red-700" : "text-grey"
      }`}
    >
      {message}
    </p>
  );
}

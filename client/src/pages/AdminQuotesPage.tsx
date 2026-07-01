import { useState } from "react";
import type { FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import AdminShell from "../components/layout/AdminShell";
import Button from "../components/ui/Button";
import FormField from "../components/ui/FormField";
import StatusText from "../components/ui/StatusText";
import { api, type ApiQuoteRequest } from "../lib/api";

export default function AdminQuotesPage() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const quotes = useQuery({
    queryKey: ["admin-quotes"],
    queryFn: api.quotes.listAdmin,
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Pick<ApiQuoteRequest, "status" | "notes">> }) =>
      api.quotes.update(id, payload),
    onSuccess: async () => {
      setEditingId(null);
      await queryClient.invalidateQueries({ queryKey: ["admin-quotes"] });
    },
  });

  return (
    <AdminShell>
      <div className="mx-auto max-w-6xl">
        <header className="mb-12">
          <p className="mb-2 text-[0.75rem] font-semibold uppercase tracking-[0.3em] text-grey">
            Enquiry Inbox
          </p>
          <h1 className="font-display text-5xl font-semibold uppercase tracking-[-0.04em]">
            Quote Requests
          </h1>
        </header>
        <section className="border-t border-grey-light">
          {quotes.isLoading ? <p className="border-b border-grey-light py-8 text-sm text-grey">Loading quotes</p> : null}
          {quotes.isError ? <p className="border-b border-grey-light py-8 text-sm text-grey">Quotes could not load</p> : null}
          {(quotes.data?.quotes ?? []).map((quote) => (
            <article key={quote.id} className="border-b border-grey-light py-8">
              {editingId === quote.id ? (
                <QuoteEditPanel
                  quote={quote}
                  isSaving={updateMutation.isPending}
                  onCancel={() => setEditingId(null)}
                  onSave={(payload) => updateMutation.mutate({ id: quote.id, payload })}
                />
              ) : (
                <div className="grid gap-5 lg:grid-cols-12">
                  <div className="lg:col-span-3">
                    <h2 className="text-sm font-semibold uppercase tracking-[0.08em]">{quote.client_name}</h2>
                    <p className="text-[0.75rem] uppercase tracking-[0.2em] text-grey">{quote.whatsapp}</p>
                    <p className="text-sm text-grey">{quote.email}</p>
                  </div>
                  <div className="lg:col-span-6">
                    <p className="text-sm leading-7 text-grey">{quote.description}</p>
                    {quote.notes ? (
                      <p className="mt-4 border-l border-ink pl-4 text-sm leading-7 text-ink">
                        {quote.notes}
                      </p>
                    ) : null}
                  </div>
                  <div className="lg:col-span-3 space-y-4">
                    <StatusText status={quote.status} />
                    <Button onClick={() => setEditingId(quote.id)}>Edit Notes</Button>
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

function QuoteEditPanel({
  quote,
  isSaving,
  onSave,
  onCancel,
}: {
  quote: ApiQuoteRequest;
  isSaving: boolean;
  onSave: (payload: Partial<Pick<ApiQuoteRequest, "status" | "notes">>) => void;
  onCancel: () => void;
}) {
  const [status, setStatus] = useState<ApiQuoteRequest["status"]>(quote.status);
  const [notes, setNotes] = useState(quote.notes ?? "");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSave({ status, notes: notes || null });
  }

  return (
    <form className="border border-grey-light bg-grey-faint p-6" onSubmit={handleSubmit}>
      <div className="grid gap-8 md:grid-cols-2">
        <FormField as="select" id={`quote-status-${quote.id}`} label="Status" value={status} onChange={(event) => setStatus(event.target.value as ApiQuoteRequest["status"])}>
          <option value="new">New</option>
          <option value="responded">Responded</option>
          <option value="closed">Closed</option>
        </FormField>
        <div className="md:col-span-2">
          <FormField as="textarea" id={`quote-notes-${quote.id}`} label="Internal Notes" rows={5} value={notes} onChange={(event) => setNotes(event.target.value)} />
        </div>
      </div>
      <div className="mt-8 flex gap-3">
        <Button type="submit" disabled={isSaving}>{isSaving ? "Saving" : "Save Quote"}</Button>
        <Button type="button" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}

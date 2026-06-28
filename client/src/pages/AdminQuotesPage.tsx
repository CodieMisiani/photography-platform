import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import AdminShell from "../components/layout/AdminShell";
import StatusText from "../components/ui/StatusText";
import { api, type ApiQuoteRequest } from "../lib/api";

export default function AdminQuotesPage() {
  const queryClient = useQueryClient();
  const quotes = useQuery({
    queryKey: ["admin-quotes"],
    queryFn: api.quotes.listAdmin,
  });
  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ApiQuoteRequest["status"] }) =>
      api.quotes.updateStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-quotes"] }),
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
            <article key={quote.id} className="grid gap-5 border-b border-grey-light py-8 lg:grid-cols-12">
              <div className="lg:col-span-3">
                <h2 className="text-sm font-semibold uppercase tracking-[0.08em]">{quote.client_name}</h2>
                <p className="text-[0.75rem] uppercase tracking-[0.2em] text-grey">{quote.whatsapp}</p>
                <p className="text-sm text-grey">{quote.email}</p>
              </div>
              <p className="lg:col-span-6 text-sm leading-7 text-grey">{quote.description}</p>
              <div className="lg:col-span-3 space-y-4">
                <StatusText status={quote.status} />
                <select
                  aria-label={`Update quote status for ${quote.client_name}`}
                  value={quote.status}
                  onChange={(event) =>
                    statusMutation.mutate({
                      id: quote.id,
                      status: event.target.value as ApiQuoteRequest["status"],
                    })
                  }
                  className="w-full border border-ink bg-paper p-2 text-[0.75rem] uppercase tracking-[0.2em]"
                >
                  <option value="new">New</option>
                  <option value="responded">Responded</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </article>
          ))}
        </section>
      </div>
    </AdminShell>
  );
}

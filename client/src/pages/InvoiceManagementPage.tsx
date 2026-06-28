import { useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import AdminShell from "../components/layout/AdminShell";
import Button from "../components/ui/Button";
import FormField from "../components/ui/FormField";
import MetricTile from "../components/ui/MetricTile";
import StatusText from "../components/ui/StatusText";
import { api } from "../lib/api";
import { fetchInvoices } from "../services/invoiceService";

const filters = ["All", "Paid", "Pending", "Failed"] as const;
type InvoiceFilter = (typeof filters)[number];

export default function InvoiceManagementPage() {
  const queryClient = useQueryClient();
  const [selectedFilter, setSelectedFilter] = useState<InvoiceFilter>("All");
  const [isCreating, setIsCreating] = useState(false);
  const { data, isLoading, isError } = useQuery({
    queryKey: ["invoices"],
    queryFn: fetchInvoices,
  });
  const createMutation = useMutation({
    mutationFn: api.invoices.create,
    onSuccess: async () => {
      setIsCreating(false);
      await queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
  const deleteMutation = useMutation({
    mutationFn: api.invoices.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["invoices"] }),
  });

  const filteredInvoices = useMemo(() => {
    const rows = data?.invoices ?? [];
    return selectedFilter === "All"
      ? rows
      : rows.filter((invoice) => invoice.status === selectedFilter);
  }, [data?.invoices, selectedFilter]);

  return (
    <AdminShell>
      <div className="mx-auto max-w-6xl">
        <header className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 text-[0.75rem] font-semibold uppercase tracking-[0.3em] text-grey">
              Financial Overview
            </p>
            <h1 className="font-display text-6xl font-semibold uppercase leading-none tracking-[-0.04em]">
              Invoices
            </h1>
          </div>
          <Button onClick={() => setIsCreating((value) => !value)}>
            Create Invoice
          </Button>
        </header>

        <section className="mb-12 grid border-l border-t border-grey-light md:grid-cols-4">
          <MetricTile label="Paid Revenue" value={data?.summary.totalRevenue ?? "-"} />
          <MetricTile label="Pending Amount" value={data?.summary.pendingAmount ?? "-"} />
          <MetricTile label="Paid Invoices" value={data?.summary.paidCount ?? "-"} />
          <MetricTile label="Drafts" value={data?.summary.draftCount ?? "-"} />
        </section>

        <section className="mb-12 border-y border-grey-light py-6">
          <p className="mb-4 text-[0.7rem] font-semibold uppercase tracking-[0.25em] text-grey">
            Quick Filters
          </p>
          <div className="flex flex-wrap gap-5">
            {filters.map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setSelectedFilter(filter)}
                className={`text-[0.75rem] font-semibold uppercase tracking-[0.25em] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink ${
                  selectedFilter === filter
                    ? "text-ink underline decoration-ink decoration-1 underline-offset-4"
                    : "text-grey"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </section>

        {isCreating ? (
          <CreateInvoicePanel
            isSubmitting={createMutation.isPending}
            onCreate={(payload) => createMutation.mutate(payload)}
          />
        ) : null}

        <section className="border-t border-grey-light">
          <div className="hidden grid-cols-12 gap-4 border-b border-grey-light py-4 text-[0.7rem] font-semibold uppercase tracking-[0.25em] text-grey md:grid">
            <div className="col-span-4">Client</div>
            <div className="col-span-2">Amount</div>
            <div className="col-span-2">Due Date</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2 text-right">Options</div>
          </div>
          {isLoading ? <p className="border-b border-grey-light py-8 text-sm text-grey">Loading invoices</p> : null}
          {isError ? <p className="border-b border-grey-light py-8 text-sm text-grey">Invoices could not load</p> : null}
          {filteredInvoices.map((invoice) => (
            <article
              key={invoice.id}
              className="grid gap-4 border-b border-grey-light py-8 md:grid-cols-12 md:items-center"
            >
              <div className="col-span-4 flex items-center gap-4">
                <div className="flex h-8 w-8 items-center justify-center bg-grey-faint text-[0.75rem] font-semibold">
                  {invoice.initials}
                </div>
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-[0.08em]">
                    {invoice.client}
                  </h2>
                  <p className="text-[0.7rem] font-semibold uppercase tracking-[0.25em] text-grey">
                    {invoice.id}
                  </p>
                </div>
              </div>
              <LabeledCell label="Amount">{invoice.amount}</LabeledCell>
              <LabeledCell label="Due Date">{invoice.dueDate}</LabeledCell>
              <LabeledCell label="Status">
                <StatusText status={invoice.status} />
              </LabeledCell>
              <div className="col-span-2 text-left md:text-right">
                <Button
                  disabled={!invoice.databaseId || deleteMutation.isPending}
                  onClick={() => invoice.databaseId && deleteMutation.mutate(invoice.databaseId)}
                >
                  Delete
                </Button>
              </div>
            </article>
          ))}
        </section>
      </div>
    </AdminShell>
  );
}

function LabeledCell({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="col-span-2">
      <span className="mb-1 block text-[0.7rem] font-semibold uppercase tracking-[0.25em] text-grey md:hidden">
        {label}
      </span>
      <div className="text-sm text-ink">{children}</div>
    </div>
  );
}

function CreateInvoicePanel({
  isSubmitting,
  onCreate,
}: {
  isSubmitting: boolean;
  onCreate: (payload: { client_name: string; phone: string; amount: number }) => void;
}) {
  const [clientName, setClientName] = useState("");
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onCreate({
      client_name: clientName,
      phone,
      amount: Number(amount),
    });
  }

  return (
    <form className="mb-12 border border-grey-light bg-grey-faint p-8" onSubmit={handleSubmit}>
      <h2 className="mb-8 text-2xl font-display font-semibold uppercase">
        Create New Invoice
      </h2>
      <div className="grid gap-8 md:grid-cols-2">
        <FormField id="clientName" label="Client Name" required value={clientName} onChange={(event) => setClientName(event.target.value)} />
        <FormField id="phone" label="Phone" required value={phone} onChange={(event) => setPhone(event.target.value)} />
        <FormField id="amount" label="Amount" type="number" min="1" required value={amount} onChange={(event) => setAmount(event.target.value)} />
      </div>
      <div className="mt-8 flex flex-col gap-4 sm:flex-row">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating" : "Generate Invoice"}
        </Button>
      </div>
    </form>
  );
}

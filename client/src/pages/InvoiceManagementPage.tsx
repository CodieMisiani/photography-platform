import { useMemo, useState } from "react";
import type { Dispatch, FormEvent, ReactNode, SetStateAction } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import AdminShell from "../components/layout/AdminShell";
import Button from "../components/ui/Button";
import FormField from "../components/ui/FormField";
import MetricTile from "../components/ui/MetricTile";
import StatusText from "../components/ui/StatusText";
import { api } from "../lib/api";
import { fetchInvoices } from "../services/invoiceService";
import type { Invoice, InvoiceLineItem } from "../types/invoice";

const filters = ["All", "Paid", "Pending", "Failed"] as const;
type InvoiceFilter = (typeof filters)[number];
type EditableLineItem = { description: string; quantity: string; unit_price: string };

export default function InvoiceManagementPage() {
  const queryClient = useQueryClient();
  const [selectedFilter, setSelectedFilter] = useState<InvoiceFilter>("All");
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
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
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof api.invoices.update>[1] }) =>
      api.invoices.update(id, payload),
    onSuccess: async () => {
      setEditingId(null);
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
          <InvoiceForm
            title="Create New Invoice"
            submitLabel="Generate Invoice"
            isSubmitting={createMutation.isPending}
            onSubmit={(payload) => createMutation.mutate(payload)}
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
            <article key={invoice.id} className="border-b border-grey-light py-8">
              {editingId === invoice.databaseId ? (
                <InvoiceForm
                  title={`Edit ${invoice.id}`}
                  submitLabel="Save Invoice"
                  invoice={invoice}
                  isSubmitting={updateMutation.isPending}
                  onCancel={() => setEditingId(null)}
                  onSubmit={(payload) =>
                    invoice.databaseId &&
                    updateMutation.mutate({ id: invoice.databaseId, payload })
                  }
                />
              ) : (
                <div className="grid gap-4 md:grid-cols-12 md:items-center">
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
                  <div className="col-span-2 flex gap-3 text-left md:justify-end md:text-right">
                    <Button disabled={!invoice.databaseId} onClick={() => setEditingId(invoice.databaseId ?? null)}>
                      Edit
                    </Button>
                    <Button
                      disabled={!invoice.databaseId || deleteMutation.isPending}
                      onClick={() => invoice.databaseId && deleteMutation.mutate(invoice.databaseId)}
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

function InvoiceForm({
  title,
  submitLabel,
  invoice,
  isSubmitting,
  onSubmit,
  onCancel,
}: {
  title: string;
  submitLabel: string;
  invoice?: Invoice;
  isSubmitting: boolean;
  onSubmit: (payload: {
    client_name: string;
    phone: string;
    line_items: Array<{ description: string; quantity: number; unit_price: number }>;
  }) => void;
  onCancel?: () => void;
}) {
  const [clientName, setClientName] = useState(invoice?.client ?? "");
  const [phone, setPhone] = useState(invoice?.phone ?? "");
  const [lineItems, setLineItems] = useState<EditableLineItem[]>(
    (invoice?.lineItems ?? [{ description: "Photography services", quantity: 1, unitPrice: "0", amount: "0" }]).map(
      (item: InvoiceLineItem) => ({
        description: item.description,
        quantity: String(item.quantity ?? 1),
        unit_price: String(Number((item.unitPrice ?? item.amount).replace(/[^0-9.]/g, "")) || 0),
      }),
    ),
  );

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit({
      client_name: clientName,
      phone,
      line_items: lineItems.map((item) => ({
        description: item.description,
        quantity: Number(item.quantity),
        unit_price: Number(item.unit_price),
      })),
    });
  }

  return (
    <form className="mb-12 border border-grey-light bg-grey-faint p-8" onSubmit={handleSubmit}>
      <h2 className="mb-8 text-2xl font-display font-semibold uppercase">{title}</h2>
      <div className="grid gap-8 md:grid-cols-2">
        <FormField id={`${title}-clientName`} label="Client Name" required value={clientName} onChange={(event) => setClientName(event.target.value)} />
        <FormField id={`${title}-phone`} label="Phone" required value={phone} onChange={(event) => setPhone(event.target.value)} />
      </div>
      <div className="mt-8 space-y-6">
        <p className="text-[0.75rem] font-semibold uppercase tracking-[0.25em] text-grey">
          Line Items
        </p>
        {lineItems.map((item, index) => (
          <div key={index} className="grid gap-4 border border-grey-light bg-paper p-4 md:grid-cols-[1fr_120px_160px_auto] md:items-end">
            <FormField id={`${title}-description-${index}`} label="Description" required value={item.description} onChange={(event) => updateLineItem(index, "description", event.target.value, setLineItems)} />
            <FormField id={`${title}-quantity-${index}`} label="Qty" type="number" min="1" required value={item.quantity} onChange={(event) => updateLineItem(index, "quantity", event.target.value, setLineItems)} />
            <FormField id={`${title}-price-${index}`} label="Unit Price" type="number" min="0" required value={item.unit_price} onChange={(event) => updateLineItem(index, "unit_price", event.target.value, setLineItems)} />
            <Button type="button" onClick={() => setLineItems((current) => current.filter((_, itemIndex) => itemIndex !== index))}>
              Remove
            </Button>
          </div>
        ))}
        <Button type="button" onClick={() => setLineItems((current) => [...current, { description: "", quantity: "1", unit_price: "0" }])}>
          Add Line
        </Button>
      </div>
      <div className="mt-8 flex flex-col gap-4 sm:flex-row">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving" : submitLabel}
        </Button>
        {onCancel ? <Button type="button" onClick={onCancel}>Cancel</Button> : null}
      </div>
    </form>
  );
}

function updateLineItem(
  index: number,
  field: keyof EditableLineItem,
  value: string,
  setLineItems: Dispatch<SetStateAction<EditableLineItem[]>>,
) {
  setLineItems((current) =>
    current.map((item, itemIndex) =>
      itemIndex === index ? { ...item, [field]: value } : item,
    ),
  );
}

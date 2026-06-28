import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import AdminShell from "../components/layout/AdminShell";
import Button from "../components/ui/Button";
import FormField from "../components/ui/FormField";
import MetricTile from "../components/ui/MetricTile";
import StatusText from "../components/ui/StatusText";
import { fetchInvoices } from "../services/invoiceService";

const filters = ["All", "Paid", "Sent", "Draft"] as const;
type InvoiceFilter = (typeof filters)[number];

export default function InvoiceManagementPage() {
  const [selectedFilter, setSelectedFilter] = useState<InvoiceFilter>("All");
  const [isCreating, setIsCreating] = useState(false);
  const { data } = useQuery({
    queryKey: ["invoices"],
    queryFn: fetchInvoices,
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
          <MetricTile label="Total Revenue (Q4)" value={data?.summary.totalRevenue ?? "-"} />
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
                className={`text-[0.75rem] font-semibold uppercase tracking-[0.25em] ${
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

        {isCreating ? <CreateInvoicePanel /> : null}

        <section className="border-t border-grey-light">
          <div className="hidden grid-cols-12 gap-4 border-b border-grey-light py-4 text-[0.7rem] font-semibold uppercase tracking-[0.25em] text-grey md:grid">
            <div className="col-span-4">Client</div>
            <div className="col-span-2">Amount</div>
            <div className="col-span-2">Due Date</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2 text-right">Options</div>
          </div>
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
                <button className="text-[0.75rem] font-semibold uppercase tracking-[0.25em] text-grey underline decoration-ink decoration-1 underline-offset-4">
                  Edit
                </button>
              </div>
            </article>
          ))}
        </section>
      </div>
    </AdminShell>
  );
}

function LabeledCell({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="col-span-2">
      <span className="mb-1 block text-[0.7rem] font-semibold uppercase tracking-[0.25em] text-grey md:hidden">
        {label}
      </span>
      <div className="text-sm text-ink">{children}</div>
    </div>
  );
}

function CreateInvoicePanel() {
  return (
    <section className="mb-12 border border-grey-light bg-grey-faint p-8">
      <h2 className="mb-8 text-2xl font-display font-semibold uppercase">
        Create New Invoice
      </h2>
      <div className="grid gap-8 md:grid-cols-2">
        <FormField id="clientName" label="Client Name" placeholder="Kinfolk Magazine" />
        <FormField id="dueDate" label="Due Date" type="date" />
        <div className="md:col-span-2">
          <FormField
            id="lineItem"
            label="Line Item"
            placeholder="Description of service"
          />
        </div>
      </div>
      <div className="mt-8 flex flex-col gap-4 sm:flex-row">
        <Button>Generate Invoice</Button>
        <Button>Save as Draft</Button>
      </div>
    </section>
  );
}

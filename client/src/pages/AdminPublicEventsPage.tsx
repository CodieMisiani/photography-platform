import { useState } from "react";
import type { Dispatch, FormEvent, SetStateAction } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import AdminShell from "../components/layout/AdminShell";
import Button from "../components/ui/Button";
import FormField from "../components/ui/FormField";
import StatusText from "../components/ui/StatusText";
import { api } from "../lib/api";

export default function AdminPublicEventsPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    title: "",
    venue: "",
    event_date: "",
    ticket_url: "",
    price: "0",
    is_published: false,
  });
  const events = useQuery({
    queryKey: ["admin-public-events"],
    queryFn: api.publicEvents.listAdmin,
  });
  const createMutation = useMutation({
    mutationFn: api.publicEvents.create,
    onSuccess: async () => {
      setForm({ title: "", venue: "", event_date: "", ticket_url: "", price: "0", is_published: false });
      await queryClient.invalidateQueries({ queryKey: ["admin-public-events"] });
    },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, is_published }: { id: string; is_published: boolean }) =>
      api.publicEvents.update(id, { is_published }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-public-events"] }),
  });
  const deleteMutation = useMutation({
    mutationFn: api.publicEvents.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-public-events"] }),
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    createMutation.mutate({
      title: form.title,
      venue: form.venue,
      event_date: form.event_date,
      ticket_url: form.ticket_url || null,
      price: Number(form.price).toFixed(2),
      is_published: form.is_published,
    });
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
          <div className="grid gap-8 md:grid-cols-2">
            <FormField id="eventTitle" label="Title" required value={form.title} onChange={(event) => setField("title", event.target.value, setForm)} />
            <FormField id="venue" label="Venue" required value={form.venue} onChange={(event) => setField("venue", event.target.value, setForm)} />
            <FormField id="eventDate" label="Date" type="date" required value={form.event_date} onChange={(event) => setField("event_date", event.target.value, setForm)} />
            <FormField id="price" label="Price" type="number" min="0" required value={form.price} onChange={(event) => setField("price", event.target.value, setForm)} />
            <div className="md:col-span-2">
              <FormField id="ticketUrl" label="Ticket URL" type="url" value={form.ticket_url} onChange={(event) => setField("ticket_url", event.target.value, setForm)} />
            </div>
            <label className="flex items-center gap-3 text-[0.75rem] font-semibold uppercase tracking-[0.2em] text-grey">
              <input type="checkbox" checked={form.is_published} onChange={(event) => setForm((current) => ({ ...current, is_published: event.target.checked }))} />
              Publish now
            </label>
          </div>
          <Button type="submit" disabled={createMutation.isPending} className="mt-8">
            {createMutation.isPending ? "Creating" : "Create Event"}
          </Button>
        </form>

        <section className="border-t border-grey-light">
          {events.isLoading ? <p className="border-b border-grey-light py-8 text-sm text-grey">Loading events</p> : null}
          {(events.data?.events ?? []).map((event) => (
            <article key={event.id} className="grid gap-4 border-b border-grey-light py-8 md:grid-cols-12 md:items-center">
              <div className="md:col-span-5">
                <h2 className="text-sm font-semibold uppercase tracking-[0.08em]">{event.title}</h2>
                <p className="text-sm text-grey">{event.venue}</p>
              </div>
              <div className="md:col-span-2 text-sm">{event.event_date}</div>
              <div className="md:col-span-2"><StatusText status={event.is_published ? "Published" : "Draft"} /></div>
              <div className="flex gap-3 md:col-span-3 md:justify-end">
                <Button onClick={() => updateMutation.mutate({ id: event.id, is_published: !event.is_published })}>
                  {event.is_published ? "Unpublish" : "Publish"}
                </Button>
                <Button onClick={() => deleteMutation.mutate(event.id)} disabled={deleteMutation.isPending}>
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

function setField(
  field: "title" | "venue" | "event_date" | "ticket_url" | "price",
  value: string,
  setForm: Dispatch<SetStateAction<{
    title: string;
    venue: string;
    event_date: string;
    ticket_url: string;
    price: string;
    is_published: boolean;
  }>>,
) {
  setForm((current) => ({ ...current, [field]: value }));
}

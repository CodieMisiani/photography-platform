import { useState } from "react";
import type { Dispatch, FormEvent, SetStateAction } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import AdminShell from "../components/layout/AdminShell";
import Button from "../components/ui/Button";
import FormField from "../components/ui/FormField";
import StatusText from "../components/ui/StatusText";
import { api, type ApiBooking } from "../lib/api";

export default function AdminBookingsPage() {
  const queryClient = useQueryClient();
  const [blockedDate, setBlockedDate] = useState("");
  const [reason, setReason] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const bookings = useQuery({
    queryKey: ["admin-bookings"],
    queryFn: api.bookings.listAdmin,
  });
  const blocks = useQuery({
    queryKey: ["admin-calendar-blocks"],
    queryFn: api.bookings.listBlocks,
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<ApiBooking> }) =>
      api.bookings.update(id, payload),
    onSuccess: async () => {
      setEditingId(null);
      await queryClient.invalidateQueries({ queryKey: ["admin-bookings"] });
    },
  });
  const blockMutation = useMutation({
    mutationFn: api.bookings.blockDate,
    onSuccess: async () => {
      setBlockedDate("");
      setReason("");
      await queryClient.invalidateQueries({ queryKey: ["admin-calendar-blocks"] });
    },
  });
  const unblockMutation = useMutation({
    mutationFn: api.bookings.unblockDate,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-calendar-blocks"] }),
  });

  function handleBlock(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    blockMutation.mutate({ blocked_date: blockedDate, reason });
  }

  return (
    <AdminShell>
      <div className="mx-auto max-w-6xl">
        <header className="mb-12">
          <p className="mb-2 text-[0.75rem] font-semibold uppercase tracking-[0.3em] text-grey">
            Calendar
          </p>
          <h1 className="font-display text-5xl font-semibold uppercase tracking-[-0.04em]">
            Bookings
          </h1>
        </header>

        <section className="mb-12 grid gap-8 lg:grid-cols-2">
          <form className="border border-grey-light bg-grey-faint p-8" onSubmit={handleBlock}>
            <h2 className="mb-6 text-2xl font-display font-semibold uppercase">
              Block a Date
            </h2>
            <div className="grid gap-6">
              <FormField id="blockedDate" label="Date" type="date" required value={blockedDate} onChange={(event) => setBlockedDate(event.target.value)} />
              <FormField id="reason" label="Reason" required value={reason} onChange={(event) => setReason(event.target.value)} />
              <Button type="submit" disabled={blockMutation.isPending}>
                {blockMutation.isPending ? "Blocking" : "Block Date"}
              </Button>
            </div>
          </form>

          <section className="border border-grey-light bg-paper p-8">
            <h2 className="mb-6 text-2xl font-display font-semibold uppercase">
              Blocked Dates
            </h2>
            <div className="space-y-4">
              {blocks.isLoading ? <p className="text-sm text-grey">Loading blocks</p> : null}
              {(blocks.data?.blocks ?? []).map((block) => (
                <div key={block.id} className="flex items-center justify-between gap-4 border-b border-grey-light pb-4">
                  <div>
                    <p className="text-sm font-semibold uppercase">{block.blocked_date}</p>
                    <p className="text-sm text-grey">{block.reason}</p>
                  </div>
                  <Button onClick={() => unblockMutation.mutate(block.id)} disabled={unblockMutation.isPending}>
                    Unblock
                  </Button>
                </div>
              ))}
              {!blocks.isLoading && (blocks.data?.blocks ?? []).length === 0 ? (
                <p className="text-sm text-grey">No blocked dates.</p>
              ) : null}
            </div>
          </section>
        </section>

        <section className="border-t border-grey-light">
          {bookings.isLoading ? <AdminState message="Loading bookings" /> : null}
          {bookings.isError ? <AdminState message="Bookings could not load" /> : null}
          {(bookings.data?.bookings ?? []).map((booking) => (
            <article key={booking.id} className="border-b border-grey-light py-8">
              {editingId === booking.id ? (
                <BookingEditPanel
                  booking={booking}
                  isSaving={updateMutation.isPending}
                  onCancel={() => setEditingId(null)}
                  onSave={(payload) => updateMutation.mutate({ id: booking.id, payload })}
                />
              ) : (
                <div className="grid gap-4 md:grid-cols-12 md:items-center">
                  <div className="md:col-span-4">
                    <h2 className="text-sm font-semibold uppercase tracking-[0.08em]">{booking.client_name}</h2>
                    <p className="text-[0.75rem] uppercase tracking-[0.2em] text-grey">{booking.email}</p>
                    <p className="text-sm text-grey">{booking.whatsapp}</p>
                  </div>
                  <div className="md:col-span-2 text-sm">{booking.event_date}</div>
                  <div className="md:col-span-2 text-sm">{booking.event_type}</div>
                  <div className="md:col-span-2"><StatusText status={booking.status} /></div>
                  <div className="md:col-span-2">
                    <Button onClick={() => setEditingId(booking.id)}>Edit</Button>
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

function BookingEditPanel({
  booking,
  isSaving,
  onSave,
  onCancel,
}: {
  booking: ApiBooking;
  isSaving: boolean;
  onSave: (payload: Partial<ApiBooking>) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    client_name: booking.client_name,
    whatsapp: booking.whatsapp,
    email: booking.email,
    event_date: booking.event_date.slice(0, 10),
    event_type: booking.event_type,
    notes: booking.notes ?? "",
    status: booking.status,
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSave({ ...form, notes: form.notes || null });
  }

  return (
    <form className="border border-grey-light bg-grey-faint p-6" onSubmit={handleSubmit}>
      <div className="grid gap-8 md:grid-cols-2">
        <FormField id={`booking-name-${booking.id}`} label="Name" required value={form.client_name} onChange={(event) => setFormValue("client_name", event.target.value, setForm)} />
        <FormField id={`booking-whatsapp-${booking.id}`} label="WhatsApp" required value={form.whatsapp} onChange={(event) => setFormValue("whatsapp", event.target.value, setForm)} />
        <FormField id={`booking-email-${booking.id}`} label="Email" type="email" required value={form.email} onChange={(event) => setFormValue("email", event.target.value, setForm)} />
        <FormField id={`booking-date-${booking.id}`} label="Event Date" type="date" required value={form.event_date} onChange={(event) => setFormValue("event_date", event.target.value, setForm)} />
        <FormField id={`booking-type-${booking.id}`} label="Event Type" required value={form.event_type} onChange={(event) => setFormValue("event_type", event.target.value, setForm)} />
        <FormField as="select" id={`booking-status-${booking.id}`} label="Status" value={form.status} onChange={(event) => setFormValue("status", event.target.value as ApiBooking["status"], setForm)}>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="declined">Declined</option>
        </FormField>
        <div className="md:col-span-2">
          <FormField as="textarea" id={`booking-notes-${booking.id}`} label="Notes" rows={4} value={form.notes} onChange={(event) => setFormValue("notes", event.target.value, setForm)} />
        </div>
      </div>
      <div className="mt-8 flex gap-3">
        <Button type="submit" disabled={isSaving}>{isSaving ? "Saving" : "Save Booking"}</Button>
        <Button type="button" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}

function setFormValue<T extends Record<string, unknown>>(
  field: keyof T,
  value: T[keyof T],
  setForm: Dispatch<SetStateAction<T>>,
) {
  setForm((current) => ({ ...current, [field]: value }));
}

function AdminState({ message }: { message: string }) {
  return <p className="border-b border-grey-light py-8 text-sm text-grey">{message}</p>;
}

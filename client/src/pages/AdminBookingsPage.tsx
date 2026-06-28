import { useState } from "react";
import type { FormEvent } from "react";
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
  const bookings = useQuery({
    queryKey: ["admin-bookings"],
    queryFn: api.bookings.listAdmin,
  });
  const blocks = useQuery({
    queryKey: ["admin-calendar-blocks"],
    queryFn: api.bookings.listBlocks,
  });
  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ApiBooking["status"] }) =>
      api.bookings.updateStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-bookings"] }),
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
            <article key={booking.id} className="grid gap-4 border-b border-grey-light py-8 md:grid-cols-12 md:items-center">
              <div className="md:col-span-4">
                <h2 className="text-sm font-semibold uppercase tracking-[0.08em]">{booking.client_name}</h2>
                <p className="text-[0.75rem] uppercase tracking-[0.2em] text-grey">{booking.email}</p>
              </div>
              <div className="md:col-span-2 text-sm">{booking.event_date}</div>
              <div className="md:col-span-2 text-sm">{booking.event_type}</div>
              <div className="md:col-span-2"><StatusText status={booking.status} /></div>
              <div className="md:col-span-2">
                <select
                  aria-label={`Update status for ${booking.client_name}`}
                  value={booking.status}
                  onChange={(event) =>
                    statusMutation.mutate({
                      id: booking.id,
                      status: event.target.value as ApiBooking["status"],
                    })
                  }
                  className="w-full border border-ink bg-paper p-2 text-[0.75rem] uppercase tracking-[0.2em]"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="declined">Declined</option>
                </select>
              </div>
            </article>
          ))}
        </section>
      </div>
    </AdminShell>
  );
}

function AdminState({ message }: { message: string }) {
  return <p className="border-b border-grey-light py-8 text-sm text-grey">{message}</p>;
}

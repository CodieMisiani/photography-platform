import { useMemo, useState } from "react";
import type { Dispatch, FormEvent, SetStateAction } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import Footer from "../components/Footer";
import Header from "../components/Header";
import Button from "../components/ui/Button";
import FormField from "../components/ui/FormField";
import { api } from "../lib/api";

const eventTypes = ["Wedding", "Portrait", "Corporate", "Concert", "Editorial"];

type BookingForm = {
  client_name: string;
  whatsapp: string;
  email: string;
  event_type: string;
  notes: string;
};

export default function BookPage() {
  const today = new Date();
  const monthStart = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-01`;
  const monthEndDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const monthEnd = monthEndDate.toISOString().slice(0, 10);
  const [selectedDate, setSelectedDate] = useState("");
  const [message, setMessage] = useState("");
  const [form, setForm] = useState<BookingForm>({
    client_name: "",
    whatsapp: "",
    email: "",
    event_type: eventTypes[0],
    notes: "",
  });

  const availability = useQuery({
    queryKey: ["availability", monthStart, monthEnd],
    queryFn: () => api.bookings.availability(monthStart, monthEnd),
  });
  const bookingMutation = useMutation({
    mutationFn: api.bookings.create,
  });

  const unavailable = useMemo(
    () => new Set((availability.data?.unavailable_dates ?? []).map((date) => date.date.slice(0, 10))),
    [availability.data?.unavailable_dates],
  );
  const days = buildMonthDays(today.getFullYear(), today.getMonth());

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    try {
      await bookingMutation.mutateAsync({
        ...form,
        event_date: selectedDate,
        notes: form.notes || null,
      });
      setMessage("Booking request sent. We will confirm availability shortly.");
      setSelectedDate("");
      setForm({
        client_name: "",
        whatsapp: "",
        email: "",
        event_type: eventTypes[0],
        notes: "",
      });
    } catch {
      setMessage("Booking could not be sent. Please review the details and try again.");
    }
  }

  return (
    <div className="bg-paper text-ink">
      <Header />
      <main className="mx-auto max-w-7xl px-6 py-16">
        <section className="mb-12 max-w-3xl border-b border-grey-light pb-10">
          <p className="mb-4 text-[0.75rem] uppercase tracking-[0.3em] text-grey">
            Book Me
          </p>
          <h1 className="text-5xl font-display uppercase tracking-[-0.04em] sm:text-6xl">
            Pick an open date.
          </h1>
          <p className="mt-6 max-w-xl text-[0.95rem] leading-7 text-grey">
            Booking is for clients who already know the date. Quote requests are
            for broader project planning and pricing.
          </p>
        </section>

        <section className="grid gap-10 lg:grid-cols-[1fr_420px]">
          <div>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-2xl font-display font-semibold uppercase">
                {today.toLocaleString("en", { month: "long", year: "numeric" })}
              </h2>
              {availability.isLoading ? (
                <span className="text-[0.75rem] uppercase tracking-[0.25em] text-grey">
                  Loading dates
                </span>
              ) : null}
            </div>
            {availability.isError ? (
              <div className="border border-grey-light bg-grey-faint p-8">
                <p className="mb-4 text-sm text-grey">
                  Availability could not load.
                </p>
                <Button onClick={() => availability.refetch()}>Retry</Button>
              </div>
            ) : (
              <div className="grid grid-cols-7 border-l border-t border-grey-light">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div key={day} className="border-b border-r border-grey-light p-3 text-[0.7rem] uppercase tracking-[0.2em] text-grey">
                    {day}
                  </div>
                ))}
                {days.map((day, index) => {
                  const dateId = day?.toISOString().slice(0, 10) ?? "";
                  const blocked = !day || unavailable.has(dateId) || dateId < today.toISOString().slice(0, 10);
                  const selected = selectedDate === dateId;
                  return (
                    <button
                      key={dateId || `blank-${index}`}
                      type="button"
                      disabled={blocked}
                      onClick={() => setSelectedDate(dateId)}
                      className={`min-h-20 border-b border-r border-grey-light p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink ${
                        selected ? "bg-ink text-paper" : "bg-paper text-ink"
                      } ${blocked ? "cursor-not-allowed text-grey opacity-40" : "hover:bg-grey-faint"}`}
                    >
                      {day ? day.getDate() : ""}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <aside className="border border-grey-light bg-grey-faint p-8">
            <h2 className="mb-6 text-2xl font-display font-semibold uppercase">
              Booking Details
            </h2>
            {selectedDate ? (
              <form className="space-y-6" onSubmit={handleSubmit}>
                <p className="text-[0.75rem] font-semibold uppercase tracking-[0.25em] text-grey">
                  Selected date: {selectedDate}
                </p>
                <FormField id="client_name" label="Name" required value={form.client_name} onChange={(event) => setFormValue("client_name", event.target.value, setForm)} />
                <FormField id="whatsapp" label="WhatsApp" required value={form.whatsapp} onChange={(event) => setFormValue("whatsapp", event.target.value, setForm)} />
                <FormField id="email" label="Email" required type="email" value={form.email} onChange={(event) => setFormValue("email", event.target.value, setForm)} />
                <FormField as="select" id="event_type" label="Event Type" value={form.event_type} onChange={(event) => setFormValue("event_type", event.target.value, setForm)}>
                  {eventTypes.map((type) => (
                    <option key={type}>{type}</option>
                  ))}
                </FormField>
                <FormField as="textarea" id="notes" label="Notes" rows={4} value={form.notes} onChange={(event) => setFormValue("notes", event.target.value, setForm)} />
                {message ? <p className="text-sm leading-6 text-grey">{message}</p> : null}
                <Button type="submit" disabled={bookingMutation.isPending} className="w-full">
                  {bookingMutation.isPending ? "Sending" : "Send Booking"}
                </Button>
              </form>
            ) : (
              <p className="text-sm leading-7 text-grey">
                Choose an available date from the calendar to open the booking form.
              </p>
            )}
          </aside>
        </section>
      </main>
      <Footer />
    </div>
  );
}

function buildMonthDays(year: number, month: number) {
  const monthStart = new Date(year, month, 1);
  const firstWeekday = monthStart.getDay();
  const monthEnd = new Date(year, month + 1, 0);
  const days: Array<Date | null> = Array.from({ length: firstWeekday }, () => null);
  for (let day = 1; day <= monthEnd.getDate(); day += 1) {
    days.push(new Date(year, month, day));
  }
  return days;
}

function setFormValue(
  field: keyof BookingForm,
  value: string,
  setForm: Dispatch<SetStateAction<BookingForm>>,
) {
  setForm((current) => ({
    ...current,
    [field]: value,
  }));
}

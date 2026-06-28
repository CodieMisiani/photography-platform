import { useMemo, useState } from "react";
import Footer from "../components/Footer";
import Header from "../components/Header";
import Button from "../components/ui/Button";
import { publicEvents } from "../data/eventFixtures";
import type { EventCategory, PublicEvent } from "../types/event";

const filterOptions = [
  "All Events",
  "Workshop",
  "Exhibition",
  "Studio Talk",
] as const;

type EventFilter = (typeof filterOptions)[number];

export default function PublicEventsPage() {
  const [selectedFilter, setSelectedFilter] = useState<EventFilter>("All Events");

  const filteredEvents = useMemo(
    () =>
      selectedFilter === "All Events"
        ? publicEvents
        : publicEvents.filter((event) => event.category === selectedFilter),
    [selectedFilter],
  );

  return (
    <div className="bg-paper text-ink">
      <Header />

      <main className="min-h-screen">
        <section className="mx-auto max-w-7xl px-6 py-16 md:py-24">
          <div className="max-w-4xl border-b border-grey-light pb-12">
            <p className="mb-6 text-[0.75rem] uppercase tracking-[0.3em] text-grey">
              Public Programming
            </p>
            <h1 className="mb-8 text-5xl font-display uppercase leading-tight tracking-[-0.04em] text-ink sm:text-6xl md:text-[4.5rem]">
              Studio Sessions & Exhibitions
            </h1>
            <p className="max-w-xl text-[1rem] leading-8 text-grey">
              Explore our curated events, from intimate film photography
              workshops to international gallery openings and creative
              networking nights.
            </p>
          </div>
        </section>

        <section className="mx-auto mb-12 max-w-7xl px-6">
          <div className="flex gap-4 overflow-x-auto pb-4" aria-label="Event filters">
            {filterOptions.map((option) => {
              const isSelected = selectedFilter === option;

              return (
                <button
                  key={option}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => setSelectedFilter(option)}
                  className={`whitespace-nowrap border px-6 py-2 text-[0.75rem] font-semibold uppercase tracking-[0.2em] transition-colors duration-200 ${
                    isSelected
                      ? "border-ink bg-ink text-paper"
                      : "border-grey-light bg-transparent text-ink hover:bg-ink hover:text-paper"
                  }`}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </section>

        <section className="mx-auto mb-24 max-w-7xl px-6">
          {filteredEvents.length > 0 ? (
            <div className="flex flex-col border-t border-grey-light">
              {filteredEvents.map((event) => (
                <EventRow key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <EmptyState onReset={() => setSelectedFilter("All Events")} />
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}

function EventRow({ event }: { event: PublicEvent }) {
  return (
    <article className="studio-plane grid gap-8 border-b border-grey-light py-12 md:grid-cols-[80px_minmax(220px,1fr)_minmax(0,1.7fr)] md:items-start">
      <time className="flex flex-row items-baseline gap-3 md:flex-col md:items-center md:gap-1">
        <span className="font-display text-5xl font-semibold leading-none text-ink">
          {event.day}
        </span>
        <span className="text-[0.75rem] font-semibold uppercase tracking-[0.25em] text-grey">
          {event.month}
        </span>
      </time>

      <div className="aspect-[4/3] overflow-hidden bg-grey-faint">
        <img
          src={event.image}
          alt={event.imageAlt}
          className="h-full w-full object-cover grayscale"
        />
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-6">
          <StatusLabel category={event.category} />
          <span className="text-[0.75rem] font-semibold uppercase tracking-[0.25em] text-ink">
            {event.price}
          </span>
        </div>
        <h2 className="text-3xl font-display font-semibold uppercase leading-tight text-ink">
          {event.title}
        </h2>
        <p className="max-w-xl text-[0.95rem] leading-7 text-grey">
          {event.description}
        </p>
        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-[0.75rem] font-semibold uppercase tracking-[0.25em] text-grey">
            {event.location}
          </span>
          <Button>Get Tickets</Button>
        </div>
      </div>
    </article>
  );
}

function StatusLabel({ category }: { category: EventCategory }) {
  return (
    <span className="text-[0.75rem] font-semibold uppercase tracking-[0.25em] text-grey underline decoration-ink decoration-1 underline-offset-4">
      {category}
    </span>
  );
}

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-6 border-y border-grey-light py-24 text-center">
      <div className="max-w-md">
        <h2 className="mb-4 text-3xl font-display font-semibold uppercase text-ink">
          No Sessions Found
        </h2>
        <p className="text-[0.95rem] leading-7 text-grey">
          We do not have any events scheduled for this category at the moment.
          Join our mailing list for updates.
        </p>
      </div>
      <Button onClick={onReset}>View All Upcoming Events</Button>
    </div>
  );
}

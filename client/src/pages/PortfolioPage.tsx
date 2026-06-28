import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Footer from "../components/Footer";
import Header from "../components/Header";
import Button from "../components/ui/Button";
import type { PortfolioItem } from "../types/portfolio";
import { api } from "../lib/api";

const filterOptions = [
  "All",
  "Weddings",
  "Corporate",
  "Concerts",
  "Portraits",
] as const;

type FilterOption = (typeof filterOptions)[number];

export default function PortfolioPage() {
  const [selectedFilter, setSelectedFilter] = useState<FilterOption>("All");
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["portfolio"],
    queryFn: api.portfolio.list,
  });

  const portfolioItems = useMemo(
    () =>
      (data?.events ?? []).map((event) => ({
        id: event.id,
        title: event.title,
        category: normalizeCategory(event.category),
        year: new Date(event.event_date).getFullYear().toString(),
        image: event.cover_url,
      })),
    [data?.events],
  );

  const filteredItems = useMemo(
    () =>
      selectedFilter === "All"
        ? portfolioItems
        : portfolioItems.filter((item) => item.category === selectedFilter),
    [portfolioItems, selectedFilter],
  );

  return (
    <div className="bg-paper text-ink">
      <Header />

      <main className="mx-auto max-w-7xl px-6 py-14">
        <section className="mb-16 border-b border-grey-light pb-12">
          <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <p className="text-[0.75rem] uppercase tracking-[0.3em] text-grey">
                The Portfolio
              </p>
              <h1 className="mt-4 text-5xl font-display uppercase tracking-[-0.04em] text-ink sm:text-6xl">
                A curated collection of visual narratives.
              </h1>
              <p className="mt-6 max-w-xl text-[0.95rem] leading-7 text-grey">
                From intimate celebrations to high-energy concerts, we capture
                the essence of every moment through a cinematic lens.
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              {filterOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setSelectedFilter(option)}
                  className={`uppercase tracking-[0.3em] text-[0.75rem] pb-1 transition-colors ${
                    selectedFilter === option
                      ? "border-b border-ink text-ink"
                      : "text-grey"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-px border border-grey-light bg-grey-faint sm:grid-cols-2">
          {isLoading ? <PortfolioState message="Loading portfolio" /> : null}
          {isError ? (
            <PortfolioState message="Portfolio could not load" action={() => refetch()} />
          ) : null}
          {!isLoading && !isError && filteredItems.length === 0 ? (
            <PortfolioState message="No projects found" />
          ) : null}
          {!isLoading && !isError
            ? filteredItems.map((item) => <PortfolioCard key={item.id} item={item} />)
            : null}
        </section>

        <div className="mt-10 flex justify-center">
          <Button className="border-ink text-ink hover:bg-ink hover:text-paper">
            Load More Projects
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function normalizeCategory(category: string): PortfolioItem["category"] {
  const match = filterOptions.find((option) => option !== "All" && option === category);
  return match && match !== "All" ? match : "Portraits";
}

function PortfolioState({
  message,
  action,
}: {
  message: string;
  action?: () => void;
}) {
  return (
    <div className="col-span-full flex min-h-80 flex-col items-center justify-center gap-6 bg-paper p-10 text-center">
      <p className="text-[0.75rem] font-semibold uppercase tracking-[0.25em] text-grey">
        {message}
      </p>
      {action ? <Button onClick={action}>Retry</Button> : null}
    </div>
  );
}

function PortfolioCard({ item }: { item: PortfolioItem }) {
  return (
    <article className="studio-plane group relative overflow-hidden bg-paper text-ink">
      <img
        src={item.image}
        alt={item.title}
        className="h-[560px] w-full object-cover transition-all duration-700 group-hover:grayscale-0 grayscale"
      />
      <div className="absolute inset-0 bg-ink/0 transition-opacity duration-500 group-hover:bg-ink/30" />
      <div className="absolute bottom-0 left-0 right-0 border-t border-grey-light bg-paper/95 p-8">
        <p className="text-[0.75rem] uppercase tracking-[0.3em] text-grey">
          {item.category} - {item.year}
        </p>
        <h2 className="mt-4 text-2xl font-semibold uppercase tracking-[-0.03em] text-ink">
          {item.title}
        </h2>
        <div className="mt-4 flex items-center gap-2 text-[0.75rem] uppercase tracking-[0.3em] text-ink">
          <span>View project</span>
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </article>
  );
}

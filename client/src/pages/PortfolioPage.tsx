import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
  const [selectedFilter, setSelectedFilter] = useState<FilterOption>("All");
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["portfolio"],
    queryFn: () => api.portfolio.list(),
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
    <div className="bg-paper text-text-primary">
      <Header />

      <main id="main" className="mx-auto max-w-7xl px-6 py-14">
        <section className="mb-16 border-b border-paper-deep pb-12">
          <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs uppercase tracking-widest text-text-muted">
                The Portfolio
              </p>
              <h1 className="mt-4 text-5xl font-display uppercase tracking-[-0.04em] text-text-primary sm:text-6xl">
                A curated collection of visual narratives.
              </h1>
              <p className="mt-6 max-w-xl text-[0.95rem] leading-7 text-text-secondary">
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
                  className={`pb-1 text-[0.75rem] uppercase tracking-[0.3em] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 active:scale-[0.97] ${
                    selectedFilter === option
                      ? "bg-accent px-3 py-2 text-white"
                      : "text-text-muted hover:text-accent"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-px border border-paper-deep bg-paper-deep sm:grid-cols-2">
          {isLoading ? <PortfolioState message="Loading portfolio" /> : null}
          {isError ? (
            <PortfolioState
              message="Portfolio could not load"
              action={() => refetch()}
            />
          ) : null}
          {!isLoading && !isError && filteredItems.length === 0 ? (
            <PortfolioState message="No projects found" />
          ) : null}
          {!isLoading && !isError
            ? filteredItems.map((item) => (
                <PortfolioCard
                  key={item.id}
                  item={item}
                  onOpen={() => navigate(`/portfolio/${item.id}`)}
                />
              ))
            : null}
        </section>
      </main>

      <Footer />
    </div>
  );
}

function normalizeCategory(category: string): PortfolioItem["category"] {
  const match = filterOptions.find(
    (option) => option !== "All" && option === category,
  );
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
    <div className="col-span-full flex min-h-80 flex-col items-center justify-center gap-6 bg-paper-white p-10 text-center">
      <p className="text-[0.75rem] font-semibold uppercase tracking-[0.25em] text-text-muted">
        {message}
      </p>
      {action ? <Button onClick={action}>Retry</Button> : null}
    </div>
  );
}

function PortfolioCard({
  item,
  onOpen,
}: {
  item: PortfolioItem;
  onOpen: () => void;
}) {
  return (
    <article
      className="portfolio-card studio-plane group relative cursor-pointer overflow-hidden border border-paper-deep bg-paper-white text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 active:scale-[0.99]"
      onClick={onOpen}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen();
        }
      }}
      role="button"
      tabIndex={0}
    >
      <img
        src={item.image}
        alt={item.title}
        className="h-140 w-full object-cover transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
      />
      <div className="absolute inset-0 bg-ink-rich/0 transition-colors duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:bg-ink-rich/20" />
      <div className="absolute bottom-0 left-0 right-0 border-t border-paper-deep bg-paper/95 p-8">
        <p className="text-xs uppercase tracking-widest text-text-secondary">
          {item.category} - {item.year}
        </p>
        <h2 className="mt-4 text-2xl font-semibold uppercase tracking-[-0.03em] text-text-primary transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-1 group-hover:brightness-110">
          {item.title}
        </h2>
        <div className="mt-4 h-px w-0 bg-accent transition-[width] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:w-full" />
        <div className="mt-4 flex items-center gap-2 text-[0.75rem] uppercase tracking-[0.3em] text-text-primary transition-colors group-hover:text-accent">
          <span>View project</span>
          <svg
            className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-1"
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

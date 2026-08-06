import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useInfiniteQuery } from "@tanstack/react-query";
import Footer from "../components/Footer";
import Header from "../components/Header";
import Button from "../components/ui/Button";
import { api } from "../lib/api";

const topics = [
  "Client stories",
  "Featured galleries",
  "Photography tips",
  "Event notes",
  "Travel stories",
  "Studio process",
];

function formatDate(value: string | null) {
  if (!value) return "Draft";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Draft";
  return date.toLocaleDateString("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function JournalPage() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ["journal-list", activeCategory],
    queryFn: ({ pageParam }) => api.journal.list(pageParam, 9, activeCategory ?? undefined),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.pages ? lastPage.page + 1 : undefined,
  });
  const posts = useMemo(
    () => data?.pages.flatMap((result) => result.posts) ?? [],
    [data?.pages],
  );

  function selectCategory(category: string | null) {
    setActiveCategory(category);
  }

  const categories = useMemo(() => {
    const values = new Set<string>();
    posts.forEach((post) => {
      if (post.category) values.add(post.category);
    });
    return Array.from(values);
  }, [posts]);

  return (
    <div className="bg-paper text-text-primary">
      <Header />

      <main id="main">
        <section className="bg-ink-rich text-text-inverse">
          <div className="mx-auto grid min-h-[56vh] max-w-7xl items-end gap-12 px-6 pb-16 pt-24 md:grid-cols-[1.1fr_0.9fr] md:pb-20 md:pt-32">
            <div>
              <p className="mb-6 text-xs uppercase tracking-widest text-text-muted">
                Journal
              </p>
              <h1 className="max-w-4xl text-5xl font-display font-normal leading-[0.98] tracking-[-0.055em] text-text-inverse sm:text-7xl md:text-[7rem]">
                Notes from the work behind the frame.
              </h1>
            </div>
            <p className="max-w-xl pb-3 text-xl leading-8 tracking-[-0.02em] text-text-inverse/78 md:justify-self-end">
              Stories, field notes, and practical guidance from weddings,
              events, portraits, and commissioned brand work.
            </p>
          </div>
        </section>

        <div className="section-divider" />

        <section className="bg-paper py-16">
          <div className="mx-auto flex max-w-7xl flex-wrap gap-3 px-6">
            {topics.map((topic) => (
              <span
                key={topic}
                className="border border-paper-deep bg-paper-white px-4 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-text-muted"
              >
                {topic}
              </span>
            ))}
          </div>
        </section>

        <section className="bg-paper-warm pb-20">
          <div className="mx-auto mb-8 flex max-w-7xl flex-wrap gap-3 px-6">
            <button
              type="button"
              onClick={() => selectCategory(null)}
              className={`border px-4 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.22em] transition-colors ${
                activeCategory === null
                  ? "border-accent bg-accent text-white"
                  : "border-paper-deep bg-paper-white text-text-muted"
              }`}
            >
              All stories
            </button>
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => selectCategory(category)}
                className={`border px-4 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.22em] transition-colors ${
                  activeCategory === category
                    ? "border-accent bg-accent text-white"
                    : "border-paper-deep bg-paper-white text-text-muted"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {isLoading ? (
            <p className="mx-auto max-w-7xl px-6 text-sm text-text-muted">
              Loading journal stories…
            </p>
          ) : null}
          {isError ? (
            <p className="mx-auto max-w-7xl px-6 text-sm text-text-muted">
              Journal stories could not be loaded right now.
            </p>
          ) : null}
          {!isLoading && !isError && posts.length === 0 ? (
            <p className="mx-auto max-w-7xl px-6 text-sm text-text-muted">
              No stories are published yet. Check back soon.
            </p>
          ) : null}
          <div className="mx-auto grid max-w-7xl gap-px border border-paper-deep bg-paper-deep md:grid-cols-2">
            {posts.map((article, index) => (
              <article
                key={article.slug}
                className={`group bg-paper-white p-8 transition-colors duration-150 hover:bg-paper ${
                  index === 0
                    ? "md:col-span-2 md:grid md:grid-cols-[0.85fr_1.15fr] md:gap-10"
                    : ""
                }`}
              >
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-text-secondary">
                    {article.category ?? "Field notes"}
                  </p>
                  <h2 className="mt-4 text-3xl font-display font-semibold uppercase leading-tight tracking-[-0.04em] text-text-primary sm:text-4xl">
                    {article.title}
                  </h2>
                </div>
                <div className="mt-8 flex flex-col justify-between gap-8 md:mt-0">
                  <p className="max-w-xl text-[0.95rem] leading-7 text-text-secondary">
                    {article.excerpt}
                  </p>
                  <div className="flex items-center justify-between border-t border-paper-deep pt-5">
                    <span className="text-[0.75rem] uppercase tracking-[0.25em] text-text-muted">
                      {formatDate(article.published_at)}
                    </span>
                    <Link
                      to={`/journal/${article.slug}`}
                      className="inline-flex items-center gap-2 text-[0.75rem] font-semibold uppercase tracking-[0.25em] text-text-primary transition-colors duration-150 group-hover:text-accent"
                    >
                      Read story
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
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
          {!isLoading && !isError && hasNextPage ? (
            <div className="mx-auto mt-8 flex max-w-7xl justify-center px-6">
              <Button type="button" onClick={() => void fetchNextPage()} disabled={isFetchingNextPage}>
                {isFetchingNextPage ? "Loading…" : "Load more"}
              </Button>
            </div>
          ) : null}
        </section>

        <section className="bg-ink-studio py-20 text-text-inverse">
          <div className="mx-auto grid max-w-7xl gap-10 px-6 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <p className="text-xs uppercase tracking-widest text-text-inverse/60">
                Have a story coming up?
              </p>
              <h2 className="mt-5 max-w-3xl text-4xl font-display uppercase tracking-[-0.04em] sm:text-5xl">
                Tell us what you are planning and we will help shape the visual
                approach.
              </h2>
            </div>
            <Button asLink to="/request-quote" variant="secondary">
              Start a Project
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

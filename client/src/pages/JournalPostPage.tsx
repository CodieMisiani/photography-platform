import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import Footer from "../components/Footer";
import Header from "../components/Header";
import Button from "../components/ui/Button";
import { api } from "../lib/api";
import MDEditor from "@uiw/react-md-editor";

function formatDate(value: string | null) {
  if (!value) return "Unpublished";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unpublished";
  return date.toLocaleDateString("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function JournalPostPage() {
  const { slug } = useParams();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["journal-post", slug],
    queryFn: () => api.journal.get(slug ?? ""),
    enabled: Boolean(slug),
  });

  const post = data?.post;
  const body = useMemo(() => post?.body ?? "", [post?.body]);

  return (
    <div className="bg-paper text-text-primary">
      <Header />

      <main id="main" className="bg-paper pb-20">
        <section className="border-b border-paper-deep bg-paper-warm">
          <div className="mx-auto max-w-6xl px-6 py-16 md:px-8 md:py-24">
            <Button asLink to="/journal" variant="neutral">
              ← Back to journal
            </Button>
            {isLoading ? (
              <p className="mt-8 text-sm text-text-muted">Loading article…</p>
            ) : null}
            {isError ? (
              <p className="mt-8 text-sm text-text-muted">
                This journal story could not be loaded right now.
              </p>
            ) : null}
            {post ? (
              <div className="mt-12 grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
                <div>
                  <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-text-muted">
                    {post.category ?? "Field notes"}
                  </p>
                  <h1 className="mt-4 max-w-3xl text-4xl font-display font-semibold uppercase leading-tight tracking-[-0.04em] text-text-primary sm:text-5xl">
                    {post.title}
                  </h1>
                  <p className="mt-6 max-w-2xl text-lg leading-8 text-text-secondary">
                    {post.excerpt}
                  </p>
                  <div className="mt-8 flex flex-wrap gap-4 text-[0.76rem] font-semibold uppercase tracking-[0.24em] text-text-muted">
                    <span>{formatDate(post.published_at)}</span>
                    {post.read_time_minutes ? (
                      <span>{post.read_time_minutes} min read</span>
                    ) : null}
                  </div>
                </div>
                {post.cover_url ? (
                  <img
                    src={post.cover_url}
                    alt={post.title}
                    className="h-80 w-full rounded-none object-cover grayscale"
                  />
                ) : null}
              </div>
            ) : null}
          </div>
        </section>

        {post ? (
          <section className="mx-auto max-w-4xl px-6 py-16 md:px-8 md:py-24">
            <div className="prose prose-stone max-w-none text-[1rem] leading-8 text-text-secondary">
              <MDEditor.Markdown source={body} />
            </div>
          </section>
        ) : null}
      </main>

      <Footer />
    </div>
  );
}

import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { createPortal } from "react-dom";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { api } from "../lib/api";

export default function PortfolioProjectPage() {
  const navigate = useNavigate();
  const params = useParams();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const projectId = params.id ?? "";

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["portfolio-project", projectId],
    queryFn: () =>
      Promise.all([
        api.portfolio.get(projectId),
        api.portfolio.listPhotos(projectId),
      ]),
    enabled: Boolean(projectId),
  });

  const event = data?.[0]?.event;
  const photos = data?.[1]?.photos;
  const galleryItems = useMemo(
    () =>
      [event?.cover_url, ...(photos ?? []).map((photo) => photo.cloudinary_url)].filter(
        Boolean,
      ) as string[],
    [event?.cover_url, photos],
  );

  return (
    <div className="bg-paper text-text-primary">
      <Header />
      <main id="main" className="mx-auto max-w-7xl px-6 py-14">
        <button
          type="button"
          onClick={() => navigate("/portfolio")}
          className="mb-8 inline-flex items-center gap-3 text-sm uppercase tracking-[0.3em] text-text-secondary transition-colors hover:text-accent"
        >
          <span aria-hidden="true">←</span>
          Back to Portfolio
        </button>

        {isLoading ? (
          <div className="space-y-8">
            <div className="h-12 w-48 animate-pulse bg-paper-deep" />
            <div className="aspect-[16/9] w-full animate-pulse bg-paper-deep" />
            <div className="grid gap-4 md:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="aspect-square animate-pulse bg-paper-deep"
                />
              ))}
            </div>
          </div>
        ) : null}

        {!isLoading && isError ? (
          <div className="rounded-none border border-paper-deep bg-paper-white p-10 text-center">
            <p className="text-sm uppercase tracking-[0.3em] text-text-muted">
              Project could not load
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="mt-6 text-sm uppercase tracking-[0.3em] text-accent"
            >
              Retry
            </button>
          </div>
        ) : null}

        {!isLoading && !isError && event ? (
          <>
            <div className="mb-8">
              <p className="text-xs uppercase tracking-[0.3em] text-text-muted">
                {event.category}
              </p>
              <h1 className="mt-3 font-display text-3xl text-text-primary md:text-4xl">
                {event.title}
              </h1>
              <p className="mt-2 text-sm uppercase tracking-[0.25em] text-text-secondary">
                {new Date(event.event_date).toLocaleDateString("en", {
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
            <img
              src={event.cover_url ?? ""}
              alt={event.title}
              className="mb-8 aspect-[16/9] w-full object-cover"
            />
            {(photos?.length ?? 0) > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {(photos ?? []).map((photo, index) => (
                  <button
                    key={photo.id}
                    type="button"
                    onClick={() => setLightboxIndex(index + 1)}
                    className="group relative aspect-square overflow-hidden border border-paper-deep bg-paper-white text-left"
                  >
                    <img
                      src={photo.cloudinary_url}
                      alt={photo.caption ?? event.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                    <div className="absolute inset-0 bg-ink-rich/0 transition-colors duration-300 group-hover:bg-ink-rich/20" />
                  </button>
                ))}
              </div>
            ) : (
              <div className="border border-paper-deep bg-paper-white p-10 text-center text-text-muted">
                More photos coming soon
              </div>
            )}
          </>
        ) : null}
      </main>

      {lightboxIndex !== null && galleryItems[lightboxIndex] ? (
        <ProjectLightbox
          images={galleryItems}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
        />
      ) : null}

      <Footer />
    </div>
  );
}

function ProjectLightbox({
  images,
  index,
  onClose,
  onNavigate,
}: {
  images: string[];
  index: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft")
        onNavigate((index - 1 + images.length) % images.length);
      if (event.key === "ArrowRight") onNavigate((index + 1) % images.length);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [images.length, index, onClose, onNavigate]);

  const image = images[index];
  if (!image) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-ink-rich/95 p-6 text-text-inverse"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute right-6 top-6 text-4xl leading-none hover:text-accent"
        aria-label="Close preview"
      >
        ×
      </button>
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onNavigate((index - 1 + images.length) % images.length);
        }}
        className="absolute left-4 top-1/2 -translate-y-1/2 px-4 py-3 text-4xl hover:text-accent"
        aria-label="Previous image"
      >
        ‹
      </button>
      <img
        src={image}
        alt="Project preview"
        className="max-h-[80vh] max-w-full object-contain"
      />
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onNavigate((index + 1) % images.length);
        }}
        className="absolute right-4 top-1/2 -translate-y-1/2 px-4 py-3 text-4xl hover:text-accent"
        aria-label="Next image"
      >
        ›
      </button>
    </div>,
    document.body,
  );
}

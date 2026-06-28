import { useState } from "react";
import type { FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import AdminShell from "../components/layout/AdminShell";
import Button from "../components/ui/Button";
import FormField from "../components/ui/FormField";
import MetricTile from "../components/ui/MetricTile";
import StatusText from "../components/ui/StatusText";
import { api } from "../lib/api";
import { fetchPortfolioCmsProjects } from "../services/portfolioService";

export default function PortfolioCmsPage() {
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const { data, isLoading, isError } = useQuery({
    queryKey: ["portfolio-cms-projects"],
    queryFn: fetchPortfolioCmsProjects,
  });
  const deleteMutation = useMutation({
    mutationFn: api.portfolio.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["portfolio-cms-projects"] }),
  });
  const featuredMutation = useMutation({
    mutationFn: ({ id, is_featured }: { id: string; is_featured: boolean }) =>
      api.portfolio.update(id, { is_featured }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["portfolio-cms-projects"] }),
  });

  return (
    <AdminShell>
      <div className="mx-auto max-w-6xl">
        <header className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="mb-2 text-4xl font-display font-semibold uppercase tracking-[-0.04em]">
              Portfolio Management
            </h1>
            <p className="max-w-md text-[0.95rem] leading-7 text-grey">
              Curate your visual narrative. Add, edit, or organize your studio's
              finest works.
            </p>
          </div>
          <Button onClick={() => setIsAdding((value) => !value)}>
            Add Project
          </Button>
        </header>

        <section className="mb-16 grid border-l border-t border-grey-light md:grid-cols-4">
          {(data?.metrics ?? []).map((metric) => (
            <MetricTile key={metric.label} label={metric.label} value={metric.value} />
          ))}
        </section>

        {isAdding ? <NewProjectPanel onDone={() => setIsAdding(false)} /> : null}

        <section className="border-t border-grey-light">
          {isLoading ? <p className="border-b border-grey-light py-8 text-sm text-grey">Loading portfolio</p> : null}
          {isError ? <p className="border-b border-grey-light py-8 text-sm text-grey">Portfolio could not load</p> : null}
          {(data?.projects ?? []).map((project) => (
            <article
              key={project.id}
              className="studio-plane grid gap-6 border-b border-grey-light py-8 md:grid-cols-12 md:items-center"
            >
              <div className="md:col-span-6 flex items-center gap-6">
                <div className="h-32 w-24 shrink-0 bg-grey-faint">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="h-full w-full object-cover grayscale"
                  />
                </div>
                <div>
                  <div className="mb-2 flex flex-wrap items-center gap-3">
                    <h2 className="text-2xl font-display font-semibold uppercase">
                      {project.title}
                    </h2>
                    <StatusText status={project.status} />
                  </div>
                  <p className="text-[0.75rem] font-semibold uppercase tracking-[0.25em] text-grey">
                    {project.series} / {project.category}
                  </p>
                </div>
              </div>
              <div className="hidden text-center text-[0.75rem] font-semibold uppercase tracking-[0.25em] text-grey md:col-span-3 md:block">
                {project.date}
              </div>
              <div className="flex flex-wrap gap-4 md:col-span-3 md:justify-end">
                <Button
                  onClick={() =>
                    featuredMutation.mutate({
                      id: project.id,
                      is_featured: project.status !== "Featured",
                    })
                  }
                >
                  {project.status === "Featured" ? "Unfeature" : "Feature"}
                </Button>
                <Button
                  onClick={() => deleteMutation.mutate(project.id)}
                  disabled={deleteMutation.isPending}
                >
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

function NewProjectPanel({ onDone }: { onDone: () => void }) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Portraits");
  const [eventDate, setEventDate] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isFeatured, setIsFeatured] = useState(false);
  const createMutation = useMutation({
    mutationFn: async () => {
      const uploaded = file ? await api.portfolio.upload(file) : null;
      return api.portfolio.create({
        title,
        category,
        event_date: eventDate,
        cover_url: uploaded?.url ?? coverUrl,
        is_featured: isFeatured,
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["portfolio-cms-projects"] });
      onDone();
    },
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    createMutation.mutate();
  }

  return (
    <form className="mb-12 border border-grey-light bg-grey-faint p-8" onSubmit={handleSubmit}>
      <h2 className="mb-8 text-2xl font-display font-semibold uppercase">
        New Project
      </h2>
      <div className="grid gap-8 md:grid-cols-2">
        <FormField id="projectTitle" label="Project Title" required value={title} onChange={(event) => setTitle(event.target.value)} />
        <FormField as="select" id="projectCategory" label="Category" value={category} onChange={(event) => setCategory(event.target.value)}>
          <option>Portraits</option>
          <option>Weddings</option>
          <option>Corporate</option>
          <option>Concerts</option>
        </FormField>
        <FormField id="eventDate" label="Event Date" type="date" required value={eventDate} onChange={(event) => setEventDate(event.target.value)} />
        <FormField id="coverUrl" label="Cover URL" type="url" value={coverUrl} onChange={(event) => setCoverUrl(event.target.value)} />
        <div className="md:col-span-2">
          <label className="mb-3 block text-[0.7rem] font-semibold uppercase tracking-[0.25em] text-grey" htmlFor="projectImage">
            Upload Image
          </label>
          <input
            id="projectImage"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            className="w-full border border-dashed border-ink bg-paper p-8 text-[0.75rem] font-semibold uppercase tracking-[0.2em]"
          />
        </div>
        <label className="flex items-center gap-3 text-[0.75rem] font-semibold uppercase tracking-[0.2em] text-grey">
          <input type="checkbox" checked={isFeatured} onChange={(event) => setIsFeatured(event.target.checked)} />
          Featured
        </label>
      </div>
      <div className="mt-8 flex flex-col gap-4 sm:flex-row">
        <Button type="button" onClick={onDone}>Cancel</Button>
        <Button type="submit" disabled={createMutation.isPending}>
          {createMutation.isPending ? "Publishing" : "Publish Project"}
        </Button>
      </div>
    </form>
  );
}

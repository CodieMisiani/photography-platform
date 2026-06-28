import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import AdminShell from "../components/layout/AdminShell";
import Button from "../components/ui/Button";
import FormField from "../components/ui/FormField";
import MetricTile from "../components/ui/MetricTile";
import StatusText from "../components/ui/StatusText";
import { fetchPortfolioCmsProjects } from "../services/portfolioService";

export default function PortfolioCmsPage() {
  const [isAdding, setIsAdding] = useState(false);
  const { data } = useQuery({
    queryKey: ["portfolio-cms-projects"],
    queryFn: fetchPortfolioCmsProjects,
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

        {isAdding ? <NewProjectPanel /> : null}

        <section className="border-t border-grey-light">
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
              <div className="flex gap-4 md:col-span-3 md:justify-end">
                <button className="border border-ink px-4 py-2 text-[0.75rem] font-semibold uppercase tracking-[0.2em] hover:bg-ink hover:text-paper">
                  Edit
                </button>
                <button className="border border-ink px-4 py-2 text-[0.75rem] font-semibold uppercase tracking-[0.2em] underline decoration-ink decoration-1 underline-offset-4 hover:bg-ink hover:text-paper">
                  Delete
                </button>
              </div>
            </article>
          ))}
        </section>

        <div className="mt-12 flex items-center justify-between border-t border-grey-light pt-6">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.25em] text-grey">
            Page 01 / 12
          </p>
          <div className="flex">
            <button className="h-10 w-10 border border-ink hover:bg-ink hover:text-paper">
              {"<"}
            </button>
            <button className="h-10 w-10 border-y border-r border-ink hover:bg-ink hover:text-paper">
              {">"}
            </button>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}

function NewProjectPanel() {
  return (
    <section className="mb-12 border border-grey-light bg-grey-faint p-8">
      <h2 className="mb-8 text-2xl font-display font-semibold uppercase">
        New Project
      </h2>
      <div className="grid gap-8 md:grid-cols-2">
        <FormField id="projectTitle" label="Project Title" placeholder="Ivory Nocturne" />
        <FormField as="select" id="projectCategory" label="Category">
          <option>Portrait</option>
          <option>Architectural</option>
          <option>Editorial</option>
          <option>Nature</option>
        </FormField>
        <div className="md:col-span-2 border border-dashed border-ink bg-paper p-10 text-center">
          <p className="text-[0.75rem] font-semibold uppercase tracking-[0.25em]">
            Drop assets here or click to upload
          </p>
        </div>
      </div>
      <div className="mt-8 flex flex-col gap-4 sm:flex-row">
        <Button>Cancel</Button>
        <Button>Publish Project</Button>
      </div>
    </section>
  );
}

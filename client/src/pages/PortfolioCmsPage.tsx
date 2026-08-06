import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import AdminShell from "../components/layout/AdminShell";
import Button from "../components/ui/Button";
import AdminEmptyState from "../components/ui/AdminEmptyState";
import FormField from "../components/ui/FormField";
import MetricTile from "../components/ui/MetricTile";
import StatusText from "../components/ui/StatusText";
import { api } from "../lib/api";
import type { ApiProjectPhoto } from "../lib/api";
import { fetchPortfolioCmsProjects } from "../services/portfolioService";
import type { PortfolioCmsProject } from "../types/portfolio";

export default function PortfolioCmsPage() {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const editingId = projectId ?? null;
  const { data, isLoading, isError } = useQuery({
    queryKey: ["portfolio-cms-projects"],
    queryFn: fetchPortfolioCmsProjects,
  });
  const deleteMutation = useMutation({
    mutationFn: api.portfolio.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["portfolio-cms-projects"] }),
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof api.portfolio.update>[1] }) =>
      api.portfolio.update(id, payload),
    onSuccess: async () => {
      navigate("/admin/portfolio-cms");
      await queryClient.invalidateQueries({ queryKey: ["portfolio-cms-projects"] });
    },
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

        {isAdding ? <ProjectForm onDone={() => setIsAdding(false)} /> : null}
        <CategoryManager />

        <section className="border-t border-grey-light">
          {isLoading ? <p className="border-b border-grey-light py-8 text-sm text-grey">Loading portfolio</p> : null}
          {isError ? <p className="border-b border-grey-light py-8 text-sm text-grey">Portfolio could not load</p> : null}
          {!isLoading && !isError && (data?.projects ?? []).length === 0 ? (
            <AdminEmptyState
              icon="image"
              title="No portfolio items yet"
              message="Upload your first photo to get started."
              actionLabel="Add Photo"
              onAction={() => setIsAdding(true)}
            />
          ) : null}
          {(data?.projects ?? []).map((project) => (
            <article key={project.id} className="border-b border-grey-light py-8 transition-colors duration-150 hover:bg-paper-warm">
              {editingId === project.id ? (
                <ProjectForm
                  project={project}
                  isSaving={updateMutation.isPending}
                  onCancel={() => navigate("/admin/portfolio-cms")}
                  onSave={(payload) => updateMutation.mutate({ id: project.id, payload })}
                />
              ) : (
                <div className="studio-plane grid gap-6 md:grid-cols-12 md:items-center">
                  <div className="md:col-span-6 flex items-center gap-6">
                    <div className="h-32 w-24 shrink-0 bg-grey-faint">
                      <img
                        src={project.image ?? ""}
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
                    <Button onClick={() => navigate(`/admin/projects/${project.id}/edit`)}>Edit</Button>
                    <Button
                      onClick={() =>
                        updateMutation.mutate({
                          id: project.id,
                          payload: { is_featured: !project.isFeatured },
                        })
                      }
                    >
                      {project.isFeatured ? "Unfeature" : "Feature"}
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => {
                        if (
                          window.confirm(
                            "Delete this portfolio item permanently? This also removes its Cloudinary image when available.",
                          )
                        ) {
                          deleteMutation.mutate(project.id);
                        }
                      }}
                      disabled={deleteMutation.isPending}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              )}
            </article>
          ))}
        </section>
      </div>
    </AdminShell>
  );
}

function CategoryManager() {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const { data } = useQuery({ queryKey: ["portfolio-categories"], queryFn: api.portfolio.categories.list });
  const create = useMutation({ mutationFn: api.portfolio.categories.create, onSuccess: async () => { setName(""); setMessage("Category added."); await queryClient.invalidateQueries({ queryKey: ["portfolio-categories"] }); } });
  const remove = useMutation({ mutationFn: api.portfolio.categories.delete, onSuccess: async () => { setMessage("Category deleted."); await queryClient.invalidateQueries({ queryKey: ["portfolio-categories"] }); }, onError: (error: Error) => setMessage(error.message) });
  return <section className="mb-12 border border-grey-light bg-paper-white p-6"><h2 className="text-2xl font-display font-semibold uppercase">Categories</h2><form className="mt-4 flex gap-3" onSubmit={(event) => { event.preventDefault(); if (name.trim()) create.mutate(name); }}><input value={name} onChange={(event) => setName(event.target.value)} placeholder="New category" className="flex-1 border border-grey-light bg-paper px-3 py-2" /><Button type="submit" disabled={create.isPending}>Add Category</Button></form>{message ? <p className="mt-3 text-sm text-text-muted">{message}</p> : null}<div className="mt-4 flex flex-wrap gap-2">{(data?.categories ?? []).map((category) => <span key={category.id} className="inline-flex items-center gap-2 border border-paper-deep px-3 py-2 text-sm"><span>{category.name}</span><button type="button" className="text-red-700" onClick={() => { if (window.confirm(`Delete ${category.name}?`)) remove.mutate(category.id); }}>×</button></span>)}</div></section>;
}

function ProjectForm({
  project,
  isSaving = false,
  onDone,
  onSave,
  onCancel,
}: {
  project?: PortfolioCmsProject;
  isSaving?: boolean;
  onDone?: () => void;
  onSave?: (payload: Parameters<typeof api.portfolio.update>[1]) => void;
  onCancel?: () => void;
}) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState(project?.title ?? "");
  const { data: categoryData } = useQuery({ queryKey: ["portfolio-categories"], queryFn: api.portfolio.categories.list });
  const [category, setCategory] = useState(project?.category ?? "");
  const [eventDate, setEventDate] = useState(project?.eventDate ?? "");
  const [coverUrl] = useState(project?.coverUrl ?? "");
  const [coverPublicId] = useState(project?.coverPublicId ?? null);
  const [file, setFile] = useState<File | null>(null);
  const localPreviewUrl = useFilePreview(file);
  const previewUrl = localPreviewUrl || coverUrl;
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "uploading" | "success" | "error"
  >("idle");
  const [uploadError, setUploadError] = useState("");
  const [isFeatured, setIsFeatured] = useState(project?.isFeatured ?? false);
  const [isPublished, setIsPublished] = useState(project?.isPublished ?? true);
  const createMutation = useMutation({
    mutationFn: async () => {
      const uploaded = await uploadSelectedPortfolioFile(
        file,
        setUploadStatus,
        setUploadError,
      );
      return api.portfolio.create({
        title,
        category,
        event_date: eventDate,
        cover_url: uploaded?.url ?? coverUrl,
        cover_public_id: uploaded?.public_id ?? coverPublicId,
        is_featured: isFeatured,
        is_published: isPublished,
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["portfolio-cms-projects"] });
      onDone?.();
    },
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (project && onSave) {
      const uploaded = await uploadSelectedPortfolioFile(
        file,
        setUploadStatus,
        setUploadError,
      );
      onSave({
        title,
        category,
        event_date: eventDate,
        cover_url: uploaded?.url ?? coverUrl,
        cover_public_id: uploaded?.public_id ?? coverPublicId,
        is_featured: isFeatured,
        is_published: isPublished,
      });
      return;
    }

    createMutation.mutate();
  }

  return (
    <form className="mb-12 border border-grey-light bg-grey-faint p-8" onSubmit={handleSubmit}>
      <h2 className="mb-8 text-2xl font-display font-semibold uppercase">
        {project ? "Edit Project" : "New Project"}
      </h2>
      <div className="grid gap-8 md:grid-cols-2">
        <FormField id={`projectTitle-${project?.id ?? "new"}`} label="Project Title" required value={title} onChange={(event) => setTitle(event.target.value)} />
        <FormField as="select" id={`projectCategory-${project?.id ?? "new"}`} label="Category" required value={category} onChange={(event) => setCategory(event.target.value)}>
          <option value="">Select a category</option>
          {(categoryData?.categories ?? []).map((item) => <option key={item.id} value={item.name}>{item.name}</option>)}
        </FormField>
        <FormField id={`eventDate-${project?.id ?? "new"}`} label="Event Date" type="date" required value={eventDate} onChange={(event) => setEventDate(event.target.value)} />
        <div className="md:col-span-2">
          <label className="mb-3 block text-[0.7rem] font-semibold uppercase tracking-[0.25em] text-grey" htmlFor={`projectImage-${project?.id ?? "new"}`}>
            Cover Photo
          </label>
          <input
            id={`projectImage-${project?.id ?? "new"}`}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(event) => {
              setFile(event.target.files?.[0] ?? null);
              setUploadStatus("idle");
              setUploadError("");
            }}
            className="w-full border border-dashed border-ink bg-paper p-8 text-[0.75rem] font-semibold uppercase tracking-[0.2em]"
          />
          {file ? (
            <p className="mt-3 text-[0.75rem] font-semibold uppercase tracking-[0.2em] text-grey">
              Ready to upload: {file.name}
            </p>
          ) : null}
          {uploadStatus === "uploading" ? <UploadNote message="Uploading image" /> : null}
          {uploadStatus === "success" ? <UploadNote message="Image uploaded successfully" /> : null}
          {uploadStatus === "error" ? (
            <UploadNote message={uploadError || "Image upload failed"} tone="error" />
          ) : null}
          {previewUrl ? (
            <div className="mt-4 flex items-end gap-4">
              <img
                src={previewUrl}
                alt={localPreviewUrl ? "Selected cover preview" : "Current cover preview"}
                className="h-32 w-24 object-cover grayscale"
              />
              {project && !localPreviewUrl ? <Button type="button" variant="danger" onClick={() => {
                if (window.confirm("Remove this cover photo? The project will remain available as a draft until a new cover is uploaded.")) {
                  onSave?.({ title, category, event_date: eventDate, cover_url: null, cover_public_id: null, is_featured: isFeatured, is_published: false });
                }
              }}>Remove cover</Button> : null}
            </div>
          ) : null}
        </div>
        <label className="flex items-center gap-3 text-[0.75rem] font-semibold uppercase tracking-[0.2em] text-grey">
          <input type="checkbox" checked={isFeatured} onChange={(event) => setIsFeatured(event.target.checked)} />
          Featured
        </label>
        <label className="flex items-center gap-3 text-[0.75rem] font-semibold uppercase tracking-[0.2em] text-grey">
          <input type="checkbox" checked={isPublished} onChange={(event) => setIsPublished(event.target.checked)} />
          Publish now
        </label>
      </div>
      <div className="mt-8 flex flex-col gap-4 sm:flex-row">
        <Button type="button" variant="neutral" onClick={onCancel ?? onDone}>Cancel</Button>
        <Button type="submit" disabled={createMutation.isPending || isSaving}>
          {createMutation.isPending || isSaving ? "Saving" : project ? "Save Project" : "Publish Project"}
        </Button>
      </div>
      {project ? <ProjectPhotoManager projectId={project.id} /> : null}
    </form>
  );
}

function ProjectPhotoManager({ projectId }: { projectId: string }) {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const { data, isLoading } = useQuery({
    queryKey: ["portfolio-project-photos", projectId],
    queryFn: () => api.portfolio.listPhotos(projectId),
  });
  const photos = data?.photos ?? [];
  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: ["portfolio-project-photos", projectId] });
  const updateMutation = useMutation({
    mutationFn: ({ photoId, payload }: { photoId: string; payload: Partial<Pick<ApiProjectPhoto, "caption" | "alt_text" | "sort_order">> }) =>
      api.portfolio.updatePhoto(projectId, photoId, payload),
    onSuccess: refresh,
  });
  const deleteMutation = useMutation({
    mutationFn: (photoId: string) => api.portfolio.deletePhoto(projectId, photoId),
    onSuccess: refresh,
  });

  async function upload(file: File | null) {
    if (!file) return;
    setUploading(true);
    try {
      await api.portfolio.addPhoto(projectId, file, { sort_order: photos.length });
      await refresh();
    } finally {
      setUploading(false);
    }
  }

  async function movePhoto(targetId: string) {
    if (!draggedId || draggedId === targetId) return;
    const from = photos.findIndex((photo) => photo.id === draggedId);
    const to = photos.findIndex((photo) => photo.id === targetId);
    if (from < 0 || to < 0) return;
    const reordered = [...photos];
    const [moved] = reordered.splice(from, 1);
    reordered.splice(to, 0, moved);
    setDraggedId(null);
    await api.portfolio.reorderPhotos(
      projectId,
      reordered.map((photo, index) => ({ id: photo.id, sort_order: index })),
    );
    await refresh();
  }

  return (
    <section className="mt-10 border-t border-grey-light pt-8">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-display font-semibold uppercase">Project Photos</h3>
          <p className="mt-1 text-sm text-grey">Drag the grip to arrange gallery images. Captions save when you leave the field.</p>
        </div>
        <label className="cursor-pointer bg-accent px-4 py-3 text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-white hover:bg-accent/90">
          {uploading ? "Uploading…" : "Add Photo"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            disabled={uploading}
            onChange={(event) => {
              void upload(event.target.files?.[0] ?? null);
              event.currentTarget.value = "";
            }}
          />
        </label>
      </div>
      {isLoading ? <div className="h-32 animate-pulse bg-paper-deep" /> : null}
      {!isLoading && photos.length === 0 ? (
        <p className="border border-dashed border-grey-light p-6 text-sm text-grey">No additional photos yet.</p>
      ) : null}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {photos.map((photo, index) => (
          <article
            key={photo.id}
            draggable
            onDragStart={() => setDraggedId(photo.id)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => void movePhoto(photo.id)}
            className="border border-grey-light bg-paper-white p-2"
          >
            <div className="relative aspect-square overflow-hidden bg-grey-faint">
              <img src={photo.cloudinary_url} alt={photo.caption ?? "Project photo"} className="h-full w-full object-cover" />
              <span className="absolute left-2 top-2 bg-paper/90 px-2 py-1 text-xs text-text-muted" title="Drag to reorder">⋮⋮ {index + 1}</span>
            </div>
            <input
              defaultValue={photo.caption ?? ""}
              aria-label={`Caption for photo ${index + 1}`}
              placeholder="Caption"
              maxLength={255}
              onBlur={(event) => {
                if (event.target.value !== (photo.caption ?? "")) {
                  updateMutation.mutate({ photoId: photo.id, payload: { caption: event.target.value } });
                }
              }}
              className="mt-2 w-full border border-grey-light bg-paper px-2 py-2 text-sm"
            />
            <input
              defaultValue={photo.alt_text ?? ""}
              aria-label={`Alt text for photo ${index + 1}`}
              placeholder="Alt text"
              maxLength={255}
              onBlur={(event) => {
                if (event.target.value !== (photo.alt_text ?? "")) updateMutation.mutate({ photoId: photo.id, payload: { alt_text: event.target.value } });
              }}
              className="mt-2 w-full border border-grey-light bg-paper px-2 py-2 text-sm"
            />
            <button
              type="button"
              className="mt-2 text-xs font-semibold uppercase tracking-widest text-red-700"
              disabled={deleteMutation.isPending}
              onClick={() => {
                if (window.confirm("Delete this photo permanently?")) deleteMutation.mutate(photo.id);
              }}
            >
              Delete
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

function useFilePreview(file: File | null) {
  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : ""), [file]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return previewUrl;
}

async function uploadSelectedPortfolioFile(
  file: File | null,
  setStatus: (status: "idle" | "uploading" | "success" | "error") => void,
  setError: (message: string) => void,
) {
  if (!file) {
    return null;
  }

  setStatus("uploading");
  setError("");
  try {
    const uploaded = await api.portfolio.upload(file);
    setStatus("success");
    return uploaded;
  } catch (error) {
    setStatus("error");
    setError(error instanceof Error ? error.message : "Image upload failed");
    throw error;
  }
}

function UploadNote({
  message,
  tone = "info",
}: {
  message: string;
  tone?: "info" | "error";
}) {
  return (
    <p
      className={`mt-3 text-[0.75rem] font-semibold uppercase tracking-[0.2em] ${
        tone === "error" ? "text-red-700" : "text-grey"
      }`}
    >
      {message}
    </p>
  );
}

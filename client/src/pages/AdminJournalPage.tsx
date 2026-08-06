import { useState } from "react";
import type { FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import MDEditor from "@uiw/react-md-editor";
import AdminShell from "../components/layout/AdminShell";
import Button from "../components/ui/Button";
import AdminEmptyState from "../components/ui/AdminEmptyState";
import FormField from "../components/ui/FormField";
import StatusText from "../components/ui/StatusText";
import { api } from "../lib/api";

type JournalFormState = {
  title: string;
  excerpt: string;
  body: string;
  category: string;
  is_published: boolean;
};

const emptyForm: JournalFormState = {
  title: "",
  excerpt: "",
  body: "",
  category: "",
  is_published: false,
};

export default function AdminJournalPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeEditor, setActiveEditor] = useState<"write" | "preview">(
    "write",
  );

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-journal"],
    queryFn: api.journal.adminList,
  });

  const createMutation = useMutation({
    mutationFn: async () =>
      api.journal.create({
        title: form.title,
        excerpt: form.excerpt,
        body: form.body,
        category: form.category,
        is_published: form.is_published,
        cover: file,
      }),
    onSuccess: async () => {
      setForm(emptyForm);
      setFile(null);
      await queryClient.invalidateQueries({ queryKey: ["admin-journal"] });
      await queryClient.invalidateQueries({ queryKey: ["journal-list"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Parameters<typeof api.journal.update>[1];
    }) => api.journal.update(id, payload),
    onSuccess: async () => {
      setEditingId(null);
      await queryClient.invalidateQueries({ queryKey: ["admin-journal"] });
      await queryClient.invalidateQueries({ queryKey: ["journal-list"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: api.journal.delete,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-journal"] });
      await queryClient.invalidateQueries({ queryKey: ["journal-list"] });
    },
  });

  function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    createMutation.mutate();
  }

  return (
    <AdminShell>
      <div className="mx-auto max-w-6xl">
        <header className="mb-10">
          <p className="mb-2 text-[0.75rem] font-semibold uppercase tracking-[0.3em] text-grey">
            Editorial
          </p>
          <h1 className="font-display text-5xl font-semibold uppercase tracking-[-0.04em]">
            Journal Posts
          </h1>
          <p className="mt-4 max-w-2xl text-[0.95rem] leading-7 text-grey">
            Publish field notes, stories, and behind-the-scenes writing for the
            public journal.
          </p>
        </header>

        <form
          className="mb-12 border border-grey-light bg-grey-faint p-8"
          onSubmit={handleCreate}
        >
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-2xl font-display font-semibold uppercase">
              Create Post
            </h2>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setActiveEditor("write")}
                className={`border px-3 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.2em] ${
                  activeEditor === "write"
                    ? "border-accent bg-accent text-white"
                    : "border-paper-deep bg-paper-white text-text-muted"
                }`}
              >
                Write
              </button>
              <button
                type="button"
                onClick={() => setActiveEditor("preview")}
                className={`border px-3 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.2em] ${
                  activeEditor === "preview"
                    ? "border-accent bg-accent text-white"
                    : "border-paper-deep bg-paper-white text-text-muted"
                }`}
              >
                Preview
              </button>
            </div>
          </div>
          <div className="grid gap-8 md:grid-cols-2">
            <FormField
              id="journal-title"
              label="Title"
              required
              value={form.title}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  title: event.target.value,
                }))
              }
            />
            <FormField
              id="journal-category"
              label="Category"
              value={form.category}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  category: event.target.value,
                }))
              }
            />
            <div className="md:col-span-2">
              <FormField
                id="journal-excerpt"
                as="textarea"
                label="Excerpt"
                required
                value={form.excerpt}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    excerpt: event.target.value,
                  }))
                }
                rows={4}
              />
            </div>
            <div className="md:col-span-2">
              <label
                className="mb-3 block text-[0.7rem] font-semibold uppercase tracking-[0.25em] text-grey"
                htmlFor="journal-cover"
              >
                Cover image
              </label>
              <input
                id="journal-cover"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                className="w-full border border-dashed border-ink bg-paper p-8 text-[0.75rem] font-semibold uppercase tracking-[0.2em]"
              />
            </div>
            <label className="flex items-center gap-3 text-[0.75rem] font-semibold uppercase tracking-[0.2em] text-grey">
              <input
                type="checkbox"
                checked={form.is_published}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    is_published: event.target.checked,
                  }))
                }
              />
              Publish immediately
            </label>
          </div>
          <div className="mt-8 rounded-none border border-paper-deep bg-paper p-4">
            {activeEditor === "write" ? (
              <MDEditor
                value={form.body}
                onChange={(value) =>
                  setForm((current) => ({ ...current, body: value ?? "" }))
                }
                height={320}
              />
            ) : (
              <div className="prose prose-stone max-w-none min-h-65 p-2 text-[0.95rem] leading-8 text-text-secondary">
                <MDEditor.Markdown
                  source={form.body || "No preview yet. Start writing…"}
                />
              </div>
            )}
          </div>
          <Button
            type="submit"
            disabled={createMutation.isPending}
            className="mt-8"
          >
            {createMutation.isPending ? "Publishing" : "Publish Post"}
          </Button>
        </form>

        <section className="border-t border-grey-light">
          {isLoading ? (
            <p className="border-b border-grey-light py-8 text-sm text-grey">
              Loading journal posts
            </p>
          ) : null}
          {isError ? (
            <p className="border-b border-grey-light py-8 text-sm text-grey">
              Journal posts could not be loaded
            </p>
          ) : null}
          {!isLoading && !isError && (data?.posts ?? []).length === 0 ? (
            <AdminEmptyState
              icon="star"
              title="No journal posts yet"
              message="Create your first story to start publishing."
              actionLabel="Create Post"
              onAction={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            />
          ) : null}
          {(data?.posts ?? []).map((post) => (
            <article
              key={post.id}
              className="border-b border-grey-light py-8 transition-colors duration-150 hover:bg-paper-warm"
            >
              {editingId === post.id ? (
                <EditJournalPanel
                  post={post}
                  onCancel={() => setEditingId(null)}
                  onSave={(payload) =>
                    updateMutation.mutate({ id: post.id, payload })
                  }
                  isSaving={updateMutation.isPending}
                />
              ) : (
                <div className="grid gap-6 md:grid-cols-[1.1fr_0.7fr] md:items-start">
                  <div>
                    <div className="mb-3 flex flex-wrap items-center gap-3">
                      <h2 className="text-2xl font-display font-semibold uppercase">
                        {post.title}
                      </h2>
                      <StatusText
                        status={post.is_published ? "Published" : "Draft"}
                      />
                    </div>
                    <p className="text-[0.95rem] leading-7 text-grey">
                      {post.excerpt}
                    </p>
                    <p className="mt-4 text-[0.72rem] font-semibold uppercase tracking-[0.25em] text-text-muted">
                      {post.category ?? "Uncategorized"} ·{" "}
                      {post.read_time_minutes ?? 1} min read
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3 md:justify-end">
                    <Button onClick={() => setEditingId(post.id)}>Edit</Button>
                    <Button
                      onClick={() =>
                        updateMutation.mutate({
                          id: post.id,
                          payload: { is_published: !post.is_published },
                        })
                      }
                    >
                      {post.is_published ? "Unpublish" : "Publish"}
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => {
                        if (
                          window.confirm(
                            "Delete this journal post permanently?",
                          )
                        ) {
                          deleteMutation.mutate(post.id);
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

function EditJournalPanel({
  post,
  onCancel,
  onSave,
  isSaving,
}: {
  post: {
    id: string;
    title: string;
    excerpt: string;
    body: string;
    cover_url: string | null;
    category: string | null;
    read_time_minutes: number | null;
    is_published: boolean;
  };
  onCancel: () => void;
  onSave: (payload: Parameters<typeof api.journal.update>[1]) => void;
  isSaving: boolean;
}) {
  const [form, setForm] = useState<JournalFormState>({
    title: post.title,
    excerpt: post.excerpt,
    body: post.body,
    category: post.category ?? "",
    is_published: post.is_published,
  });
  const [file, setFile] = useState<File | null>(null);
  const [activeEditor, setActiveEditor] = useState<"write" | "preview">(
    "write",
  );

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSave({
      title: form.title,
      excerpt: form.excerpt,
      body: form.body,
      category: form.category,
      is_published: form.is_published,
      cover: file,
    });
  }

  return (
    <form
      className="border border-grey-light bg-grey-faint p-6"
      onSubmit={handleSubmit}
    >
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h3 className="text-xl font-display font-semibold uppercase">
          Edit Post
        </h3>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setActiveEditor("write")}
            className={`border px-3 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.2em] ${activeEditor === "write" ? "border-accent bg-accent text-white" : "border-paper-deep bg-paper-white text-text-muted"}`}
          >
            Write
          </button>
          <button
            type="button"
            onClick={() => setActiveEditor("preview")}
            className={`border px-3 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.2em] ${activeEditor === "preview" ? "border-accent bg-accent text-white" : "border-paper-deep bg-paper-white text-text-muted"}`}
          >
            Preview
          </button>
        </div>
      </div>
      <div className="grid gap-8 md:grid-cols-2">
        <FormField
          id={`edit-journal-title-${post.id}`}
          label="Title"
          required
          value={form.title}
          onChange={(event) =>
            setForm((current) => ({ ...current, title: event.target.value }))
          }
        />
        <FormField
          id={`edit-journal-category-${post.id}`}
          label="Category"
          value={form.category}
          onChange={(event) =>
            setForm((current) => ({ ...current, category: event.target.value }))
          }
        />
        <div className="md:col-span-2">
          <FormField
            id={`edit-journal-excerpt-${post.id}`}
            as="textarea"
            label="Excerpt"
            required
            value={form.excerpt}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                excerpt: event.target.value,
              }))
            }
            rows={4}
          />
        </div>
        <div className="md:col-span-2">
          <label
            className="mb-3 block text-[0.7rem] font-semibold uppercase tracking-[0.25em] text-grey"
            htmlFor={`edit-journal-cover-${post.id}`}
          >
            Replace cover image
          </label>
          <input
            id={`edit-journal-cover-${post.id}`}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            className="w-full border border-dashed border-ink bg-paper p-8 text-[0.75rem] font-semibold uppercase tracking-[0.2em]"
          />
        </div>
        <label className="flex items-center gap-3 text-[0.75rem] font-semibold uppercase tracking-[0.2em] text-grey">
          <input
            type="checkbox"
            checked={form.is_published}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                is_published: event.target.checked,
              }))
            }
          />
          Publish now
        </label>
      </div>
      <div className="mt-8 rounded-none border border-paper-deep bg-paper p-4">
        {activeEditor === "write" ? (
          <MDEditor
            value={form.body}
            onChange={(value) =>
              setForm((current) => ({ ...current, body: value ?? "" }))
            }
            height={320}
          />
        ) : (
          <div className="prose prose-stone max-w-none min-h-65 p-2 text-[0.95rem] leading-8 text-text-secondary">
            <MDEditor.Markdown
              source={form.body || "No preview yet. Start writing…"}
            />
          </div>
        )}
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button type="submit" disabled={isSaving}>
          {isSaving ? "Saving" : "Save Post"}
        </Button>
        <Button type="button" variant="neutral" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

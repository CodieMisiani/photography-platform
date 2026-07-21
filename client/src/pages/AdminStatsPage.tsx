import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import AdminShell from "../components/layout/AdminShell";
import Button from "../components/ui/Button";
import FormField from "../components/ui/FormField";
import { api } from "../lib/api";

type AdminStat = {
  id: string;
  key: string;
  label: string;
  value: number;
  suffix?: string | null;
  sort_order: number;
  is_visible: boolean;
};

export default function AdminStatsPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery<{ stats: AdminStat[] }>({
    queryKey: ["admin", "stats"],
    queryFn: () => api.stats.adminList(),
  });
  const [editing, setEditing] = useState<
    Record<string, { label: string; value: string; suffix?: string | null }>
  >({});

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<AdminStat>;
    }) => api.stats.update(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
    },
  });

  function startEdit(stat: AdminStat) {
    setEditing((s) => ({
      ...s,
      [stat.id]: {
        label: stat.label,
        value: String(stat.value),
        suffix: stat.suffix ?? "",
      },
    }));
  }

  function cancelEdit(id: string) {
    setEditing((s) => {
      const next = { ...s };
      delete next[id];
      return next;
    });
  }

  function save(id: string) {
    const payload = editing[id];
    updateMutation.mutate({
      id,
      payload: {
        label: payload.label,
        value: Number(payload.value),
        suffix: payload.suffix || null,
      },
    });
  }

  return (
    <AdminShell>
      <div className="mx-auto max-w-4xl">
        <header className="mb-8">
          <p className="mb-2 text-[0.75rem] font-semibold uppercase tracking-[0.3em] text-grey">
            Site
          </p>
          <h1 className="font-display text-4xl font-semibold">Statistics</h1>
        </header>

        {isLoading ? <p>Loading...</p> : null}

        <section className="space-y-6">
          {data?.stats.map((stat) => (
            <div
              key={stat.id}
              className="flex items-center gap-4 border-b border-grey-light py-4"
            >
              <div className="flex-1">
                <div className="mb-2 text-sm font-semibold text-grey">
                  {stat.key}
                </div>
                {editing[stat.id] ? (
                  <div className="grid gap-3 md:grid-cols-3">
                    <FormField
                      label="Label"
                      id={`label-${stat.id}`}
                      value={editing[stat.id].label}
                      onChange={(e) =>
                        setEditing((s) => ({
                          ...s,
                          [stat.id]: { ...s[stat.id], label: e.target.value },
                        }))
                      }
                    />
                    <FormField
                      label="Value"
                      id={`value-${stat.id}`}
                      value={editing[stat.id].value}
                      onChange={(e) =>
                        setEditing((s) => ({
                          ...s,
                          [stat.id]: { ...s[stat.id], value: e.target.value },
                        }))
                      }
                    />
                    <FormField
                      label="Suffix"
                      id={`suffix-${stat.id}`}
                      value={editing[stat.id].suffix ?? ""}
                      onChange={(e) =>
                        setEditing((s) => ({
                          ...s,
                          [stat.id]: { ...s[stat.id], suffix: e.target.value },
                        }))
                      }
                    />
                  </div>
                ) : (
                  <div className="text-lg font-semibold">
                    {stat.label}: {stat.value}
                    {stat.suffix ?? ""}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                {editing[stat.id] ? (
                  <>
                    <Button
                      onClick={() => save(stat.id)}
                      disabled={updateMutation.isPending}
                    >
                      Save
                    </Button>
                    <Button variant="neutral" onClick={() => cancelEdit(stat.id)}>Cancel</Button>
                  </>
                ) : (
                  <Button onClick={() => startEdit(stat)}>Edit</Button>
                )}
              </div>
            </div>
          ))}
        </section>
      </div>
    </AdminShell>
  );
}

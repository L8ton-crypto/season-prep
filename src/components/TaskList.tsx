"use client";
import { useMemo, useState } from "react";
import { CATEGORIES } from "@/lib/seasons";
import type { Task, Kid } from "@/lib/types";

type Props = {
  tasks: Task[];
  kids: Kid[];
  onToggle: (id: string, done: boolean) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, fields: Partial<Pick<Task, "title" | "notes" | "category" | "kid_id">>) => void;
};

export default function TaskList({ tasks, kids, onToggle, onDelete, onEdit }: Props) {
  const [filter, setFilter] = useState<string>("all");
  const [hideDone, setHideDone] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      if (filter !== "all" && t.category !== filter) return false;
      if (hideDone && t.done) return false;
      return true;
    });
  }, [tasks, filter, hideDone]);

  const grouped = useMemo(() => {
    const map = new Map<string, Task[]>();
    for (const t of filtered) {
      const list = map.get(t.category) || [];
      list.push(t);
      map.set(t.category, list);
    }
    return map;
  }, [filtered]);

  const counts = useMemo(() => {
    const totals = { all: tasks.length, done: tasks.filter((t) => t.done).length };
    return totals;
  }, [tasks]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="text-sm text-zinc-400">
            <span className="text-zinc-200 font-semibold">{counts.done}</span> / {counts.all} done
          </p>
          <label className="flex items-center gap-2 text-sm text-zinc-400 cursor-pointer">
            <input
              type="checkbox"
              checked={hideDone}
              onChange={(e) => setHideDone(e.target.checked)}
              className="accent-emerald-500"
            />
            Hide done
          </label>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          <FilterChip label="All" active={filter === "all"} onClick={() => setFilter("all")} />
          {CATEGORIES.map((c) => (
            <FilterChip
              key={c.id}
              label={`${c.emoji} ${c.label}`}
              active={filter === c.id}
              onClick={() => setFilter(c.id)}
            />
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-10 text-zinc-500 text-sm border border-dashed border-white/10 rounded-xl">
          Nothing to show. Add a task or change the filter.
        </div>
      ) : (
        Array.from(grouped.entries()).map(([category, list]) => {
          const cat = CATEGORIES.find((c) => c.id === category) || CATEGORIES[CATEGORIES.length - 1];
          return (
            <div key={category} className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-zinc-400 font-medium">
                <span>{cat.emoji}</span>
                <span>{cat.label}</span>
                <span className="text-zinc-600 text-xs">
                  {list.filter((t) => t.done).length} / {list.length}
                </span>
              </div>
              <ul className="space-y-1.5">
                {list.map((t) => (
                  <TaskRow
                    key={t.id}
                    task={t}
                    kids={kids}
                    isEditing={editingId === t.id}
                    onStartEdit={() => setEditingId(t.id)}
                    onCancelEdit={() => setEditingId(null)}
                    onToggle={onToggle}
                    onDelete={onDelete}
                    onEdit={onEdit}
                  />
                ))}
              </ul>
            </div>
          );
        })
      )}
    </div>
  );
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition ${
        active ? "bg-emerald-500/20 text-emerald-200 border border-emerald-500/30" : "bg-zinc-900 text-zinc-400 border border-white/5 hover:text-zinc-200"
      }`}
    >
      {label}
    </button>
  );
}

function TaskRow({
  task,
  kids,
  isEditing,
  onStartEdit,
  onCancelEdit,
  onToggle,
  onDelete,
  onEdit,
}: {
  task: Task;
  kids: Kid[];
  isEditing: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onToggle: Props["onToggle"];
  onDelete: Props["onDelete"];
  onEdit: Props["onEdit"];
}) {
  const [draftTitle, setDraftTitle] = useState(task.title);
  const [draftNotes, setDraftNotes] = useState(task.notes || "");
  const [draftKidId, setDraftKidId] = useState<string>(task.kid_id || "");

  const monthLabel =
    task.due_month && task.due_month >= 1 && task.due_month <= 12
      ? new Date(2000, task.due_month - 1, 1).toLocaleString("en-GB", { month: "short" })
      : null;

  const kidName = task.kid_id ? kids.find((k) => k.id === task.kid_id)?.name : null;

  return (
    <li className={`rounded-lg border ${task.done ? "border-white/5 bg-zinc-900/30" : "border-white/10 bg-zinc-900/60"}`}>
      <div className="flex items-start gap-3 p-3">
        <button
          type="button"
          onClick={() => onToggle(task.id, !task.done)}
          aria-label={task.done ? "Mark not done" : "Mark done"}
          className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center border shrink-0 transition ${
            task.done ? "bg-emerald-500/30 border-emerald-400 text-emerald-200" : "border-zinc-600 hover:border-zinc-300"
          }`}
        >
          {task.done && (
            <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M3.5 8.5l3 3 6-7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>
        <div className="min-w-0 flex-1">
          {isEditing ? (
            <div className="space-y-2">
              <input
                value={draftTitle}
                onChange={(e) => setDraftTitle(e.target.value)}
                maxLength={200}
                className="w-full bg-zinc-950 border border-white/10 rounded px-2 py-1.5 text-sm"
                placeholder="Title"
              />
              <textarea
                value={draftNotes}
                onChange={(e) => setDraftNotes(e.target.value)}
                maxLength={1000}
                rows={2}
                className="w-full bg-zinc-950 border border-white/10 rounded px-2 py-1.5 text-sm"
                placeholder="Notes (optional)"
              />
              <select
                value={draftKidId}
                onChange={(e) => setDraftKidId(e.target.value)}
                className="w-full bg-zinc-950 border border-white/10 rounded px-2 py-1.5 text-sm"
              >
                <option value="">No specific kid</option>
                {kids.map((k) => (
                  <option key={k.id} value={k.id}>
                    For {k.name}
                  </option>
                ))}
              </select>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="text-xs px-3 py-1.5 rounded bg-emerald-500/20 text-emerald-200 border border-emerald-500/30 hover:bg-emerald-500/30"
                  onClick={() => {
                    if (!draftTitle.trim()) return;
                    onEdit(task.id, {
                      title: draftTitle.trim(),
                      notes: draftNotes,
                      kid_id: draftKidId || null,
                    });
                    onCancelEdit();
                  }}
                >
                  Save
                </button>
                <button
                  type="button"
                  className="text-xs px-3 py-1.5 rounded bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                  onClick={() => {
                    setDraftTitle(task.title);
                    setDraftNotes(task.notes || "");
                    setDraftKidId(task.kid_id || "");
                    onCancelEdit();
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="text-xs px-3 py-1.5 rounded bg-red-500/10 text-red-300 border border-red-500/20 hover:bg-red-500/20 ml-auto"
                  onClick={() => {
                    if (confirm("Delete this task?")) onDelete(task.id);
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ) : (
            <button type="button" onClick={onStartEdit} className="block text-left w-full">
              <p className={`text-sm ${task.done ? "line-through text-zinc-500" : "text-zinc-100"}`}>{task.title}</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {monthLabel && (
                  <span className="text-[10px] uppercase tracking-wider text-zinc-500 bg-zinc-800/60 px-1.5 py-0.5 rounded">
                    Due {monthLabel}
                  </span>
                )}
                {kidName && (
                  <span className="text-[10px] uppercase tracking-wider text-sky-300 bg-sky-500/10 px-1.5 py-0.5 rounded">
                    {kidName}
                  </span>
                )}
                {task.notes && <span className="text-xs text-zinc-400 truncate">{task.notes}</span>}
              </div>
            </button>
          )}
        </div>
      </div>
    </li>
  );
}

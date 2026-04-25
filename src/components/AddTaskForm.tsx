"use client";
import { useState } from "react";
import { CATEGORIES, Season } from "@/lib/seasons";
import type { Kid } from "@/lib/types";

export default function AddTaskForm({
  season,
  year,
  kids,
  onCreated,
}: {
  season: Season;
  year: number;
  kids: Kid[];
  onCreated: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string>("general");
  const [kidId, setKidId] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          category,
          season,
          year,
          kid_id: kidId || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to add");
      }
      setTitle("");
      setCategory("general");
      setKidId("");
      setOpen(false);
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add");
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full py-3 rounded-xl border border-dashed border-white/15 text-sm text-zinc-400 hover:text-zinc-100 hover:border-white/30 transition"
      >
        + Add a task
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-xl border border-white/10 bg-zinc-900/60 p-4 space-y-3">
      <input
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        maxLength={200}
        placeholder="What needs doing?"
        className="w-full bg-zinc-950 border border-white/10 rounded px-3 py-2 text-sm"
      />
      <div className="grid grid-cols-2 gap-2">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="bg-zinc-950 border border-white/10 rounded px-2 py-2 text-sm"
        >
          {CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.emoji} {c.label}
            </option>
          ))}
        </select>
        <select
          value={kidId}
          onChange={(e) => setKidId(e.target.value)}
          className="bg-zinc-950 border border-white/10 rounded px-2 py-2 text-sm"
        >
          <option value="">For everyone</option>
          {kids.map((k) => (
            <option key={k.id} value={k.id}>
              {k.name}
            </option>
          ))}
        </select>
      </div>
      {error && <p className="text-xs text-red-300">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting || !title.trim()}
          className="px-4 py-2 rounded text-sm bg-emerald-500/20 text-emerald-200 border border-emerald-500/30 hover:bg-emerald-500/30 disabled:opacity-50"
        >
          {submitting ? "Adding..." : "Add"}
        </button>
        <button
          type="button"
          className="px-4 py-2 rounded text-sm bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
          onClick={() => {
            setOpen(false);
            setTitle("");
            setError(null);
          }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

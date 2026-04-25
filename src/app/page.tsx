"use client";
import { useCallback, useEffect, useState } from "react";
import SeasonHeader from "@/components/SeasonHeader";
import TaskList from "@/components/TaskList";
import AddTaskForm from "@/components/AddTaskForm";
import KidsPanel from "@/components/KidsPanel";
import { Season, currentSeason } from "@/lib/seasons";
import type { Task, Kid } from "@/lib/types";

type View = "tasks" | "kids";

export default function HomePage() {
  const [year, setYear] = useState<number>(() => new Date().getFullYear());
  const [season, setSeason] = useState<Season>(() => currentSeason());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [kids, setKids] = useState<Kid[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>("tasks");
  const [seeding, setSeeding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [tasksRes, kidsRes] = await Promise.all([
        fetch(`/api/tasks?year=${year}`),
        fetch(`/api/kids`),
      ]);
      if (!tasksRes.ok) throw new Error("Failed to load tasks");
      if (!kidsRes.ok) throw new Error("Failed to load kids");
      const tasksData = await tasksRes.json();
      const kidsData = await kidsRes.json();
      setTasks(tasksData.tasks || []);
      setKids(kidsData.kids || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Load failed");
    } finally {
      setLoading(false);
    }
  }, [year]);

  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);

  // Auto-seed if year is empty.
  useEffect(() => {
    if (loading || seeding) return;
    if (tasks.length === 0 && !error) {
      void seed();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, tasks.length]);

  async function seed() {
    setSeeding(true);
    try {
      await fetch("/api/tasks/seed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ year }),
      });
      await load();
    } finally {
      setSeeding(false);
    }
  }

  async function toggle(id: string, done: boolean) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done } : t)));
    await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ done }),
    });
  }

  async function remove(id: string) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    await fetch(`/api/tasks/${id}`, { method: "DELETE" });
  }

  async function edit(id: string, fields: Partial<Pick<Task, "title" | "notes" | "category" | "kid_id">>) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...fields } : t)));
    await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fields),
    });
  }

  const seasonTasks = tasks.filter((t) => t.season === season);

  return (
    <main className="max-w-2xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">SeasonPrep</h1>
          <p className="text-xs text-zinc-500">Get ahead of the next season</p>
        </div>
        <nav className="flex bg-zinc-900 rounded-full p-1 text-xs">
          <button
            type="button"
            onClick={() => setView("tasks")}
            className={`px-3 py-1.5 rounded-full transition ${view === "tasks" ? "bg-zinc-800 text-zinc-100" : "text-zinc-400"}`}
          >
            Tasks
          </button>
          <button
            type="button"
            onClick={() => setView("kids")}
            className={`px-3 py-1.5 rounded-full transition ${view === "kids" ? "bg-zinc-800 text-zinc-100" : "text-zinc-400"}`}
          >
            Kids
          </button>
        </nav>
      </header>

      <SeasonHeader active={season} onSelect={setSeason} year={year} onYearChange={setYear} />

      {error && (
        <div className="text-sm text-red-300 bg-red-500/10 border border-red-500/20 rounded p-3">
          {error}{" "}
          <button onClick={load} className="underline">
            Retry
          </button>
        </div>
      )}

      {loading || seeding ? (
        <div className="text-center py-10 text-zinc-500 text-sm">{seeding ? "Setting up your year..." : "Loading..."}</div>
      ) : view === "tasks" ? (
        <div className="space-y-4">
          <TaskList tasks={seasonTasks} kids={kids} onToggle={toggle} onDelete={remove} onEdit={edit} />
          <AddTaskForm season={season} year={year} kids={kids} onCreated={load} />
        </div>
      ) : (
        <KidsPanel kids={kids} onChanged={load} />
      )}

      <footer className="pt-8 pb-4 text-center text-xs text-zinc-600">
        SeasonPrep • Built by L8 •{" "}
        <a href="https://github.com/L8ton-crypto/season-prep" className="underline hover:text-zinc-400">
          source
        </a>
      </footer>
    </main>
  );
}

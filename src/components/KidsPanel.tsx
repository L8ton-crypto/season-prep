"use client";
import { useState } from "react";
import type { Kid } from "@/lib/types";

export default function KidsPanel({
  kids,
  onChanged,
}: {
  kids: Kid[];
  onChanged: () => void;
}) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [bornYear, setBornYear] = useState<string>("");
  const [editingId, setEditingId] = useState<string | null>(null);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    const res = await fetch("/api/kids", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), born_year: bornYear ? parseInt(bornYear, 10) : null }),
    });
    if (res.ok) {
      setName("");
      setBornYear("");
      setAdding(false);
      onChanged();
    }
  }

  async function patch(id: string, fields: Partial<Kid>) {
    await fetch(`/api/kids/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fields),
    });
    onChanged();
  }

  async function remove(id: string) {
    if (!confirm("Remove this kid? Tasks tagged for them will become general.")) return;
    await fetch(`/api/kids/${id}`, { method: "DELETE" });
    onChanged();
  }

  const thisYear = new Date().getFullYear();

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-200">Kids</h3>
        {!adding && (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="text-xs px-3 py-1 rounded bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
          >
            + Add kid
          </button>
        )}
      </div>

      {adding && (
        <form onSubmit={add} className="rounded-lg border border-white/10 bg-zinc-900/60 p-3 space-y-2">
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
            maxLength={50}
            className="w-full bg-zinc-950 border border-white/10 rounded px-2 py-1.5 text-sm"
          />
          <input
            value={bornYear}
            onChange={(e) => setBornYear(e.target.value.replace(/[^0-9]/g, "").slice(0, 4))}
            placeholder="Birth year (optional)"
            inputMode="numeric"
            className="w-full bg-zinc-950 border border-white/10 rounded px-2 py-1.5 text-sm"
          />
          <div className="flex gap-2">
            <button type="submit" className="text-xs px-3 py-1.5 rounded bg-emerald-500/20 text-emerald-200 border border-emerald-500/30">
              Save
            </button>
            <button
              type="button"
              onClick={() => {
                setAdding(false);
                setName("");
                setBornYear("");
              }}
              className="text-xs px-3 py-1.5 rounded bg-zinc-800 text-zinc-300"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {kids.length === 0 && !adding ? (
        <p className="text-xs text-zinc-500">Add kids to track their sizing across seasons.</p>
      ) : (
        <ul className="space-y-2">
          {kids.map((k) => {
            const age = k.born_year ? thisYear - k.born_year : null;
            const editing = editingId === k.id;
            return (
              <li key={k.id} className="rounded-lg border border-white/10 bg-zinc-900/60 p-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-zinc-100">
                      {k.name} {age != null && <span className="text-xs text-zinc-500">({age}y)</span>}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingId(editing ? null : k.id)}
                      className="text-xs text-zinc-400 hover:text-zinc-100"
                    >
                      {editing ? "Close" : "Edit"}
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(k.id)}
                      className="text-xs text-red-400 hover:text-red-300"
                    >
                      Remove
                    </button>
                  </div>
                </div>
                {editing && (
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    <SizeField label="Tops" value={k.size_top} onSave={(v) => patch(k.id, { size_top: v })} />
                    <SizeField label="Bottoms" value={k.size_bottom} onSave={(v) => patch(k.id, { size_bottom: v })} />
                    <SizeField label="Shoes" value={k.size_shoe} onSave={(v) => patch(k.id, { size_shoe: v })} />
                  </div>
                )}
                {!editing && (k.size_top || k.size_bottom || k.size_shoe) && (
                  <div className="mt-2 flex gap-2 flex-wrap">
                    {k.size_top && (
                      <span className="text-[10px] uppercase tracking-wider text-zinc-400 bg-zinc-800/60 px-1.5 py-0.5 rounded">
                        Tops {k.size_top}
                      </span>
                    )}
                    {k.size_bottom && (
                      <span className="text-[10px] uppercase tracking-wider text-zinc-400 bg-zinc-800/60 px-1.5 py-0.5 rounded">
                        Bottoms {k.size_bottom}
                      </span>
                    )}
                    {k.size_shoe && (
                      <span className="text-[10px] uppercase tracking-wider text-zinc-400 bg-zinc-800/60 px-1.5 py-0.5 rounded">
                        Shoes {k.size_shoe}
                      </span>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function SizeField({ label, value, onSave }: { label: string; value: string; onSave: (v: string) => void }) {
  const [local, setLocal] = useState(value);
  return (
    <div className="text-xs">
      <label className="block text-zinc-500 mb-1">{label}</label>
      <input
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        onBlur={() => {
          if (local !== value) onSave(local);
        }}
        maxLength={30}
        placeholder="-"
        className="w-full bg-zinc-950 border border-white/10 rounded px-2 py-1 text-sm"
      />
    </div>
  );
}

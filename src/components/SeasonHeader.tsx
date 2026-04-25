"use client";
import { Season, SEASONS, currentSeason, nextSeasonStart, daysBetween } from "@/lib/seasons";

export default function SeasonHeader({
  active,
  onSelect,
  year,
  onYearChange,
}: {
  active: Season;
  onSelect: (s: Season) => void;
  year: number;
  onYearChange: (y: number) => void;
}) {
  const today = new Date();
  const cur = currentSeason(today);
  const upcoming = nextSeasonStart(today);
  const days = daysBetween(today, upcoming.date);
  const upcomingMeta = SEASONS.find((s) => s.id === upcoming.season)!;

  return (
    <div className="space-y-4">
      <div className={`rounded-2xl bg-gradient-to-br ${upcomingMeta.gradient} border border-white/5 p-5`}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wider text-zinc-400">Right now</p>
            <h2 className="text-2xl font-semibold mt-1">
              {SEASONS.find((s) => s.id === cur)!.emoji} {SEASONS.find((s) => s.id === cur)!.label}
            </h2>
            <p className="text-sm text-zinc-300 mt-2">
              {upcomingMeta.emoji} {upcomingMeta.label} starts in <span className="font-semibold">{days}</span>{" "}
              days
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onYearChange(year - 1)}
              className="text-zinc-400 hover:text-zinc-100 px-2 py-1 rounded hover:bg-white/5"
              aria-label="Previous year"
            >
              ‹
            </button>
            <span className="font-mono text-sm text-zinc-200 min-w-[3.5rem] text-center">{year}</span>
            <button
              type="button"
              onClick={() => onYearChange(year + 1)}
              className="text-zinc-400 hover:text-zinc-100 px-2 py-1 rounded hover:bg-white/5"
              aria-label="Next year"
            >
              ›
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {SEASONS.map((s) => {
          const isActive = active === s.id;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => onSelect(s.id)}
              className={`rounded-xl p-3 border text-center transition ${
                isActive
                  ? `bg-gradient-to-br ${s.gradient} border-white/20`
                  : "bg-zinc-900/50 border-white/5 hover:border-white/15"
              }`}
            >
              <div className="text-2xl">{s.emoji}</div>
              <div className={`text-xs mt-1 ${isActive ? s.accent : "text-zinc-400"}`}>{s.label}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

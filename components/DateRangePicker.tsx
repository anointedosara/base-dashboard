"use client";

import { useState } from "react";
import {
  MONTHS,
  WEEKDAYS,
  monthMatrix,
  formatMDY,
  sameDay,
  startOfDay,
  type DateRange,
} from "@/lib/date";
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from "@/components/Icons";

function Calendar({
  selected,
  min,
  max,
  onPick,
}: {
  selected: Date;
  min?: Date;
  max?: Date;
  onPick: (d: Date) => void;
}) {
  const [view, setView] = useState({ y: selected.getFullYear(), m: selected.getMonth() });
  const cells = monthMatrix(view.y, view.m);

  const step = (delta: number) => {
    const m = view.m + delta;
    setView({ y: view.y + Math.floor(m / 12), m: ((m % 12) + 12) % 12 });
  };

  const disabled = (d: Date) =>
    (min ? startOfDay(d) < startOfDay(min) : false) || (max ? startOfDay(d) > startOfDay(max) : false);

  return (
    <div className="w-64 rounded-xl bg-card p-3 shadow-xl ring-1 ring-line">
      <div className="mb-2 flex items-center justify-between">
        <button onClick={() => step(-1)} className="flex h-7 w-7 items-center justify-center rounded-md text-muted hover:bg-canvas" aria-label="Previous month">
          <ChevronLeftIcon className="h-4 w-4" />
        </button>
        <span className="text-sm font-medium text-ink">
          {MONTHS[view.m]} {view.y}
        </span>
        <button onClick={() => step(1)} className="flex h-7 w-7 items-center justify-center rounded-md text-muted hover:bg-canvas" aria-label="Next month">
          <ChevronRightIcon className="h-4 w-4" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-y-1 text-center text-[11px]">
        {WEEKDAYS.map((d, i) => (
          <span key={i} className="text-muted">{d}</span>
        ))}
        {cells.map((c, i) => {
          const isSel = sameDay(c.date, selected);
          const off = disabled(c.date);
          return (
            <button
              key={i}
              disabled={off}
              onClick={() => onPick(c.date)}
              className={`mx-auto flex h-7 w-7 items-center justify-center rounded-full text-xs transition ${
                isSel
                  ? "bg-primary font-medium text-white"
                  : off
                    ? "cursor-not-allowed text-line"
                    : c.current
                      ? "text-ink-soft hover:bg-canvas"
                      : "text-muted/60 hover:bg-canvas"
              }`}
            >
              {c.day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function RangeChip({
  which,
  value,
  open,
  setOpen,
  onChange,
  max,
}: {
  which: "start" | "end";
  value: DateRange;
  open: null | "start" | "end";
  setOpen: (v: null | "start" | "end") => void;
  onChange: (r: DateRange) => void;
  max?: Date;
}) {
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(open === which ? null : which)}
        className="flex items-center gap-2 rounded-xl bg-card px-3.5 py-2.5 text-sm font-medium text-ink-soft ring-1 ring-line transition hover:ring-primary/40"
      >
        {formatMDY(value[which])}
        <ChevronDownIcon className="h-3.5 w-3.5" />
      </button>
      {open === which && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(null)} />
          <div className="absolute right-0 top-12 z-40 animate-fade-in">
            <Calendar
              selected={value[which]}
              min={which === "end" ? value.start : undefined}
              max={which === "start" ? value.end : max}
              onPick={(d) => {
                onChange(
                  which === "start" ? { start: d, end: value.end } : { start: value.start, end: d },
                );
                setOpen(null);
              }}
            />
          </div>
        </>
      )}
    </div>
  );
}

export function DateRangePicker({
  value,
  onChange,
  max,
}: {
  value: DateRange;
  onChange: (r: DateRange) => void;
  max?: Date;
}) {
  const [open, setOpen] = useState<null | "start" | "end">(null);
  const shared = { value, open, setOpen, onChange, max };
  return (
    <div className="flex items-center gap-3">
      <RangeChip which="start" {...shared} />
      <RangeChip which="end" {...shared} />
    </div>
  );
}

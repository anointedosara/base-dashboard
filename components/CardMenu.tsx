"use client";

import { useState } from "react";
import { MoreIcon, TrendUpIcon, DownloadIcon } from "@/components/Icons";

export function CardMenu({ onRefresh }: { onRefresh?: () => void }) {
  const [open, setOpen] = useState(false);

  const items = [
    { label: "Refresh data", Icon: TrendUpIcon, run: onRefresh },
    { label: "Export", Icon: DownloadIcon, run: undefined },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="text-muted transition hover:text-ink"
        aria-label="Card options"
        aria-expanded={open}
      >
        <MoreIcon />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-7 z-20 w-40 overflow-hidden rounded-xl bg-card py-1 shadow-xl ring-1 ring-line animate-fade-in">
            {items.map(({ label, Icon, run }) => (
              <button
                key={label}
                onClick={() => {
                  run?.();
                  setOpen(false);
                }}
                className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-ink-soft transition hover:bg-canvas"
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

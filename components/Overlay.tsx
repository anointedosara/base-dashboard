"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { CloseIcon } from "@/components/Icons";

/** Right-hand slide-in drawer. */
export function Drawer({
  open,
  onClose,
  title,
  children,
  width = "max-w-md",
}: {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  width?: string;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40 animate-fade-in" onClick={onClose} />
      <div
        className={cn(
          "absolute right-0 top-0 flex h-full w-full flex-col bg-card shadow-2xl animate-slide-in-right",
          width,
        )}
      >
        <div className="flex items-center justify-between border-b border-line px-6 py-5">
          <div className="text-lg font-semibold text-ink">{title}</div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-danger-soft text-danger transition hover:bg-danger hover:text-white"
            aria-label="Close"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-6">{children}</div>
      </div>
    </div>
  );
}

/** Centered modal dialog. */
export function Modal({
  open,
  onClose,
  children,
  className,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 animate-fade-in" onClick={onClose} />
      <div className={cn("relative w-full max-w-lg rounded-2xl bg-card p-6 shadow-2xl animate-fade-in", className)}>
        {children}
      </div>
    </div>
  );
}

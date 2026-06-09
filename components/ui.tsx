import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { CardMenu } from "@/components/CardMenu";

export function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-2xl bg-card p-5 shadow-[0_4px_24px_rgba(20,20,43,0.04)]", className)}>
      {children}
    </section>
  );
}

export function CardHeader({
  title,
  action,
  more,
  onRefresh,
}: {
  title: string;
  action?: ReactNode;
  more?: boolean;
  onRefresh?: () => void;
}) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <h3 className="text-base font-semibold text-ink">{title}</h3>
      {action}
      {more && <CardMenu onRefresh={onRefresh} />}
    </div>
  );
}

/* Status pill used across boards, lists, invoices. */
const TONES: Record<string, string> = {
  Low: "bg-danger-soft text-danger",
  Medium: "bg-warning-soft text-warning",
  High: "bg-info-soft text-info",
  "On Track": "bg-warning-soft text-warning",
  "At risk": "bg-danger-soft text-danger",
  Complete: "bg-success-soft text-success",
  Done: "bg-success-soft text-success",
  Pending: "bg-warning-soft text-warning",
  Running: "bg-primary-light text-primary",
  Cancel: "bg-danger-soft text-danger",
  Male: "bg-info-soft text-info",
  Female: "bg-danger-soft text-danger",
};

export function Pill({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
        TONES[label] ?? "bg-line text-ink-soft",
        className,
      )}
    >
      {label}
    </span>
  );
}

export { TONES };

export function PageTitle({ children }: { children: ReactNode }) {
  return <h1 className="text-2xl font-semibold text-ink">{children}</h1>;
}

export function SearchInput({
  placeholder = "Search",
  className,
}: {
  placeholder?: string;
  className?: string;
}) {
  return (
    <label className={cn("flex items-center gap-2 rounded-xl bg-card px-3.5 py-2.5 text-sm ring-1 ring-line", className)}>
      <SearchSvg />
      <input
        placeholder={placeholder}
        className="w-full bg-transparent text-ink outline-none placeholder:text-muted"
      />
    </label>
  );
}

function SearchSvg() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9094b0" strokeWidth="2" strokeLinecap="round">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

export function DateChip({ label }: { label: string }) {
  return (
    <button className="flex items-center gap-2 rounded-xl bg-card px-3.5 py-2.5 text-sm font-medium text-ink-soft ring-1 ring-line transition hover:ring-primary/40">
      {label}
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m6 9 6 6 6-6" />
      </svg>
    </button>
  );
}

export function PrimaryButton({
  children,
  className,
  onClick,
  type = "button",
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white transition hover:bg-primary-dark active:scale-[0.98]",
        className,
      )}
    >
      {children}
    </button>
  );
}

import type { ReactNode } from "react";

export function PageHeader({
  title,
  children,
}: {
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <h1 className="text-2xl font-semibold text-ink">{title}</h1>
      {children && <div className="flex flex-wrap items-center gap-3">{children}</div>}
    </div>
  );
}

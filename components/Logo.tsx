import { cn } from "@/lib/cn";

export function LogoMark({ size = 40, className }: { size?: number; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full bg-primary",
        className,
      )}
      style={{ width: size, height: size }}
    >
      <svg
        width={size * 0.62}
        height={size * 0.62}
        viewBox="0 0 24 24"
        fill="none"
        stroke="#fff"
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 15l5-6 4 3 5-7" />
        <circle cx="8" cy="9" r="1.4" fill="#fff" stroke="none" />
        <circle cx="12" cy="12" r="1.4" fill="#fff" stroke="none" />
        <circle cx="17" cy="5" r="1.4" fill="#fff" stroke="none" />
      </svg>
    </span>
  );
}

export function Logo({ size = 40 }: { size?: number }) {
  return (
    <div className="flex items-center gap-3">
      <LogoMark size={size} />
      <span className="text-2xl font-semibold tracking-tight text-ink">Base</span>
    </div>
  );
}

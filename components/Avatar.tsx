import { cn } from "@/lib/cn";

const GRADIENTS = [
  "from-violet-400 to-indigo-500",
  "from-rose-400 to-pink-500",
  "from-amber-400 to-orange-500",
  "from-emerald-400 to-teal-500",
  "from-sky-400 to-blue-500",
  "from-fuchsia-400 to-purple-500",
  "from-cyan-400 to-sky-500",
  "from-orange-400 to-rose-500",
];

function hash(str: string) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase();
}

export function Avatar({
  name,
  size = 40,
  online,
  className,
  ring,
  src,
  colorIndex,
}: {
  name: string;
  size?: number;
  online?: boolean;
  className?: string;
  ring?: boolean;
  src?: string;
  /** Force a specific palette slot (used by AvatarGroup so each avatar differs). */
  colorIndex?: number;
}) {
  const gradient = GRADIENTS[(colorIndex ?? hash(name)) % GRADIENTS.length];
  return (
    <span
      className={cn("relative inline-flex shrink-0", className)}
      style={{ width: size, height: size }}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={name}
          className={cn("h-full w-full rounded-full object-cover", ring && "ring-2 ring-white")}
        />
      ) : (
        <span
          className={cn(
            "flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br font-semibold text-white",
            gradient,
            ring && "ring-2 ring-white",
          )}
          style={{ fontSize: size * 0.38 }}
        >
          {initials(name)}
        </span>
      )}
      {online && (
        <span className="absolute bottom-0 right-0 h-[28%] w-[28%] rounded-full border-2 border-white bg-emerald-500" />
      )}
    </span>
  );
}

/** Overlapping avatar stack with an optional "+N" trailing chip. */
export function AvatarGroup({
  names,
  size = 26,
  plus,
}: {
  names: string[];
  size?: number;
  plus?: number;
}) {
  return (
    <div className="flex items-center">
      {names.map((n, i) => (
        <span key={n + i} style={{ marginLeft: i === 0 ? 0 : -size * 0.35 }}>
          <Avatar name={n} size={size} ring colorIndex={i} />
        </span>
      ))}
      {plus != null && (
        <span
          className="flex items-center justify-center rounded-full bg-info font-semibold text-white ring-2 ring-white"
          style={{
            width: size,
            height: size,
            marginLeft: -size * 0.35,
            fontSize: size * 0.4,
          }}
        >
          +{plus}
        </span>
      )}
    </div>
  );
}

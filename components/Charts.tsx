"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/cn";

/* ---------- helpers ---------- */

function smoothPath(points: [number, number][]) {
  if (points.length < 2) return "";
  const d = [`M ${points[0][0]} ${points[0][1]}`];
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] || points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;
    const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
    const cp1y = p1[1] + (p2[1] - p0[1]) / 6;
    const cp2x = p2[0] - (p3[0] - p1[0]) / 6;
    const cp2y = p2[1] - (p3[1] - p1[1]) / 6;
    d.push(`C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${p2[0]} ${p2[1]}`);
  }
  return d.join(" ");
}

/* ---------- Reports line/area chart ---------- */

export function LineAreaChart({
  data,
  labels,
  values,
  valueLabel = "Sales",
  highlightIndex,
  yTicks = [0, 20, 40, 60, 80, 100],
  height = 260,
}: {
  data: number[];
  labels: string[];
  /** Real per-point numbers shown in the tooltip (defaults to `data`). */
  values?: number[];
  valueLabel?: string;
  highlightIndex?: number;
  yTicks?: number[];
  height?: number;
}) {
  const W = 720;
  const H = height;
  const padL = 34;
  const padR = 14;
  const padT = 14;
  const padB = 28;
  const max = Math.max(...yTicks);
  const min = Math.min(...yTicks);
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;

  const svgRef = useRef<SVGSVGElement>(null);
  const [hovered, setHovered] = useState<number | null>(null);

  const xFor = (i: number) => padL + (plotW * i) / (data.length - 1);
  const yFor = (v: number) => padT + plotH - (plotH * (v - min)) / (max - min);
  const pts = data.map((v, i) => [xFor(i), yFor(v)] as [number, number]);
  const line = smoothPath(pts);
  const area = `${line} L ${xFor(data.length - 1)} ${padT + plotH} L ${padL} ${padT + plotH} Z`;

  const active = hovered ?? highlightIndex ?? Math.floor(data.length / 2);
  const tipVal = (values ?? data)[active];
  const tipText = tipVal.toLocaleString();
  // Keep the tooltip box inside the chart at the edges.
  const tipX = Math.min(Math.max(pts[active][0], padL + 42), W - padR - 42);

  const onMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const vbX = ((e.clientX - rect.left) / rect.width) * W;
    const i = Math.round((vbX - padL) / (plotW / (data.length - 1)));
    setHovered(Math.min(Math.max(i, 0), data.length - 1));
  };

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${W} ${H}`}
      className="h-auto w-full touch-none"
      role="img"
      onMouseMove={onMove}
      onMouseLeave={() => setHovered(null)}
    >
      <defs>
        <linearGradient id="reportLine" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#4d8dff" />
          <stop offset="50%" stopColor="#8a6bff" />
          <stop offset="100%" stopColor="#ff6bcb" />
        </linearGradient>
        <linearGradient id="reportArea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8a6bff" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#8a6bff" stopOpacity="0" />
        </linearGradient>
      </defs>

      {yTicks.map((t) => (
        <g key={t}>
          <line x1={padL} x2={W - padR} y1={yFor(t)} y2={yFor(t)} stroke="#eef0f5" strokeWidth={1} />
          <text x={4} y={yFor(t) + 4} fontSize={11} fill="#b6b9cc">
            {t}
          </text>
        </g>
      ))}

      <path d={area} fill="url(#reportArea)" />
      <path d={line} fill="none" stroke="url(#reportLine)" strokeWidth={3} strokeLinecap="round" />

      {pts.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i === active ? 5 : 3.5} fill="#fff" stroke="#8a6bff" strokeWidth={2.5} />
      ))}

      {/* guide line + tooltip at the active time period */}
      <line x1={pts[active][0]} x2={pts[active][0]} y1={pts[active][1]} y2={padT + plotH} stroke="#c9b6ff" strokeDasharray="3 3" />
      <g transform={`translate(${tipX - 40}, ${pts[active][1] - 52})`} style={{ transition: "transform 0.08s linear" }}>
        <rect width={80} height={40} rx={8} fill="#1f2233" />
        <text x={40} y={16} textAnchor="middle" fontSize={10} fill="#aeb2c8">
          {valueLabel}
        </text>
        <text x={40} y={31} textAnchor="middle" fontSize={13} fontWeight={600} fill="#fff">
          {tipText}
        </text>
        <path d={`M${pts[active][0] - tipX + 34} 40 L${pts[active][0] - tipX + 40} 47 L${pts[active][0] - tipX + 46} 40 Z`} fill="#1f2233" />
      </g>

      {labels.map((l, i) => (
        <text
          key={l + i}
          x={xFor(i)}
          y={H - 8}
          textAnchor="middle"
          fontSize={11}
          fill={i === active ? "#5d5fef" : "#b6b9cc"}
          fontWeight={i === active ? 600 : 400}
        >
          {l}
        </text>
      ))}
    </svg>
  );
}

/* ---------- Donut chart ---------- */

export function DonutChart({
  segments,
  size = 200,
  thickness = 22,
  centerTop,
  centerBottom,
  centerIcon,
  gap = 0.04,
}: {
  segments: { value: number; color: string }[];
  size?: number;
  thickness?: number;
  centerTop?: string;
  centerBottom?: string;
  centerIcon?: boolean;
  gap?: number;
}) {
  const total = segments.reduce((s, x) => s + x.value, 0);
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  // Precompute the cumulative fraction before each segment so we never mutate during render.
  const starts: number[] = [];
  segments.reduce((acc, seg) => {
    starts.push(acc);
    return acc + seg.value / total;
  }, 0);
  return (
    <div className="relative inline-flex" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f0f1f6" strokeWidth={thickness} />
        {segments.map((seg, i) => {
          const frac = seg.value / total;
          const len = Math.max(0, (frac - gap) * c);
          const dash = `${len} ${c - len}`;
          const offset = -starts[i] * c;
          return (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={seg.color}
              strokeWidth={thickness}
              strokeDasharray={dash}
              strokeDashoffset={offset}
              strokeLinecap="round"
            />
          );
        })}
      </svg>
      {(centerTop || centerBottom || centerIcon) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          {centerIcon ? (
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-light text-primary">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 17 9 11l4 4 8-8" />
                <path d="M17 7h4v4" />
              </svg>
            </span>
          ) : (
            <>
              <span className="text-2xl font-semibold text-ink">{centerTop}</span>
              <span className="text-xs text-muted">{centerBottom}</span>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export function Legend({ items }: { items: { label: string; color: string }[] }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
      {items.map((it) => (
        <span key={it.label} className="flex items-center gap-2 text-xs text-ink-soft">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: it.color }} />
          {it.label}
        </span>
      ))}
    </div>
  );
}

/* ---------- Horizontal bar chart ---------- */

export function HBarChart({
  rows,
}: {
  rows: { label: string; value: number; display: string; color: string }[];
}) {
  const max = Math.max(...rows.map((r) => r.value));
  return (
    <div className="flex flex-col gap-3.5">
      {rows.map((r) => (
        <div key={r.label} className="flex items-center gap-3 text-xs">
          <span className="w-8 shrink-0 text-muted">{r.label}</span>
          <div className="h-2.5 flex-1 rounded-full bg-line">
            <div
              className="h-full rounded-full"
              style={{ width: `${(r.value / max) * 100}%`, background: r.color }}
            />
          </div>
          <span className="w-12 shrink-0 text-right font-medium text-ink-soft">{r.display}</span>
        </div>
      ))}
    </div>
  );
}

/* ---------- Sparkline (stat cards) ---------- */

export function Sparkline({
  data,
  color = "#4d8dff",
  id,
  height = 70,
}: {
  data: number[];
  color?: string;
  id: string;
  height?: number;
}) {
  const W = 320;
  const H = height;
  const pad = 6;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const xFor = (i: number) => (W * i) / (data.length - 1);
  const yFor = (v: number) => pad + (H - pad * 2) - ((H - pad * 2) * (v - min)) / (max - min || 1);
  const pts = data.map((v, i) => [xFor(i), yFor(v)] as [number, number]);
  const line = smoothPath(pts);
  const area = `${line} L ${W} ${H} L 0 ${H} Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="h-full w-full">
      <defs>
        <linearGradient id={`spark-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#spark-${id})`} />
      <path d={line} fill="none" stroke={color} strokeWidth={3} strokeLinecap="round" />
    </svg>
  );
}

/* ---------- Mini vertical bars (performance) ---------- */

export function MiniBars({
  data,
  highlightIndex,
  highlightLabel,
  color = "#ff8b6b",
  mutedColor = "#ffe0d4",
}: {
  data: { label: string; value: number }[];
  highlightIndex?: number;
  highlightLabel?: string;
  color?: string;
  mutedColor?: string;
}) {
  const max = Math.max(...data.map((d) => d.value));
  return (
    <div className="flex h-32 items-end gap-2.5">
      {data.map((d, i) => {
        const active = i === highlightIndex;
        return (
          <div key={d.label} className="flex flex-1 flex-col items-center gap-1.5">
            <div className="relative flex w-full flex-1 items-end">
              {active && highlightLabel && (
                <span
                  className="absolute -top-1 left-1/2 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-md px-1.5 py-0.5 text-[10px] font-semibold text-white"
                  style={{ background: color }}
                >
                  {highlightLabel}
                </span>
              )}
              <div
                className="w-full rounded-md"
                style={{
                  height: `${(d.value / max) * 100}%`,
                  background: active ? color : mutedColor,
                }}
              />
            </div>
            <span className={cn("text-[10px]", active ? "font-medium text-ink-soft" : "text-muted")}>
              {d.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ---------- Gauge (small ring for customer detail) ---------- */

export function Gauge({ value, color, size = 84 }: { value: number; color: string; size?: number }) {
  const thickness = 9;
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  const len = (value / 100) * c;
  return (
    <div className="relative inline-flex" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f0f1f6" strokeWidth={thickness} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={thickness}
          strokeDasharray={`${len} ${c - len}`}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-ink">
        {value}%
      </span>
    </div>
  );
}

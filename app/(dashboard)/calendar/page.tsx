"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, PrimaryButton } from "@/components/ui";
import { Modal } from "@/components/Overlay";
import { Avatar } from "@/components/Avatar";
import { TextInput } from "@/components/Form";
import {
  PlusIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  SearchIcon,
  MapPinIcon,
  ClockIcon,
} from "@/components/Icons";
import { PEOPLE, CALENDAR_EVENTS, DAY_EVENTS } from "@/lib/data";
import { readUserState } from "@/lib/usePersistedUserState";

/* Merge decorative events + the signed-in user's schedules + their tasks onto Dec 2021. */
const STATUS_COLOR: Record<string, string> = { Pending: "#f5a623", Running: "#5d5fef", Done: "#2eb67d" };
type SchedRow = { date: string; location: string };
type TaskGroup = { title: string; tasks: { name: string; start: string; status: string }[] };

function buildMonthEvents(schedules: SchedRow[], groups: TaskGroup[]) {
  const map: Record<number, { label: string; color: string }[]> = {};
  const add = (day: number, e: { label: string; color: string }) => {
    if (!day) return;
    (map[day] ||= []).push(e);
  };
  Object.entries(CALENDAR_EVENTS).forEach(([d, evs]) => evs.forEach((e) => add(Number(d), e)));
  schedules.forEach((r) => add(parseInt(r.date, 10), { label: r.location, color: "#1fc8db" }));
  groups.forEach((g) =>
    g.tasks.forEach((t) => add(parseInt(t.start, 10), { label: t.name, color: STATUS_COLOR[t.status] ?? "#9094b0" })),
  );
  return map;
}

const VIEWS = ["Day", "Week", "Month", "Year"] as const;
type View = (typeof VIEWS)[number];

const WD = ["S", "M", "T", "W", "T", "F", "S"];
const WD_FULL = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function monthMatrix(year: number, month: number) {
  const first = new Date(year, month, 1).getDay();
  const days = new Date(year, month + 1, 0).getDate();
  const prevDays = new Date(year, month, 0).getDate();
  const rows = Math.ceil((first + days) / 7);
  const cells: { day: number; current: boolean }[] = [];
  for (let i = 0; i < first; i++) cells.push({ day: prevDays - first + 1 + i, current: false });
  for (let d = 1; d <= days; d++) cells.push({ day: d, current: true });
  let next = 1;
  while (cells.length < rows * 7) cells.push({ day: next++, current: false });
  return cells;
}

type UserEvent = { day: number; label: string; color: string };

export default function CalendarPage() {
  const [view, setView] = useState<View>("Month");
  const [modal, setModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState(2);
  const [userEvents, setUserEvents] = useState<UserEvent[]>([]);

  // The user's own schedules + tasks, merged with anything they create here.
  const monthEvents: Record<number, { label: string; color: string }[]> = (() => {
    const schedules = readUserState<SchedRow[]>("schedules", []);
    const groups = readUserState<TaskGroup[]>("tasks.list", []);
    const map = buildMonthEvents(schedules, groups);
    userEvents.forEach((e) => (map[e.day] ||= []).push({ label: e.label, color: e.color }));
    return map;
  })();

  return (
    <div className="mx-auto max-w-[1400px]">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-ink">Calendar</h1>
        <div className="inline-flex rounded-xl bg-card p-1 ring-1 ring-line">
          {VIEWS.map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                view === v ? "bg-primary text-white" : "text-ink-soft hover:text-ink"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[300px_1fr]">
        {/* Scheduler sidebar */}
        <Card className="h-fit">
          <PrimaryButton onClick={() => setModal(true)} className="w-full py-3">
            <PlusIcon className="h-4 w-4" /> Create Schedule
          </PrimaryButton>

          <div className="mt-5">
            <MiniMonth highlight={selectedDay} onPick={setSelectedDay} />
          </div>

          <div className="mt-6">
            <h4 className="mb-3 text-base font-semibold text-ink">People</h4>
            <label className="flex items-center gap-2 rounded-xl bg-canvas px-3 py-2.5 text-sm">
              <SearchIcon className="h-4 w-4 text-muted" />
              <input placeholder="Search for People" className="w-full bg-transparent outline-none placeholder:text-muted" />
            </label>
            <div className="mt-3 space-y-3">
              {PEOPLE.map((p) => (
                <div key={p.email} className="flex items-center gap-3">
                  <Avatar name={p.name} size={36} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">{p.name}</p>
                    <p className="truncate text-xs text-muted">{p.email}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Link
            href="/tasks"
            className="mt-6 block rounded-xl border border-line py-2.5 text-center text-sm font-medium text-primary transition hover:bg-primary-light"
          >
            My Schedule
          </Link>
        </Card>

        {/* Main view */}
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-medium text-ink-soft">December {selectedDay}, 2021</p>
            <div className="flex items-center gap-2">
              <button className="flex h-7 w-7 items-center justify-center rounded-md text-muted hover:bg-canvas" aria-label="Previous">
                <ChevronLeftIcon className="h-4 w-4" />
              </button>
              <button className="flex h-7 w-7 items-center justify-center rounded-md text-muted hover:bg-canvas" aria-label="Next">
                <ChevronRightIcon className="h-4 w-4" />
              </button>
            </div>
          </div>

          {view === "Month" && <MonthView events={monthEvents} highlightDay={selectedDay} onPickDay={setSelectedDay} />}
          {view === "Day" && <DayView />}
          {view === "Week" && <WeekView />}
          {view === "Year" && <YearView />}
        </Card>
      </div>

      {modal && (
        <CreateEventModal
          open
          day={selectedDay}
          onClose={() => setModal(false)}
          onSave={(ev) => {
            setUserEvents((prev) => [...prev, ev]);
            setModal(false);
          }}
        />
      )}
    </div>
  );
}

/* ---------------- Mini month (sidebar + year) ---------------- */

function MiniMonth({
  year = 2021,
  month = 11,
  highlight,
  title,
  onPick,
}: {
  year?: number;
  month?: number;
  highlight?: number;
  title?: string;
  onPick?: (day: number) => void;
}) {
  const cells = monthMatrix(year, month);
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-ink">{title ?? `${MONTHS[month]} ${year}`}</span>
        {!title && (
          <div className="flex gap-1 text-muted">
            <ChevronLeftIcon className="h-3.5 w-3.5" />
            <ChevronRightIcon className="h-3.5 w-3.5" />
          </div>
        )}
      </div>
      <div className="grid grid-cols-7 gap-y-1 text-center text-[11px]">
        {WD.map((d, i) => (
          <span key={i} className="text-muted">{d}</span>
        ))}
        {cells.map((c, i) => (
          <button
            key={i}
            onClick={() => c.current && onPick?.(c.day)}
            className={`mx-auto flex h-6 w-6 items-center justify-center rounded-full transition ${
              c.current && c.day === highlight
                ? "bg-primary font-medium text-white"
                : c.current
                  ? "text-ink-soft hover:bg-canvas"
                  : "text-line"
            }`}
          >
            {c.day}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Month view ---------------- */

function MonthView({
  events: eventMap,
  highlightDay,
  onPickDay,
}: {
  events: Record<number, { label: string; color: string }[]>;
  highlightDay: number;
  onPickDay: (day: number) => void;
}) {
  const cells = monthMatrix(2021, 11);
  return (
    <div>
      <div className="grid grid-cols-7 border-b border-line pb-2 text-center text-xs font-medium text-muted">
        {WD_FULL.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {cells.map((c, i) => {
          const events = c.current ? eventMap[c.day] : undefined;
          const highlight = c.current && c.day === highlightDay;
          return (
            <button
              type="button"
              key={i}
              onClick={() => c.current && onPickDay(c.day)}
              className={`min-h-[88px] border-b border-r border-line/70 p-2 text-left ${
                i % 7 === 0 ? "border-l" : ""
              } ${highlight ? "bg-primary-light/30" : c.current ? "hover:bg-canvas/60" : ""}`}
            >
              <span
                className={`text-sm ${
                  highlight ? "font-semibold text-primary" : c.current ? "text-ink-soft" : "text-line"
                }`}
              >
                {String(c.day).padStart(2, "0")}
              </span>
              {highlight && <div className="mt-1 h-0.5 w-6 rounded bg-warning" />}
              <div className="mt-1 space-y-1">
                {events?.slice(0, 2).map((e, ei) => (
                  <div
                    key={ei}
                    className="truncate rounded px-1.5 py-0.5 text-[10px] font-medium text-white"
                    style={{ background: e.color }}
                  >
                    {e.label}
                  </div>
                ))}
                {events && events.length > 2 && (
                  <div className="rounded px-1.5 py-0.5 text-[10px] font-medium text-muted ring-1 ring-line">
                    +{events.length - 2} more
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- Day view ---------------- */

const DAY_HOURS = Array.from({ length: 17 }, (_, i) => 9 + i); // 9 -> 25 (1AM)

function fmtHour(h: number) {
  const hh = h % 24;
  const ampm = hh < 12 ? "AM" : "PM";
  const disp = hh % 12 === 0 ? 12 : hh % 12;
  return `${String(disp).padStart(2, "0")}.00 ${ampm}`;
}

function DayView() {
  return (
    <div className="overflow-x-auto">
      <div className="min-w-[520px]">
        {DAY_HOURS.map((h) => {
          const ev = DAY_EVENTS.find((e) => e.start === h);
          return (
            <div key={h} className="flex items-stretch border-b border-line/70 last:border-0">
              <span className="w-16 shrink-0 py-4 text-xs text-muted">{fmtHour(h)}</span>
              <div className="relative flex-1 py-2">
                {ev && (
                  <div
                    className="ml-[var(--off)] inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium text-white"
                    style={
                      { background: ev.color, ["--off" as string]: `${ev.col * 30}%` } as React.CSSProperties
                    }
                  >
                    {ev.label}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- Week view ---------------- */

function WeekView() {
  const days = [29, 30, 1, 2, 3, 4, 5];
  const weekEvents: Record<number, { label: string; color: string; row: number }[]> = {
    2: [
      { label: "Free day", color: "#1fc8db", row: 1 },
      { label: "Party Time", color: "#d63ef0", row: 3 },
    ],
    4: [{ label: "Meeting", color: "#5d5fef", row: 2 }],
  };
  return (
    <div className="overflow-x-auto">
      <div className="min-w-[640px]">
        <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-line text-center text-xs font-medium text-muted">
          <span />
          {WD_FULL.map((d, i) => (
            <span key={i} className="py-2">
              {d} <span className={days[i] === 2 ? "text-primary" : "text-ink-soft"}>{String(days[i]).padStart(2, "0")}</span>
            </span>
          ))}
        </div>
        {[9, 10, 11, 12, 13, 14, 15].map((h, ri) => (
          <div key={h} className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-line/70">
            <span className="py-5 pl-1 text-xs text-muted">{fmtHour(h)}</span>
            {days.map((d, ci) => (
              <div key={ci} className="border-l border-line/70 p-1">
                {weekEvents[d]?.filter((e) => e.row === ri).map((e, ei) => (
                  <div key={ei} className="rounded-md px-2 py-1 text-[10px] font-medium text-white" style={{ background: e.color }}>
                    {e.label}
                  </div>
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Year view ---------------- */

function YearView() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {MONTHS.map((m, i) => (
        <MiniMonth key={m} month={i} year={2021} title={`${m} 2021`} highlight={i === 11 ? 2 : undefined} />
      ))}
    </div>
  );
}

/* ---------------- Create event modal ---------------- */

const EVENT_TABS = ["Event", "Reminder", "Task"] as const;
const EVENT_COLOR: Record<string, string> = { Event: "#5d5fef", Reminder: "#ff8b6b", Task: "#2eb67d" };

function CreateEventModal({
  open,
  day,
  onClose,
  onSave,
}: {
  open: boolean;
  day: number;
  onClose: () => void;
  onSave: (ev: { day: number; label: string; color: string }) => void;
}) {
  const [tab, setTab] = useState<(typeof EVENT_TABS)[number]>("Event");
  const [title, setTitle] = useState("");
  const [error, setError] = useState(false);
  const [eventDay, setEventDay] = useState(day);

  const save = () => {
    if (!title.trim()) {
      setError(true);
      return;
    }
    onSave({ day: eventDay, label: title.trim(), color: EVENT_COLOR[tab] });
    setTitle("");
    setError(false);
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-ink">Create an Event</h3>
        <button
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-danger-soft text-danger transition hover:bg-danger hover:text-white"
          aria-label="Close"
        >
          ✕
        </button>
      </div>

      <div className="mb-5 flex gap-2">
        {EVENT_TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              tab === t ? "bg-warning text-white" : "text-ink-soft hover:bg-canvas"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <TextInput value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Add title" autoFocus />
      {error && <p className="mt-1 text-xs text-danger">Please add a title</p>}

      <div className="mt-4 flex items-start gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-warning-soft text-warning">
          <ClockIcon className="h-4 w-4" />
        </span>
        <div className="text-sm">
          <div className="flex items-center gap-2">
            <span className="font-medium text-ink">December</span>
            <select
              value={eventDay}
              onChange={(e) => setEventDay(Number(e.target.value))}
              className="rounded-lg bg-canvas px-2 py-1 text-sm outline-none ring-1 ring-line focus:ring-primary/40"
            >
              {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            <span className="text-ink-soft">12:00pm – 1:00pm</span>
          </div>
          <p className="text-xs text-muted">Time zone · Does not repeat</p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-dark">
          <Avatar name="People" size={18} /> Add People
        </button>
        <button className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-ink-soft ring-1 ring-line transition hover:text-ink">
          <MapPinIcon className="h-4 w-4 text-primary" /> Add location
        </button>
      </div>

      <div className="mt-5 flex items-center gap-3">
        <Avatar name="John Deo" size={36} />
        <div className="text-sm">
          <p className="font-medium text-ink">John Deo</p>
          <p className="text-xs text-muted">Busy · Default visibility · notify 30 minutes before</p>
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <button onClick={onClose} className="rounded-xl px-5 py-2.5 text-sm font-medium text-ink-soft ring-1 ring-line transition hover:bg-canvas">
          Close
        </button>
        <PrimaryButton onClick={save} className="px-6">Save</PrimaryButton>
      </div>
    </Modal>
  );
}

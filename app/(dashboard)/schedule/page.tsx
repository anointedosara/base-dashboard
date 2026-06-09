"use client";

import { useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { Card, PrimaryButton } from "@/components/ui";
import { Modal } from "@/components/Overlay";
import { Avatar } from "@/components/Avatar";
import { Field, TextInput } from "@/components/Form";
import {
  PlusIcon,
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  EditIcon,
  TrashIcon,
  SearchIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@/components/Icons";
import { PEOPLE } from "@/lib/data";
import { WEEKDAYS, MONTHS, monthMatrix } from "@/lib/date";
import { notify } from "@/lib/notificationStore";
import { useEnsureAuth } from "@/lib/useEnsureAuth";
import { usePersistedUserState } from "@/lib/usePersistedUserState";

type Sched = { id: number; date: string; time: string; location: string };

export default function SchedulePage() {
  const ensure = useEnsureAuth();
  const [rows, setRows] = usePersistedUserState<Sched[]>("schedules", [], []);
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const [modal, setModal] = useState<null | { mode: "add" } | { mode: "edit"; row: Sched }>(null);
  const [peopleQuery, setPeopleQuery] = useState("");
  const [day, setDay] = useState(3);

  const nextId = () => Math.max(0, ...rows.map((r) => r.id)) + 1;
  const save = (data: Omit<Sched, "id">, id?: number) => {
    if (!ensure()) return;
    setRows((prev) =>
      id != null ? prev.map((r) => (r.id === id ? { ...r, ...data } : r)) : [{ id: nextId(), ...data }, ...prev],
    );
    notify(id != null ? `Updated schedule “${data.location}”` : `Created schedule “${data.location}” on ${data.date}`);
  };
  const remove = (id: number) => {
    if (!ensure()) return;
    setRows((prev) => prev.filter((r) => r.id !== id));
    setChecked((prev) => new Set([...prev].filter((x) => x !== id)));
    notify("Deleted a schedule");
  };
  const toggle = (id: number) =>
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const allChecked = rows.length > 0 && rows.every((r) => checked.has(r.id));
  const toggleAll = () => setChecked(allChecked ? new Set() : new Set(rows.map((r) => r.id)));
  const deleteChecked = () => {
    if (!ensure()) return;
    const n = checked.size;
    setRows((prev) => prev.filter((r) => !checked.has(r.id)));
    setChecked(new Set());
    notify(`Deleted ${n} schedule${n === 1 ? "" : "s"}`);
  };

  const people = PEOPLE.filter(
    (p) =>
      !peopleQuery.trim() ||
      p.name.toLowerCase().includes(peopleQuery.toLowerCase()) ||
      p.email.toLowerCase().includes(peopleQuery.toLowerCase()),
  );

  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader title="Schedule List">
        {checked.size > 0 && (
          <button
            onClick={deleteChecked}
            className="inline-flex items-center gap-2 rounded-xl bg-danger-soft px-4 py-2.5 text-sm font-medium text-danger transition hover:bg-danger hover:text-white"
          >
            <TrashIcon className="h-4 w-4" /> Delete ({checked.size})
          </button>
        )}
        <PrimaryButton onClick={() => ensure() && setModal({ mode: "add" })}>
          <PlusIcon className="h-4 w-4" /> Add New
        </PrimaryButton>
      </PageHeader>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[320px_1fr]">
        {/* Scheduler sidebar */}
        <Card className="flex h-fit flex-col">
          <PrimaryButton onClick={() => ensure() && setModal({ mode: "add" })} className="w-full py-3">
            <PlusIcon className="h-4 w-4" /> Create Schedule
          </PrimaryButton>

          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-ink">{MONTHS[11]} {day}, 2021</span>
              <div className="flex gap-1 text-muted">
                <ChevronLeftIcon className="h-3.5 w-3.5" />
                <ChevronRightIcon className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="grid grid-cols-7 gap-y-1 text-center text-[11px]">
              {WEEKDAYS.map((d, i) => (
                <span key={i} className="text-muted">{d}</span>
              ))}
              {monthMatrix(2021, 11).map((c, i) => (
                <button
                  key={i}
                  onClick={() => c.current && setDay(c.day)}
                  className={`mx-auto flex h-6 w-6 items-center justify-center rounded-full transition ${
                    c.current && c.day === day
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

          <div className="mt-6">
            <h4 className="mb-3 text-base font-semibold text-ink">People</h4>
            <label className="flex items-center gap-2 rounded-xl bg-canvas px-3 py-2.5 text-sm">
              <SearchIcon className="h-4 w-4 text-muted" />
              <input
                value={peopleQuery}
                onChange={(e) => setPeopleQuery(e.target.value)}
                placeholder="Search for People"
                className="w-full bg-transparent outline-none placeholder:text-muted"
              />
            </label>
            <div className="mt-3 space-y-3">
              {people.map((p) => (
                <div key={p.email} className="flex items-center gap-3">
                  <Avatar name={p.name} size={36} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">{p.name}</p>
                    <p className="truncate text-xs text-muted">{p.email}</p>
                  </div>
                </div>
              ))}
              {people.length === 0 && <p className="text-xs text-muted">No people found.</p>}
            </div>
          </div>

          <Link
            href="/tasks"
            className="mt-6 block rounded-xl border border-line py-2.5 text-center text-sm font-medium text-primary transition hover:bg-primary-light"
          >
            My Schedule
          </Link>
        </Card>

        {/* Schedule table */}
        <Card className="p-0">
          <div className="hidden grid-cols-[auto_1.3fr_1fr_1.4fr_auto] items-center gap-4 border-b border-line px-6 py-4 text-xs font-medium text-muted sm:grid">
            <input type="checkbox" checked={allChecked} onChange={toggleAll} className="h-4 w-4 accent-primary" />
            <span>Date</span>
            <span>Time</span>
            <span>Location</span>
            <span />
          </div>

          <div className="divide-y divide-line">
            {rows.length === 0 && <p className="px-6 py-10 text-center text-sm text-muted">No schedules yet.</p>}
            {rows.map((r) => (
              <div
                key={r.id}
                className="grid grid-cols-[auto_1fr_auto] items-center gap-4 px-6 py-4 sm:grid-cols-[auto_1.3fr_1fr_1.4fr_auto]"
              >
                <input type="checkbox" checked={checked.has(r.id)} onChange={() => toggle(r.id)} className="h-4 w-4 accent-primary" />
                <span className="flex items-center gap-2 text-sm font-medium text-ink">
                  <CalendarIcon className="h-4 w-4 text-primary" /> {r.date}
                </span>
                <span className="flex items-center gap-2 text-sm text-ink-soft">
                  <ClockIcon className="h-4 w-4 text-muted" /> {r.time}
                </span>
                <span className="justify-self-start">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-light px-3 py-1.5 text-xs font-medium text-primary">
                    <MapPinIcon className="h-3.5 w-3.5" /> {r.location}
                  </span>
                </span>
                <div className="flex items-center gap-2 justify-self-end">
                  <button
                    onClick={() => setModal({ mode: "edit", row: r })}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-warning-soft text-warning transition hover:bg-warning hover:text-white"
                    aria-label="Edit schedule"
                  >
                    <EditIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => remove(r.id)}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-danger-soft text-danger transition hover:bg-danger hover:text-white"
                    aria-label="Delete schedule"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {modal && (
        <ScheduleModal
          initial={modal.mode === "edit" ? modal.row : undefined}
          onClose={() => setModal(null)}
          onSave={(data) => {
            save(data, modal.mode === "edit" ? modal.row.id : undefined);
            setModal(null);
          }}
        />
      )}
    </div>
  );
}

function ScheduleModal({
  initial,
  onSave,
  onClose,
}: {
  initial?: Sched;
  onSave: (data: Omit<Sched, "id">) => void;
  onClose: () => void;
}) {
  const [date, setDate] = useState(initial?.date ?? "12 Dec, 2021");
  const [time, setTime] = useState(initial?.time ?? "10.15AM");
  const [location, setLocation] = useState(initial?.location ?? "");
  const [error, setError] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date.trim() || !time.trim() || !location.trim()) {
      setError(true);
      return;
    }
    onSave({ date: date.trim(), time: time.trim(), location: location.trim() });
  };

  return (
    <Modal open onClose={onClose}>
      <h3 className="mb-5 text-lg font-semibold text-ink">{initial ? "Edit Schedule" : "Create Schedule"}</h3>
      <form onSubmit={submit} className="space-y-4" noValidate>
        <Field label="Date">
          <TextInput value={date} onChange={(e) => setDate(e.target.value)} placeholder="12 Dec, 2021" />
        </Field>
        <Field label="Time">
          <TextInput value={time} onChange={(e) => setTime(e.target.value)} placeholder="10.15AM" />
        </Field>
        <Field label="Location">
          <TextInput value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Office Meeting" />
        </Field>
        {error && <p className="text-xs text-danger">Please fill in date, time and location.</p>}
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="rounded-xl px-5 py-2.5 text-sm font-medium text-ink-soft ring-1 ring-line transition hover:bg-canvas">
            Cancel
          </button>
          <PrimaryButton type="submit" className="px-6">{initial ? "Save Changes" : "Create"}</PrimaryButton>
        </div>
      </form>
    </Modal>
  );
}

"use client";

import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, PrimaryButton, Pill } from "@/components/ui";
import { Avatar, AvatarGroup } from "@/components/Avatar";
import { Modal } from "@/components/Overlay";
import { Field, TextInput, Select } from "@/components/Form";
import {
  PlusIcon,
  FilterIcon,
  MoreIcon,
  SearchIcon,
  CheckCircleIcon,
  HeartIcon,
  CommentIcon,
  EditIcon,
  TrashIcon,
  ChevronRightIcon,
} from "@/components/Icons";
import { usePersistedUserState } from "@/lib/usePersistedUserState";
import { useEnsureAuth } from "@/lib/useEnsureAuth";
import { notify } from "@/lib/notificationStore";

const TABS = ["List", "Board", "Timeline"] as const;
type Tab = (typeof TABS)[number];

/* ---------- List types ---------- */
type Task = { uid: number; name: string; start: string; end: string; members: number; status: string };
type Group = { title: string; tasks: Task[] };
const GROUP_TITLES = ["To Do", "Doing", "Done"];

/* ---------- Board types ---------- */
type BoardCard = { id: number; title: string; priority: string; track?: string; art?: "preview" | "thumbs" };
type BoardColumn = { title: string; cards: BoardCard[] };
const BOARD_TITLES = ["ToDo", "In Progress", "In Review", "Done"];
const PRIORITIES = ["Low", "Medium", "High"];
const TRACKS = ["On Track", "At risk"];

/* ---------- Timeline types ---------- */
type TLTask = { id: number; title: string; time: string; day: string; group: string; priority: string; track: string };
const TL_GROUPS = ["To Do", "Doing", "Done"];

const EMPTY_GROUPS: Group[] = GROUP_TITLES.map((title) => ({ title, tasks: [] }));
const EMPTY_COLUMNS: BoardColumn[] = BOARD_TITLES.map((title) => ({ title, cards: [] }));

export default function SchedulePage() {
  const ensure = useEnsureAuth();
  const [tab, setTab] = useState<Tab>("Board");
  const [query, setQuery] = useState("");

  /* List state (empty by default; saved per user) */
  const [groups, setGroups] = usePersistedUserState<Group[]>("tasks.list", EMPTY_GROUPS, EMPTY_GROUPS);
  const [taskModal, setTaskModal] = useState<null | { mode: "add" } | { mode: "edit"; task: Task; group: string }>(null);

  /* Board state */
  const [columns, setColumns] = usePersistedUserState<BoardColumn[]>("tasks.board", EMPTY_COLUMNS, EMPTY_COLUMNS);
  const [boardFilter, setBoardFilter] = useState<{ priorities: string[]; tracks: string[] }>({ priorities: [], tracks: [] });
  const [cardModal, setCardModal] = useState<null | { card: BoardCard; column: string }>(null);

  /* Timeline state */
  const [tlTasks, setTlTasks] = usePersistedUserState<TLTask[]>("tasks.timeline", [], []);
  const [tlGroup, setTlGroup] = useState<string | null>(null);
  const [tlDay, setTlDay] = useState("02");
  const [tlModal, setTlModal] = useState<null | { mode: "add" } | { mode: "edit"; task: TLTask }>(null);

  const nextTlId = () => Math.max(0, ...tlTasks.map((t) => t.id)) + 1;
  const saveTl = (data: Omit<TLTask, "id">, id?: number) => {
    if (!ensure()) return;
    setTlTasks((prev) => {
      const without = prev.filter((t) => t.id !== id);
      return [...without, { id: id ?? nextTlId(), ...data }];
    });
    notify(id != null ? `Updated task “${data.title}”` : `Added task “${data.title}”`);
  };
  const deleteTl = (id: number) => {
    if (!ensure()) return;
    setTlTasks((prev) => prev.filter((t) => t.id !== id));
  };

  /* ----- List handlers ----- */
  const nextUid = () => Math.max(0, ...groups.flatMap((g) => g.tasks.map((t) => t.uid))) + 1;
  const saveTask = (groupTitle: string, data: Omit<Task, "uid">, uid?: number) => {
    if (!ensure()) return;
    setGroups((prev) => {
      const without = prev.map((g) => ({ ...g, tasks: g.tasks.filter((t) => t.uid !== uid) }));
      const id = uid ?? nextUid();
      return without.map((g) => (g.title === groupTitle ? { ...g, tasks: [...g.tasks, { uid: id, ...data }] } : g));
    });
    notify(uid != null ? `Updated task “${data.name}”` : `Added task “${data.name}”`);
  };
  const deleteTask = (uid: number) => {
    if (!ensure()) return;
    setGroups((prev) => prev.map((g) => ({ ...g, tasks: g.tasks.filter((t) => t.uid !== uid) })));
  };

  /* ----- Board handlers ----- */
  const moveCard = (id: number, toTitle: string) => {
    if (!ensure()) return;
    setColumns((prev) => {
      let moved: BoardCard | undefined;
      const without = prev.map((col) => ({
        ...col,
        cards: col.cards.filter((c) => {
          if (c.id === id) {
            moved = c;
            return false;
          }
          return true;
        }),
      }));
      if (!moved) return prev;
      return without.map((col) => (col.title === toTitle ? { ...col, cards: [...col.cards, moved!] } : col));
    });
  };
  const deleteCard = (id: number) => {
    if (!ensure()) return;
    setColumns((prev) => prev.map((col) => ({ ...col, cards: col.cards.filter((c) => c.id !== id) })));
  };
  const saveCard = (id: number, data: Omit<BoardCard, "id">, toTitle: string) => {
    if (!ensure()) return;
    setColumns((prev) => {
      const without = prev.map((col) => ({ ...col, cards: col.cards.filter((c) => c.id !== id) }));
      return without.map((col) => (col.title === toTitle ? { ...col, cards: [...col.cards, { id, ...data }] } : col));
    });
  };

  const q = query.trim().toLowerCase();
  const filteredGroups = groups.map((g) => ({
    ...g,
    tasks: q ? g.tasks.filter((t) => t.name.toLowerCase().includes(q) || t.status.toLowerCase().includes(q)) : g.tasks,
  }));

  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader title="Task Preview">
        {tab === "Board" ? (
          <BoardFilter value={boardFilter} onChange={setBoardFilter} />
        ) : (
          <PrimaryButton onClick={() => (tab === "Timeline" ? setTlModal({ mode: "add" }) : setTaskModal({ mode: "add" }))}>
            <PlusIcon className="h-4 w-4" /> Add Task
          </PrimaryButton>
        )}
      </PageHeader>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex rounded-xl bg-card p-1 ring-1 ring-line">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-lg px-5 py-2 text-sm font-medium transition ${
                tab === t ? "bg-primary text-white" : "text-ink-soft hover:text-ink"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        {tab !== "Timeline" && (
          <label className="flex w-full items-center gap-2 rounded-xl bg-card px-3.5 py-2.5 text-sm ring-1 ring-line sm:w-64">
            <SearchIcon className="h-4 w-4 text-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search"
              className="w-full bg-transparent text-ink outline-none placeholder:text-muted"
            />
          </label>
        )}
      </div>

      {tab === "Board" && (
        <BoardView
          columns={columns}
          query={q}
          filter={boardFilter}
          onMove={moveCard}
          onDelete={deleteCard}
          onEdit={(card, column) => setCardModal({ card, column })}
        />
      )}
      {tab === "List" && (
        <ListView
          groups={filteredGroups}
          onEdit={(task, group) => setTaskModal({ mode: "edit", task, group })}
          onDelete={deleteTask}
        />
      )}
      {tab === "Timeline" && (
        <TimelineView
          tasks={tlTasks}
          group={tlGroup}
          setGroup={setTlGroup}
          day={tlDay}
          setDay={setTlDay}
          onEdit={(task) => setTlModal({ mode: "edit", task })}
          onDelete={deleteTl}
        />
      )}

      {taskModal && (
        <TaskModal
          initial={taskModal.mode === "edit" ? { task: taskModal.task, group: taskModal.group } : undefined}
          onClose={() => setTaskModal(null)}
          onSave={(group, data) => {
            saveTask(group, data, taskModal.mode === "edit" ? taskModal.task.uid : undefined);
            setTaskModal(null);
          }}
        />
      )}

      {cardModal && (
        <BoardCardModal
          card={cardModal.card}
          column={cardModal.column}
          onClose={() => setCardModal(null)}
          onSave={(data, toTitle) => {
            saveCard(cardModal.card.id, data, toTitle);
            setCardModal(null);
          }}
        />
      )}

      {tlModal && (
        <TimelineTaskModal
          initial={tlModal.mode === "edit" ? tlModal.task : undefined}
          onClose={() => setTlModal(null)}
          onSave={(data) => {
            saveTl(data, tlModal.mode === "edit" ? tlModal.task.id : undefined);
            setTlModal(null);
          }}
        />
      )}
    </div>
  );
}

/* ---------------- Board ---------------- */

function BoardFilter({
  value,
  onChange,
}: {
  value: { priorities: string[]; tracks: string[] };
  onChange: (v: { priorities: string[]; tracks: string[] }) => void;
}) {
  const [open, setOpen] = useState(false);
  const count = value.priorities.length + value.tracks.length;

  const toggle = (key: "priorities" | "tracks", v: string) => {
    const list = value[key];
    onChange({ ...value, [key]: list.includes(v) ? list.filter((x) => x !== v) : [...list, v] });
  };

  return (
    <div className="relative">
      <PrimaryButton onClick={() => setOpen((o) => !o)}>
        <FilterIcon className="h-4 w-4" /> Filter
        {count > 0 && <span className="ml-1 rounded-full bg-white/25 px-1.5 text-xs">{count}</span>}
      </PrimaryButton>
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-12 z-40 w-56 rounded-xl bg-card p-4 shadow-xl ring-1 ring-line animate-fade-in">
            <p className="mb-2 text-xs font-semibold uppercase text-muted">Priority</p>
            <div className="mb-3 flex flex-col gap-2">
              {PRIORITIES.map((p) => (
                <label key={p} className="flex items-center gap-2 text-sm text-ink-soft">
                  <input type="checkbox" checked={value.priorities.includes(p)} onChange={() => toggle("priorities", p)} className="h-4 w-4 accent-primary" />
                  {p}
                </label>
              ))}
            </div>
            <p className="mb-2 text-xs font-semibold uppercase text-muted">Track</p>
            <div className="flex flex-col gap-2">
              {TRACKS.map((t) => (
                <label key={t} className="flex items-center gap-2 text-sm text-ink-soft">
                  <input type="checkbox" checked={value.tracks.includes(t)} onChange={() => toggle("tracks", t)} className="h-4 w-4 accent-primary" />
                  {t}
                </label>
              ))}
            </div>
            {count > 0 && (
              <button onClick={() => onChange({ priorities: [], tracks: [] })} className="mt-3 w-full rounded-lg py-2 text-sm font-medium text-danger ring-1 ring-line hover:bg-canvas">
                Clear filters
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function BoardCardMenu({
  card,
  column,
  onMove,
  onEdit,
  onDelete,
}: {
  card: BoardCard;
  column: string;
  onMove: (id: number, to: string) => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button onClick={() => setOpen((v) => !v)} className="text-muted transition hover:text-ink" aria-label="Task options">
        <MoreIcon className="h-4 w-4" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-6 z-20 w-44 overflow-hidden rounded-xl bg-card py-1 shadow-xl ring-1 ring-line animate-fade-in">
            <button onClick={() => { setOpen(false); onEdit(); }} className="flex w-full items-center gap-2 px-4 py-2 text-sm text-ink-soft hover:bg-canvas">
              <EditIcon className="h-4 w-4 text-primary" /> Edit
            </button>
            <button onClick={() => { setOpen(false); onMove(card.id, "Done"); }} className="flex w-full items-center gap-2 px-4 py-2 text-sm text-ink-soft hover:bg-canvas">
              <CheckCircleIcon className="h-4 w-4 text-success" /> Mark done
            </button>
            <div className="my-1 border-t border-line" />
            <p className="px-4 py-1 text-[11px] font-semibold uppercase text-muted">Move to</p>
            {BOARD_TITLES.filter((t) => t !== column).map((t) => (
              <button key={t} onClick={() => { setOpen(false); onMove(card.id, t); }} className="flex w-full items-center gap-2 px-4 py-2 text-sm text-ink-soft hover:bg-canvas">
                <ChevronRightIcon className="h-4 w-4 text-muted" /> {t}
              </button>
            ))}
            <div className="my-1 border-t border-line" />
            <button onClick={() => { setOpen(false); onDelete(); }} className="flex w-full items-center gap-2 px-4 py-2 text-sm text-danger hover:bg-canvas">
              <TrashIcon className="h-4 w-4" /> Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function BoardArt({ art }: { art?: "preview" | "thumbs" }) {
  if (art === "preview")
    /* eslint-disable-next-line @next/next/no-img-element */
    return <img src="/images/app-ui.svg" alt="UI preview" className="mb-3 h-28 w-full rounded-lg object-cover" />;
  if (art === "thumbs")
    return (
      <div className="mb-3 grid grid-cols-2 gap-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/web-ui.svg" alt="Web UI" className="h-20 w-full rounded-lg object-cover" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/blocks.svg" alt="3D blocks" className="h-20 w-full rounded-lg object-cover" />
      </div>
    );
  return null;
}

function BoardView({
  columns,
  query,
  filter,
  onMove,
  onDelete,
  onEdit,
}: {
  columns: BoardColumn[];
  query: string;
  filter: { priorities: string[]; tracks: string[] };
  onMove: (id: number, to: string) => void;
  onDelete: (id: number) => void;
  onEdit: (card: BoardCard, column: string) => void;
}) {
  const match = (c: BoardCard) =>
    (!query || c.title.toLowerCase().includes(query)) &&
    (filter.priorities.length === 0 || filter.priorities.includes(c.priority)) &&
    (filter.tracks.length === 0 || (c.track ? filter.tracks.includes(c.track) : false));

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {columns.map((col) => {
        const cards = col.cards.filter(match);
        const done = col.title !== "ToDo";
        return (
          <div key={col.title}>
            <h3 className="mb-3 px-1 text-base font-semibold text-ink">{col.title}</h3>
            <div className="space-y-4">
              {cards.map((c) => (
                <Card key={c.id} className="p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <CheckCircleIcon filled={done} className={done ? "h-5 w-5 text-primary" : "h-5 w-5 text-line"} />
                      <span className="text-sm font-semibold text-ink">{c.title}</span>
                    </div>
                    <BoardCardMenu
                      card={c}
                      column={col.title}
                      onMove={onMove}
                      onEdit={() => onEdit(c, col.title)}
                      onDelete={() => onDelete(c.id)}
                    />
                  </div>

                  <div className="mb-3 flex flex-wrap gap-2">
                    <Pill label={c.priority} />
                    {c.track && <Pill label={c.track} />}
                  </div>

                  <p className="mb-3 text-xs leading-relaxed text-muted">Discussion for management dashboard ui design</p>

                  <BoardArt art={c.art} />

                  <div className="flex items-center justify-between">
                    <AvatarGroup names={["John D", "Mark R", "Anne J"]} size={24} plus={1} />
                    <div className="flex items-center gap-3 text-xs text-muted">
                      <span className="flex items-center gap-1"><CommentIcon className="h-4 w-4" /> 112</span>
                      <span className="flex items-center gap-1"><HeartIcon className="h-4 w-4" /> 1.2k</span>
                    </div>
                  </div>
                </Card>
              ))}
              {cards.length === 0 && <p className="px-1 text-xs text-muted">No tasks.</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function BoardCardModal({
  card,
  column,
  onSave,
  onClose,
}: {
  card: BoardCard;
  column: string;
  onSave: (data: Omit<BoardCard, "id">, toTitle: string) => void;
  onClose: () => void;
}) {
  const [title, setTitle] = useState(card.title);
  const [priority, setPriority] = useState(card.priority);
  const [track, setTrack] = useState(card.track ?? "None");
  const [col, setCol] = useState(column);
  const [error, setError] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError(true);
      return;
    }
    onSave({ title: title.trim(), priority, track: track === "None" ? undefined : track, art: card.art }, col);
  };

  return (
    <Modal open onClose={onClose}>
      <h3 className="mb-5 text-lg font-semibold text-ink">Edit Task</h3>
      <form onSubmit={submit} className="space-y-4" noValidate>
        <div>
          <Field label="Title">
            <TextInput value={title} onChange={(e) => setTitle(e.target.value)} />
          </Field>
          {error && <p className="mt-1 text-xs text-danger">Title is required</p>}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Priority">
            <Select value={priority} onChange={(e) => setPriority((e.target as HTMLSelectElement).value)}>
              {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
            </Select>
          </Field>
          <Field label="Track">
            <Select value={track} onChange={(e) => setTrack((e.target as HTMLSelectElement).value)}>
              <option>None</option>
              {TRACKS.map((t) => <option key={t}>{t}</option>)}
            </Select>
          </Field>
        </div>
        <Field label="Column">
          <Select value={col} onChange={(e) => setCol((e.target as HTMLSelectElement).value)}>
            {BOARD_TITLES.map((t) => <option key={t}>{t}</option>)}
          </Select>
        </Field>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="rounded-xl px-5 py-2.5 text-sm font-medium text-ink-soft ring-1 ring-line transition hover:bg-canvas">
            Cancel
          </button>
          <PrimaryButton type="submit" className="px-6">Save Changes</PrimaryButton>
        </div>
      </form>
    </Modal>
  );
}

/* ---------------- List ---------------- */

function ListView({
  groups,
  onEdit,
  onDelete,
}: {
  groups: Group[];
  onEdit: (task: Task, group: string) => void;
  onDelete: (uid: number) => void;
}) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  return (
    <div className="space-y-5">
      {groups.map((g) => {
        const open = !!expanded[g.title];
        const tasks = open ? g.tasks : g.tasks.slice(0, 2);
        return (
          <Card key={g.title}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-semibold text-ink">{g.title}</h3>
              {g.tasks.length > 2 && (
                <button
                  onClick={() => setExpanded((s) => ({ ...s, [g.title]: !open }))}
                  className="text-sm font-medium text-primary"
                >
                  {open ? "See Less" : "See More"}
                </button>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead>
                  <tr className="text-left text-xs text-muted">
                    <th className="pb-3 font-medium">Check Box</th>
                    <th className="pb-3 font-medium">Task Name</th>
                    <th className="pb-3 font-medium">Start Date</th>
                    <th className="pb-3 font-medium">End Date</th>
                    <th className="pb-3 font-medium">Member</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.length === 0 && (
                    <tr><td colSpan={7} className="py-6 text-center text-muted">No tasks.</td></tr>
                  )}
                  {tasks.map((r) => (
                    <tr key={r.uid} className="border-t border-line/70">
                      <td className="py-3.5">
                        <input type="checkbox" defaultChecked={g.title !== "To Do"} className="h-4 w-4 accent-primary" />
                      </td>
                      <td className="py-3.5">
                        <div className="flex items-center gap-3">
                          <Avatar name={r.name} size={28} />
                          <span className="font-medium text-primary">{r.name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 text-ink-soft">{r.start}</td>
                      <td className="py-3.5 text-danger">{r.end}</td>
                      <td className="py-3.5 text-ink-soft">{r.members} Member</td>
                      <td className="py-3.5"><Pill label={r.status} /></td>
                      <td className="py-3.5">
                        <div className="flex items-center gap-2">
                          <button onClick={() => onEdit(r, g.title)} className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-light text-primary transition hover:bg-primary hover:text-white" aria-label="Edit task">
                            <EditIcon className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={() => onDelete(r.uid)} className="flex h-7 w-7 items-center justify-center rounded-lg bg-danger-soft text-danger transition hover:bg-danger hover:text-white" aria-label="Delete task">
                            <TrashIcon className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

/* ---------------- Task modal (List add / edit) ---------------- */

function TaskModal({
  initial,
  onSave,
  onClose,
}: {
  initial?: { task: Task; group: string };
  onSave: (group: string, data: Omit<Task, "uid">) => void;
  onClose: () => void;
}) {
  const t = initial?.task;
  const [name, setName] = useState(t?.name ?? "");
  const [start, setStart] = useState(t?.start ?? "01/12/2021");
  const [end, setEnd] = useState(t?.end ?? "5/12/2021");
  const [members, setMembers] = useState(String(t?.members ?? 5));
  const [status, setStatus] = useState(t?.status ?? "Pending");
  const [group, setGroup] = useState(initial?.group ?? "To Do");
  const [error, setError] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError(true);
      return;
    }
    onSave(group, { name: name.trim(), start, end, members: Number(members) || 1, status });
  };

  return (
    <Modal open onClose={onClose}>
      <h3 className="mb-5 text-lg font-semibold text-ink">{initial ? "Edit Task" : "Add Task"}</h3>
      <form onSubmit={submit} className="space-y-4" noValidate>
        <div>
          <Field label="Task Name">
            <TextInput value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Dashboard Design" />
          </Field>
          {error && <p className="mt-1 text-xs text-danger">Task name is required</p>}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Start Date"><TextInput value={start} onChange={(e) => setStart(e.target.value)} /></Field>
          <Field label="End Date"><TextInput value={end} onChange={(e) => setEnd(e.target.value)} /></Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Members"><TextInput type="number" min={1} value={members} onChange={(e) => setMembers(e.target.value)} /></Field>
          <Field label="Status">
            <Select value={status} onChange={(e) => setStatus((e.target as HTMLSelectElement).value)}>
              <option>Pending</option>
              <option>Running</option>
              <option>Done</option>
            </Select>
          </Field>
        </div>
        <Field label="Column">
          <Select value={group} onChange={(e) => setGroup((e.target as HTMLSelectElement).value)}>
            {GROUP_TITLES.map((gt) => <option key={gt}>{gt}</option>)}
          </Select>
        </Field>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="rounded-xl px-5 py-2.5 text-sm font-medium text-ink-soft ring-1 ring-line transition hover:bg-canvas">Cancel</button>
          <PrimaryButton type="submit" className="px-6">{initial ? "Save Changes" : "Add Task"}</PrimaryButton>
        </div>
      </form>
    </Modal>
  );
}

/* ---------------- Timeline ---------------- */

const HOURS = ["09.00 AM", "10.00 AM", "11.00 AM", "12.00 PM", "01.00 PM", "02.00 PM", "03.00 PM", "04.00 PM", "05.00 PM"];
const TL_DAYS = ["9", "30", "01", "02", "03", "04", "05", "06", "07", "08"];

function TimelineRowMenu({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button onClick={() => setOpen((v) => !v)} className="text-muted transition hover:text-ink" aria-label="Task options">
        <MoreIcon className="h-4 w-4" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-6 z-20 w-32 overflow-hidden rounded-xl bg-card py-1 shadow-xl ring-1 ring-line animate-fade-in">
            <button onClick={() => { setOpen(false); onEdit(); }} className="flex w-full items-center gap-2 px-4 py-2 text-sm text-ink-soft hover:bg-canvas">
              <EditIcon className="h-4 w-4 text-primary" /> Edit
            </button>
            <button onClick={() => { setOpen(false); onDelete(); }} className="flex w-full items-center gap-2 px-4 py-2 text-sm text-danger hover:bg-canvas">
              <TrashIcon className="h-4 w-4" /> Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function TimelineView({
  tasks,
  group,
  setGroup,
  day,
  setDay,
  onEdit,
  onDelete,
}: {
  tasks: TLTask[];
  group: string | null;
  setGroup: (g: string | null) => void;
  day: string;
  setDay: (d: string) => void;
  onEdit: (task: TLTask) => void;
  onDelete: (id: number) => void;
}) {
  const visible = tasks.filter((t) => t.day === day && (group ? t.group === group : true));
  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[200px_1fr]">
      <div className="space-y-3">
        {TL_GROUPS.map((s) => {
          const active = group === s;
          const count = tasks.filter((t) => t.day === day && t.group === s).length;
          return (
            <button
              key={s}
              onClick={() => setGroup(active ? null : s)}
              className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition ${
                active ? "bg-primary text-white" : "bg-card text-ink-soft ring-1 ring-line hover:text-ink"
              }`}
            >
              <span>{s} <span className={active ? "text-white/70" : "text-muted"}>({count})</span></span>
              <ChevronRightIcon className="h-4 w-4" />
            </button>
          );
        })}
        {group && (
          <button onClick={() => setGroup(null)} className="w-full rounded-xl py-2 text-xs font-medium text-primary ring-1 ring-line hover:bg-canvas">
            Show all
          </button>
        )}
      </div>

      <Card className="overflow-x-auto p-0">
        <div className="min-w-[640px]">
          <div className="flex items-center justify-between gap-1 border-b border-line px-4 py-3 text-xs text-muted">
            {TL_DAYS.map((d) => (
              <button
                key={d}
                onClick={() => setDay(d)}
                className={`flex h-8 flex-1 items-center justify-center rounded-md transition ${
                  day === d ? "bg-primary font-medium text-white" : "hover:bg-canvas"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
          {HOURS.map((h) => {
            const rowTasks = visible.filter((t) => t.time === h);
            return (
              <div key={h} className="flex items-center gap-4 border-b border-line/70 px-4 py-4 last:border-0">
                <span className="w-16 shrink-0 text-xs text-muted">{h}</span>
                <div className="flex flex-1 flex-wrap gap-3">
                  {rowTasks.map((task) => {
                    const done = task.group === "Done";
                    return (
                      <div key={task.id} className="flex items-center gap-3 rounded-xl bg-card px-4 py-2.5 shadow-[0_4px_20px_rgba(20,20,43,0.08)] ring-1 ring-line">
                        <CheckCircleIcon filled={done} className={done ? "h-5 w-5 text-primary" : "h-5 w-5 text-line"} />
                        <span className="whitespace-nowrap text-sm font-medium text-ink">{task.title}</span>
                        <AvatarGroup names={["John D", "Mark R"]} size={22} plus={1} />
                        <Pill label={task.priority} />
                        <Pill label={task.track} />
                        <TimelineRowMenu onEdit={() => onEdit(task)} onDelete={() => onDelete(task.id)} />
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

function TimelineTaskModal({
  initial,
  onSave,
  onClose,
}: {
  initial?: TLTask;
  onSave: (data: Omit<TLTask, "id">) => void;
  onClose: () => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [time, setTime] = useState(initial?.time ?? HOURS[0]);
  const [day, setDay] = useState(initial?.day ?? "02");
  const [grp, setGrp] = useState(initial?.group ?? "To Do");
  const [priority, setPriority] = useState(initial?.priority ?? "Low");
  const [track, setTrack] = useState(initial?.track ?? "On Track");
  const [error, setError] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError(true);
      return;
    }
    onSave({ title: title.trim(), time, day, group: grp, priority, track });
  };

  return (
    <Modal open onClose={onClose}>
      <h3 className="mb-5 text-lg font-semibold text-ink">{initial ? "Edit Task" : "Add Task"}</h3>
      <form onSubmit={submit} className="space-y-4" noValidate>
        <div>
          <Field label="Task Name">
            <TextInput value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Web Design" />
          </Field>
          {error && <p className="mt-1 text-xs text-danger">Task name is required</p>}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Time">
            <Select value={time} onChange={(e) => setTime((e.target as HTMLSelectElement).value)}>
              {HOURS.map((h) => <option key={h}>{h}</option>)}
            </Select>
          </Field>
          <Field label="Day">
            <Select value={day} onChange={(e) => setDay((e.target as HTMLSelectElement).value)}>
              {TL_DAYS.map((d) => <option key={d}>{d}</option>)}
            </Select>
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Group">
            <Select value={grp} onChange={(e) => setGrp((e.target as HTMLSelectElement).value)}>
              {TL_GROUPS.map((g) => <option key={g}>{g}</option>)}
            </Select>
          </Field>
          <Field label="Priority">
            <Select value={priority} onChange={(e) => setPriority((e.target as HTMLSelectElement).value)}>
              {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
            </Select>
          </Field>
        </div>
        <Field label="Track">
          <Select value={track} onChange={(e) => setTrack((e.target as HTMLSelectElement).value)}>
            {TRACKS.map((t) => <option key={t}>{t}</option>)}
          </Select>
        </Field>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="rounded-xl px-5 py-2.5 text-sm font-medium text-ink-soft ring-1 ring-line transition hover:bg-canvas">Cancel</button>
          <PrimaryButton type="submit" className="px-6">{initial ? "Save Changes" : "Add Task"}</PrimaryButton>
        </div>
      </form>
    </Modal>
  );
}

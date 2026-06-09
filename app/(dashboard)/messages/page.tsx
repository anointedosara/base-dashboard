"use client";

import { useRef, useState } from "react";
import { Avatar } from "@/components/Avatar";
import { Modal } from "@/components/Overlay";
import { PrimaryButton } from "@/components/ui";
import { Field, TextInput, PhotoUpload } from "@/components/Form";
import {
  PlusIcon,
  SearchIcon,
  PhoneIcon,
  VideoIcon,
  MoreIcon,
  PaperclipIcon,
  SmileIcon,
  SendIcon,
  ChevronLeftIcon,
  MessagesIcon,
} from "@/components/Icons";
import { CUSTOMERS } from "@/lib/data";
import { addUnread, clearUnread } from "@/lib/messageStore";
import { getAuthSnapshot } from "@/lib/auth";

const ADMIN = "Base Admin";

const TABS = ["All", "Personal", "Teams"] as const;
const REPLIES = [
  "Sure, sounds good! 👍",
  "Got it, thanks for letting me know.",
  "Let me check and get back to you.",
  "Perfect, talk soon!",
  "Haha nice 😄",
];

type Conversation = { name: string; preview: string; time: string; online: boolean; type: "personal" | "team"; image?: string };
type Msg = { from: "me" | "them"; type: "text" | "image"; text?: string; url?: string; time?: string };

function welcomeText() {
  const first = getAuthSnapshot()?.fullName?.split(" ")[0];
  return `Hi ${first ?? "there"} 👋 Welcome to Base! I'm the admin — reach out here anytime if you need a hand getting started.`;
}

export default function MessagesPage() {
  // Every signed-in user starts with one automatic welcome chat from the admin.
  const [conversations, setConversations] = useState<Conversation[]>(() =>
    getAuthSnapshot() ? [{ name: ADMIN, preview: welcomeText(), time: "now", online: true, type: "personal" }] : [],
  );
  const [messages, setMessages] = useState<Record<string, Msg[]>>(() => {
    const init: Record<string, Msg[]> = {};
    if (getAuthSnapshot()) init[ADMIN] = [{ from: "them", type: "text", text: welcomeText(), time: "now" }];
    return init;
  });
  const [active, setActive] = useState<string | null>(null);
  const [tab, setTab] = useState<(typeof TABS)[number]>("All");
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState("");
  const [picker, setPicker] = useState(false);
  const [mobileChat, setMobileChat] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const activeRef = useRef<string | null>(null);

  const current = conversations.find((c) => c.name === active) ?? null;
  const thread = active ? messages[active] ?? [] : [];

  const byTab = conversations.filter((c) =>
    tab === "All" ? true : tab === "Personal" ? c.type === "personal" : c.type === "team",
  );
  const shown = query.trim()
    ? byTab.filter((c) => c.name.toLowerCase().includes(query.trim().toLowerCase()))
    : byTab;

  const open = (name: string) => {
    setActive(name);
    activeRef.current = name;
    setMobileChat(true);
    clearUnread(); // reading a conversation clears the unread badge
  };

  const push = (name: string, msg: Msg) => {
    setMessages((prev) => ({ ...prev, [name]: [...(prev[name] ?? []), msg] }));
    setConversations((prev) =>
      prev.map((c) => (c.name === name ? { ...c, preview: msg.type === "image" ? "📷 Photo" : msg.text!, time: "now" } : c)),
    );
  };

  // Simulate the other person replying ~1.5s later.
  const scheduleReply = (name: string) => {
    setTimeout(() => {
      push(name, { from: "them", type: "text", text: REPLIES[Math.floor(name.length) % REPLIES.length], time: "now" });
      if (activeRef.current !== name) addUnread(1); // only counts if you're not looking at it
    }, 1500);
  };

  const send = () => {
    if (!draft.trim() || !active) return;
    push(active, { from: "me", type: "text", text: draft.trim(), time: "now" });
    scheduleReply(active);
    setDraft("");
  };

  const sendImage = (file: File | null) => {
    if (!file || !active) return;
    push(active, { from: "me", type: "image", url: URL.createObjectURL(file), time: "now" });
    scheduleReply(active);
  };

  const createConversation = (conv: Conversation) => {
    setConversations((prev) => (prev.some((c) => c.name === conv.name) ? prev : [conv, ...prev]));
    setPicker(false);
    open(conv.name);
  };

  return (
    <div className="mx-auto h-[calc(100dvh-6.5rem)] max-w-[1400px] lg:h-[calc(100dvh-4rem)]">
      <div className="grid h-full grid-cols-1 gap-5 lg:grid-cols-[320px_1fr] xl:grid-cols-[360px_1fr]">
        {/* Conversation list */}
        <div className={`flex h-full flex-col rounded-2xl bg-card p-5 shadow-[0_4px_24px_rgba(20,20,43,0.04)] ${mobileChat ? "hidden lg:flex" : "flex"}`}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-ink">Message</h2>
            <button onClick={() => setPicker(true)} className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white transition hover:bg-primary-dark" aria-label="New message">
              <PlusIcon className="h-4 w-4" />
            </button>
          </div>

          <label className="flex items-center gap-2 rounded-xl bg-canvas px-3 py-2.5 text-sm">
            <SearchIcon className="h-4 w-4 text-muted" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search" className="w-full bg-transparent outline-none placeholder:text-muted" />
          </label>

          <div className="mt-4 flex gap-6 border-b border-line text-sm">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`-mb-px border-b-2 pb-2 font-medium transition ${
                  tab === t ? "border-primary text-primary" : "border-transparent text-muted hover:text-ink"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="mt-2 flex-1 space-y-1 overflow-y-auto">
            {shown.length === 0 && (
              <div className="px-3 py-10 text-center text-sm text-muted">
                {conversations.length === 0
                  ? "No conversations yet. Tap + to start one."
                  : query.trim()
                    ? "No conversations found."
                    : `No ${tab.toLowerCase()} conversations yet.`}
              </div>
            )}
            {shown.map((c) => (
              <button
                key={c.name}
                onClick={() => open(c.name)}
                className={`flex w-full items-center gap-3 rounded-xl p-3 text-left transition ${
                  active === c.name ? "bg-primary-light/50" : "hover:bg-canvas"
                }`}
              >
                <Avatar name={c.name} size={44} online={c.online} src={c.image} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-semibold text-ink">{c.name}</span>
                    <span className="shrink-0 text-[11px] text-muted">{c.time}</span>
                  </div>
                  <p className="truncate text-xs text-muted">{c.preview}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat */}
        <div className={`flex h-full flex-col rounded-2xl bg-card shadow-[0_4px_24px_rgba(20,20,43,0.04)] ${mobileChat ? "flex" : "hidden lg:flex"}`}>
          {!current ? (
            <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-light text-primary">
                <MessagesIcon className="h-7 w-7" />
              </span>
              <h3 className="mt-4 text-lg font-semibold text-ink">No conversation selected</h3>
              <p className="mt-1 max-w-xs text-sm text-muted">
                Pick a conversation on the left, or tap <span className="font-medium text-primary">+</span> to start a new one.
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between border-b border-line px-5 py-4">
                <div className="flex items-center gap-3">
                  <button onClick={() => setMobileChat(false)} className="text-ink-soft lg:hidden" aria-label="Back">
                    <ChevronLeftIcon className="h-5 w-5" />
                  </button>
                  <Avatar name={current.name} size={42} online={current.online} src={current.image} />
                  <div>
                    <p className="text-sm font-semibold text-ink">{current.name}</p>
                    <p className="text-xs text-emerald-500">{current.type === "team" ? "Group" : current.online ? "Online" : "Offline"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-ink-soft">
                  {[PhoneIcon, VideoIcon, MoreIcon].map((Icon, i) => (
                    <button key={i} className="flex h-9 w-9 items-center justify-center rounded-full bg-canvas transition hover:text-primary" aria-label="Action">
                      <Icon className="h-4 w-4" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto px-5 py-6">
                {thread.length === 0 && (
                  <p className="mt-10 text-center text-sm text-muted">No messages yet. Say hello 👋</p>
                )}
                {thread.map((m, i) => {
                  const mine = m.from === "me";
                  return (
                    <div key={i} className={`flex items-end gap-2 ${mine ? "justify-end" : "justify-start"}`}>
                      {!mine && <Avatar name={current.name} size={30} />}
                      <div className={`max-w-[75%] ${m.type === "image" ? "" : "rounded-2xl px-4 py-2.5 text-sm"} ${
                        m.type === "image" ? "" : mine ? "rounded-br-md bg-primary text-white" : "rounded-bl-md bg-canvas text-ink"
                      }`}>
                        {m.type === "image" ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={m.url} alt="attachment" className="max-h-60 rounded-xl ring-1 ring-line" />
                        ) : (
                          <p>{m.text}</p>
                        )}
                        {m.time && m.type === "text" && (
                          <span className={`mt-1 block text-right text-[10px] ${mine ? "text-white/70" : "text-muted"}`}>{m.time}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center gap-3 border-t border-line px-5 py-4">
                <button onClick={() => fileRef.current?.click()} className="text-muted transition hover:text-primary" aria-label="Attach image">
                  <PaperclipIcon className="h-5 w-5" />
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { sendImage(e.target.files?.[0] ?? null); e.target.value = ""; }} />
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send()}
                  placeholder="Type a message..."
                  className="flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-muted"
                />
                <button className="text-muted transition hover:text-primary" aria-label="Emoji">
                  <SmileIcon className="h-5 w-5" />
                </button>
                <button onClick={send} className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white transition hover:bg-primary-dark" aria-label="Send">
                  <SendIcon className="h-4 w-4" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {picker && (
        <NewChatModal
          existing={conversations.map((c) => c.name)}
          onClose={() => setPicker(false)}
          onCreate={createConversation}
        />
      )}
    </div>
  );
}

/* ---------------- New chat modal (private / group) ---------------- */

function NewChatModal({
  existing,
  onCreate,
  onClose,
}: {
  existing: string[];
  onCreate: (c: Conversation) => void;
  onClose: () => void;
}) {
  const [step, setStep] = useState<"choose" | "private" | "group">("choose");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [groupName, setGroupName] = useState("");
  const [groupImg, setGroupImg] = useState<string | null>(null);
  const [error, setError] = useState("");

  const people = CUSTOMERS.filter((p) => !existing.includes(p.name));
  const toggle = (name: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });

  const createGroup = () => {
    if (!groupName.trim()) return setError("Please name the group.");
    if (selected.size < 2) return setError("Pick at least two people for a group.");
    onCreate({
      name: groupName.trim(),
      preview: `${selected.size} members`,
      time: "now",
      online: false,
      type: "team",
      image: groupImg ?? undefined,
    });
  };

  return (
    <Modal open onClose={onClose}>
      {step === "choose" && (
        <>
          <h3 className="mb-5 text-lg font-semibold text-ink">New conversation</h3>
          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => setStep("private")} className="flex flex-col items-center gap-2 rounded-xl p-6 ring-1 ring-line transition hover:bg-canvas hover:ring-primary/40">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-light text-primary text-xl">👤</span>
              <span className="text-sm font-semibold text-ink">Private chat</span>
              <span className="text-center text-xs text-muted">One person · Personal</span>
            </button>
            <button onClick={() => setStep("group")} className="flex flex-col items-center gap-2 rounded-xl p-6 ring-1 ring-line transition hover:bg-canvas hover:ring-primary/40">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-light text-primary text-xl">👥</span>
              <span className="text-sm font-semibold text-ink">Group chat</span>
              <span className="text-center text-xs text-muted">Many people · Teams</span>
            </button>
          </div>
        </>
      )}

      {step === "private" && (
        <>
          <h3 className="mb-4 text-lg font-semibold text-ink">Select a person</h3>
          <div className="max-h-80 space-y-1 overflow-y-auto">
            {people.length === 0 && <p className="py-6 text-center text-sm text-muted">Everyone is already in your list.</p>}
            {people.map((p) => (
              <button
                key={p.email}
                onClick={() => onCreate({ name: p.name, preview: "Start a conversation", time: "now", online: true, type: "personal" })}
                className="flex w-full items-center gap-3 rounded-xl p-3 text-left transition hover:bg-canvas"
              >
                <Avatar name={p.name} size={40} online />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">{p.name}</p>
                  <p className="truncate text-xs text-muted">{p.email}</p>
                </div>
              </button>
            ))}
          </div>
          <button onClick={() => setStep("choose")} className="mt-4 text-sm font-medium text-primary">← Back</button>
        </>
      )}

      {step === "group" && (
        <>
          <h3 className="mb-4 text-lg font-semibold text-ink">Create a group</h3>
          <div className="mb-4 flex items-center gap-4">
            <PhotoUpload size={64} value={groupImg} onChange={(_, url) => setGroupImg(url)} />
            <div className="flex-1">
              <Field label="Group name">
                <TextInput value={groupName} onChange={(e) => setGroupName(e.target.value)} placeholder="e.g. Design Team" />
              </Field>
            </div>
          </div>
          <p className="mb-2 text-sm font-medium text-ink-soft">Add members ({selected.size})</p>
          <div className="max-h-56 space-y-1 overflow-y-auto">
            {people.map((p) => (
              <label key={p.email} className="flex cursor-pointer items-center gap-3 rounded-xl p-2.5 transition hover:bg-canvas">
                <input type="checkbox" checked={selected.has(p.name)} onChange={() => toggle(p.name)} className="h-4 w-4 accent-primary" />
                <Avatar name={p.name} size={34} />
                <span className="text-sm font-medium text-ink">{p.name}</span>
              </label>
            ))}
          </div>
          {error && <p className="mt-2 text-xs text-danger">{error}</p>}
          <div className="mt-4 flex justify-between">
            <button onClick={() => setStep("choose")} className="text-sm font-medium text-primary">← Back</button>
            <PrimaryButton onClick={createGroup} className="px-6">Create Group</PrimaryButton>
          </div>
        </>
      )}
    </Modal>
  );
}

"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { PrimaryButton, Pill } from "@/components/ui";
import { Avatar } from "@/components/Avatar";
import {
  PlusIcon,
  SearchIcon,
  MailIcon,
  CalendarIcon,
  StarIcon,
  MoreIcon,
  EditIcon,
  TrashIcon,
} from "@/components/Icons";
import { INVOICES } from "@/lib/data";
import {
  subscribeInvoices,
  getInvoicesSnapshot,
  getInvoicesServerSnapshot,
  deleteCreatedInvoiceAt,
} from "@/lib/invoiceStore";
import { useEnsureAuth } from "@/lib/useEnsureAuth";
import { usePersistedUserState } from "@/lib/usePersistedUserState";

type Row = (typeof INVOICES)[number] & { uid: number };

export default function InvoicePage() {
  // Seed invoices (mutable) plus invoices created on /invoice/create (from the store).
  const [seed, setSeed] = useState<Row[]>(() => INVOICES.map((inv, i) => ({ ...inv, uid: i })));
  const created = useSyncExternalStore(subscribeInvoices, getInvoicesSnapshot, getInvoicesServerSnapshot);
  const items: Row[] = [
    ...created.map((c, i) => ({ ...c, starred: false, checked: false, uid: 1000 + i })),
    ...seed,
  ];
  const [query, setQuery] = useState("");
  // Nothing pre-selected / pre-liked; the user's stars + selections save per account.
  const [checked, setChecked] = usePersistedUserState<number[]>("invoice.checked", [], []);
  const [starred, setStarred] = usePersistedUserState<number[]>("invoice.starred", [], []);
  const [menu, setMenu] = useState<number | null>(null);
  const ensure = useEnsureAuth();
  const router = useRouter();

  const q = query.trim().toLowerCase();
  const filtered = q
    ? items.filter((it) =>
        [it.id, it.name, it.email, it.status].some((f) => f.toLowerCase().includes(q)),
      )
    : items;

  const toggleIn = (arr: number[], uid: number) =>
    arr.includes(uid) ? arr.filter((x) => x !== uid) : [...arr, uid];

  const allVisibleChecked = filtered.length > 0 && filtered.every((it) => checked.includes(it.uid));
  const selectedCount = items.filter((it) => checked.includes(it.uid)).length;

  const toggleAll = () => {
    if (allVisibleChecked) setChecked(checked.filter((uid) => !filtered.some((f) => f.uid === uid)));
    else setChecked([...new Set([...checked, ...filtered.map((f) => f.uid)])]);
  };

  const deleteUids = (uids: number[]) => {
    if (!ensure()) return;
    const drop = new Set(uids);
    // Seed rows live in local state…
    setSeed((prev) => prev.filter((it) => !drop.has(it.uid)));
    // …created rows live in the store (delete by index, highest first so indices stay valid).
    uids
      .filter((u) => u >= 1000)
      .sort((a, b) => b - a)
      .forEach((u) => deleteCreatedInvoiceAt(u - 1000));
    setChecked(checked.filter((u) => !drop.has(u)));
    setMenu(null);
  };

  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader title="Invoice List">
        <label className="flex w-full items-center gap-2 rounded-xl bg-card px-3.5 py-2.5 text-sm ring-1 ring-line sm:w-64">
          <SearchIcon className="h-4 w-4 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search"
            className="w-full bg-transparent text-ink outline-none placeholder:text-muted"
          />
        </label>
        <PrimaryButton onClick={() => ensure() && router.push("/invoice/create")}>
          <PlusIcon className="h-4 w-4" /> Add New
        </PrimaryButton>
      </PageHeader>

      {/* column header */}
      <div className="hidden grid-cols-[auto_1fr_1.4fr_1.6fr_1.2fr_1fr_auto_auto] items-center gap-4 px-5 pb-2 text-xs font-medium text-muted lg:grid">
        <input type="checkbox" checked={allVisibleChecked} onChange={toggleAll} className="h-4 w-4 accent-primary" />
        <span>Invoice Id</span>
        <span>Name</span>
        <span>Email</span>
        <span>Date</span>
        <span>Status</span>
        <span />
        <button
          onClick={() => selectedCount > 0 && deleteUids(items.filter((it) => checked.includes(it.uid)).map((it) => it.uid))}
          disabled={selectedCount === 0}
          className={`justify-self-end transition ${
            selectedCount > 0 ? "text-danger hover:scale-110" : "cursor-not-allowed text-line"
          }`}
          aria-label={`Delete ${selectedCount} selected`}
          title={selectedCount > 0 ? `Delete ${selectedCount} selected` : "Select rows to delete"}
        >
          <TrashIcon className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="rounded-2xl bg-card py-12 text-center text-sm text-muted shadow-[0_2px_14px_rgba(20,20,43,0.04)]">
            No invoices match “{query}”.
          </div>
        )}
        {filtered.map((inv) => (
          <div
            key={inv.uid}
            className="grid grid-cols-[auto_1fr_auto] items-center gap-4 rounded-2xl bg-card px-5 py-3.5 shadow-[0_2px_14px_rgba(20,20,43,0.04)] lg:grid-cols-[auto_1fr_1.4fr_1.6fr_1.2fr_1fr_auto_auto]"
          >
            <input
              type="checkbox"
              checked={checked.includes(inv.uid)}
              onChange={() => setChecked(toggleIn(checked, inv.uid))}
              className="h-4 w-4 accent-primary"
            />

            <div className="min-w-0 lg:contents">
              <span className="block font-medium text-ink lg:inline">{inv.id}</span>
              <div className="mt-1 flex items-center gap-2.5 lg:mt-0">
                <Avatar name={inv.name} size={30} />
                <span className="truncate font-medium text-ink">{inv.name}</span>
              </div>
              <span className="mt-1 flex items-center gap-2 truncate text-sm text-ink-soft lg:mt-0">
                <MailIcon className="h-4 w-4 text-emerald-500" /> {inv.email}
              </span>
              <span className="mt-1 flex items-center gap-2 text-sm text-ink-soft lg:mt-0">
                <CalendarIcon className="h-4 w-4 text-primary" /> {inv.date}
              </span>
              <span className="mt-2 lg:mt-0">
                <Pill label={inv.status} />
              </span>
            </div>

            <div className="relative flex items-center gap-3 justify-self-end lg:contents">
              <button
                onClick={() => ensure() && setStarred(toggleIn(starred, inv.uid))}
                className={starred.includes(inv.uid) ? "text-warning" : "text-line"}
                aria-label="Star invoice"
              >
                <StarIcon filled={starred.includes(inv.uid)} className="h-5 w-5" />
              </button>
              <button
                onClick={() => setMenu(menu === inv.uid ? null : inv.uid)}
                className="text-muted transition hover:text-ink"
                aria-label="Row actions"
              >
                <MoreIcon />
              </button>
              {menu === inv.uid && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenu(null)} />
                  <div className="absolute right-0 top-9 z-20 w-32 overflow-hidden rounded-xl bg-card py-1 shadow-xl ring-1 ring-line animate-fade-in">
                    <Link
                      href="/invoice/create"
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-ink-soft hover:bg-canvas"
                    >
                      <EditIcon className="h-4 w-4 text-primary" /> Edit
                    </Link>
                    <button
                      onClick={() => deleteUids([inv.uid])}
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-danger hover:bg-canvas"
                    >
                      <TrashIcon className="h-4 w-4" /> Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

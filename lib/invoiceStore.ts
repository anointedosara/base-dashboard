/* Lightweight client-side store so invoices created on /invoice/create show up
   on /invoice. Persists to localStorage and exposes a useSyncExternalStore API
   (the React-sanctioned way to read external/client-only state without
   hydration mismatches or setState-in-effect). */

export type StoredInvoice = {
  id: string;
  name: string;
  email: string;
  date: string;
  status: string;
};

const KEY = "base.invoices.created";
const EMPTY: StoredInvoice[] = [];

let cache: StoredInvoice[] | null = null;
const listeners = new Set<() => void>();

function load(): StoredInvoice[] {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as StoredInvoice[]) : [];
  } catch {
    return [];
  }
}

function persist() {
  if (typeof window === "undefined" || !cache) return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(cache));
  } catch {
    /* ignore quota / serialization errors in this demo */
  }
}

function emit() {
  listeners.forEach((l) => l());
}

export function subscribeInvoices(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

/** Stable snapshot reference — only changes when the list is mutated. */
export function getInvoicesSnapshot(): StoredInvoice[] {
  if (cache === null) cache = load();
  return cache;
}

export function getInvoicesServerSnapshot(): StoredInvoice[] {
  return EMPTY;
}

export function addCreatedInvoice(inv: StoredInvoice) {
  cache = [inv, ...getInvoicesSnapshot()];
  persist();
  emit();
}

export function deleteCreatedInvoiceAt(index: number) {
  cache = getInvoicesSnapshot().filter((_, i) => i !== index);
  persist();
  emit();
}

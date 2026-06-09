/* Session-scoped notification feed. Empty on load; pages call notify(...) when
   the user changes something, and the Notification page reads it via
   useSyncExternalStore. Lives in module memory (resets on full reload). */

export type Notif = { id: number; actor: string; action: string; time: string; unread: boolean };

let cache: Notif[] = [];
let seq = 0;
const EMPTY: Notif[] = [];
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

export function subscribeNotifs(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function getNotifsSnapshot(): Notif[] {
  return cache;
}

export function getNotifsServerSnapshot(): Notif[] {
  return EMPTY;
}

/** Record a change. `action` describes what was done, e.g. `Created invoice #876370`.
    Notifications are delivered by the admin by default. */
export function notify(action: string, actor = "Base Admin") {
  cache = [{ id: seq++, actor, action, time: "Just now", unread: true }, ...cache];
  emit();
}

export function markAllNotifsRead() {
  cache = cache.map((n) => ({ ...n, unread: false }));
  emit();
}

export function markNotifRead(id: number) {
  cache = cache.map((n) => (n.id === id ? { ...n, unread: false } : n));
  emit();
}

export function clearNotifs() {
  cache = [];
  emit();
}

/* Tiny unread-message counter for the sidebar badge. Starts at 0; increments
   when a reply arrives while you're not looking at that conversation. */

let unread = 0;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

export function subscribeUnread(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}
export function getUnreadSnapshot(): number {
  return unread;
}
export function getUnreadServerSnapshot(): number {
  return 0;
}
export function addUnread(n = 1) {
  unread += n;
  emit();
}
export function clearUnread() {
  if (unread === 0) return;
  unread = 0;
  emit();
}

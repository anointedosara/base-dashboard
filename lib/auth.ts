/* Client-side auth backed by localStorage. Accounts are unique by email and
   username. Exposes a useSyncExternalStore API so the UI reacts to login/logout. */

export type Account = { fullName: string; email: string; username: string; password: string; photo?: string; plan?: string };

const USERS_KEY = "base.users";
const SESSION_KEY = "base.session";

let current: Account | null | undefined = undefined; // undefined = not loaded yet
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function loadUsers(): Account[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(USERS_KEY);
    return raw ? (JSON.parse(raw) as Account[]) : [];
  } catch {
    return [];
  }
}

function saveUsers(users: Account[]) {
  try {
    window.localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch {
    /* ignore */
  }
}

function loadCurrent(): Account | null {
  if (typeof window === "undefined") return null;
  const email = window.localStorage.getItem(SESSION_KEY);
  if (!email) return null;
  return loadUsers().find((u) => u.email === email) ?? null;
}

function setSession(user: Account | null) {
  try {
    if (user) window.localStorage.setItem(SESSION_KEY, user.email);
    else window.localStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
  current = user;
  emit();
}

export function subscribeAuth(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}
export function getAuthSnapshot(): Account | null {
  if (current === undefined) current = loadCurrent();
  return current;
}
export function getAuthServerSnapshot(): Account | null {
  return null;
}

export function register(data: Account): { ok: boolean; error?: string } {
  const users = loadUsers();
  const email = data.email.trim().toLowerCase();
  const username = data.username.trim().toLowerCase();
  if (users.some((u) => u.email.toLowerCase() === email)) return { ok: false, error: "An account with this email already exists." };
  if (users.some((u) => u.username.toLowerCase() === username)) return { ok: false, error: "That username is already taken." };
  const user: Account = { ...data, email: data.email.trim(), username: data.username.trim() };
  saveUsers([...users, user]);
  setSession(user);
  return { ok: true };
}

export function login(email: string, password: string): { ok: boolean; error?: string } {
  const user = loadUsers().find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  if (!user || user.password !== password) return { ok: false, error: "Invalid email or password." };
  setSession(user);
  return { ok: true };
}

export function logout() {
  setSession(null);
}

/** Update the signed-in account (profile, photo, plan) and persist it. */
export function updateAccount(patch: Partial<Account>): { ok: boolean; error?: string } {
  if (!current) return { ok: false, error: "Not signed in." };
  const users = loadUsers();
  if (patch.email && patch.email.toLowerCase() !== current.email.toLowerCase()) {
    if (users.some((u) => u.email.toLowerCase() === patch.email!.toLowerCase())) {
      return { ok: false, error: "Another account already uses this email." };
    }
  }
  const updated: Account = { ...current, ...patch };
  saveUsers(users.map((u) => (u.email === current!.email ? updated : u)));
  // session key tracks email; rewrite it if the email changed
  try {
    window.localStorage.setItem(SESSION_KEY, updated.email);
  } catch {
    /* ignore */
  }
  current = updated;
  emit();
  return { ok: true };
}

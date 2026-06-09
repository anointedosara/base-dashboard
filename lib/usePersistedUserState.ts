"use client";

import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { getAuthSnapshot } from "./auth";

/* Per-user persisted state.
   - Signed-in users: state is stored in localStorage under their account and
     defaults to `emptyInitial` (a brand-new user starts with nothing).
   - Guests: state is the in-memory `guestSeed` demo data (never persisted).

   Login / logout always navigates between pages, so the data components remount
   and re-read the right account in the useState initializer. */

function keyFor(name: string): string | null {
  const account = getAuthSnapshot();
  return account ? `base.u.${account.email}.${name}` : null;
}

function read<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

/** One-off read of the signed-in user's stored collection (for cross-page display). */
export function readUserState<T>(name: string, fallback: T): T {
  const key = keyFor(name);
  if (!key) return fallback;
  return read<T>(key, fallback);
}

export function usePersistedUserState<T>(
  name: string,
  guestSeed: T,
  emptyInitial: T,
): [T, Dispatch<SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => {
    const key = keyFor(name);
    if (!key) return guestSeed; // guest → demo data
    return read<T>(key, emptyInitial); // user → saved data or empty
  });

  // Persist to the signed-in user's storage whenever the state changes.
  useEffect(() => {
    const key = keyFor(name);
    if (!key) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch {
      /* ignore quota errors */
    }
  }, [name, state]);

  return [state, setState];
}

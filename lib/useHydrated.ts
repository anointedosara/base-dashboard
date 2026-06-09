"use client";

import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

/** False during SSR + the first client (hydration) render, true afterwards.
    Uses the server/client snapshot split of useSyncExternalStore — no effect, so
    it doesn't trip the set-state-in-effect rule. Lets auth guards wait for the
    real localStorage-backed auth state instead of bouncing a logged-in user to
    /login on refresh. */
export function useHydrated() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}

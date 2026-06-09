"use client";

import { useRouter } from "next/navigation";
import { getAuthSnapshot } from "./auth";

/** Returns a guard you call before a mutation. If not signed in, it redirects
    to /login and returns false so the caller can bail out. */
export function useEnsureAuth() {
  const router = useRouter();
  return () => {
    if (getAuthSnapshot() === null) {
      router.push("/login");
      return false;
    }
    return true;
  };
}

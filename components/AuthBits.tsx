"use client";

import { useState } from "react";
import { EyeIcon, EyeOffIcon } from "@/components/Icons";

export function SocialButtons() {
  return (
    <div className="grid grid-cols-2 gap-3">
      <button className="flex items-center justify-center gap-2 rounded-xl bg-canvas py-2.5 text-sm font-medium text-ink-soft ring-1 ring-line transition hover:bg-line/50">
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.65l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
          <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z" />
        </svg>
        Google
      </button>
      <button className="flex items-center justify-center gap-2 rounded-xl bg-canvas py-2.5 text-sm font-medium text-ink-soft ring-1 ring-line transition hover:bg-line/50">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
          <path d="M24 12a12 12 0 1 0-13.87 11.85v-8.38H7.08V12h3.05V9.36c0-3 1.79-4.67 4.53-4.67 1.31 0 2.68.24 2.68.24v2.95H15.8c-1.49 0-1.95.92-1.95 1.87V12h3.32l-.53 3.47h-2.79v8.38A12 12 0 0 0 24 12Z" />
        </svg>
        Facebook
      </button>
    </div>
  );
}

export function PasswordField({
  placeholder = "••••••••",
  defaultValue,
}: {
  placeholder?: string;
  defaultValue?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="w-full rounded-xl bg-canvas px-4 py-3 pr-11 text-sm text-ink outline-none ring-1 ring-transparent transition placeholder:text-muted focus:bg-card focus:ring-primary/40"
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted transition hover:text-ink"
        aria-label={show ? "Hide password" : "Show password"}
      >
        {show ? <EyeIcon className="h-4 w-4" /> : <EyeOffIcon className="h-4 w-4" />}
      </button>
    </div>
  );
}

export function Divider() {
  return (
    <div className="flex items-center gap-3 text-xs text-muted">
      <span className="h-px flex-1 bg-line" />
      Or
      <span className="h-px flex-1 bg-line" />
    </div>
  );
}

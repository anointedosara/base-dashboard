"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogoMark } from "@/components/Logo";
import { AuthArt } from "@/components/AuthArt";
import { Field, TextInput } from "@/components/Form";
import { SocialButtons, Divider } from "@/components/AuthBits";
import { EyeIcon, EyeOffIcon } from "@/components/Icons";
import { login } from "@/lib/auth";
import { notify, clearNotifs } from "@/lib/notificationStore";
import { addUnread } from "@/lib/messageStore";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }
    const res = login(email, password);
    if (!res.ok) {
      setError(res.error ?? "Could not sign in.");
      return;
    }
    clearNotifs();
    notify("You logged in successfully");
    addUnread(1); // the admin welcome message is waiting
    router.push("/dashboard");
  };

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      <div className="flex items-center justify-center bg-card px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-6 flex flex-col items-center">
            <LogoMark size={56} />
            <h1 className="mt-4 text-xl font-semibold text-ink">Log in</h1>
          </div>

          <SocialButtons />
          <div className="my-5">
            <Divider />
          </div>

          <form className="space-y-4" onSubmit={submit} noValidate>
            <Field label="Email Address">
              <TextInput type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="example@gmail.com" />
            </Field>
            <div>
              <span className="mb-1.5 block text-sm font-medium text-ink-soft">Password</span>
              <div className="relative">
                <input
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl bg-canvas px-4 py-3 pr-11 text-sm text-ink outline-none ring-1 ring-transparent transition placeholder:text-muted focus:bg-card focus:ring-primary/40"
                />
                <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted transition hover:text-ink" aria-label={show ? "Hide password" : "Show password"}>
                  {show ? <EyeIcon className="h-4 w-4" /> : <EyeOffIcon className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && <p className="text-sm text-danger">{error}</p>}

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-ink-soft">
                <input type="checkbox" className="h-4 w-4 accent-primary" /> Remember me
              </label>
              <Link href="/recover" className="font-medium text-primary">Reset Password?</Link>
            </div>

            <button type="submit" className="block w-full rounded-xl bg-primary py-3 text-center text-sm font-medium text-white transition hover:bg-primary-dark">
              Log in
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-ink-soft">
            Don&apos;t have account yet?{" "}
            <Link href="/signup" className="font-medium text-primary">New Account</Link>
          </p>
        </div>
      </div>

      <div className="hidden items-center justify-center p-12 lg:flex">
        <AuthArt clock />
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogoMark } from "@/components/Logo";
import { AuthArt } from "@/components/AuthArt";
import { Field, TextInput } from "@/components/Form";
import { SocialButtons, Divider } from "@/components/AuthBits";
import { EyeIcon, EyeOffIcon } from "@/components/Icons";
import { register } from "@/lib/auth";
import { notify, clearNotifs } from "@/lib/notificationStore";
import { addUnread } from "@/lib/messageStore";

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [agree, setAgree] = useState(false);
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !username.trim() || !password) {
      setError("Please fill in all fields.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (!agree) {
      setError("Please accept the terms of use and privacy policy.");
      return;
    }
    const res = register({ fullName: fullName.trim(), email, username, password });
    if (!res.ok) {
      setError(res.error ?? "Could not create account.");
      return;
    }
    clearNotifs();
    notify("Welcome to Base — your account was created");
    addUnread(1); // the admin welcome message is waiting
    router.push("/account-created");
  };

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      <div className="flex items-center justify-center bg-card px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-6 flex flex-col items-center">
            <LogoMark size={56} />
            <h1 className="mt-4 text-xl font-semibold text-ink">Sign Up</h1>
          </div>

          <SocialButtons />
          <div className="my-5">
            <Divider />
          </div>

          <form className="space-y-4" onSubmit={submit} noValidate>
            <Field label="Full Name">
              <TextInput value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Jiangyu" />
            </Field>
            <Field label="Email Address">
              <TextInput type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="example@gmail.com" />
            </Field>
            <Field label="Username">
              <TextInput value={username} onChange={(e) => setUsername(e.target.value)} placeholder="johnkevine4362" />
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

            <label className="flex items-start gap-2 text-sm text-ink-soft">
              <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 h-4 w-4 accent-primary" />
              <span>
                By creating an account you agree to the{" "}
                <a href="#" className="font-medium text-primary underline">terms of use</a> and our{" "}
                <a href="#" className="font-medium text-primary underline">privacy policy.</a>
              </span>
            </label>

            {error && <p className="text-sm text-danger">{error}</p>}

            <button type="submit" className="block w-full rounded-xl bg-primary py-3 text-center text-sm font-medium text-white transition hover:bg-primary-dark">
              Create account
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-ink-soft">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-primary">Log in</Link>
          </p>
        </div>
      </div>

      <div className="hidden items-center justify-center p-12 lg:flex">
        <AuthArt />
      </div>
    </div>
  );
}

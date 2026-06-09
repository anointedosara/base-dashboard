"use client";

import { Suspense, useEffect, useState, useSyncExternalStore } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { Card, PrimaryButton } from "@/components/ui";
import { Avatar } from "@/components/Avatar";
import { Modal } from "@/components/Overlay";
import { Field, TextInput, Select, PhotoUpload } from "@/components/Form";
import { USER } from "@/lib/data";
import { notify } from "@/lib/notificationStore";
import { subscribeAuth, getAuthSnapshot, getAuthServerSnapshot, updateAccount } from "@/lib/auth";
import { useHydrated } from "@/lib/useHydrated";

const TABS = ["General", "Account", "Notifications", "Billing"] as const;
type Tab = (typeof TABS)[number];

function Toggle({ defaultOn, onChange }: { defaultOn?: boolean; onChange?: (v: boolean) => void }) {
  const [on, setOn] = useState(!!defaultOn);
  return (
    <button
      onClick={() => {
        const v = !on;
        setOn(v);
        onChange?.(v);
      }}
      className={`relative h-6 w-11 rounded-full transition ${on ? "bg-primary" : "bg-line"}`}
      aria-pressed={on}
    >
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${on ? "left-[22px]" : "left-0.5"}`} />
    </button>
  );
}

function Flash({ message }: { message: string }) {
  return <div className="mb-4 rounded-xl bg-success-soft px-4 py-2.5 text-sm font-medium text-success animate-fade-in">{message}</div>;
}

const INITIAL = {
  first: "Easin",
  last: "Arafat",
  email: "easin.arafat@base.com",
  phone: "+33 757 005 467",
  role: "Administrator",
  language: "English",
};

export default function SettingsPage() {
  return (
    <Suspense fallback={null}>
      <SettingsInner />
    </Suspense>
  );
}

function profileFromAccount() {
  const a = getAuthSnapshot();
  const parts = (a?.fullName ?? USER.name).split(" ");
  return {
    first: parts[0] ?? "",
    last: parts.slice(1).join(" "),
    email: a?.email ?? INITIAL.email,
    phone: INITIAL.phone,
    role: INITIAL.role,
    language: INITIAL.language,
  };
}

function SettingsInner() {
  const params = useSearchParams();
  const router = useRouter();
  const account = useSyncExternalStore(subscribeAuth, getAuthSnapshot, getAuthServerSnapshot);
  const qp = params.get("tab");
  const initialTab: Tab = (TABS as readonly string[]).includes(qp ?? "") ? (qp as Tab) : "General";
  const [tab, setTab] = useState<Tab>(initialTab);
  const [flash, setFlash] = useState("");

  const switchTab = (t: Tab) => {
    setTab(t);
    setFlash("");
  };
  const showFlash = (msg: string) => {
    setFlash(msg);
    notify(msg);
  };

  /* General */
  const [profile, setProfile] = useState(profileFromAccount);
  const [photo, setPhoto] = useState<string | null>(getAuthSnapshot()?.photo ?? null);
  const setP = (k: keyof typeof INITIAL, v: string) => setProfile((p) => ({ ...p, [k]: v }));

  /* Account */
  const [pwd, setPwd] = useState({ current: "", next: "", confirm: "" });
  const [pwdError, setPwdError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  /* Billing */
  const [plan, setPlan] = useState(getAuthSnapshot()?.plan ?? USER.plan);
  const [card, setCard] = useState({ last4: "4242", exp: "09/26" });
  const [editCard, setEditCard] = useState(false);

  // Settings requires an account (wait for hydration so refresh doesn't bounce).
  const hydrated = useHydrated();
  useEffect(() => {
    if (hydrated && account === null) router.replace("/login");
  }, [hydrated, account, router]);
  if (hydrated && account === null) return null;

  return (
    <div className="mx-auto max-w-[1100px]">
      <PageHeader title="Settings" />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[220px_1fr]">
        <Card className="h-fit p-2">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => switchTab(t)}
              className={`flex w-full items-center rounded-xl px-4 py-3 text-sm font-medium transition ${
                tab === t ? "bg-primary-light text-primary" : "text-ink-soft hover:bg-canvas"
              }`}
            >
              {t}
            </button>
          ))}
        </Card>

        <Card>
          {flash && <Flash message={flash} />}

          {tab === "General" && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const res = updateAccount({
                  fullName: `${profile.first} ${profile.last}`.trim(),
                  email: profile.email,
                  photo: photo ?? undefined,
                });
                if (!res.ok) {
                  setFlash(res.error ?? "Could not save changes.");
                  return;
                }
                showFlash("Profile updated successfully");
              }}
              className="space-y-6"
            >
              <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-center">
                <PhotoUpload size={80} value={photo} onChange={(_, url) => setPhoto(url)} />
                <div className="text-center sm:text-left">
                  <p className="text-lg font-semibold text-ink">{profile.first} {profile.last}</p>
                  <p className="text-sm text-muted">{plan}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Field label="First Name"><TextInput value={profile.first} onChange={(e) => setP("first", e.target.value)} /></Field>
                <Field label="Last Name"><TextInput value={profile.last} onChange={(e) => setP("last", e.target.value)} /></Field>
                <Field label="Email"><TextInput type="email" value={profile.email} onChange={(e) => setP("email", e.target.value)} /></Field>
                <Field label="Phone"><TextInput value={profile.phone} onChange={(e) => setP("phone", e.target.value)} /></Field>
                <Field label="Role">
                  <Select value={profile.role} onChange={(e) => setP("role", (e.target as HTMLSelectElement).value)}>
                    <option>Administrator</option><option>Editor</option><option>Viewer</option>
                  </Select>
                </Field>
                <Field label="Language">
                  <Select value={profile.language} onChange={(e) => setP("language", (e.target as HTMLSelectElement).value)}>
                    <option>English</option><option>French</option><option>Spanish</option>
                  </Select>
                </Field>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => { setProfile(profileFromAccount()); setPhoto(getAuthSnapshot()?.photo ?? null); setFlash(""); }}
                  className="rounded-xl px-5 py-2.5 text-sm font-medium text-ink-soft ring-1 ring-line transition hover:bg-canvas"
                >
                  Cancel
                </button>
                <PrimaryButton type="submit">Save Changes</PrimaryButton>
              </div>
            </form>
          )}

          {tab === "Account" && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!pwd.current || !pwd.next || !pwd.confirm) { setPwdError("Please fill in all password fields."); return; }
                if (pwd.next.length < 6) { setPwdError("New password must be at least 6 characters."); return; }
                if (pwd.next !== pwd.confirm) { setPwdError("New password and confirmation do not match."); return; }
                setPwdError("");
                setPwd({ current: "", next: "", confirm: "" });
                showFlash("Password updated successfully");
              }}
              className="space-y-6"
            >
              <h3 className="text-base font-semibold text-ink">Change Password</h3>
              <div className="grid grid-cols-1 gap-5">
                <Field label="Current Password"><TextInput type="password" value={pwd.current} onChange={(e) => setPwd((p) => ({ ...p, current: e.target.value }))} placeholder="••••••••" /></Field>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <Field label="New Password"><TextInput type="password" value={pwd.next} onChange={(e) => setPwd((p) => ({ ...p, next: e.target.value }))} placeholder="••••••••" /></Field>
                  <Field label="Confirm Password"><TextInput type="password" value={pwd.confirm} onChange={(e) => setPwd((p) => ({ ...p, confirm: e.target.value }))} placeholder="••••••••" /></Field>
                </div>
              </div>
              {pwdError && <p className="text-sm text-danger">{pwdError}</p>}
              <div className="rounded-xl bg-danger-soft/60 p-4">
                <p className="text-sm font-medium text-danger">Delete account</p>
                <p className="mt-1 text-xs text-ink-soft">Once deleted, your account and all data are permanently removed.</p>
                <button type="button" onClick={() => setConfirmDelete(true)} className="mt-3 rounded-lg bg-danger px-4 py-2 text-sm font-medium text-white transition hover:opacity-90">
                  Delete Account
                </button>
              </div>
              <div className="flex justify-end">
                <PrimaryButton type="submit">Update Password</PrimaryButton>
              </div>
            </form>
          )}

          {tab === "Notifications" && (
            <div className="space-y-1">
              {[
                { t: "Email notifications", d: "Get emails about your account activity.", on: true },
                { t: "Push notifications", d: "Receive push alerts on your devices.", on: true },
                { t: "Weekly summary", d: "A digest of your week every Monday.", on: false },
                { t: "Product updates", d: "News about features and improvements.", on: false },
                { t: "Mentions", d: "Notify me when someone mentions me.", on: true },
              ].map((row) => (
                <div key={row.t} className="flex items-center justify-between border-b border-line py-4 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-ink">{row.t}</p>
                    <p className="text-xs text-muted">{row.d}</p>
                  </div>
                  <Toggle defaultOn={row.on} onChange={(v) => showFlash(`${row.t} ${v ? "enabled" : "disabled"}`)} />
                </div>
              ))}
            </div>
          )}

          {tab === "Billing" && (
            <div className="space-y-5">
              <div className="flex flex-col items-start justify-between gap-4 rounded-xl bg-primary-light/50 p-5 sm:flex-row sm:items-center">
                <div>
                  <p className="text-sm text-ink-soft">Current plan</p>
                  <p className="text-xl font-semibold text-ink">{plan}</p>
                  <p className="text-xs text-muted">
                    {plan === "Free Account" ? "Upgrade to unlock unlimited projects and reports." : "You have access to all premium features."}
                  </p>
                </div>
                {plan === "Free Account" ? (
                  <PrimaryButton onClick={() => { setPlan("Pro Account"); updateAccount({ plan: "Pro Account" }); showFlash("Upgraded to Pro Account"); }}>Upgrade Now</PrimaryButton>
                ) : (
                  <button onClick={() => { setPlan("Free Account"); updateAccount({ plan: "Free Account" }); showFlash("Downgraded to Free Account"); }} className="rounded-xl px-5 py-2.5 text-sm font-medium text-ink-soft ring-1 ring-line transition hover:bg-canvas">
                    Cancel plan
                  </button>
                )}
              </div>
              <div>
                <h3 className="mb-3 text-base font-semibold text-ink">Payment Method</h3>
                <div className="flex items-center justify-between rounded-xl p-4 ring-1 ring-line">
                  <div className="flex items-center gap-3">
                    <Avatar name="Visa" size={40} />
                    <div>
                      <p className="text-sm font-medium text-ink">Visa ending in {card.last4}</p>
                      <p className="text-xs text-muted">Expires {card.exp}</p>
                    </div>
                  </div>
                  <button onClick={() => setEditCard(true)} className="text-sm font-medium text-primary">Edit</button>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Delete account confirm */}
      {confirmDelete && (
        <Modal open onClose={() => setConfirmDelete(false)}>
          <h3 className="text-lg font-semibold text-ink">Delete account?</h3>
          <p className="mt-2 text-sm text-ink-soft">This action cannot be undone. All your data will be permanently removed.</p>
          <div className="mt-6 flex justify-end gap-3">
            <button onClick={() => setConfirmDelete(false)} className="rounded-xl px-5 py-2.5 text-sm font-medium text-ink-soft ring-1 ring-line transition hover:bg-canvas">Cancel</button>
            <button
              onClick={() => { setConfirmDelete(false); showFlash("Account deletion requested"); }}
              className="rounded-xl bg-danger px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
            >
              Delete Account
            </button>
          </div>
        </Modal>
      )}

      {/* Edit payment method */}
      {editCard && (
        <EditCardModal
          card={card}
          onClose={() => setEditCard(false)}
          onSave={(c) => { setCard(c); setEditCard(false); showFlash("Payment method updated"); }}
        />
      )}
    </div>
  );
}

function EditCardModal({
  card,
  onSave,
  onClose,
}: {
  card: { last4: string; exp: string };
  onSave: (c: { last4: string; exp: string }) => void;
  onClose: () => void;
}) {
  const [number, setNumber] = useState("4242 4242 4242 " + card.last4);
  const [exp, setExp] = useState(card.exp);
  const [error, setError] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const digits = number.replace(/\D/g, "");
    if (digits.length < 4 || !/^\d{2}\/\d{2}$/.test(exp)) { setError(true); return; }
    onSave({ last4: digits.slice(-4), exp });
  };

  return (
    <Modal open onClose={onClose}>
      <h3 className="mb-5 text-lg font-semibold text-ink">Edit Payment Method</h3>
      <form onSubmit={submit} className="space-y-4" noValidate>
        <Field label="Card Number"><TextInput value={number} onChange={(e) => setNumber(e.target.value)} placeholder="1234 5678 9012 3456" /></Field>
        <Field label="Expiry (MM/YY)"><TextInput value={exp} onChange={(e) => setExp(e.target.value)} placeholder="09/26" /></Field>
        {error && <p className="text-xs text-danger">Enter a valid card number and expiry (MM/YY).</p>}
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="rounded-xl px-5 py-2.5 text-sm font-medium text-ink-soft ring-1 ring-line transition hover:bg-canvas">Cancel</button>
          <PrimaryButton type="submit" className="px-6">Save</PrimaryButton>
        </div>
      </form>
    </Modal>
  );
}

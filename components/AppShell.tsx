"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { subscribeUnread, getUnreadSnapshot, getUnreadServerSnapshot } from "@/lib/messageStore";
import { subscribeNotifs, getNotifsSnapshot, getNotifsServerSnapshot } from "@/lib/notificationStore";
import { subscribeAuth, getAuthSnapshot, getAuthServerSnapshot, logout } from "@/lib/auth";
import { useHydrated } from "@/lib/useHydrated";
import { cn } from "@/lib/cn";
import { Logo, LogoMark } from "@/components/Logo";
import { Avatar } from "@/components/Avatar";
import { USER } from "@/lib/data";
import {
  DashboardIcon,
  AnalyticsIcon,
  InvoiceIcon,
  ScheduleIcon,
  CalendarIcon,
  MessagesIcon,
  NotificationIcon,
  SettingsIcon,
  LogoutIcon,
  MenuIcon,
} from "@/components/Icons";

const NAV = [
  { label: "Dashboard", href: "/dashboard", Icon: DashboardIcon },
  { label: "Analytics", href: "/analytics", Icon: AnalyticsIcon },
  { label: "Invoice", href: "/invoice", Icon: InvoiceIcon },
  { label: "Schedule", href: "/schedule", Icon: ScheduleIcon },
  { label: "Calendar", href: "/calendar", Icon: CalendarIcon },
  { label: "Messages", href: "/messages", Icon: MessagesIcon },
  { label: "Notification", href: "/notification", Icon: NotificationIcon },
  { label: "Settings", href: "/settings", Icon: SettingsIcon },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const unread = useSyncExternalStore(subscribeUnread, getUnreadSnapshot, getUnreadServerSnapshot);
  const notifs = useSyncExternalStore(subscribeNotifs, getNotifsSnapshot, getNotifsServerSnapshot);
  const notifUnread = notifs.filter((n) => n.unread).length;
  const account = useSyncExternalStore(subscribeAuth, getAuthSnapshot, getAuthServerSnapshot);
  const name = account?.fullName ?? USER.name;
  const plan = account?.plan ?? USER.plan;
  return (
    <div className="flex h-full flex-col bg-card">
      <div className="px-6 pt-7 pb-6">
        <Link href="/dashboard" onClick={onNavigate}>
          <Logo />
        </Link>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-4">
        {NAV.map(({ label, href, Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          const badge =
            href === "/messages" && unread > 0
              ? unread
              : href === "/notification" && notifUnread > 0
                ? notifUnread
                : undefined;
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={cn(
                "group flex items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-medium transition",
                active
                  ? "bg-primary-light text-primary"
                  : "text-ink-soft hover:bg-canvas hover:text-ink",
              )}
            >
              <Icon className={cn("h-5 w-5", active ? "text-primary" : "text-muted")} />
              <span className="flex-1">{label}</span>
              {badge && (
                <span className="rounded-full bg-danger px-2 py-0.5 text-[11px] font-semibold text-white">
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Upgrade card — only for signed-in users */}
      {account && (
        <div className="px-4 py-5">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-indigo-50 to-violet-100 px-4 pb-4 pt-6 text-center">
            <div className="mx-auto mb-3 h-16 w-16">
              <svg viewBox="0 0 64 64" className="h-full w-full">
                <path d="M32 6 54 34H10L32 6Z" fill="#a5b4fc" />
                <path d="M32 6 54 34H32V6Z" fill="#818cf8" />
                <rect x="22" y="34" width="20" height="3" rx="1.5" fill="#6366f1" />
                <path d="M30 37h4v10h-4z" fill="#c7d2fe" />
              </svg>
            </div>
            <Link
              href="/settings?tab=Billing"
              onClick={onNavigate}
              className="block rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-dark"
            >
              Upgrade Now
            </Link>
          </div>
        </div>
      )}

      {/* User */}
      <div className="flex items-center gap-3 border-t border-line px-5 py-4">
        {account ? (
          <>
            <Avatar name={name} size={38} src={account.photo} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-ink">{name}</p>
              <p className="truncate text-xs text-muted">{plan}</p>
            </div>
            <button
              onClick={() => {
                logout();
                onNavigate?.();
                router.push("/login");
              }}
              className="text-muted transition hover:text-danger"
              aria-label="Log out"
              title="Log out"
            >
              <LogoutIcon className="h-5 w-5" />
            </button>
          </>
        ) : (
          <>
            <Avatar name="Guest" size={38} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-ink">Guest</p>
              <p className="truncate text-xs text-muted">Not signed in</p>
            </div>
            <Link href="/login" onClick={onNavigate} className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white transition hover:bg-primary-dark">
              Log in
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const account = useSyncExternalStore(subscribeAuth, getAuthSnapshot, getAuthServerSnapshot);
  const pathname = usePathname();
  const router = useRouter();
  const hydrated = useHydrated();

  // Guests may only view the Dashboard; everything else needs an account.
  // Wait for hydration so a refresh doesn't bounce a logged-in user to /login.
  const allowed = account !== null || pathname === "/dashboard";
  useEffect(() => {
    if (hydrated && !allowed) router.replace("/login");
  }, [hydrated, allowed, router]);
  if (hydrated && !allowed) return null;

  return (
    <div className="flex min-h-screen bg-canvas">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-[260px] shrink-0 border-r border-line lg:block">
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/40 animate-fade-in" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-[270px] animate-slide-in-right shadow-2xl">
            <SidebarContent onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-card px-4 py-3 lg:hidden">
          <button
            onClick={() => setOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-ink-soft hover:bg-canvas"
            aria-label="Open menu"
          >
            <MenuIcon />
          </button>
          <LogoMark size={34} />
          <Avatar name={account?.fullName ?? "Guest"} size={34} src={account?.photo} />
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}

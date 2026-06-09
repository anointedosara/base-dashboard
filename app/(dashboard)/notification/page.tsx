"use client";

import { useSyncExternalStore } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui";
import { Avatar } from "@/components/Avatar";
import { NotificationIcon } from "@/components/Icons";
import {
  subscribeNotifs,
  getNotifsSnapshot,
  getNotifsServerSnapshot,
  markAllNotifsRead,
  markNotifRead,
  clearNotifs,
} from "@/lib/notificationStore";

export default function NotificationPage() {
  const items = useSyncExternalStore(subscribeNotifs, getNotifsSnapshot, getNotifsServerSnapshot);
  const unreadCount = items.filter((n) => n.unread).length;

  return (
    <div className="mx-auto max-w-[860px]">
      <PageHeader title="Notification">
        {items.length > 0 && (
          <>
            <button onClick={markAllNotifsRead} className="text-sm font-medium text-primary transition hover:text-primary-dark">
              Mark all as read
            </button>
            <button onClick={clearNotifs} className="text-sm font-medium text-muted transition hover:text-danger">
              Clear all
            </button>
          </>
        )}
      </PageHeader>

      {items.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-20 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-light text-primary">
            <NotificationIcon className="h-7 w-7" />
          </span>
          <h3 className="mt-4 text-lg font-semibold text-ink">No notifications yet</h3>
          <p className="mt-1 max-w-sm text-sm text-muted">
            When you make changes across the dashboard — add a customer, create an invoice, schedule a task — they&apos;ll show up here.
          </p>
        </Card>
      ) : (
        <>
          {unreadCount > 0 && <p className="mb-3 text-sm text-muted">{unreadCount} unread</p>}
          <Card className="divide-y divide-line p-0">
            {items.map((n) => (
              <button
                key={n.id}
                onClick={() => markNotifRead(n.id)}
                className={`flex w-full items-center gap-4 px-6 py-4 text-left transition hover:bg-canvas/60 ${
                  n.unread ? "bg-primary-light/20" : ""
                }`}
              >
                <Avatar name={n.actor} size={44} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-ink">
                    <span className="font-semibold">{n.actor}</span> <span className="text-ink-soft">{n.action}</span>
                  </p>
                  <p className="mt-0.5 text-xs text-muted">{n.time}</p>
                </div>
                {n.unread && <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-primary" />}
              </button>
            ))}
          </Card>
        </>
      )}
    </div>
  );
}

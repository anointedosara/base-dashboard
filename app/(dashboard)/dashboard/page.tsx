"use client";

import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardHeader } from "@/components/ui";
import { DateRangePicker } from "@/components/DateRangePicker";
import { LineAreaChart, DonutChart, Legend } from "@/components/Charts";
import { HeartCardIcon, BagIcon, CartIcon, BriefcaseIcon, StarIcon } from "@/components/Icons";
import { TOP_SELLING } from "@/lib/data";
import { rangeActivity } from "@/lib/activity";
import { DATASET_TODAY, formatLong, type DateRange } from "@/lib/date";

const STAT_META = [
  { id: "save", label: "Save Products", bg: "bg-info-soft", text: "text-info", Icon: HeartCardIcon, key: "saved" },
  { id: "stock", label: "Stock Products", bg: "bg-warning-soft", text: "text-warning", Icon: BagIcon, key: "stock" },
  { id: "sales", label: "Sales Products", bg: "bg-danger-soft", text: "text-danger", Icon: CartIcon, key: "salesProducts" },
  { id: "jobs", label: "Job Application", bg: "bg-primary-light", text: "text-primary", Icon: BriefcaseIcon, key: "jobs" },
] as const;

export default function DashboardPage() {
  const [range, setRange] = useState<DateRange>({
    start: new Date(2021, 9, 6),
    end: new Date(2021, 9, 10),
  });
  const activity = rangeActivity(range.start, range.end);
  const orders = activity.orders.slice(0, 6);

  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader title="Dashboard">
        <DateRangePicker value={range} onChange={setRange} max={DATASET_TODAY} />
      </PageHeader>
      <p className="-mt-3 mb-6 text-sm text-muted">
        Showing activity for {formatLong(range.start)} – {formatLong(range.end)}
      </p>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {STAT_META.map((s) => (
          <Card key={s.id} className="flex items-center gap-4">
            <span className={`flex h-14 w-14 items-center justify-center rounded-2xl ${s.bg} ${s.text}`}>
              <s.Icon className="h-6 w-6" />
            </span>
            <div>
              <p className="text-2xl font-semibold text-ink">{activity.totals[s.key]}+</p>
              <p className="text-sm text-muted">{s.label}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Reports + Analytics */}
      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Reports" more />
            <LineAreaChart
              data={activity.report.data}
              labels={activity.report.labels}
              values={activity.report.sales}
              valueLabel="Sales"
              highlightIndex={activity.report.peak}
            />
          </Card>

        <Card>
          <CardHeader title="Analytics" more />
            <div className="flex flex-col items-center gap-6 py-4">
              <DonutChart
                segments={[
                  { value: 50, color: "#4d8dff" },
                  { value: 30, color: "#ffc542" },
                  { value: 20, color: "#ff8b6b" },
                ]}
                centerTop="80%"
                centerBottom="Transactions"
              />
              <Legend
                items={[
                  { label: "Sale", color: "#4d8dff" },
                  { label: "Distribute", color: "#ffc542" },
                  { label: "Return", color: "#ff8b6b" },
                ]}
              />
            </div>
          </Card>
      </div>

      {/* Recent orders + Top selling */}
      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Recent Orders" more />
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-sm">
                <thead>
                  <tr className="text-left text-xs text-muted">
                    <th className="pb-3 font-medium">Tracking no</th>
                    <th className="pb-3 font-medium">Product Name</th>
                    <th className="pb-3 font-medium">Date</th>
                    <th className="pb-3 font-medium">Price</th>
                    <th className="pb-3 font-medium">Total Order</th>
                    <th className="pb-3 font-medium">Total Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-muted">
                        No orders in this period.
                      </td>
                    </tr>
                  )}
                  {orders.map((o, i) => (
                    <tr key={i} className={i % 2 ? "bg-canvas/60" : ""}>
                      <td className="rounded-l-lg py-3.5 pl-2 font-medium text-ink">{o.id}</td>
                      <td className="py-3.5 text-ink-soft">{o.name}</td>
                      <td className="py-3.5 text-ink-soft">{o.dateLabel}</td>
                      <td className="py-3.5 text-ink-soft">{o.price}</td>
                      <td className="py-3.5">
                        <span className="rounded-md bg-info-soft px-3 py-1 text-xs font-medium text-info">
                          {o.orders}
                        </span>
                      </td>
                      <td className="rounded-r-lg py-3.5 pr-2 font-medium text-ink">{o.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

        <Card>
          <CardHeader title="Top selling Products" more />
            <div className="space-y-4">
              {TOP_SELLING.map((p, i) => (
                <div key={i} className="flex items-center gap-4">
                  <span className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-canvas">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.name.toLowerCase().includes("iphone") ? "/images/phone.svg" : "/images/shoe.svg"}
                      alt={p.name}
                      className="h-full w-full object-cover"
                    />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">{p.name}</p>
                    <div className="my-1 flex gap-0.5 text-warning">
                      {Array.from({ length: 5 }).map((_, s) => (
                        <StarIcon key={s} filled={s < p.rating} className="h-3.5 w-3.5" />
                      ))}
                    </div>
                    <p className="text-sm font-semibold text-ink">{p.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
      </div>
    </div>
  );
}

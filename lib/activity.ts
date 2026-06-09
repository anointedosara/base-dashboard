/* Deterministic "past activity" generator.
   A given date (or date range) always produces the same numbers, so the UI is
   stable across server render + client hydration — no Math.random at render time. */

import { eachDay, formatMDY, formatLong } from "./date";

const PRODUCTS = [
  { name: "Camera Lens", unit: 178 },
  { name: "Black Sleep Dress", unit: 14 },
  { name: "Argan Oil", unit: 21 },
  { name: "EAU DE Parfum", unit: 32 },
  { name: "Blutooth Devices", unit: 10 },
  { name: "Airdot", unit: 15 },
  { name: "Shoes", unit: 10 },
  { name: "Kids T-Shirt", unit: 12 },
  { name: "Smart Watch", unit: 12 },
  { name: "NIKE Shoes", unit: 87 },
  { name: "iPhone 12", unit: 987 },
];

function hashStr(s: string) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
/** Seeded pseudo-random in [0, 1). */
function rng(s: string) {
  return hashStr(s) / 4294967295;
}

/** Deterministic per-customer stats for the detail panel. */
export function customerStats(name: string) {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const performance = months.map((label, i) => ({
    label,
    value: Math.round(25 + rng(name + "perf" + i) * 70),
  }));
  const highlight = performance.reduce((best, p, i, arr) => (p.value > arr[best].value ? i : best), 0);
  const highlightLabel = (1 + rng(name + "peak") * 4).toFixed(2) + "k";
  return {
    performance,
    highlight,
    highlightLabel,
    gaugeA: Math.round(40 + rng(name + "ga") * 55),
    gaugeB: Math.round(40 + rng(name + "gb") * 55),
  };
}

export const REPORT_TIMES = [
  "10am", "11am", "12am", "01am", "02am", "03am", "04am", "05am", "06am", "07am", "08am", "09am",
];

export type Order = {
  id: string;
  name: string;
  price: string;
  qty: number;
  orders: string;
  amount: string;
  amountNum: number;
  date: Date;
  dateLabel: string;
};

export type RangeActivity = ReturnType<typeof rangeActivity>;

export function rangeActivity(start: Date, end: Date) {
  const days = eachDay(start, end);
  const seedKey = `${formatMDY(start)}~${formatMDY(end)}`;

  /* ----- orders within the range ----- */
  const orders: Order[] = [];
  for (const d of days) {
    const key = formatMDY(d);
    const count = Math.floor(rng(key + "#c") * 3); // 0..2 orders per day
    for (let i = 0; i < count; i++) {
      const p = PRODUCTS[Math.floor(rng(key + "#p" + i) * PRODUCTS.length)];
      const qty = 20 + Math.floor(rng(key + "#q" + i) * 460);
      const amountNum = qty * p.unit;
      orders.push({
        id: "#" + (870000 + Math.floor(rng(key + "#i" + i) * 9999)),
        name: p.name,
        price: "$" + p.unit,
        qty,
        orders: qty.toLocaleString(),
        amount: "$" + amountNum.toLocaleString(),
        amountNum,
        date: d,
        dateLabel: formatLong(d),
      });
    }
  }
  orders.sort((a, b) => b.date.getTime() - a.date.getTime());

  /* ----- per-product aggregation (top selling) ----- */
  const map = new Map<string, { name: string; unit: number; qty: number; amount: number }>();
  for (const o of orders) {
    const unit = PRODUCTS.find((p) => p.name === o.name)!.unit;
    const ex = map.get(o.name) ?? { name: o.name, unit, qty: 0, amount: 0 };
    ex.qty += o.qty;
    ex.amount += o.amountNum;
    map.set(o.name, ex);
  }
  const productAgg = [...map.values()]
    .sort((a, b) => b.amount - a.amount)
    .map((p, i) => ({
      rank: i + 1,
      name: p.name,
      price: "$" + p.unit,
      order: p.qty.toLocaleString() + " Piece",
      sales: "$" + p.amount.toLocaleString(),
    }));

  /* ----- KPI totals (seeded per day) ----- */
  let saved = 0, stock = 0, salesProducts = 0, jobs = 0;
  for (const d of days) {
    const k = formatMDY(d);
    saved += Math.floor(rng(k + "sv") * 6);
    stock += Math.floor(rng(k + "st") * 3);
    salesProducts += Math.floor(rng(k + "sp") * 7);
    jobs += rng(k + "jb") > 0.7 ? 1 : 0;
  }
  const totalSales = orders.reduce((s, o) => s + o.amountNum, 0);
  const totalOrders = orders.reduce((s, o) => s + o.qty, 0);

  /* ----- Reports series (sales per time bucket, seeded by range) ----- */
  const sales = REPORT_TIMES.map((_, i) => Math.round(800 + rng(seedKey + "rt" + i) * 4200));
  const maxSales = Math.max(...sales, 1);
  const data = sales.map((v) => Math.round((v / maxSales) * 90));
  const peak = sales.indexOf(maxSales);

  /* ----- sparklines (always 10 points so the curve is smooth) ----- */
  const spark = Array.from({ length: 10 }, (_, i) => Math.round(20 + rng(seedKey + "sk" + i) * 60));
  const sparkB = Array.from({ length: 10 }, (_, i) => Math.round(20 + rng(seedKey + "skb" + i) * 60));

  return {
    days,
    orders,
    productAgg,
    totals: { saved, stock, salesProducts, jobs, totalSales, totalOrders, totalProducts: productAgg.length },
    report: { labels: REPORT_TIMES, data, sales, peak },
    spark,
    sparkB,
  };
}

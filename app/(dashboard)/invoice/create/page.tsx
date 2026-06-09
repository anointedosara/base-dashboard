"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, PrimaryButton } from "@/components/ui";
import { Field, TextInput, PhotoUpload } from "@/components/Form";
import {
  PlusIcon,
  TrashIcon,
  MapPinIcon,
  CalendarIcon,
  ChevronLeftIcon,
  PrintIcon,
  DownloadIcon,
  CloseIcon,
} from "@/components/Icons";
import { LogoMark } from "@/components/Logo";
import { INVOICE_LINE_ITEMS } from "@/lib/data";
import { addCreatedInvoice } from "@/lib/invoiceStore";
import { notify } from "@/lib/notificationStore";
import { useEnsureAuth } from "@/lib/useEnsureAuth";

type LineItem = { name: string; rate: string; qty: string; amount: string };
type Details = { id: string; date: string; name: string; email: string; address: string };

const num = (s: string) => Number(s.replace(/[^0-9.]/g, "")) || 0;
const money = (n: number) => "$" + n.toLocaleString("en-US");

function normalizeItem(name: string, rate: string, qty: string): LineItem {
  const r = num(rate);
  const q = num(qty);
  return {
    name: name.trim(),
    rate: "$" + r.toLocaleString("en-US"),
    qty: `${q} Pcs`,
    amount: money(r * q),
  };
}

export default function CreateInvoicePage() {
  const router = useRouter();
  const ensure = useEnsureAuth();

  const [details, setDetails] = useState<Details>({
    id: "#876370",
    date: "01/12/2021",
    name: "Alison G.",
    email: "",
    address: "",
  });
  const [items, setItems] = useState<LineItem[]>(INVOICE_LINE_ITEMS);

  // The preview only reflects edits once "Send Invoice" is clicked (a committed snapshot).
  const [preview, setPreview] = useState<{ details: Details; items: LineItem[] }>({
    details: { id: "#876370", date: "01/12/2021", name: "Alison G.", email: "your.mail@gmail.com", address: "4304 Liberty Avenue" },
    items: INVOICE_LINE_ITEMS,
  });

  // New-item editor (shown when clicking +)
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({ name: "", rate: "", qty: "" });
  const [draftError, setDraftError] = useState(false);

  const set = (k: keyof Details, v: string) => setDetails((d) => ({ ...d, [k]: v }));

  const addDraft = () => {
    if (!draft.name.trim() || !draft.rate.trim() || !draft.qty.trim()) {
      setDraftError(true);
      return;
    }
    setItems((prev) => [...prev, normalizeItem(draft.name, draft.rate, draft.qty)]);
    setDraft({ name: "", rate: "", qty: "" });
    setDraftError(false);
    setAdding(false);
  };

  const removeItem = (i: number) => setItems((prev) => prev.filter((_, idx) => idx !== i));

  const sendInvoice = () => setPreview({ details: { ...details }, items: [...items] });

  const createInvoice = () => {
    if (!ensure()) return;
    sendInvoice();
    addCreatedInvoice({
      id: details.id,
      name: details.name || "Unnamed",
      email: details.email || "—",
      date: details.date,
      status: "Pending",
    });
    notify(`Created invoice ${details.id}`);
    router.push("/invoice");
  };

  const subtotal = preview.items.reduce((s, it) => s + num(it.amount), 0);
  const discount = Math.round(subtotal * 0.05);
  const total = subtotal - discount;

  const download = () => {
    const rows = preview.items
      .map(
        (it) =>
          `<tr><td>${it.name}</td><td style="text-align:right">${it.qty}</td><td style="text-align:right">${it.rate}</td><td style="text-align:right">${it.amount}</td></tr>`,
      )
      .join("");
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Invoice ${preview.details.id}</title>
<style>body{font-family:Arial,Helvetica,sans-serif;color:#25253c;padding:40px;max-width:720px;margin:auto}
h1{color:#5d5fef}table{width:100%;border-collapse:collapse;margin-top:24px}
th,td{padding:8px;border-bottom:1px solid #eee;font-size:13px}th{text-align:left;color:#888;font-weight:600}
.totals{margin-top:16px;text-align:right;font-size:13px}.total{font-weight:700;color:#5d5fef}</style></head>
<body><h1>Invoice ${preview.details.id}</h1>
<p><strong>To:</strong> ${preview.details.name}${preview.details.email ? " · " + preview.details.email : ""}${preview.details.address ? "<br>" + preview.details.address : ""}<br><strong>Date:</strong> ${preview.details.date}</p>
<table><thead><tr><th>Task description</th><th style="text-align:right">Qty</th><th style="text-align:right">Rate</th><th style="text-align:right">Amount</th></tr></thead><tbody>${rows}</tbody></table>
<div class="totals"><p>Subtotal: ${money(subtotal)}</p><p>Discount 5%: ${money(discount)}</p><p class="total">Total: ${money(total)}</p></div>
</body></html>`;
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `invoice-${preview.details.id.replace(/[^a-z0-9]/gi, "")}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-[1400px]">
      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/invoice"
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-card text-ink-soft ring-1 ring-line transition hover:text-ink"
          aria-label="Back to invoices"
        >
          <ChevronLeftIcon className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-semibold text-ink">Create New Invoice</h1>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        {/* Form */}
        <Card>
          <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-5">
            <PhotoUpload />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Invoice Id">
                <TextInput value={details.id} onChange={(e) => set("id", e.target.value)} />
              </Field>
              <Field label="Date">
                <div className="relative">
                  <TextInput value={details.date} onChange={(e) => set("date", e.target.value)} className="pr-10" />
                  <CalendarIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
                </div>
              </Field>
            </div>
            <Field label="Name">
              <TextInput value={details.name} onChange={(e) => set("name", e.target.value)} />
            </Field>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Email">
                <TextInput type="email" value={details.email} onChange={(e) => set("email", e.target.value)} placeholder="Example@gmail.com" />
              </Field>
              <Field label="Address">
                <div className="relative">
                  <TextInput value={details.address} onChange={(e) => set("address", e.target.value)} placeholder="Street" className="pr-10" />
                  <MapPinIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                </div>
              </Field>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-base font-semibold text-ink">Product Description</h3>
                <button
                  type="button"
                  onClick={() => setAdding((v) => !v)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white transition hover:bg-primary-dark"
                  aria-label="Add line item"
                >
                  {adding ? <CloseIcon className="h-4 w-4" /> : <PlusIcon className="h-4 w-4" />}
                </button>
              </div>

              {/* Inline editor for a new product */}
              {adding && (
                <div className="mb-3 rounded-xl bg-canvas/70 p-3 animate-fade-in">
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1.4fr_0.8fr_0.8fr]">
                    <input
                      autoFocus
                      value={draft.name}
                      onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                      placeholder="Product name"
                      className="rounded-lg bg-card px-3 py-2 text-sm outline-none ring-1 ring-line focus:ring-primary/40"
                    />
                    <input
                      value={draft.rate}
                      onChange={(e) => setDraft((d) => ({ ...d, rate: e.target.value }))}
                      placeholder="Rate e.g. 1200"
                      className="rounded-lg bg-card px-3 py-2 text-sm outline-none ring-1 ring-line focus:ring-primary/40"
                    />
                    <input
                      value={draft.qty}
                      onChange={(e) => setDraft((d) => ({ ...d, qty: e.target.value }))}
                      placeholder="Qty e.g. 10"
                      className="rounded-lg bg-card px-3 py-2 text-sm outline-none ring-1 ring-line focus:ring-primary/40"
                    />
                  </div>
                  {draftError && <p className="mt-1 text-xs text-danger">Fill in name, rate and quantity.</p>}
                  <div className="mt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={addDraft}
                      className="rounded-lg bg-primary px-4 py-1.5 text-sm font-medium text-white transition hover:bg-primary-dark"
                    >
                      Add product
                    </button>
                  </div>
                </div>
              )}

              <div className="hidden grid-cols-[1.4fr_0.8fr_0.8fr_1fr_auto] gap-2 px-1 pb-2 text-xs text-muted sm:grid">
                <span>Product Name</span>
                <span>Rate</span>
                <span>QTY</span>
                <span>Amount</span>
                <span />
              </div>
              <div className="space-y-2">
                {items.length === 0 && <p className="py-3 text-center text-sm text-muted">No products yet. Click + to add one.</p>}
                {items.map((it, i) => (
                  <div key={i} className="grid grid-cols-[1.4fr_0.8fr_0.8fr_1fr_auto] items-center gap-2 text-sm">
                    <span className="truncate font-medium text-primary">{it.name}</span>
                    <span className="text-ink-soft">{it.rate}</span>
                    <span className="text-ink-soft">{it.qty}</span>
                    <span className="font-medium text-success">{it.amount}</span>
                    <button type="button" onClick={() => removeItem(i)} className="text-danger transition hover:scale-110" aria-label="Remove item">
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-2 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={sendInvoice}
                className="flex-1 rounded-xl border border-primary/40 py-3 text-sm font-medium text-primary transition hover:bg-primary-light"
              >
                Send Invoice
              </button>
              <PrimaryButton type="button" onClick={createInvoice} className="flex-1 py-3">
                Create Invoice
              </PrimaryButton>
            </div>
          </form>
        </Card>

        {/* Preview */}
        <Card>
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-base font-semibold text-ink">Preview</h3>
            <div className="flex items-center gap-2">
              <button onClick={download} className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-light text-primary transition hover:bg-primary hover:text-white" aria-label="Download">
                <DownloadIcon className="h-4 w-4" />
              </button>
              <button onClick={() => window.print()} className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-light text-primary transition hover:bg-primary hover:text-white" aria-label="Print">
                <PrintIcon className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div id="invoice-preview" className="rounded-xl ring-1 ring-line">
            <div className="flex items-start justify-between rounded-t-xl bg-canvas/70 p-6">
              <LogoMark size={40} />
              <div className="text-right text-xs text-ink-soft">
                <p>{preview.details.email || "your.mail@gmail.com"}</p>
                <p>+386 989 271 3115</p>
              </div>
            </div>

            <div className="flex items-start justify-between p-6">
              <div className="text-xs text-ink-soft">
                <p className="mb-1 font-semibold text-ink">RECIPIENT</p>
                <p>{preview.details.name || "—"}</p>
                <p>{preview.details.address || "4304 Liberty Avenue"}</p>
                <p>92680 Tustin, CA</p>
                <p>VAT no.: 12345678</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-semibold text-ink">Invoice</p>
                <p className="mt-2 text-xs text-muted">INVOICE NO.</p>
                <p className="text-xs font-medium text-ink">{preview.details.id}</p>
                <p className="mt-1 text-xs text-muted">INVOICE DATE</p>
                <p className="text-xs font-medium text-ink">{preview.details.date}</p>
              </div>
            </div>

            <div className="px-6">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-line text-left text-muted">
                    <th className="py-2 font-medium">TASK DESCRIPTION</th>
                    <th className="py-2 text-right font-medium">QTY</th>
                    <th className="py-2 text-right font-medium">RATE</th>
                    <th className="py-2 text-right font-medium">AMOUNT</th>
                  </tr>
                </thead>
                <tbody className="text-ink-soft">
                  {preview.items.map((it, i) => (
                    <tr key={i} className="border-b border-line">
                      <td className="py-2.5">{it.name}</td>
                      <td className="py-2.5 text-right">{it.qty}</td>
                      <td className="py-2.5 text-right">{it.rate}</td>
                      <td className="py-2.5 text-right">{it.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="ml-auto mt-3 w-48 space-y-1 text-xs">
                <div className="flex justify-between text-muted">
                  <span>SUBTOTAL</span>
                  <span>{money(subtotal)}</span>
                </div>
                <div className="flex justify-between text-muted">
                  <span>DISCOUNT 5%</span>
                  <span>{money(discount)}</span>
                </div>
                <div className="flex justify-between border-t border-line pt-1 font-semibold text-ink">
                  <span>TOTAL</span>
                  <span className="text-primary">{money(total)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 p-6 text-[11px] leading-relaxed text-muted">
              <p>Transfer the amount to the business account below. Please include invoice number on your check.</p>
              <p className="text-ink-soft">BANK: FTSBUS33 &nbsp;&nbsp; IBAN: GB82-1111-2222-3333</p>
              <p className="pt-2">NOTES</p>
              <p>
                All amounts are in dollars. Please make the payment within 15 days from the issue date of this invoice.
                Thank you for your confidence in my work.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardHeader, PrimaryButton, Pill } from "@/components/ui";
import { Avatar } from "@/components/Avatar";
import { DateRangePicker } from "@/components/DateRangePicker";
import { Sparkline, HBarChart, DonutChart, Legend, MiniBars, Gauge } from "@/components/Charts";
import { Drawer } from "@/components/Overlay";
import { Field, TextInput, TextArea, Select, PhotoUpload } from "@/components/Form";
import { PlusIcon, MoreIcon, EditIcon, TrashIcon, MailIcon, PhoneIcon, MapPinIcon } from "@/components/Icons";
import { PRODUCT_BY_MONTH, CUSTOMERS } from "@/lib/data";
import { rangeActivity, customerStats } from "@/lib/activity";
import { DATASET_TODAY, type DateRange } from "@/lib/date";
import { notify } from "@/lib/notificationStore";
import { useEnsureAuth } from "@/lib/useEnsureAuth";

type Tab = "product" | "customer";

type AddedProduct = { name: string; brand: string; price: string; negotiable: boolean; description: string; imageUrl: string };
type Customer = { name: string; email: string; phone: string; gender: string; role: string; imageUrl?: string };

export default function AnalyticsPage() {
  const [tab, setTab] = useState<Tab>("product");
  const [drawer, setDrawer] = useState<null | "product" | "customer">(null);
  const [range, setRange] = useState<DateRange>({ start: new Date(2021, 9, 6), end: new Date(2021, 9, 10) });

  const [customProducts, setCustomProducts] = useState<AddedProduct[]>([]);
  const [customers, setCustomers] = useState<Customer[]>(() => CUSTOMERS.map((c) => ({ ...c })));
  const [selected, setSelected] = useState(0);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const ensure = useEnsureAuth();

  const closeCustomerDrawer = () => {
    setDrawer(null);
    setEditIndex(null);
  };

  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader title={tab === "product" ? "Product Analytics" : "Customer List"}>
        {tab === "product" && <DateRangePicker value={range} onChange={setRange} max={DATASET_TODAY} />}
        <PrimaryButton
          onClick={() => {
            if (!ensure()) return;
            setEditIndex(null);
            setDrawer(tab);
          }}
        >
          <PlusIcon className="h-4 w-4" />
          {tab === "product" ? "Add Product" : "Add Customer"}
        </PrimaryButton>
      </PageHeader>

      <div className="mb-6 inline-flex rounded-xl bg-card p-1 ring-1 ring-line">
        {(["product", "customer"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-lg px-5 py-2 text-sm font-medium capitalize transition ${
              tab === t ? "bg-primary text-white" : "text-ink-soft hover:text-ink"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "product" ? (
        <ProductView range={range} customProducts={customProducts} />
      ) : (
        <CustomerView
          customers={customers}
          selected={selected}
          setSelected={setSelected}
          onEdit={(i) => {
            if (!ensure()) return;
            setEditIndex(i);
            setDrawer("customer");
          }}
          onDelete={(i) => {
            if (!ensure()) return;
            const removed = customers[i]?.name;
            setCustomers((prev) => prev.filter((_, idx) => idx !== i));
            setSelected((s) => {
              const shifted = i < s ? s - 1 : s;
              return Math.max(0, Math.min(shifted, customers.length - 2));
            });
            notify(`Deleted customer “${removed}”`);
          }}
        />
      )}

      <Drawer open={drawer === "product"} onClose={() => setDrawer(null)} title="Add a New Product">
        <ProductForm
          onAdd={(p) => {
            setCustomProducts((prev) => [...prev, p]);
            notify(`Added product “${p.name}”`);
          }}
          onClose={() => setDrawer(null)}
        />
      </Drawer>
      <Drawer
        open={drawer === "customer"}
        onClose={closeCustomerDrawer}
        title={editIndex != null ? "Edit Customer" : "Add Customer"}
      >
        <CustomerForm
          initial={editIndex != null ? customers[editIndex] : undefined}
          onSubmit={(c) => {
            if (editIndex != null) {
              setCustomers((prev) => prev.map((row, idx) => (idx === editIndex ? c : row)));
              notify(`Updated customer “${c.name}”`);
            } else {
              setCustomers((prev) => [...prev, c]);
              setSelected(customers.length); // newly added row sits at the bottom
              notify(`Added customer “${c.name}”`);
            }
          }}
          onClose={closeCustomerDrawer}
        />
      </Drawer>
    </div>
  );
}

/* ---------------- Product view ---------------- */

function StatBig({ label, badge, value, spark, color, id }: {
  label: string; badge: string; value: string; spark: number[]; color: string; id: string;
}) {
  return (
    <Card className="flex flex-col">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ background: `${color}22`, color }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
              <path d="m3.3 7 8.7 5 8.7-5M12 22V12" />
            </svg>
          </span>
          <span className="text-sm text-muted">{label}</span>
        </div>
        <span className="text-xs font-medium text-success">{badge}</span>
      </div>
      <p className="mt-3 text-3xl font-semibold text-ink">{value}</p>
      <div className="mt-3 h-16">
        <Sparkline data={spark} color={color} id={id} />
      </div>
    </Card>
  );
}

function ProductView({ range, customProducts }: { range: DateRange; customProducts: AddedProduct[] }) {
  const [expanded, setExpanded] = useState(false);
  const activity = rangeActivity(range.start, range.end);

  const customRows = customProducts.map((p) => ({
    name: p.name,
    price: p.price.startsWith("$") ? p.price : "$" + p.price,
    order: "0 Piece",
    sales: "$0",
    img: p.imageUrl as string | undefined,
  }));
  const aggRows = activity.productAgg.map((p) => ({ name: p.name, price: p.price, order: p.order, sales: p.sales, img: undefined as string | undefined }));
  // Existing top-sellers first; freshly added products are always shown, appended at the bottom.
  const full = [...aggRows, ...customRows];
  const collapsed = [...aggRows.slice(0, 4), ...customRows];
  const visible = (expanded ? full : collapsed).map((r, i) => ({ ...r, rank: i + 1 }));

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
      <div className="space-y-5 lg:col-span-2">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <StatBig
            label="Total Product"
            badge={`+${activity.totals.totalProducts} New`}
            value={activity.totals.totalOrders.toLocaleString()}
            spark={activity.spark}
            color="#4d8dff"
            id="prod"
          />
          <StatBig
            label="Total Sales"
            badge={`+${activity.orders.length} Orders`}
            value={"$" + activity.totals.totalSales.toLocaleString()}
            spark={activity.sparkB}
            color="#ffc542"
            id="sales"
          />
        </div>

        <Card>
          <CardHeader
            title="Top Selling Products"
            action={
              aggRows.length > 4 ? (
                <button onClick={() => setExpanded((v) => !v)} className="text-sm font-medium text-primary">
                  {expanded ? "See Less" : "See More"}
                </button>
              ) : undefined
            }
          />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="text-left text-xs text-muted">
                  <th className="pb-3 font-medium">SN</th>
                  <th className="pb-3 font-medium">Name</th>
                  <th className="pb-3 font-medium">Price</th>
                  <th className="pb-3 font-medium">Total Order</th>
                  <th className="pb-3 font-medium">Total Sales</th>
                </tr>
              </thead>
              <tbody>
                {visible.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted">No products in this period.</td>
                  </tr>
                )}
                {visible.map((p, i) => (
                  <tr key={i} className={i % 2 ? "bg-canvas/60" : ""}>
                    <td className="rounded-l-lg py-3 pl-3">
                      {p.rank <= 3 ? <Medal rank={p.rank} /> : <span className="text-ink-soft">{p.rank}</span>}
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={p.name} size={30} src={p.img} />
                        <span className="font-medium text-primary">{p.name}</span>
                      </div>
                    </td>
                    <td className="py-3 text-ink-soft">{p.price}</td>
                    <td className="py-3 text-ink-soft">{p.order}</td>
                    <td className="rounded-r-lg py-3 pr-3 font-medium text-success">{p.sales}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <div className="space-y-5">
        <Card>
          <CardHeader title="Product Add  by Month" />
          <HBarChart rows={[...PRODUCT_BY_MONTH]} />
        </Card>
        <Card>
          <CardHeader title="Product Sales Analytics" more />
          <div className="flex flex-col items-center gap-6 py-2">
            <DonutChart
              segments={[
                { value: 45, color: "#4d8dff" },
                { value: 35, color: "#ffc542" },
                { value: 20, color: "#ff8b6b" },
              ]}
              centerIcon
            />
            <Legend
              items={[
                { label: "Total Sales", color: "#4d8dff" },
                { label: "Total Order", color: "#ffc542" },
                { label: "Order Cancel", color: "#ff8b6b" },
              ]}
            />
          </div>
        </Card>
      </div>
    </div>
  );
}

function Medal({ rank }: { rank: number }) {
  const colors = ["#f5a623", "#c0c4d6", "#e08a5b"];
  return (
    <span className="inline-flex items-center justify-center" style={{ color: colors[rank - 1] }}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="12" cy="9" r="6" opacity="0.85" />
        <path d="M8 13l-1.5 8L12 18l5.5 3L16 13" fill="currentColor" opacity="0.5" />
        <text x="12" y="12" textAnchor="middle" fontSize="7" fill="#fff" fontWeight="700">{rank}</text>
      </svg>
    </span>
  );
}

/* ---------------- Customer view ---------------- */

function CustomerView({
  customers,
  selected,
  setSelected,
  onEdit,
  onDelete,
}: {
  customers: Customer[];
  selected: number;
  setSelected: (i: number) => void;
  onEdit: (i: number) => void;
  onDelete: (i: number) => void;
}) {
  const [menu, setMenu] = useState<number | null>(null);
  const customer = customers[selected];
  const stats = customer ? customerStats(customer.name) : null;

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
      <Card className="overflow-visible lg:col-span-2">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-sm">
            <thead>
              <tr className="text-left text-xs text-muted">
                <th className="pb-3 font-medium">Name</th>
                <th className="pb-3 font-medium">Email</th>
                <th className="pb-3 font-medium">Phone number</th>
                <th className="pb-3 font-medium">Gender</th>
                <th className="pb-3" />
              </tr>
            </thead>
            <tbody>
              {customers.map((c, i) => (
                <tr
                  key={i}
                  onClick={() => setSelected(i)}
                  className={`group cursor-pointer transition ${
                    selected === i
                      ? "relative z-10 [&>td]:bg-primary-light/40 [&>td:first-child]:rounded-l-xl [&>td:last-child]:rounded-r-xl [box-shadow:0_0_0_1.5px_rgba(93,95,239,0.35),0_10px_28px_rgba(93,95,239,0.18)]"
                      : "border-b border-line/70 last:border-0 hover:bg-canvas/60"
                  }`}
                >
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={c.name} size={32} online src={c.imageUrl} />
                      <span className="font-medium text-ink">{c.name}</span>
                    </div>
                  </td>
                  <td className="py-3 text-ink-soft">{c.email}</td>
                  <td className="py-3 text-ink-soft">{c.phone}</td>
                  <td className="py-3"><Pill label={c.gender} /></td>
                  <td className="relative py-3 text-right">
                    <button
                      onClick={(e) => { e.stopPropagation(); setMenu(menu === i ? null : i); }}
                      className={`text-muted transition hover:text-ink ${
                        selected === i ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                      }`}
                      aria-label="Row actions"
                    >
                      <MoreIcon />
                    </button>
                    {menu === i && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setMenu(null); }} />
                        <div className="absolute right-6 top-10 z-20 w-32 overflow-hidden rounded-xl bg-card py-1 shadow-xl ring-1 ring-line animate-fade-in">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setMenu(null);
                              onEdit(i);
                            }}
                            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-ink-soft hover:bg-canvas"
                          >
                            <EditIcon className="h-4 w-4 text-primary" /> Edit
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setMenu(null);
                              onDelete(i);
                            }}
                            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-danger hover:bg-canvas"
                          >
                            <TrashIcon className="h-4 w-4" /> Delete
                          </button>
                        </div>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="h-fit">
        {customer && stats ? (
          <>
            <div className="flex flex-col items-center text-center">
              <Avatar name={customer.name} size={84} src={customer.imageUrl} />
              <h3 className="mt-3 text-lg font-semibold text-ink">{customer.name}</h3>
              <p className="text-sm text-muted">{customer.role}</p>
            </div>

            <div className="mt-6">
              <h4 className="mb-3 text-sm font-semibold text-ink">Contact Info</h4>
              <div className="space-y-3 text-sm text-ink-soft">
                <p className="flex items-center gap-3"><MailIcon className="h-4 w-4 text-muted" /> {customer.email}</p>
                <p className="flex items-center gap-3"><PhoneIcon className="h-4 w-4 text-muted" /> {customer.phone}</p>
                <p className="flex items-start gap-3"><MapPinIcon className="h-4 w-4 shrink-0 text-muted" /> 2239 Hog Camp Road, Schaumburg</p>
              </div>
            </div>

            <div className="mt-6 rounded-xl bg-canvas/70 p-4">
              <div className="mb-2 flex items-center justify-between">
                <h4 className="text-sm font-semibold text-ink">Performance</h4>
                <MoreIcon className="h-4 w-4 text-muted" />
              </div>
              <MiniBars
                data={stats.performance}
                highlightIndex={stats.highlight}
                highlightLabel={stats.highlightLabel}
              />
            </div>

            <div className="mt-5 grid grid-cols-2 gap-4">
              <div className="flex justify-center rounded-xl bg-canvas/70 p-4"><Gauge value={stats.gaugeA} color="#ffc542" /></div>
              <div className="flex justify-center rounded-xl bg-canvas/70 p-4"><Gauge value={stats.gaugeB} color="#4d8dff" /></div>
            </div>
          </>
        ) : (
          <p className="py-16 text-center text-sm text-muted">Select a customer to see details.</p>
        )}
      </Card>
    </div>
  );
}

/* ---------------- Forms ---------------- */

function ErrorText({ show, children }: { show: boolean; children: string }) {
  if (!show) return null;
  return <p className="mt-1 text-xs text-danger">{children}</p>;
}

function ProductForm({ onAdd, onClose }: { onAdd: (p: AddedProduct) => void; onClose: () => void }) {
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("Apple");
  const [price, setPrice] = useState("");
  const [negotiable, setNegotiable] = useState(true);
  const [description, setDescription] = useState("");
  const [img, setImg] = useState<{ file: File | null; url: string | null }>({ file: null, url: null });
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const er = { name: !name.trim(), price: !price.trim(), description: !description.trim(), img: !img.url };
    setErrors(er);
    if (Object.values(er).some(Boolean)) return;
    onAdd({ name: name.trim(), brand, price: price.trim(), negotiable, description: description.trim(), imageUrl: img.url! });
    onClose();
  };

  return (
    <form onSubmit={submit} className="flex h-full flex-col gap-5" noValidate>
      <PhotoUpload value={img.url} onChange={(file, url) => setImg({ file, url })} error={errors.img} />
      <ErrorText show={!!errors.img}>Please add a product image</ErrorText>
      <div>
        <Field label="Product Name">
          <TextInput value={name} onChange={(e) => setName(e.target.value)} placeholder='Mackbook Pro 2021 14"' />
        </Field>
        <ErrorText show={!!errors.name}>Product name is required</ErrorText>
      </div>
      <Field label="Brand">
        <Select value={brand} onChange={(e) => setBrand((e.target as HTMLSelectElement).value)}>
          <option>Apple</option>
          <option>Samsung</option>
          <option>Sony</option>
          <option>Dell</option>
          <option>HP</option>
        </Select>
      </Field>
      <div>
        <Field label="Price">
          <div className="flex items-center gap-4">
            <TextInput value={price} onChange={(e) => setPrice(e.target.value)} placeholder="$1200" className="flex-1" />
            <label className="flex items-center gap-2 text-sm text-ink-soft">
              <input type="checkbox" checked={negotiable} onChange={(e) => setNegotiable(e.target.checked)} className="h-4 w-4 accent-primary" /> Negotiable
            </label>
          </div>
        </Field>
        <ErrorText show={!!errors.price}>Price is required</ErrorText>
      </div>
      <div>
        <Field label="Descriptions">
          <TextArea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="This the New creation Of apple." />
        </Field>
        <ErrorText show={!!errors.description}>Description is required</ErrorText>
      </div>
      <PrimaryButton type="submit" className="mt-auto w-full py-3">Save Product</PrimaryButton>
    </form>
  );
}

function CustomerForm({
  initial,
  onSubmit,
  onClose,
}: {
  initial?: Customer;
  onSubmit: (c: Customer) => void;
  onClose: () => void;
}) {
  const [firstInit, ...lastInit] = (initial?.name ?? "").split(" ");
  const [first, setFirst] = useState(initial ? firstInit : "");
  const [last, setLast] = useState(initial ? lastInit.join(" ") : "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [gender, setGender] = useState(initial?.gender ?? "Male");
  const [img, setImg] = useState<{ file: File | null; url: string | null }>({
    file: null,
    url: initial?.imageUrl ?? null,
  });
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const er = { first: !first.trim(), last: !last.trim(), email: !email.trim(), phone: !phone.trim(), img: !img.url };
    setErrors(er);
    if (Object.values(er).some(Boolean)) return;
    onSubmit({
      name: `${first.trim()} ${last.trim()}`,
      email: email.trim(),
      phone: phone.trim(),
      gender,
      role: initial?.role ?? "Customer",
      imageUrl: img.url ?? undefined,
    });
    onClose();
  };

  return (
    <form onSubmit={submit} className="flex h-full flex-col gap-5" noValidate>
      <PhotoUpload value={img.url} onChange={(file, url) => setImg({ file, url })} error={errors.img} />
      <ErrorText show={!!errors.img}>Please add a profile image</ErrorText>
      <div>
        <Field label="First Name">
          <TextInput value={first} onChange={(e) => setFirst(e.target.value)} placeholder="John" />
        </Field>
        <ErrorText show={!!errors.first}>First name is required</ErrorText>
      </div>
      <div>
        <Field label="Last Name">
          <TextInput value={last} onChange={(e) => setLast(e.target.value)} placeholder="Deo" />
        </Field>
        <ErrorText show={!!errors.last}>Last name is required</ErrorText>
      </div>
      <div>
        <Field label="Email">
          <TextInput type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Example@gmail.com" />
        </Field>
        <ErrorText show={!!errors.email}>Email is required</ErrorText>
      </div>
      <div>
        <Field label="Phone Number">
          <TextInput value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="33757005467" />
        </Field>
        <ErrorText show={!!errors.phone}>Phone number is required</ErrorText>
      </div>
      <Field label="Gender">
        <Select value={gender} onChange={(e) => setGender((e.target as HTMLSelectElement).value)}>
          <option>Male</option>
          <option>Female</option>
        </Select>
      </Field>
      <PrimaryButton type="submit" className="mt-auto w-full py-3">
        {initial ? "Save Changes" : "Add Customer"}
      </PrimaryButton>
    </form>
  );
}

/* Centralised mock data for the Base dashboard demo. */

export const USER = {
  name: "Easin Arafat",
  plan: "Free Account",
};

/* ---------- Dashboard ---------- */

export const DASH_STATS = [
  { id: "save", label: "Save Products", value: "178+", icon: "heart", tone: "blue" },
  { id: "stock", label: "Stock Products", value: "20+", icon: "bag", tone: "amber" },
  { id: "sales", label: "Sales Products", value: "190+", icon: "cart", tone: "rose" },
  { id: "jobs", label: "Job Application", value: "12+", icon: "briefcase", tone: "violet" },
] as const;

export const REPORT_DATA = [50, 42, 58, 35, 30, 50, 28, 40, 38, 66, 55, 72];
export const REPORT_LABELS = [
  "10am", "11am", "12am", "01am", "02am", "03am", "04am", "05am", "06am", "07am", "08am", "09am",
];

export const RECENT_ORDERS = [
  { id: "#876364", name: "Camera Lens", price: "$178", order: 325, amount: "$1,46,660" },
  { id: "#876368", name: "Black Sleep Dress", price: "$14", order: 53, amount: "$46,660" },
  { id: "#876412", name: "Argan Oil", price: "$21", order: 78, amount: "$3,46,676" },
  { id: "#876621", name: "EAU DE Parfum", price: "$32", order: 98, amount: "$3,46,981" },
];

export const TOP_SELLING = [
  { name: "NIKE Shoes Black Pattern", rating: 4, price: "$87" },
  { name: "iPhone 12", rating: 4, price: "$987" },
];

/* ---------- Analytics / Products ---------- */

export const PRODUCT_ROWS = [
  { rank: 1, name: "Blutooth Devices", price: "$10", order: "34,666 Piece", sales: "$3,46,660" },
  { rank: 2, name: "Airdot", price: "$15", order: "20,000 Piece", sales: "$3,00,000" },
  { rank: 3, name: "Shoes", price: "$10", order: "15,000 Piece", sales: "$1,50,000" },
  { rank: 4, name: "Kids T-Shirt", price: "$12", order: "10,000 Piece", sales: "$1,20,000" },
  { rank: 5, name: "Smart Watch", price: "$12", order: "10,000 Piece", sales: "$1,20,000" },
  { rank: 6, name: "Girls Top", price: "$12", order: "10,000 Piece", sales: "$1,20,000" },
];

export const PRODUCT_BY_MONTH = [
  { label: "Jan", value: 23400, display: "23,400", color: "#ff8b6b" },
  { label: "Feb", value: 15000, display: "15,000", color: "#4d8dff" },
  { label: "Mar", value: 30000, display: "30,000", color: "#ff8b6b" },
  { label: "Apr", value: 22000, display: "22,000", color: "#4d8dff" },
  { label: "May", value: 10000, display: "10,000", color: "#4d8dff" },
  { label: "Jun", value: 23400, display: "23,400", color: "#ff8b6b" },
  { label: "Jul", value: 5000, display: "5,000", color: "#4d8dff" },
];

export const SALES_SPARK = [20, 28, 24, 34, 30, 42, 38, 52, 48, 60];
export const REVENUE_SPARK = [40, 30, 44, 34, 50, 38, 46, 36, 52, 44];

/* ---------- Customers ---------- */

export const CUSTOMERS = [
  { name: "John Deo", email: "johndoe2211@gmail.com", phone: "+33757005467", gender: "Male", role: "UI/UX Designer" },
  { name: "Shelby Goode", email: "shelbygoode481@gmail.com", phone: "+33757005467", gender: "Female", role: "Product Manager" },
  { name: "Robert Bacins", email: "robertbacins4182@gmail.com", phone: "+33757005467", gender: "Male", role: "Developer" },
  { name: "John Carilo", email: "john.carilo182@gmail.com", phone: "+33757805467", gender: "Male", role: "Designer" },
  { name: "Adriene Watson", email: "adrienewatson82@gmail.com", phone: "+83757305467", gender: "Female", role: "Marketer" },
  { name: "Jhon Deo", email: "jhondeo24823@gmail.com", phone: "+63475700546", gender: "Male", role: "Developer" },
  { name: "Mark Ruffalo", email: "markruffalo3735@gmail.com", phone: "+33757005467", gender: "Male", role: "Sales" },
  { name: "Bethany Jackson", email: "bethanyjackson5@gmail.com", phone: "+33757005467", gender: "Female", role: "HR Manager" },
  { name: "Christine Huston", email: "christinehuston4@gmail.com", phone: "+33757005467", gender: "Male", role: "Support" },
  { name: "Anne Jacob", email: "annejacob2@gmail.com", phone: "+33757005467", gender: "Male", role: "Analyst" },
  { name: "James Mullican", email: "jamesmullican5346@gmail.com", phone: "+33757005467", gender: "Male", role: "Designer" },
];

/* ---------- Invoices ---------- */

export const INVOICES = [
  { id: "#876364", name: "Arrora gaur", email: "arroragaur@gmail.com", date: "12 Dec, 2020", status: "Complete", starred: true, checked: false },
  { id: "#876123", name: "James Mullican", email: "jamesmullican@gmail.com", date: "10 Dec, 2020", status: "Pending", starred: false, checked: false },
  { id: "#876213", name: "Robert Bacins", email: "robertbacins@gmail.com", date: "09 Dec, 2020", status: "Complete", starred: false, checked: true },
  { id: "#876987", name: "Bethany Jackson", email: "bethanyjackson@gmail.com", date: "09 Dec, 2020", status: "Cancel", starred: false, checked: true },
  { id: "#871345", name: "Anne Jacob", email: "annejacob@gmail.com", date: "10 Dec, 2020", status: "Complete", starred: false, checked: false },
  { id: "#872345", name: "Bethany jackson", email: "bethanyjackson@gmail.com", date: "10 Dec, 2020", status: "Pending", starred: true, checked: true },
  { id: "#872346", name: "James Mullican", email: "jamesmullican@gmail.com", date: "10 Dec, 2020", status: "Complete", starred: false, checked: false },
  { id: "#873245", name: "Jhon Deo", email: "jhondeo32@gmail.com", date: "08 Dec, 2020", status: "Complete", starred: true, checked: false },
  { id: "#876364", name: "Bethany jackson", email: "bethanyjackson@gmail.com", date: "02 Dec, 2020", status: "Cancel", starred: true, checked: false },
  { id: "#878769", name: "James Mullican", email: "jamesmullican@gmail.com", date: "01 Dec, 2020", status: "Pending", starred: false, checked: true },
];

export const INVOICE_LINE_ITEMS = [
  { name: "ipod 2021", rate: "$1000", qty: "10 Pcs", amount: "$10,000" },
  { name: "Apple Mackbook", rate: "$1500", qty: "10 Pcs", amount: "$150,000" },
  { name: "i phone 12", rate: "$885", qty: "10 Pcs", amount: "$8850" },
];

/* ---------- Schedule list ---------- */

export const SCHEDULE_ROWS = [
  { date: "12 Dec, 2021", time: "10.15AM", location: "Office Meeting" },
  { date: "10 Dec, 2021", time: "11.20AM", location: "Home" },
  { date: "09 Dec, 2021", time: "11.45AM", location: "Friends Zone" },
  { date: "08 Dec, 2021", time: "12.15PM", location: "Office Meeting" },
  { date: "07 Dec, 2021", time: "01.20PM", location: "Home" },
  { date: "05 Dec, 2021", time: "10.15AM", location: "Meeting Outside" },
  { date: "04 Dec, 2021", time: "11.15AM", location: "Office Meeting" },
  { date: "04 Dec, 2021", time: "01.25PM", location: "Home" },
  { date: "02 Dec, 2021", time: "10.15AM", location: "Friends" },
  { date: "01 Dec, 2021", time: "04.30PM", location: "Meeting Outside" },
];

export const PEOPLE = [
  { name: "Eddie Lobanovskiy", email: "laboanovskiy@gmail.com" },
  { name: "Alexey Stave", email: "alexeyst@gmail.com" },
  { name: "Anton Tkacheve", email: "tkacheveanton@gmail.com" },
];

/* ---------- Tasks (board / list / timeline) ---------- */

export type Priority = "Low" | "Medium" | "High";
export type Track = "On Track" | "At risk";

export const BOARD_COLUMNS = [
  {
    title: "ToDo",
    cards: [
      { title: "Dashboard Design", priority: "Low", track: "On Track", done: false },
      { title: "Landing page Design", priority: "Medium", track: "At risk", done: false },
      { title: "E-Shop Mobile App", priority: "High", done: false },
      { title: "Dashboard Design", priority: "Low", track: "On Track", done: false },
    ],
  },
  {
    title: "In Progress",
    cards: [
      { title: "Dashboard Design", priority: "High", track: "On Track", done: true },
      { title: "Landing page Design", priority: "Low", done: true, images: true },
      { title: "E-Shop Mobile App", priority: "Low", track: "On Track", done: false },
    ],
  },
  {
    title: "In Review",
    cards: [
      { title: "Dashboard Design", priority: "Medium", done: true, preview: true },
      { title: "E-Shop Mobile App", priority: "Low", done: true, images: true },
    ],
  },
  {
    title: "Done",
    cards: [{ title: "Dashboard Design", priority: "High", track: "On Track", done: true, images: true }],
  },
] as const;

export const LIST_GROUPS = [
  {
    title: "To Do",
    rows: [
      { name: "Ui Design", start: "03/12/2021", end: "5/12/2021", members: 5, status: "Pending" },
      { name: "Logo Design", start: "03/12/2021", end: "5/12/2021", members: 5, status: "Pending" },
      { name: "Wireframe", start: "04/12/2021", end: "6/12/2021", members: 3, status: "Pending" },
      { name: "User Research", start: "05/12/2021", end: "8/12/2021", members: 4, status: "Pending" },
      { name: "Moodboard", start: "06/12/2021", end: "9/12/2021", members: 2, status: "Pending" },
    ],
  },
  {
    title: "Doing",
    rows: [
      { name: "Grapich Design", start: "03/12/2021", end: "5/12/2021", members: 5, status: "Running" },
      { name: "Web Design", start: "03/12/2021", end: "5/12/2021", members: 5, status: "Running" },
      { name: "Mobile App UI", start: "04/12/2021", end: "10/12/2021", members: 6, status: "Running" },
      { name: "Design System", start: "05/12/2021", end: "12/12/2021", members: 4, status: "Running" },
    ],
  },
  {
    title: "Done",
    rows: [
      { name: "Logo Design", start: "01/12/2021", end: "3/12/2021", members: 5, status: "Done" },
      { name: "Brand Guide", start: "28/11/2021", end: "2/12/2021", members: 3, status: "Done" },
      { name: "Icon Set", start: "26/11/2021", end: "1/12/2021", members: 2, status: "Done" },
    ],
  },
];

export const TIMELINE_TASKS = [
  { title: "Grapich Design", time: "09.00 AM", priority: "Low", track: "On Track", done: false, offset: 0 },
  { title: "Dashboard Design", time: "11.00 AM", priority: "High", track: "On Track", done: true, offset: 1 },
  { title: "Logo Design", time: "01.00 PM", priority: "High", track: "On Track", done: true, offset: 0 },
  { title: "Web Design", time: "03.00 PM", priority: "High", track: "On Track", done: true, offset: 2 },
];

/* ---------- Calendar ---------- */

export const CALENDAR_EVENTS: Record<number, { label: string; color: string }[]> = {
  2: [
    { label: "Free day", color: "#1fc8db" },
    { label: "Party Time", color: "#d63ef0" },
  ],
  16: [{ label: "Victory day", color: "#ff8b6b" }],
  21: [{ label: "Invited by friends", color: "#d63ef0" }],
  25: [{ label: "Christmas Day", color: "#1fc8db" }],
};

export const DAY_EVENTS = [
  { label: "Invited by friends", start: 9, end: 10, color: "#ff8b6b", col: 0 },
  { label: "Prayer Time", start: 12, end: 13, color: "#1fc8db", col: 1 },
  { label: "lunch Time", start: 14, end: 15, color: "#ff8b6b", col: 2 },
  { label: "Prayer Time", start: 18, end: 19, color: "#2eb67d", col: 0 },
  { label: "Dinner Time", start: 21, end: 22, color: "#5d5fef", col: 2 },
];

/* ---------- Messages ---------- */

export const CONVERSATIONS = [
  { name: "Shelby Goode", preview: "Lorem Ipsum is simply dummy text of the printing", time: "1 min ago", online: true },
  { name: "Robert Bacins", preview: "Lorem Ipsum is simply dummy text of the printing", time: "9 min ago", online: false },
  { name: "John Carilo", preview: "Lorem Ipsum is simply dummy text of the printing", time: "15 min ago", online: true, active: true },
  { name: "Adriene Watson", preview: "Lorem Ipsum is simply dummy text of the printing", time: "21 min ago", online: true },
  { name: "Jhon Deo", preview: "Lorem Ipsum is simply dummy text of the printing", time: "29 min ago", online: false },
  { name: "Mark Ruffalo", preview: "Lorem Ipsum is simply dummy text of the printing", time: "45 min ago", online: true },
  { name: "Bethany Jackson", preview: "Lorem Ipsum is simply dummy text of the printing", time: "1h ago", online: false },
];

export const CHAT_MESSAGES = [
  { from: "me", text: "Lorem Ipsum is simply" },
  { from: "me", text: "Lorem Ipsum is simply dummy text of the printing and typesetting industry.", time: "09:02 PM" },
  { from: "them", text: "Lorem Ipsum is simply dummy text of the printing and typesetting industry.", time: "09:04 PM" },
];

/* ---------- Notifications ---------- */

export const NOTIFICATIONS = [
  { name: "Shelby Goode", action: "liked your post", time: "2 min ago", unread: true },
  { name: "Robert Bacins", action: "started following you", time: "12 min ago", unread: true },
  { name: "John Carilo", action: "sent you a message", time: "32 min ago", unread: true },
  { name: "Adriene Watson", action: "commented on your task “Dashboard Design”", time: "1h ago", unread: false },
  { name: "Mark Ruffalo", action: "invited you to “E-Shop Mobile App”", time: "3h ago", unread: false },
  { name: "Bethany Jackson", action: "completed the invoice #876364", time: "Yesterday", unread: false },
  { name: "Jhon Deo", action: "uploaded 3 new files", time: "Yesterday", unread: false },
];

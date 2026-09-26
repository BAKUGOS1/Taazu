import { Home, Users, Factory, Map as MapIcon, ListChecks, ClipboardList, ShoppingCart, Wallet, Palette, QrCode, Calculator, NotebookPen } from "lucide-react";

/*
 * Everything a partner can switch on or off in Settings.
 * A module is a screen (or the calculator); features are the parts inside it.
 * Anything not switched off is on, so new features appear automatically.
 */

export type Feature = { key: string; label: string; desc: string };
export type ModuleDef = { id: string; label: string; icon: any; desc: string; features: Feature[]; tab?: boolean };

export const MODULES: ModuleDef[] = [
  { id: "Today", label: "Today", icon: Home, desc: "Daily dashboard: what needs a call, tasks, pilot gates.", features: [
    { key: "today.sup", label: "Supplier follow-ups", desc: "Suppliers due for a call today" },
    { key: "today.buy", label: "Buyer follow-ups", desc: "Buyers due for a call today" },
    { key: "today.tasks", label: "Next tasks", desc: "Open tasks by date" },
    { key: "today.gates", label: "Pilot gates", desc: "The 4 go / no-go checks" },
    { key: "today.pipeline", label: "Buyer pipeline", desc: "How many buyers at each stage" },
  ] },
  { id: "Suppliers", label: "Suppliers", icon: Factory, desc: "Call co-packers, bottle and label makers; log every talk.", features: [
    { key: "sup.due", label: "Due tab", desc: "Who to call today" },
    { key: "sup.board", label: "Pipeline board", desc: "Stages from To call to Finalized" },
    { key: "sup.compare", label: "Compare quotes", desc: "Side-by-side price and MOQ" },
    { key: "sup.script", label: "Call script", desc: "What to say and the answers to note: price, MOQ, lead time, terms" },
  ] },
  { id: "Buyers", label: "Buyers", icon: Users, desc: "Gyms, turfs, factories, canteens: your B2B leads.", features: [
    { key: "buy.due", label: "Due tab", desc: "Who to call today" },
    { key: "buy.board", label: "Pipeline board", desc: "Stages from New to Customer" },
    { key: "buy.deal", label: "Deal fields", desc: "Bottles per month, price, decision maker" },
  ] },
  { id: "Map", label: "Map", icon: MapIcon, desc: "See suppliers and buyers by area.", features: [
    { key: "map.list", label: "By-area list", desc: "The list view next to the map" },
  ] },
  { id: "Tasks", label: "Tasks", icon: ListChecks, desc: "To-do list up to the pilot.", features: [
    { key: "tasks.phases", label: "Phases tab", desc: "Tasks grouped by phase with progress" },
    { key: "tasks.done", label: "Done tab", desc: "Finished tasks" },
  ] },
  { id: "Survey", label: "Survey", icon: ClipboardList, desc: "Quick in-person taste survey.", features: [] },
  { id: "QR Survey", label: "QR Survey", icon: QrCode, desc: "Customers answer on their own phone.", features: [] },
  { id: "Sales", label: "Sales", icon: ShoppingCart, desc: "Stall sales, cash and UPI.", features: [
    { key: "sales.quick", label: "One-tap cup buttons", desc: "₹10 / ₹15 / ₹20 / ₹30 walk-in sale" },
    { key: "sales.unpaid", label: "Payment tracking", desc: "Paid / Unpaid tags, pending amount" },
  ] },
  { id: "Plans", label: "Plans", icon: NotebookPen, desc: "Your plans as cards: import, open, update.", features: [] },
  { id: "Budget", label: "Budget", icon: Wallet, desc: "₹55,000 trial: planned vs spent.", features: [] },
  { id: "Brand", label: "Brand", icon: Palette, desc: "Name ideas, bottle mockups, label rules.", features: [] },
  { id: "Calculator", label: "Calculator", icon: Calculator, desc: "Quick maths while you talk: cost, margin, GST, order total.", tab: false, features: [] },
];

/* Screens that can appear in the sidebar and dock. Settings is always available. */
export const TAB_IDS = MODULES.filter((m) => m.tab !== false).map((m) => m.id);

export const PRESETS: { id: string; label: string; desc: string; modules: string[] }[] = [
  { id: "all", label: "Everything", desc: "All screens on", modules: MODULES.map((m) => m.id) },
  { id: "sourcing", label: "Supplier hunting", desc: "Calling suppliers, quotes, budget", modules: ["Today", "Suppliers", "Tasks", "Plans", "Budget", "Map", "Calculator"] },
  { id: "selling", label: "Buyers & stall", desc: "Buyers, sales and surveys", modules: ["Today", "Buyers", "Sales", "Survey", "QR Survey", "Map", "Tasks", "Plans", "Calculator"] },
];

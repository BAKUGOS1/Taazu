import { SUP_STATUS, BUY_STATUS, SEGS, FLAVOURS, PAYS } from "../core";

/*
 * What each module looks like in a spreadsheet. The importer, the exporter and the
 * sample templates all read from here, so a file exported from Taazu imports back
 * cleanly and a template's columns always match what the importer expects.
 */

export type FieldType = "text" | "number" | "date" | "select" | "phone" | "email" | "gstin";

export type IoField = {
  k: string;                 // key on the record
  label: string;             // column header in exports and templates
  type?: FieldType;
  options?: readonly string[];
  strict?: boolean;          // select: a value outside `options` is a problem, not a warning
  legacy?: Record<string, string>; // select: old value -> current value
  required?: boolean;
  aliases?: string[];        // other headers that mean this field (HubSpot, Zoho, Tally, IndiaMART, JustDial exports…)
  joinWith?: string;         // several columns mapped here (First + Last name, Address 1 + 2) are joined with this; default ", "
  hint?: string;             // shown in the template's Instructions sheet
  example?: string[];        // sample values for the template, one per example row
};

export type IoModule = {
  id: "sup" | "buy" | "tasks" | "bud" | "sales" | "surv";
  label: string;             // "Suppliers"
  sheet: string;             // sheet name in exports
  noun: string;              // "supplier"
  fields: IoField[];
  dedupe: string[][];        // match keys, tried in order; a key is one field or several fields together
  defaults: Record<string, any>;
  skipRow?: (raw: Record<string, any>) => boolean;
};

const PHONE_ALIASES = ["mobile", "mobile no", "mobile number", "phone number", "contact number", "contact no", "phone no", "whatsapp", "whatsapp number", "cell", "tel", "telephone", "primary phone", "work phone", "phone 1"];
const NAME_COMPANY = ["company", "company name", "business", "business name", "account", "account name", "organisation", "organization", "firm", "firm name", "vendor", "vendor name", "party", "party name", "name", "shop name", "store name", "outlet"];
const CONTACT_ALIASES = ["contact person", "contact name", "person", "owner", "owner name", "full name", "first name", "last name", "surname", "key contact", "spoc", "point of contact", "contact"];
const AREA_ALIASES = ["address", "locality", "location", "street", "street address", "address line 1", "billing street", "mailing street", "place", "region", "zone"];
const CITY_ALIASES = ["town", "district", "billing city", "mailing city"];
const EMAIL_ALIASES = ["email", "e-mail", "email address", "mail", "email id", "e mail id", "primary email", "work email"];
const SOURCE_ALIASES = ["lead source", "source", "found on", "where found", "origin", "channel", "website", "url", "listing"];
const NOTES_ALIASES = ["notes", "note", "remarks", "remark", "comments", "comment", "description", "details", "memo"];
const STATUS_ALIASES = ["status", "stage", "lead status", "deal stage", "pipeline stage", "lifecycle stage", "state"];
const FOLLOW_ALIASES = ["follow up", "follow-up", "follow up date", "next follow up", "next contact", "next call", "callback", "reminder", "due date", "next activity date"];
const GEO = (): IoField[] => [
  { k: "lat", label: "Latitude", type: "number", aliases: ["lat"], hint: "Optional. Puts the record on the Map." },
  { k: "lng", label: "Longitude", type: "number", aliases: ["lng", "long", "lon"], hint: "Optional. Puts the record on the Map." },
  { k: "pid", label: "Place ID", aliases: ["google place id", "place id"], hint: "Optional. Google Maps place id." },
];

export const SUP_CATS = ["Co-packer / bottler", "Powder private label", "PET bottles / caps", "Labels & packaging", "Flavour / premix", "Testing lab", "Hydration station", "Future plant"];
export const BUY_SEGS = ["Gym", "Box cricket / turf", "Cricket academy", "Running", "Construction", "Factory", "Canteen / facility partner", "Events"];

export const MODULES: IoModule[] = [
  {
    id: "sup", label: "Suppliers", sheet: "Suppliers", noun: "supplier",
    defaults: { status: "To call", moq: "", price: "", notes: "", source: "Imported" },
    dedupe: [["gstin"], ["phone"], ["email"], ["name"]],
    fields: [
      { k: "name", label: "Supplier", required: true, aliases: [...NAME_COMPANY, "supplier", "supplier name", "manufacturer"], hint: "Business name. Required.", example: ["Shree Ganesh Bottlers", "Krishna Labels"] },
      { k: "cat", label: "Category", type: "select", options: SUP_CATS, aliases: ["type", "supplier type", "industry", "product category", "segment", "what they sell"], hint: `${SUP_CATS.join(", ")} — or your own.`, example: ["Co-packer / bottler", "Labels & packaging"] },
      { k: "about", label: "Expert in", aliases: ["expertise", "speciality", "specialty", "specialisation", "known for", "business type", "nature of business", "main products", "what they make", "about"], hint: "One line on what they're good at. Shown on the supplier card.", example: ["250 ml PET juice and water filling", "Printed labels and shrink sleeves"] },
      { k: "contact", label: "Contact person", joinWith: " ", aliases: CONTACT_ALIASES, example: ["Rakesh Patel", "Meena Shah"] },
      { k: "phone", label: "Phone", type: "phone", aliases: PHONE_ALIASES, hint: "Any format: 98250 12345, +91-98250-12345.", example: ["+91 98250 12345", "079 2656 1234"] },
      { k: "phone2", label: "Alt phone", type: "phone", aliases: ["alternate phone", "alternate number", "phone 2", "other phone", "landline", "secondary phone"], example: ["", "+91 90990 11223"] },
      { k: "email", label: "Email", type: "email", aliases: EMAIL_ALIASES, example: ["sales@ganeshbottlers.in", ""] },
      { k: "area", label: "Area", aliases: [...AREA_ALIASES, "full address", "factory address", "plant address"], hint: "Locality or full address.", example: ["Plot 12, Naroda GIDC Phase 1", "Odhav"] },
      { k: "city", label: "City", aliases: CITY_ALIASES, example: ["Ahmedabad", "Ahmedabad"] },
      { k: "gstin", label: "GSTIN", type: "gstin", aliases: ["gst", "gst no", "gst number", "gstin no", "gstin/uin", "gst in", "tax id"], hint: "15 characters. Checked for typos.", example: ["24AAACB1234C1ZL", ""] },
      { k: "fssai", label: "FSSAI no.", aliases: ["fssai", "fssai licence", "fssai license", "fssai number", "fssai no", "food licence"], hint: "14-digit licence number, or a note such as 'ask for licence copy'.", example: ["", "Ask for licence copy"] },
      { k: "use", label: "What for", aliases: ["what we need", "products", "product", "services", "offering", "why call"], example: ["250 ml PET filling, our label", "Shrink sleeves"] },
      { k: "status", label: "Status", type: "select", options: SUP_STATUS, strict: true, legacy: { Called: "Contacted", Selected: "Finalized", New: "To call", Open: "To call" }, aliases: STATUS_ALIASES, hint: `One of: ${SUP_STATUS.join(", ")}. Blank = To call.`, example: ["To call", "Quote received"] },
      { k: "moq", label: "MOQ", type: "number", aliases: ["minimum order", "min order qty", "moq units", "moq (units)"], example: ["2000", "5000"] },
      { k: "price", label: "₹/unit", type: "number", aliases: ["price", "rate", "unit price", "rate ₹/unit", "rate per unit", "cost", "price per unit", "₹ per unit"], example: ["13.5", "0.9"] },
      { k: "lead", label: "Delivery time", aliases: ["lead time", "delivery", "delivery days"], example: ["10 days", ""] },
      { k: "terms", label: "Payment terms", aliases: ["terms", "payment"], example: ["50% advance", ""] },
      { k: "sampleCost", label: "Sample ₹", type: "number", aliases: ["sample cost", "sample price", "sample"], example: ["0", ""] },
      { k: "q_lab", label: "Test report?", aliases: ["test report", "lab report", "certificate"], example: ["Yes", ""] },
      { k: "q_label", label: "What they offer", aliases: ["can they do it", "offer", "capability", "capabilities"], example: ["Nimbu & orange, 250 ml, our label", ""] },
      { k: "orderQty", label: "Our order qty", type: "number", aliases: ["order qty", "order quantity"], example: ["", ""] },
      { k: "orderDate", label: "Order date", type: "date", aliases: ["ordered on", "po date"], example: ["", ""] },
      { k: "follow", label: "Follow-up", type: "date", aliases: FOLLOW_ALIASES, hint: "Date, e.g. 2026-10-05 or 05/10/2026.", example: ["2026-10-05", ""] },
      { k: "next", label: "Next step", aliases: ["next action", "next steps", "action", "to do"], example: ["Ask for sample", ""] },
      { k: "notes", label: "Notes", aliases: NOTES_ALIASES, example: ["Met at expo", ""] },
      { k: "source", label: "Source", aliases: [...SOURCE_ALIASES, "verification", "verified from", "checked", "checked on", "reference"], hint: "Where you found them / how they were checked.", example: ["IndiaMART, GSTIN checked on GST portal", "Google Maps"] },
      ...GEO(),
    ],
  },
  {
    id: "buy", label: "Buyers", sheet: "Buyers", noun: "buyer",
    defaults: { status: "New", next: "", follow: "", notes: "", source: "Imported" },
    dedupe: [["phone"], ["email"], ["name"]],
    fields: [
      { k: "name", label: "Business", required: true, aliases: [...NAME_COMPANY, "buyer", "buyer name", "customer", "customer name", "lead", "lead name", "gym", "venue"], hint: "Business name. Required.", example: ["Iron Temple Gym", "Sunrise Box Cricket"] },
      { k: "seg", label: "Segment", type: "select", options: BUY_SEGS, aliases: ["category", "type", "industry", "customer type", "lead type", "business type", "vertical"], hint: `${BUY_SEGS.join(", ")} — or your own.`, example: ["Gym", "Box cricket / turf"] },
      { k: "contact", label: "Contact person", joinWith: " ", aliases: CONTACT_ALIASES, example: ["Amit Desai", "Kunal Joshi"] },
      { k: "phone", label: "Phone", type: "phone", aliases: PHONE_ALIASES, example: ["+91 99099 12345", "98980 55443"] },
      { k: "email", label: "Email", type: "email", aliases: EMAIL_ALIASES, example: ["owner@irontemple.in", ""] },
      { k: "area", label: "Area", aliases: AREA_ALIASES, example: ["Bodakdev", "South Bopal"] },
      { k: "city", label: "City", aliases: CITY_ALIASES, example: ["Ahmedabad", "Ahmedabad"] },
      { k: "why", label: "Why / angle", aliases: ["why", "angle", "pitch", "reason", "opportunity", "about"], example: ["600 members, sells shakes", "Evening tournaments"] },
      { k: "priority", label: "Pri", type: "select", options: ["A", "B", "C"], strict: true, legacy: { High: "A", Hot: "A", "1": "A", Medium: "B", Warm: "B", "2": "B", Low: "C", Cold: "C", "3": "C" }, aliases: ["priority", "rating", "lead rating", "tier", "grade"], hint: "A, B or C (High/Medium/Low also work).", example: ["A", "B"] },
      { k: "status", label: "Status", type: "select", options: BUY_STATUS, strict: true, legacy: { Open: "New", "Attempted to contact": "Contacted", Connected: "Contacted", Qualified: "Meeting", Won: "Customer", "Closed won": "Customer", "Closed lost": "Lost", Unqualified: "Lost" }, aliases: STATUS_ALIASES, hint: `One of: ${BUY_STATUS.join(", ")}. Blank = New.`, example: ["New", "Meeting"] },
      { k: "next", label: "Next step", aliases: ["next action", "next steps", "action", "to do"], example: ["Drop sample crate", ""] },
      { k: "follow", label: "Follow-up", type: "date", aliases: FOLLOW_ALIASES, example: ["2026-10-02", ""] },
      { k: "decision", label: "Decision maker", aliases: ["decision maker", "dm"], example: ["Owner", ""] },
      { k: "people", label: "People / day", type: "number", aliases: ["footfall", "members", "people per day", "daily footfall"], example: ["150", ""] },
      { k: "qty", label: "Bottles / month", type: "number", aliases: ["volume", "monthly volume", "expected qty"], example: ["", ""] },
      { k: "rate", label: "Our price ₹/unit", type: "number", aliases: ["our price", "price", "rate", "deal price"], example: ["", ""] },
      { k: "sampleDay", label: "Sample drop day", aliases: ["sample day", "sample drop"], example: ["Mon 11 am", ""] },
      { k: "start", label: "Can start", type: "date", aliases: ["start date", "start"], example: ["", ""] },
      { k: "notes", label: "Notes", aliases: NOTES_ALIASES, example: ["Walk-in on Sunday", ""] },
      { k: "source", label: "Source", aliases: SOURCE_ALIASES, example: ["Google Maps", "JustDial"] },
      ...GEO(),
    ],
  },
  {
    id: "tasks", label: "Tasks", sheet: "Tasks", noun: "task",
    defaults: { status: "To do", notes: "" },
    dedupe: [["task"]],
    fields: [
      { k: "task", label: "Task", required: true, aliases: ["title", "subject", "activity", "todo", "to do", "item", "description", "name"], example: ["Call 5 co-packers", "Print survey cards"] },
      { k: "phase", label: "Phase", aliases: ["week", "stage", "milestone", "group", "project"], example: ["Week 1", "Week 2"] },
      { k: "due", label: "Due", type: "date", aliases: ["due date", "deadline", "date", "end date", "by"], example: ["2026-10-01", "2026-10-07"] },
      { k: "status", label: "Status", type: "select", options: ["To do", "Doing", "Done"], strict: true, legacy: { "Not started": "To do", Open: "To do", Pending: "To do", "In progress": "Doing", Started: "Doing", Completed: "Done", Complete: "Done", Closed: "Done" }, aliases: STATUS_ALIASES, hint: "To do, Doing or Done.", example: ["To do", "Doing"] },
      { k: "notes", label: "Notes", aliases: NOTES_ALIASES, example: ["", ""] },
    ],
  },
  {
    id: "bud", label: "Budget", sheet: "Budget", noun: "budget line",
    defaults: { actual: 0, notes: "" },
    dedupe: [["bucket"]],
    skipRow: (raw) => Object.values(raw).some((v) => String(v).trim().toUpperCase() === "TOTAL"),
    fields: [
      { k: "bucket", label: "Bucket", required: true, aliases: ["head", "category", "expense head", "item", "line item", "account", "particulars", "description"], example: ["Label design + print", "Freight & samples"] },
      { k: "planned", label: "Planned ₹", type: "number", aliases: ["planned", "budget", "plan", "budgeted", "estimate", "allocated"], example: ["6000", "3000"] },
      { k: "actual", label: "Actual ₹", type: "number", aliases: ["actual", "spent", "spend", "amount spent", "used", "expense"], example: ["4500", "0"] },
      { k: "notes", label: "Notes", aliases: NOTES_ALIASES, example: ["", ""] },
    ],
  },
  {
    id: "sales", label: "Sales", sheet: "Sales", noun: "sale",
    defaults: { paid: "No", notes: "" },
    dedupe: [["date", "customer", "product", "qty", "rate"]],
    fields: [
      { k: "date", label: "Date", type: "date", required: true, aliases: ["sale date", "invoice date", "bill date", "order date", "voucher date", "txn date", "transaction date"], example: ["2026-10-12", "2026-10-12"] },
      { k: "customer", label: "Customer", aliases: ["customer name", "party", "party name", "buyer", "client", "sold to", "bill to", "account"], example: ["Garba stall – Sindhu Bhavan", "Iron Temple Gym"] },
      { k: "product", label: "Product", aliases: ["item", "item name", "sku", "product name", "description", "stock item"], example: ["Cup 200 ml", "Bottle 250 ml"] },
      { k: "qty", label: "Qty", type: "number", aliases: ["quantity", "units", "nos", "pcs", "count"], example: ["120", "24"] },
      { k: "rate", label: "Rate ₹", type: "number", aliases: ["rate", "price", "unit price", "mrp", "selling price", "rate per unit"], example: ["15", "22"] },
      { k: "paid", label: "Paid?", type: "select", options: ["No", "Yes"], strict: true, legacy: { Y: "Yes", N: "No", True: "Yes", False: "No", Paid: "Yes", Unpaid: "No", Pending: "No", Cash: "Yes", UPI: "Yes", Received: "Yes", Due: "No" }, aliases: ["paid", "payment status", "payment", "received", "collected"], hint: "Yes or No. Blank = No.", example: ["Yes", "No"] },
      { k: "notes", label: "Notes", aliases: NOTES_ALIASES, example: ["UPI", "Pay on Monday"] },
    ],
  },
  {
    id: "surv", label: "Survey", sheet: "Survey", noun: "survey reply",
    defaults: {},
    dedupe: [],
    fields: [
      { k: "date", label: "Date", type: "date", aliases: ["timestamp", "submitted at", "response date", "time"], example: ["2026-10-14", "2026-10-14"] },
      { k: "venue", label: "Venue", aliases: ["location", "place", "event", "where"], example: ["Sindhu Bhavan garba", "Iron Temple Gym"] },
      { k: "segment", label: "Who", type: "select", options: SEGS, aliases: ["segment", "who are you", "type", "respondent type", "category"], hint: SEGS.join(", "), example: ["Garba", "Gym"] },
      { k: "flavour", label: "Best flavour", type: "select", options: FLAVOURS, aliases: ["flavour", "flavor", "best flavor", "favourite flavour", "preferred flavour"], hint: FLAVOURS.join(", "), example: ["Nimbu-namak", "Jeera"] },
      { k: "pay", label: "Would pay (250 ml)", type: "select", options: PAYS, aliases: ["would pay", "price", "willing to pay", "pay", "how much would you pay"], hint: PAYS.join(", "), example: ["₹30", "₹20"] },
      { k: "comment", label: "Comment", aliases: ["comments", "feedback", "remarks", "notes", "anything else"], example: ["Less salty please", ""] },
    ],
  },
];

export const moduleById = (id: string) => MODULES.find((m) => m.id === id)!;

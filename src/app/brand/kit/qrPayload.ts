/*
 * What each Brand → QR code type puts inside the QR. Kept apart from the UI so it can be tested.
 */
export type Kind = "whatsapp" | "link" | "upi" | "call" | "location" | "wifi" | "contact" | "instagram" | "text" | "email" | "sms";
export type F = { key: string; label: string; ph?: string; area?: boolean; tel?: boolean; select?: string[] };

export const KINDS: { id: Kind; label: string; fields: F[]; caption: string }[] = [
  { id: "whatsapp", label: "WhatsApp", caption: "Scan karo · WhatsApp order", fields: [{ key: "phone", label: "WhatsApp number", ph: "91737 36652", tel: true }, { key: "msg", label: "Pehle se likha message (optional)", ph: "Hi Taazu, mujhe order karna hai", area: true }] },
  { id: "link", label: "Link / website", caption: "Scan karo", fields: [{ key: "url", label: "Link", ph: "https://taazu.vercel.app" }] },
  { id: "upi", label: "UPI payment", caption: "Scan karke pay karo", fields: [{ key: "pa", label: "UPI ID", ph: "taazu@okaxis" }, { key: "pn", label: "Naam (jo payer ko dikhega)", ph: "Taazu" }, { key: "am", label: "Amount ₹ (optional, khali = customer bharega)", ph: "25", tel: true }, { key: "tn", label: "Note (optional)", ph: "Taazu 250 ml" }] },
  { id: "call", label: "Call", caption: "Scan karke call karo", fields: [{ key: "phone", label: "Phone number", ph: "91737 36652", tel: true }] },
  { id: "location", label: "Location", caption: "Scan karo · rasta dekho", fields: [{ key: "q", label: "Google Maps link, jagah ka naam ya lat,long", ph: "Sabarmati Riverfront, Ahmedabad" }] },
  { id: "wifi", label: "Wi-Fi", caption: "Scan karke Wi-Fi join karo", fields: [{ key: "ssid", label: "Wi-Fi naam", ph: "Taazu Stall" }, { key: "pass", label: "Password", ph: "" }, { key: "sec", label: "Security", select: ["WPA", "WEP", "nopass"] }] },
  { id: "contact", label: "Contact card", caption: "Scan karke number save karo", fields: [{ key: "name", label: "Naam", ph: "Mohit Kumar" }, { key: "org", label: "Company", ph: "Taazu" }, { key: "phone", label: "Phone", ph: "91737 36652", tel: true }, { key: "email", label: "Email", ph: "" }, { key: "url", label: "Website", ph: "" }, { key: "adr", label: "Address", ph: "Ahmedabad, Gujarat" }] },
  { id: "instagram", label: "Instagram", caption: "Scan karo · follow karo", fields: [{ key: "user", label: "Instagram username", ph: "taazu.amdavad" }] },
  { id: "text", label: "Text", caption: "Scan karo", fields: [{ key: "text", label: "Text", area: true, ph: "Taazu: Paani se aage." }] },
  { id: "email", label: "Email", caption: "Scan karke email karo", fields: [{ key: "to", label: "Email", ph: "" }, { key: "sub", label: "Subject", ph: "Taazu order" }, { key: "body", label: "Message", area: true, ph: "" }] },
  { id: "sms", label: "SMS", caption: "Scan karke SMS karo", fields: [{ key: "phone", label: "Number", ph: "91737 36652", tel: true }, { key: "msg", label: "Message", area: true, ph: "" }] },
];

const digits = (p: string) => { const d = (p || "").replace(/\D/g, ""); return d.length === 10 ? "91" + d : d; };
const wifiEsc = (s: string) => (s || "").replace(/([\\;,:"])/g, "\\$1");
const vEsc = (s: string) => (s || "").replace(/([\\;,])/g, "\\$1").replace(/\n/g, "\\n");

/** What the QR actually holds for each type. Empty string = not enough filled in yet. */
export function payload(kind: Kind, d: Record<string, string>): string {
  const v = (k: string) => (d[k] || "").trim();
  switch (kind) {
    case "whatsapp": return digits(v("phone")) ? `https://wa.me/${digits(v("phone"))}${v("msg") ? "?text=" + encodeURIComponent(v("msg")) : ""}` : "";
    case "link": { const u = v("url"); return u ? (/^[a-z][a-z0-9+.-]*:/i.test(u) ? u : "https://" + u) : ""; }
    case "upi": {
      if (!v("pa")) return "";
      const q = [["pa", v("pa")], ["pn", v("pn")], ["am", v("am").replace(/[^\d.]/g, "")], ["cu", "INR"], ["tn", v("tn")]].filter(([, x]) => x);
      return "upi://pay?" + q.map(([k, x]) => `${k}=${encodeURIComponent(x)}`).join("&");
    }
    case "call": return digits(v("phone")) ? `tel:+${digits(v("phone"))}` : "";
    case "location": { const q = v("q"); return q ? (/^https?:\/\//i.test(q) ? q : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`) : ""; }
    case "wifi": return v("ssid") ? `WIFI:T:${v("sec") || "WPA"};S:${wifiEsc(v("ssid"))};${v("sec") === "nopass" ? "" : `P:${wifiEsc(v("pass"))};`};` : "";
    case "contact": {
      if (!v("name") && !v("phone")) return "";
      const lines = ["BEGIN:VCARD", "VERSION:3.0", `N:${vEsc(v("name"))};;;;`, `FN:${vEsc(v("name"))}`];
      if (v("org")) lines.push(`ORG:${vEsc(v("org"))}`);
      if (v("phone")) lines.push(`TEL;TYPE=CELL:+${digits(v("phone"))}`);
      if (v("email")) lines.push(`EMAIL:${v("email")}`);
      if (v("url")) lines.push(`URL:${v("url")}`);
      if (v("adr")) lines.push(`ADR:;;${vEsc(v("adr"))};;;;`);
      lines.push("END:VCARD");
      return lines.join("\n");
    }
    case "instagram": return v("user") ? `https://instagram.com/${v("user").replace(/^@/, "").replace(/^https?:\/\/(www\.)?instagram\.com\//, "")}` : "";
    case "text": return v("text");
    case "email": { if (!v("to")) return ""; const q = [["subject", v("sub")], ["body", v("body")]].filter(([, x]) => x); return `mailto:${v("to")}${q.length ? "?" + q.map(([k, x]) => `${k}=${encodeURIComponent(x)}`).join("&") : ""}`; }
    case "sms": return digits(v("phone")) ? `SMSTO:+${digits(v("phone"))}:${v("msg")}` : "";
  }
}


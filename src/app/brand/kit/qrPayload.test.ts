import { describe, expect, it } from "vitest";
import { payload } from "./qrPayload";

describe("QR payloads", () => {
  it("WhatsApp adds 91 to a 10-digit number and encodes the message", () => {
    expect(payload("whatsapp", { phone: "91737 36652", msg: "Hi Taazu, order?" })).toBe("https://wa.me/919173736652?text=Hi%20Taazu%2C%20order%3F");
    expect(payload("whatsapp", { phone: "+91 91737-36652" })).toBe("https://wa.me/919173736652");
    expect(payload("whatsapp", { phone: "" })).toBe("");
  });

  it("UPI builds a upi://pay link, skipping empty fields and cleaning the amount", () => {
    expect(payload("upi", { pa: "taazu@okaxis", pn: "Taazu", am: "₹25", tn: "" })).toBe("upi://pay?pa=taazu%40okaxis&pn=Taazu&am=25&cu=INR");
    expect(payload("upi", { pa: "" })).toBe("");
  });

  it("Wi-Fi escapes special characters and handles open networks", () => {
    expect(payload("wifi", { ssid: "Taazu;Stall", pass: "a:b", sec: "WPA" })).toBe("WIFI:T:WPA;S:Taazu\\;Stall;P:a\\:b;;");
    expect(payload("wifi", { ssid: "Open", sec: "nopass" })).toBe("WIFI:T:nopass;S:Open;;");
  });

  it("links get https:// when missing and locations become Maps searches", () => {
    expect(payload("link", { url: "taazu.vercel.app" })).toBe("https://taazu.vercel.app");
    expect(payload("link", { url: "http://x.in" })).toBe("http://x.in");
    expect(payload("location", { q: "Sabarmati Riverfront" })).toBe("https://www.google.com/maps/search/?api=1&query=Sabarmati%20Riverfront");
    expect(payload("location", { q: "https://maps.app.goo.gl/abc" })).toBe("https://maps.app.goo.gl/abc");
  });

  it("contact card is a vCard with the phone in international form", () => {
    const v = payload("contact", { name: "Mohit Kumar", org: "Taazu", phone: "9173736652" });
    expect(v.split("\n")).toEqual(["BEGIN:VCARD", "VERSION:3.0", "N:Mohit Kumar;;;;", "FN:Mohit Kumar", "ORG:Taazu", "TEL;TYPE=CELL:+919173736652", "END:VCARD"]);
  });

  it("call, sms, email and instagram", () => {
    expect(payload("call", { phone: "9173736652" })).toBe("tel:+919173736652");
    expect(payload("sms", { phone: "9173736652", msg: "Hi" })).toBe("SMSTO:+919173736652:Hi");
    expect(payload("email", { to: "a@b.in", sub: "Order" })).toBe("mailto:a@b.in?subject=Order");
    expect(payload("instagram", { user: "@taazu.amdavad" })).toBe("https://instagram.com/taazu.amdavad");
  });
});

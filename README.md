# Taazu — Ahmedabad Electrolyte Pilot Tracker

A high-performance operational cockpit and pilot tracker for launching an electrolyte beverage business in Ahmedabad, Gujarat.

## Features

- **Work Dashboard (Today)**: Live KPI cards (leads contacted, survey response rates, revenue collected, budget remaining), follow-up alerts, overdue task warnings, and the 4 pilot gates.
- **Directory Management**:
  - **Suppliers**: Co-packers/bottlers, PET bottle suppliers, label printers, premix manufacturers, and NABL testing labs across Ahmedabad, Changodar, Naroda, and Vatva GIDC.
  - **Buyers & B2B Leads**: Priority-ranked targets across gyms, box cricket turfs, cricket academies, runners clubs, construction firms, and industrial canteens.
  - Quick action links for 1-tap **Phone Calls**, **WhatsApp**, and **Google Maps**.
- **Interactive Ahmedabad Map**: SVG schematic visualizer plotting suppliers and buyers with geographic clusters along SG Highway, Changodar, Prahlad Nagar, and Naroda.
- **Task & Milestone Roadmap**: Phased action items from FoSCoS/Udyam registrations to sampling batches, marathon hydration partnerships, and pilot bottling.
- **On-the-ground Survey & QR Code**: Quick in-person survey logger plus a customer-facing public QR survey powered by Google Apps Script.
- **Sales & Cash Collection Log**: On-site cup and pack sales ledger tracking UPI/cash settlement.
- **₹55,000 Trial Budget Tracker**: Real-time variance tracking (planned vs. actual).
- **Brand Strategy & Mockups**: Name evaluations (RANN, JalKavach, Taazu, etc.), 250ml stock PET bottle mockups, and regulatory packaging guidelines (FSSAI / Legal Metrology).
- **CRM-style import & export** (Settings → Data): import any .xlsx, .xls, .csv or .ods (HubSpot, Zoho, Tally, IndiaMART, JustDial, Google Sheets) with automatic column matching, a preview, duplicate handling by phone / GSTIN / email / name, an error report and undo. Export each module or everything, and download a sample .xlsx template per module. Column definitions live in `src/lib/dataio/schema.ts`.
- **Persistent Storage**: Polyfilled `window.storage` backed by `localStorage` so data survives page refreshes and browser restarts.

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm

### Installation

```bash
npm install
```

### Development Server

```bash
npm run dev
```

The app will run locally at [http://localhost:5173](http://localhost:5173).

### Production Build

```bash
npm run build
npm run preview
```

## Google Sheets Survey Integration

To enable live Google Sheets synchronization for customer QR codes:
1. Open [sheets.new](https://sheets.new) and create a sheet named `Survey responses`.
2. Navigate to **Extensions → Apps Script**.
3. Paste the Apps Script snippet provided in the **QR Survey** setup panel.
4. Set a custom secret key, deploy as a Web App (access: Anyone), and paste the `/exec` URL and secret back into Taazu.

## Backend: shared Supabase project (important)

Taazu stores its data in **Phere's Supabase project** (`hrwqsgwnwpteykmigvae`), fully separated by name:

- Everything Taazu owns starts with `taazu_`: tables `taazu_workspaces`, `taazu_members`, `taazu_records`, `taazu_usernames`; functions `taazu_*`; edge functions `taazu-login`, `taazu-signup`.
- Every one of those tables and functions carries a database comment starting **"TAAZU APP — separate project … NOT part of Phere"**.
- Taazu never reads or writes Phere tables, and Phere must never touch `taazu_*` objects.
- Taazu migrations live in `supabase/migrations/` of **this** repo only. Don't run Phere's migration tooling against `taazu_*` objects, and don't run Taazu migrations from the Phere repo.

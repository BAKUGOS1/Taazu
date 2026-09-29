# Taazu Bottle Label Specifications (250 ml PET)

This directory contains the production-grade, print-ready vector artwork, high-resolution 300 DPI raster renders, prepress PDF exports, and 3D preview assets for **Taazu** electrolyte drinks.

---

## 1. Physical Mould & Label Dimensions

| Parameter | Specification | Notes |
| :--- | :--- | :--- |
| **Container** | 250 ml PET Bottle | Round profile, body diameter 55 mm |
| **Circumference** | 172.8 mm | $\pi \times 55\text{ mm} \approx 172.7876\text{ mm}$ |
| **Trim Size** | **181.0 mm (W) &times; 95.0 mm (H)** | 172.8 mm circumference + 8.0 mm glue overlap |
| **Bleed** | **3.0 mm** on all 4 edges | Canvas extends 3 mm past trim for cutting tolerance |
| **Full Canvas Size** | **187.0 mm (W) &times; 101.0 mm (H)** | Required artboard size for printer RIP |
| **Safe Margin** | **3.0 mm** inside trim line | All critical copy and logos sit within safe boundary |
| **Glue Overlap** | **8.0 mm** on right trim edge | Reserved overlap seam; strictly free of text |
| **Target Print DPI** | **300 DPI** | Exact 2205 &times; 1193 px output |

### Horizontal Panel Breakdown (Trim Coordinates, Left to Right)
```
[   BACK PANEL   ] [SIDE] [   FRONT PANEL   ] [   SIDE   ] [OVERLAP]
      62 mm        12 mm        70 mm            29 mm        8 mm
```
- Total trim width: $62 + 12 + 70 + 29 + 8 = 181\text{ mm}$.
- Total canvas width with 3 mm bleed: $187\text{ mm}$.

---

## 2. Brand Color Palette & Prepress CMYK Conversions

| Color Role | Hex Code | RGB | Approx CMYK (Offset / Flexo) |
| :--- | :--- | :--- | :--- |
| **Cream Canvas** | `#FFF8E7` | 255, 248, 231 | C0, M3, Y11, K0 |
| **Taazu Orange** | `#E0561B` | 224, 86, 27 | C3, M80, Y98, K0 |
| **Classic Yellow Band** | `#F2D22E` | 242, 210, 46 | C6, M13, Y90, K0 |
| **Jeera Masala Brown Band** | `#8A4B1F` | 138, 75, 31 | C25, M70, Y95, K30 |
| **Leaf Green Strip** | `#1F7A3A` | 31, 122, 58 | C84, M22, Y95, K12 |
| **Body Ink Dark** | `#1C1917` | 28, 25, 23 | C65, M65, Y65, K85 |
| **Muted Grey-Brown** | `#57534E` | 87, 83, 78 | C55, M50, Y50, K30 |

*Note for prepress printer: Colors must be verified against physical Pantone / proofing swatch under D50 lighting.*

---

## 3. Typography & FSSAI Compliance

- **Flavour Name, Green Strip, Tagline, Volume**: **Barlow Condensed** (SemiBold & Bold, all caps).
- **Back Panel Mandatory Statutory Text**: **Inter** (Regular, Medium, Bold). Minimum size is 6.5 to 7.0 pt, strictly complying with the FSSAI Labelling & Display Regulations (2020) for 250 ml pack sizes.
- **Outlined Vectors**: In `*-outlined.svg`, every glyph has been converted into vector `<path>` outlines using `opentype.js` so that RIP processors and printing plates require no external fonts.

---

## 4. Mandatory Placeholders Checklist (Fill Before Printing)

Before issuing the final print purchase order and making flexo/offset plates, replace the following `[x]` placeholders with finalized certified data:

- [ ] **FSSAI Licence Number**: Replace `[14-digit licence]` with brand owner / co-packer FSSAI registration number.
- [ ] **Co-packer Manufacturing Details**: Replace `[co-packer name, address, FSSAI lic.]`.
- [ ] **Brand Owner Marketing Details**: Replace `[brand owner name, address]`.
- [ ] **MRP**: Replace `₹[xx]` with retail price.
- [ ] **Customer Care Contacts**: Replace `[phone]` and `[email]`.
- [ ] **Nutrition Panel Lab Report**: Replace `[x]` numbers from NABL-accredited laboratory test report:
  - Energy (kcal)
  - Protein (g)
  - Carbohydrate (g)
  - Total Sugars (g)
  - Added Sugars (g)
  - Total Fat (g)
  - Sodium (mg)
  - Potassium (mg)
- [ ] **Barcode**: Replace `[8 900000 000000]` with registered GS1 India EAN-13 barcode.
- [ ] **Ingredients Listing**: Confirm exact descending order of raw materials with formulation chemist.
- [ ] **Vector Logo Artwork**: Replace 1024 px raster logo with vector EPS/AI when final vector redraw is completed.

---

## 5. Output Deliverables Manifest

```
brand-kit/labels/
├── taazu-label-classic.svg           # Layered, real editable text
├── taazu-label-classic-outlined.svg  # 100% vector outlines (no fonts needed)
├── taazu-label-classic.png           # 2205 x 1193 px (300 DPI, full bleed)
├── taazu-label-classic-trim.png      # 2134 x 1122 px (Trim size without bleed)
├── taazu-label-classic-print.png     # With prepress crop marks
├── taazu-label-classic.pdf           # 187 x 101 mm full bleed PDF
├── taazu-label-classic-trim.pdf      # 181 x 95 mm trim PDF
├── taazu-label-classic-marks.pdf     # With crop marks & registration details
├── taazu-label-jeera.svg             # Jeera Masala layered editable SVG
├── taazu-label-jeera-outlined.svg    # Jeera Masala outlined vector SVG
├── taazu-label-jeera.png             # 2205 x 1193 px (300 DPI, full bleed)
├── taazu-label-jeera-trim.png        # Trim size without bleed
├── taazu-label-jeera-print.png       # With prepress crop marks
├── taazu-label-jeera.pdf             # 187 x 101 mm full bleed PDF
├── taazu-label-jeera-trim.pdf        # 181 x 95 mm trim PDF
├── taazu-label-jeera-marks.pdf       # With crop marks & registration details
├── preview.html                      # Interactive flat & 3D bottle wrap QA viewer
├── README.md                         # Technical specification & checklist
└── assets/
    ├── taazu-logo-c4-transparent.png
    └── taazu-logo-icon-c2-transparent.png
```

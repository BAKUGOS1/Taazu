import { useState, useMemo } from "react";
import { 
  Folder, Film, Image as ImageIcon, Sparkles, Tag, Layers, 
  ExternalLink, Copy, Check, Download, Eye, X, Search 
} from "lucide-react";
import { Panel, btnGhost, btnPrimary } from "../../../components/ui";

export type AssetCategory = "reels" | "ingredients" | "products" | "social" | "labels" | "logos";

export interface AssetItem {
  id: string;
  title: string;
  category: AssetCategory;
  path: string;
  format: string;
  aspect: "9/16" | "4/5" | "1/1" | "4/3" | "wide";
  note: string;
  actionText?: string;
  copyContent?: string;
  isExternal?: boolean;
}

const FOLDERS: { id: AssetCategory; label: string; icon: any; count: number; desc: string }[] = [
  { id: "reels", label: "Reels & Video Storyboard", icon: Film, count: 12, desc: "Reel 2 'Andar kya hai?' 9:16 vertical storyboard frames with timings and prompts" },
  { id: "ingredients", label: "Macro Ingredients (4K)", icon: Sparkles, count: 4, desc: "Ultra-realistic studio macro photography isolated on pure white" },
  { id: "products", label: "Product Renders & 3D", icon: Layers, count: 6, desc: "High-resolution 3D renders, orthographic engineering views, and flat label references" },
  { id: "social", label: "Social Posts & Posters", icon: ImageIcon, count: 8, desc: "Ready-to-post graphics with captions, sources, and WhatsApp order CTA" },
  { id: "labels", label: "Print Labels & Outlines", icon: Tag, count: 6, desc: "Print-ready packaging vectors (300 DPI, bleed & crop marks, PDFs & SVGs)" },
  { id: "logos", label: "Logos & Brand Marks", icon: Folder, count: 6, desc: "Master vector marks, transparent icons, lockups, and brand seals" },
];

const ASSETS: AssetItem[] = [
  // --- Reels / Storyboard ---
  {
    id: "r2-f01",
    title: "Frame 01 · 0–3s · Hook Bottle Close-Up",
    category: "reels",
    path: "/brand-assets/reels/reel-2/frame-01-hook.jpg",
    format: "JPG · 9:16",
    aspect: "9/16",
    note: "Extreme close-up of chilled Taazu Classic bottle with condensation and warm cream glow.",
    copyContent: "Extreme close-up of a chilled 250 ml clear PET bottle of Taazu Classic Nimbu Namak with an orange cap, cold condensation droplets running down the label, slight low angle, warm cream background (#FFF8E7) with a soft orange glow behind the bottle. Vertical 9:16, premium beverage ad photography."
  },
  {
    id: "r2-f02",
    title: "Frame 02 · 3–5s · NIMBU (Falling Lemon)",
    category: "reels",
    path: "/brand-assets/reels/reel-2/frame-02-nimbu.jpg",
    format: "JPG · 9:16",
    aspect: "9/16",
    note: "Juicy lemon slice dripping fresh droplets into the open neck of the full Taazu bottle, orange cap resting naturally at base.",
    copyContent: "A juicy lemon slice falling in the upper-middle of the frame, frozen mid-air, with a few clear juice droplets dripping from it straight down into the open neck of the bottle. Show the FULL bottle standing upright with its base visible and orange cap resting at base. Vertical 9:16."
  },
  {
    id: "r2-f03",
    title: "Frame 03 · 5–7s · NAMAK (Rock Salt)",
    category: "reels",
    path: "/brand-assets/reels/reel-2/frame-03-namak.jpg",
    format: "JPG · 9:16",
    aspect: "9/16",
    note: "Coarse white and pink rock salt crystals raining down in crisp studio lighting.",
    copyContent: "Coarse white and pink rock salt crystals raining down from the top and landing in a small heap in the centre, crystals sparkling in the light, cool slate blue-grey gradient background. Vertical 9:16."
  },
  {
    id: "r2-f04",
    title: "Frame 04 · 7–9s · JEERA (Roasted Cumin)",
    category: "reels",
    path: "/brand-assets/reels/reel-2/frame-04-jeera.jpg",
    format: "JPG · 9:16",
    aspect: "9/16",
    note: "Roasted cumin seeds bursting outward in a freeze-frame high-speed explosion.",
    copyContent: "Roasted cumin seeds (jeera) bursting outward from the centre like a small explosion, a few seeds in sharp focus in front, warm brown (#8A4B1F) to cream gradient background. Vertical 9:16."
  },
  {
    id: "r2-f05",
    title: "Frame 05 · 9–11s · PUDINA (Fresh Mint)",
    category: "reels",
    path: "/brand-assets/reels/reel-2/frame-05-pudina.jpg",
    format: "JPG · 9:16",
    aspect: "9/16",
    note: "Three fresh mint leaves floating and gently turning in the air with dewy micro-droplets.",
    copyContent: "Three fresh mint leaves floating and gently turning in the air, dewy with water droplets, fresh green (#1F7A3A) to light mint gradient background. Vertical 9:16."
  },
  {
    id: "r2-f06",
    title: "Frame 06 · 11–13s · THANDA (Ice & Chilled Bottle)",
    category: "reels",
    path: "/brand-assets/reels/reel-2/frame-06-thanda.jpg",
    format: "JPG · 9:16",
    aspect: "9/16",
    note: "Crystal clear ice cubes dropping with frost mist beside the chilled authentic Taazu bottle.",
    copyContent: "Three crystal-clear ice cubes dropping and clinking together, frost mist and tiny water splashes, icy light blue background with a cold glow, alongside chilled Taazu bottle. Vertical 9:16."
  },
  {
    id: "r2-f07",
    title: "Frame 07 · 13–15s · SWIRL (Sab Ek Saath)",
    category: "reels",
    path: "/brand-assets/reels/reel-2/frame-07-swirl.jpg",
    format: "JPG · 9:16",
    aspect: "9/16",
    note: "Ingredients swirling in dynamic circular vortex around the glowing orange water drop.",
    copyContent: "A lemon slice, rock salt crystals, cumin seeds, mint leaves and ice cubes swirling in a circular vortex around a glossy glass-like orange water drop in the centre, motion trails, warm cream background. Vertical 9:16."
  },
  {
    id: "r2-f08",
    title: "Frame 08 · 15–17s · SPLASH & Logo Drop",
    category: "reels",
    path: "/brand-assets/reels/reel-2/frame-08-splash.jpg",
    format: "JPG · 9:16",
    aspect: "9/16",
    note: "Taazu 3D glossy logo drop hovering above liquid crown splash with Taazu bottle on reflective dark floor.",
    copyContent: "A big glossy water drop hitting a surface and exploding into a crown-shaped splash of clear lemony liquid, droplets flying, bright orange (#EA580C) background, with authentic Taazu bottle. Vertical 9:16."
  },
  {
    id: "r2-f09",
    title: "Frame 09 · 17–19s · Classic Hero Bottle",
    category: "reels",
    path: "/brand-assets/reels/reel-2/frame-09-classic-hero.jpg",
    format: "JPG · 9:16",
    aspect: "9/16",
    note: "Taazu Classic Nimbu Namak bottle standing in the centre rising out of splash with floating lemons and mint.",
    copyContent: "Taazu Classic Nimbu Namak bottle with orange cap standing in the centre, rising out of a small splash, lemon slices and mint leaves floating around it, condensation on the bottle, warm yellow-orange gradient background. Vertical 9:16."
  },
  {
    id: "r2-f10",
    title: "Frame 10 · 19–22s · Jeera Masala Hero",
    category: "reels",
    path: "/brand-assets/reels/reel-2/frame-10-jeera-hero-ref.jpg",
    format: "JPG · 9:16 Ref",
    aspect: "9/16",
    note: "Taazu Jeera Masala bottle with brown cap and roasted cumin seeds on earthen brown studio background.",
    copyContent: "Taazu Jeera Masala bottle with brown cap standing in the centre, roasted cumin seeds orbiting around it, cold condensation on the bottle, warm brown (#8A4B1F) to cream gradient background. Vertical 9:16."
  },
  {
    id: "r2-f11",
    title: "Frame 11 · 22–25s · Flavour Duo Master",
    category: "reels",
    path: "/brand-assets/reels/reel-2/frame-11-duo-ref.png",
    format: "PNG · 9:16 Ref",
    aspect: "9/16",
    note: "Both bottles side by side with ice, lemon slice, and mint: Rehydrate | Refresh | Recover.",
    copyContent: "Both Taazu bottles side by side, Classic with orange cap on the left and Jeera Masala with brown cap on the right, ice cubes, lemon slice and mint leaf at base, cream background (#FFF8E7). Vertical 9:16."
  },

  // --- Macro Ingredients ---
  {
    id: "ing-01",
    title: "Lemon Slice (Macro)",
    category: "ingredients",
    path: "/brand-assets/ingredients/lemon-slice-macro.jpg",
    format: "JPG · 1024×1024",
    aspect: "1/1",
    note: "Translucent citrus vesicles, water droplets, isolated on pure white.",
    copyContent: "Ultra-realistic macro photo of a single fresh lemon slice, top view, juicy, water droplets, isolated on a plain pure white background, soft studio light, no shadow, 4K."
  },
  {
    id: "ing-02",
    title: "Pink Rock Salt Crystals",
    category: "ingredients",
    path: "/brand-assets/ingredients/rock-salt-macro.jpg",
    format: "JPG · 1024×1024",
    aspect: "1/1",
    note: "Coarse Himalayan white & pink crystals, sharp macro facet definition.",
    copyContent: "Ultra-realistic macro photo of a small pile of coarse white and pink rock salt crystals, isolated on a plain pure white background, studio light, 4K."
  },
  {
    id: "ing-03",
    title: "Roasted Cumin (Jeera)",
    category: "ingredients",
    path: "/brand-assets/ingredients/roasted-cumin-jeera-macro.jpg",
    format: "JPG · 1024×1024",
    aspect: "1/1",
    note: "Fine seed ridges, toasted brown hues, isolated on pure white.",
    copyContent: "Ultra-realistic macro photo of a small heap of roasted cumin seeds (jeera), isolated on a plain pure white background, studio light, 4K."
  },
  {
    id: "ing-04",
    title: "Fresh Mint & Ice Cube",
    category: "ingredients",
    path: "/brand-assets/ingredients/mint-ice-cube-macro.jpg",
    format: "JPG · 1024×1024",
    aspect: "1/1",
    note: "Serrated aromatic mint leaves resting against a clear melting ice cube.",
    copyContent: "Ultra-realistic photo of two fresh mint leaves and one clear ice cube with water droplets, isolated on a plain pure white background, studio light, 4K."
  },

  // --- Product 3D Renders ---
  {
    id: "prod-09",
    title: "09 · Hero Bottle Classic A1",
    category: "products",
    path: "/brand-assets/creatives/09-hero-bottle-a1.jpg",
    format: "JPG · 896×1200",
    aspect: "4/5",
    note: "Chilled bottle standing on crushed ice with fresh lemon halves and rock salt on saffron orange.",
    copyContent: "Studio product photo of a small 250 ml clear PET bottle filled with a pale, slightly cloudy lemon-yellow drink, bright orange cap, plain cream wrap-around label, cold condensation droplets."
  },
  {
    id: "prod-10",
    title: "10 · Orthographic Views A4",
    category: "products",
    path: "/brand-assets/creatives/10-orthographic-views-a4.jpg",
    format: "JPG · 1200×896",
    aspect: "4/3",
    note: "Technical 4-angle packaging layout: front, side, 3/4 perspective, and top cap view.",
    copyContent: "Orthographic packaging engineering sheet for Taazu 250 ml PET beverage bottle."
  },
  {
    id: "prod-11",
    title: "11 · Jeera Masala Hero A2",
    category: "products",
    path: "/brand-assets/creatives/11-jeera-masala-a2.jpg",
    format: "JPG · 896×1200",
    aspect: "4/5",
    note: "Jeera Masala bottle with brown cap and roasted jeera mound on dark studio background.",
    copyContent: "Studio product photo of Taazu Jeera Masala 250 ml PET bottle with brown cap and cumin seeds."
  },
  {
    id: "prod-12",
    title: "12 · Both Flavours Duo Hero",
    category: "products",
    path: "/brand-assets/creatives/12-both-flavours-duo.png",
    format: "PNG · 1200×896",
    aspect: "4/3",
    note: "Transparent background master render featuring both Classic and Jeera bottles with ice and lemon props.",
    copyContent: "Taazu Duo Product Photo: Classic Nimbu Namak and Jeera Masala companion bottles."
  },
  {
    id: "prod-13",
    title: "13 · Flat Label Classic A5",
    category: "products",
    path: "/brand-assets/creatives/13-flat-label-classic-a5.jpg",
    format: "JPG · 1200×850",
    aspect: "4/3",
    note: "Full flat artwork reference for the 95 mm wrap-around Classic label.",
    copyContent: "Flat label artwork reference for Taazu Classic Nimbu Namak."
  },
  {
    id: "prod-14",
    title: "14 · Flat Label Jeera A5",
    category: "products",
    path: "/brand-assets/creatives/14-flat-label-jeera-a5.jpg",
    format: "JPG · 1200×850",
    aspect: "4/3",
    note: "Full flat artwork reference for the 95 mm wrap-around Jeera Masala label.",
    copyContent: "Flat label artwork reference for Taazu Jeera Masala."
  },

  // --- Social Posts ---
  {
    id: "soc-01",
    title: "01 · Paseena Sirf Paani Nahi",
    category: "social",
    path: "/brand-assets/creatives/01-paseena-sirf-paani-nahi.png",
    format: "PNG · 1080×1350",
    aspect: "4/5",
    note: "~1g sodium per litre of sweat · Baker 2017.",
    copyContent: "Paseena sirf paani nahi hota. Har litre paseene ke saath lagbhag 1 gram sodium bhi nikal jaata hai, aur plain paani woh wapas nahi deta. 💧🍋\nGarmi mein khelte ho ya kaam karte ho? Paani ke saath namak bhi wapas lo. Order: WhatsApp 91737 36652\nSource: Baker LB, Sports Medicine 2017.\n#Taazu #TaazuRaho #Amdavad #Ahmedabad #JoLogNahiJaante"
  },
  {
    id: "soc-02",
    title: "02 · Sirf 2% Kam",
    category: "social",
    path: "/brand-assets/creatives/02-sirf-2-percent.png",
    format: "PNG · 1080×1350",
    aspect: "4/5",
    note: "2% body water loss impairs stamina and cognitive focus · ACSM 2007.",
    copyContent: "Body ka sirf ~2% paani kam hua, aur stamina, focus, reaction time girne lagte hain. Aur pata bhi nahi chalta. 🔋\nSource: ACSM Position Stand, 2007.\n#Taazu #TaazuRaho #AhmedabadFitness #JoLogNahiJaante"
  },
  {
    id: "soc-03",
    title: "03 · Pyaas Late Lagti Hai",
    category: "social",
    path: "/brand-assets/creatives/03-pyaas-late-lagti-hai.png",
    format: "PNG · 1080×1350",
    aspect: "4/5",
    note: "Drink before thirst strikes in peak summer heat.",
    copyContent: "Pyaas lagi? Thoda late ho gaye. Garmi mein pyaas se pehle piyo, thoda-thoda, din bhar. ⏰\n#Taazu #TaazuRaho #Amdavad #Garmi"
  },
  {
    id: "soc-04",
    title: "04 · 44°C Amdavad (Gujarati)",
    category: "social",
    path: "/brand-assets/creatives/04-amdavad-44-degree-gujarati.png",
    format: "PNG · 1080×1350",
    aspect: "4/5",
    note: "Gujarati heat awareness post: Nimbu, namak ane thandak.",
    copyContent: "44°C. આ અમદાવાદ છે. 🌞\nગરમીમાં પણ તાજું. Nimbu, namak ane thandak.\n#Taazu #GarmiMaPanTaazu #Amdavad #Ahmedabad #Gujarat"
  },
  {
    id: "soc-05",
    title: "05 · Story: Paani vs Taazu",
    category: "social",
    path: "/brand-assets/creatives/05-story-paani-vs-taazu.png",
    format: "PNG · 1080×1920",
    aspect: "9/16",
    note: "Vertical 9:16 story for Instagram comparison polls and stickers.",
    copyContent: "Match ke baad tum kya peete ho? Paani vs Taazu Nimbu Namak! #Taazu"
  },
  {
    id: "soc-06",
    title: "06 · A4 Poster (Gym & Turf)",
    category: "social",
    path: "/brand-assets/creatives/06-poster-a4-gym-turf.png",
    format: "PNG · A4 300 DPI",
    aspect: "4/5",
    note: "Print ready A4 poster for gym reception counter standees with WhatsApp QR code.",
    copyContent: "Print on 300 gsm matte, laminate, place in acrylic standee at counter. WhatsApp QR opens direct chat."
  },
  {
    id: "soc-07",
    title: "07 · Navratri Garba Station",
    category: "social",
    path: "/brand-assets/creatives/07-navratri-garba-station.png",
    format: "PNG · 1080×1350",
    aspect: "4/5",
    note: "Garba ground station creative: 250 ml sirf ₹25.",
    copyContent: "Garba ki raat lambi hai. 💃🕺 Round ke beech mein ek chilled Taazu. Station dhoondo, 250 ml sirf ₹25, wapas circle mein.\n#Taazu #Navratri #Garba #Amdavad #TaazuRaho"
  },
  {
    id: "soc-08",
    title: "08 · Site Workers (Hindi)",
    category: "social",
    path: "/brand-assets/creatives/08-hindi-site-workers.png",
    format: "PNG · 1080×1350",
    aspect: "4/5",
    note: "B2B pitch for construction contractors, factory canteens, and outdoor crews.",
    copyContent: "धूप में काम? पसीने के साथ नमक भी जाता है। पानी पियो, नमक भी वापस लो, छाँव में थोड़ा आराम करो। Contractors aur canteens: sample ke liye WhatsApp karein 91737 36652.\n#Taazu #Ahmedabad"
  },

  // --- Print Labels ---
  {
    id: "lbl-01",
    title: "Classic Label (Print Ready)",
    category: "labels",
    path: "/brand-assets/labels/taazu-label-classic-print.png",
    format: "PNG · 300 DPI",
    aspect: "wide",
    note: "95 mm wrap-around sleeve with printer registration and bleed marks.",
    copyContent: "Taazu Classic Nimbu Namak 95 mm print label"
  },
  {
    id: "lbl-02",
    title: "Jeera Label (Print Ready)",
    category: "labels",
    path: "/brand-assets/labels/taazu-label-jeera-print.png",
    format: "PNG · 300 DPI",
    aspect: "wide",
    note: "95 mm wrap-around sleeve for Jeera Masala with bleed and crop lines.",
    copyContent: "Taazu Jeera Masala 95 mm print label"
  },
  {
    id: "lbl-03",
    title: "Classic Outlined Vector",
    category: "labels",
    path: "/brand-assets/labels/taazu-label-classic-outlined.svg",
    format: "SVG Vector",
    aspect: "wide",
    note: "Vector curves with all typography expanded to paths for press proofing.",
    copyContent: "Vector curves label artwork"
  },
  {
    id: "lbl-04",
    title: "Jeera Outlined Vector",
    category: "labels",
    path: "/brand-assets/labels/taazu-label-jeera-outlined.svg",
    format: "SVG Vector",
    aspect: "wide",
    note: "Vector curves with all typography expanded to paths for press proofing.",
    copyContent: "Vector curves label artwork"
  },

  // --- Logos ---
  {
    id: "logo-01",
    title: "Taazu 3D Glossy Icon C2",
    category: "logos",
    path: "/brand-assets/logos/taazu-logo-icon-white-c2.png",
    format: "PNG Transparent",
    aspect: "1/1",
    note: "High-resolution transparent drop icon with 3D lemon & ice cube inside.",
    copyContent: "Taazu glossy droplet icon"
  },
  {
    id: "logo-02",
    title: "Concept A Icon (Vector)",
    category: "logos",
    path: "/brand-assets/logos/concept-A-icon-color.png",
    format: "PNG · Transparent",
    aspect: "1/1",
    note: "Minimalist geometric water drop containing sliced lemon in brand saffron.",
    copyContent: "Taazu Concept A icon"
  },
  {
    id: "logo-03",
    title: "Concept A Stacked Color",
    category: "logos",
    path: "/brand-assets/logos/concept-A-stacked-color.png",
    format: "PNG · Transparent",
    aspect: "4/3",
    note: "Primary vertical logo mark with icon above the bold TAAZU wordmark.",
    copyContent: "Taazu Concept A stacked logo"
  },
  {
    id: "logo-04",
    title: "Wordmark Leaf",
    category: "logos",
    path: "/brand-assets/logos/wordmark-leaf.svg",
    format: "SVG Vector",
    aspect: "wide",
    note: "Crisp botanical leaf-green brand typography.",
    copyContent: "Taazu leaf wordmark"
  },
  {
    id: "logo-05",
    title: "Taazu Brand Seal",
    category: "logos",
    path: "/brand-assets/logos/seal-color.png",
    format: "PNG · Transparent",
    aspect: "1/1",
    note: "Heritage circular medallion seal with Gujarati and English typography.",
    copyContent: "Taazu heritage brand seal"
  }
];

export default function FolderAssetManager() {
  const [activeFolder, setActiveFolder] = useState<AssetCategory>("reels");
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [lightboxAsset, setLightboxAsset] = useState<AssetItem | null>(null);

  const filteredAssets = useMemo(() => {
    return ASSETS.filter(item => {
      const matchesFolder = item.category === activeFolder;
      const matchesSearch = !search || 
        item.title.toLowerCase().includes(search.toLowerCase()) || 
        item.note.toLowerCase().includes(search.toLowerCase()) ||
        item.format.toLowerCase().includes(search.toLowerCase());
      return matchesFolder && matchesSearch;
    });
  }, [activeFolder, search]);

  const handleCopy = (id: string, text?: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getAspectClass = (aspect: AssetItem["aspect"]) => {
    switch (aspect) {
      case "9/16": return "aspect-[9/16]";
      case "4/5": return "aspect-[4/5]";
      case "1/1": return "aspect-square";
      case "4/3": return "aspect-[4/3]";
      case "wide": return "aspect-[16/9]";
      default: return "aspect-square";
    }
  };

  return (
    <div className="space-y-5">
      {/* Folder Navigation Pills */}
      <Panel title="Brand Folders · Cheezein aur Files Category-wise">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {FOLDERS.map((f) => {
            const Icon = f.icon;
            const isActive = activeFolder === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => { setActiveFolder(f.id); setSearch(""); }}
                className={`flex flex-col items-start gap-1 rounded-2xl border p-3 text-left transition ${
                  isActive
                    ? "border-orange-500 bg-orange-50/70 text-orange-950 shadow-sm ring-2 ring-orange-200"
                    : "border-stone-200 bg-white hover:border-stone-300 text-stone-700"
                }`}
              >
                <div className="flex w-full items-center justify-between">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${
                    isActive ? "bg-orange-500 text-white" : "bg-stone-100 text-stone-600"
                  }`}>
                    <Icon size={16} />
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                    isActive ? "bg-orange-200/70 text-orange-900" : "bg-stone-100 text-stone-500"
                  }`}>
                    {f.count}
                  </span>
                </div>
                <div className="mt-1 text-xs font-bold leading-tight">{f.label}</div>
              </button>
            );
          })}
        </div>

        {/* Current Folder Info & Search */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-stone-200/80 pt-4">
          <div className="text-xs text-stone-500">
            <b>{FOLDERS.find(f => f.id === activeFolder)?.label}:</b> {FOLDERS.find(f => f.id === activeFolder)?.desc}
          </div>
          <div className="relative w-full max-w-xs">
            <Search size={14} className="absolute left-3 top-2.5 text-stone-400" />
            <input
              type="text"
              placeholder="Search files in folder…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-stone-200 bg-white py-1.5 pl-8 pr-3 text-xs outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
            />
          </div>
        </div>
      </Panel>

      {/* Special Banner for Reel 2 Storyboard */}
      {activeFolder === "reels" && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 p-4 text-white shadow-md">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">30s Video Campaign</span>
              <span className="text-xs text-orange-100 font-semibold">12 Frames Timeline</span>
            </div>
            <h3 className="mt-1 text-lg font-extrabold text-white">Reel 2: "Andar Kya Hai?" Storyboard</h3>
            <p className="text-xs text-orange-100">Full 9:16 vertical studio frames, motion cues, and Instagram safe zone guides.</p>
          </div>
          <a
            href="/brand-assets/reels/reel-2/index.html"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-xs font-bold text-orange-700 shadow-sm transition hover:bg-orange-50"
          >
            <ExternalLink size={14} /> Open Interactive Storyboard Sheet
          </a>
        </div>
      )}

      {/* Asset Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {filteredAssets.map((asset) => {
          return (
            <div
              key={asset.id}
              className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition hover:border-orange-300 hover:shadow-md"
            >
              <div>
                {/* Media Preview Box */}
                <div 
                  onClick={() => setLightboxAsset(asset)}
                  className={`relative cursor-pointer overflow-hidden bg-stone-900/5 ${getAspectClass(asset.aspect)} flex items-center justify-center p-2`}
                >
                  <img
                    src={asset.path}
                    alt={asset.title}
                    loading="lazy"
                    className="h-full w-full object-contain transition duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition group-hover:opacity-100">
                    <span className="flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-stone-900 shadow">
                      <Eye size={12} /> View Full
                    </span>
                  </div>
                  <span className="absolute bottom-2 left-2 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">
                    {asset.format}
                  </span>
                </div>

                {/* Content Info */}
                <div className="p-3">
                  <div className="text-xs font-bold text-stone-900 leading-tight">{asset.title}</div>
                  <p className="mt-1 line-clamp-2 text-[11px] text-stone-500 leading-relaxed">{asset.note}</p>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center gap-1.5 border-t border-stone-100 bg-stone-50/50 p-2.5">
                <a
                  href={asset.path}
                  download
                  target="_blank"
                  rel="noreferrer"
                  className="flex flex-1 items-center justify-center gap-1 rounded-xl border border-stone-200 bg-white py-1.5 text-[11px] font-semibold text-stone-700 shadow-sm transition hover:bg-stone-50 hover:text-stone-900"
                >
                  <Download size={12} /> File
                </a>
                {asset.copyContent && (
                  <button
                    type="button"
                    onClick={() => handleCopy(asset.id, asset.copyContent)}
                    className="flex flex-1 items-center justify-center gap-1 rounded-xl border border-stone-200 bg-white py-1.5 text-[11px] font-semibold text-stone-700 shadow-sm transition hover:bg-orange-50 hover:text-orange-700 hover:border-orange-200"
                  >
                    {copiedId === asset.id ? (
                      <>
                        <Check size={12} className="text-green-600" /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy size={12} /> {asset.category === "reels" ? "Prompt" : "Caption"}
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredAssets.length === 0 && (
        <div className="rounded-2xl border border-dashed border-stone-200 p-12 text-center">
          <Folder size={32} className="mx-auto text-stone-300" />
          <p className="mt-2 text-sm font-semibold text-stone-600">Is folder mein koi file match nahi hui</p>
          <button type="button" onClick={() => setSearch("")} className="mt-2 text-xs font-bold text-orange-600 hover:underline">
            Search clear karein
          </button>
        </div>
      )}

      {/* Fullscreen Lightbox Modal */}
      {lightboxAsset && (
        <div 
          onClick={() => setLightboxAsset(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md"
        >
          <button 
            type="button" 
            onClick={() => setLightboxAsset(null)}
            className="absolute right-4 top-4 rounded-full bg-white/20 p-2 text-white hover:bg-white/30"
          >
            <X size={20} />
          </button>
          
          <div 
            onClick={(e) => e.stopPropagation()} 
            className="flex max-h-[90vh] max-w-4xl flex-col items-center overflow-hidden rounded-2xl bg-stone-900 p-4 text-white shadow-2xl"
          >
            <div className="max-h-[75vh] w-full flex items-center justify-center overflow-hidden">
              <img
                src={lightboxAsset.path}
                alt={lightboxAsset.title}
                className="max-h-[72vh] max-w-full rounded-lg object-contain"
              />
            </div>
            <div className="mt-3 flex w-full flex-wrap items-center justify-between gap-3 border-t border-stone-800 pt-3">
              <div>
                <div className="text-sm font-bold">{lightboxAsset.title}</div>
                <div className="text-xs text-stone-400">{lightboxAsset.note}</div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={lightboxAsset.path}
                  download
                  className={`${btnPrimary} py-1.5 px-3 text-xs`}
                >
                  <Download size={14} /> Full Resolution
                </a>
                {lightboxAsset.copyContent && (
                  <button
                    type="button"
                    onClick={() => handleCopy(lightboxAsset.id, lightboxAsset.copyContent)}
                    className={`${btnGhost} py-1.5 px-3 text-xs text-white border-stone-700 hover:bg-stone-800`}
                  >
                    {copiedId === lightboxAsset.id ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                    {lightboxAsset.category === "reels" ? "Copy Prompt" : "Copy Caption"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

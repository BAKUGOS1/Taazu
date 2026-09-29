import { Download, Film, FolderOpen } from "lucide-react";
import { Panel, btnGhost, btnPrimary } from "../../../components/ui";

/* Finished files from brand-kit/creatives, served from public/creatives with the same folders. */
const VIDEO = "/creatives/video/taazu-reel-30s.mp4";

const FOLDERS = [
  {
    name: "social-posts",
    note: "Instagram posts, story, A4 poster aur Navratri post",
    files: [
      "01-paseena-sirf-paani-nahi.png", "02-sirf-2-percent.png", "03-pyaas-late-lagti-hai.png", "04-amdavad-44-degree-gujarati.png",
      "05-story-paani-vs-taazu.png", "06-poster-a4-gym-turf.png", "07-navratri-garba-station.png", "08-hindi-site-workers.png",
    ],
  },
  {
    name: "bottle-renders",
    note: "Gemini bottle renders aur technical drawing",
    files: ["09-hero-bottle-a1.jpg", "11-jeera-masala-a2.jpg", "12-both-flavours-duo.jpg", "10-orthographic-views-a4.jpg"],
  },
];

const label = (f: string) => f.replace(/^\d+-/, "").replace(/\.\w+$/, "").replace(/-/g, " ");

export default function ReadyFiles() {
  return (
    <div className="space-y-4">
      <Panel title="Promo video · Garmi ka Reset (30 sec, 9:16)" icon={Film}>
        <div>
          <div className="grid items-start gap-4 md:grid-cols-[320px_1fr]">
            <video src={VIDEO} poster="/creatives/video/taazu-reel-30s_poster.jpg" controls playsInline preload="metadata"
              className="mx-auto w-full max-w-[320px] rounded-2xl border border-stone-200 bg-black shadow-lg" style={{ aspectRatio: "9 / 16" }} />
            <div className="space-y-3 text-sm text-stone-600">
              <p>Amdavad 44° → garba night → gym, turf, site, traffic → boond aur splash → Classic Nimbu Namak → Jeera Masala → Rehydrate | Refresh | Recover → "Navratri stalls me milenge!"</p>
              <p className="text-xs text-stone-500">Music humara khud banaya hai (dhol, dandiya, shehnai tune), copyright ka issue nahi. Instagram par chaho to trending track laga sakte ho.</p>
              <div className="flex flex-wrap gap-2">
                <a className={btnPrimary} href={VIDEO} download="taazu-reel-30s.mp4"><Download size={16} />Download video</a>
                <a className={btnGhost} href="/creatives/video/taazu-reel-30s_storyboard.jpg" target="_blank" rel="noreferrer">Storyboard</a>
              </div>
              <p className="text-xs text-stone-500">Full quality file, 15 sec cut, music aur source code: repo mein <code>brand-kit/creatives/video/</code>.</p>
            </div>
          </div>
        </div>
      </Panel>

      {FOLDERS.map((f) => (
        <Panel key={f.name} title={`creatives/${f.name}`} icon={FolderOpen}>
          <div>
            <p className="mb-3 text-xs text-stone-500">{f.note}</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {f.files.map((file) => {
                const url = `/creatives/${f.name}/${file}`;
                return (
                  <a key={file} href={url} target="_blank" rel="noreferrer" className="group rounded-xl border border-stone-200 p-1.5 hover:border-orange-400">
                    <img src={url} alt={label(file)} loading="lazy" className="aspect-[4/5] w-full rounded-lg bg-stone-50 object-contain" />
                    <div className="mt-1 truncate px-1 text-[11px] font-semibold capitalize text-stone-700 group-hover:text-orange-700">{label(file)}</div>
                  </a>
                );
              })}
            </div>
          </div>
        </Panel>
      ))}
    </div>
  );
}

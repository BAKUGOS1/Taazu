/*
 * Fonts for the brand kit creatives. They are self-hosted (bundled from @fontsource) so the
 * creatives look the same offline, and so the exporter can embed them in the downloaded PNG.
 * Families get a "TZ" prefix to stay separate from the app's own Plus Jakarta Sans.
 */
import f0 from "@fontsource/baloo-bhai-2/files/baloo-bhai-2-latin-500-normal.woff2?url";
import f1 from "@fontsource/baloo-bhai-2/files/baloo-bhai-2-latin-ext-500-normal.woff2?url";
import f2 from "@fontsource/baloo-bhai-2/files/baloo-bhai-2-gujarati-500-normal.woff2?url";
import f3 from "@fontsource/baloo-bhai-2/files/baloo-bhai-2-latin-800-normal.woff2?url";
import f4 from "@fontsource/baloo-bhai-2/files/baloo-bhai-2-latin-ext-800-normal.woff2?url";
import f5 from "@fontsource/baloo-bhai-2/files/baloo-bhai-2-gujarati-800-normal.woff2?url";
import f6 from "@fontsource/baloo-2/files/baloo-2-latin-500-normal.woff2?url";
import f7 from "@fontsource/baloo-2/files/baloo-2-latin-ext-500-normal.woff2?url";
import f8 from "@fontsource/baloo-2/files/baloo-2-devanagari-500-normal.woff2?url";
import f9 from "@fontsource/baloo-2/files/baloo-2-latin-800-normal.woff2?url";
import f10 from "@fontsource/baloo-2/files/baloo-2-latin-ext-800-normal.woff2?url";
import f11 from "@fontsource/baloo-2/files/baloo-2-devanagari-800-normal.woff2?url";
import f12 from "@fontsource/plus-jakarta-sans/files/plus-jakarta-sans-latin-500-normal.woff2?url";
import f13 from "@fontsource/plus-jakarta-sans/files/plus-jakarta-sans-latin-ext-500-normal.woff2?url";
import f14 from "@fontsource/plus-jakarta-sans/files/plus-jakarta-sans-latin-700-normal.woff2?url";
import f15 from "@fontsource/plus-jakarta-sans/files/plus-jakarta-sans-latin-ext-700-normal.woff2?url";
import f16 from "@fontsource/plus-jakarta-sans/files/plus-jakarta-sans-latin-800-normal.woff2?url";
import f17 from "@fontsource/plus-jakarta-sans/files/plus-jakarta-sans-latin-ext-800-normal.woff2?url";

export type Face = { family: string; weight: number; url: string; range: string };
export const FACES: Face[] = [
  { family: "TZ Baloo Bhai", weight: 500, url: f0, range: "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD" },
  { family: "TZ Baloo Bhai", weight: 500, url: f1, range: "U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF" },
  { family: "TZ Baloo Bhai", weight: 500, url: f2, range: "U+0951-0952,U+0964-0965,U+0A80-0AFF,U+200C-200D,U+20B9,U+25CC,U+A830-A839" },
  { family: "TZ Baloo Bhai", weight: 800, url: f3, range: "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD" },
  { family: "TZ Baloo Bhai", weight: 800, url: f4, range: "U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF" },
  { family: "TZ Baloo Bhai", weight: 800, url: f5, range: "U+0951-0952,U+0964-0965,U+0A80-0AFF,U+200C-200D,U+20B9,U+25CC,U+A830-A839" },
  { family: "TZ Baloo", weight: 500, url: f6, range: "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD" },
  { family: "TZ Baloo", weight: 500, url: f7, range: "U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF" },
  { family: "TZ Baloo", weight: 500, url: f8, range: "U+0900-097F,U+1CD0-1CF9,U+200C-200D,U+20A8,U+20B9,U+20F0,U+25CC,U+A830-A839,U+A8E0-A8FF,U+11B00-11B09" },
  { family: "TZ Baloo", weight: 800, url: f9, range: "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD" },
  { family: "TZ Baloo", weight: 800, url: f10, range: "U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF" },
  { family: "TZ Baloo", weight: 800, url: f11, range: "U+0900-097F,U+1CD0-1CF9,U+200C-200D,U+20A8,U+20B9,U+20F0,U+25CC,U+A830-A839,U+A8E0-A8FF,U+11B00-11B09" },
  { family: "TZ Jakarta", weight: 500, url: f12, range: "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD" },
  { family: "TZ Jakarta", weight: 500, url: f13, range: "U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF" },
  { family: "TZ Jakarta", weight: 700, url: f14, range: "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD" },
  { family: "TZ Jakarta", weight: 700, url: f15, range: "U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF" },
  { family: "TZ Jakarta", weight: 800, url: f16, range: "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD" },
  { family: "TZ Jakarta", weight: 800, url: f17, range: "U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF" },
];

export const DISPLAY = '"TZ Baloo Bhai", "Baloo Bhai 2", system-ui, sans-serif';
export const HINDI = '"TZ Baloo", "Baloo 2", system-ui, sans-serif';
export const BODY = '"TZ Jakarta", "Plus Jakarta Sans", system-ui, sans-serif';

let loading: Promise<void> | null = null;
/** Registers the faces with the page and waits until they are ready to draw. */
export function loadFonts(): Promise<void> {
  if (!loading) {
    loading = Promise.all(
      FACES.map(async (f) => {
        const face = new FontFace(f.family, `url(${f.url}) format("woff2")`, { weight: String(f.weight), unicodeRange: f.range, display: "block" });
        document.fonts.add(face);
        await face.load().catch(() => undefined);
      }),
    ).then(() => undefined);
  }
  return loading;
}

let embedCss: Promise<string> | null = null;
const toDataUrl = (blob: Blob) => new Promise<string>((ok, fail) => { const r = new FileReader(); r.onload = () => ok(String(r.result)); r.onerror = fail; r.readAsDataURL(blob); });
/** @font-face rules with the files inlined, for html-to-image's fontEmbedCSS. */
export function fontEmbedCss(): Promise<string> {
  if (!embedCss) {
    embedCss = Promise.all(
      FACES.map(async (f) => {
        const data = await toDataUrl(await (await fetch(f.url)).blob());
        return `@font-face{font-family:"${f.family}";font-weight:${f.weight};font-style:normal;unicode-range:${f.range};src:url(${data}) format("woff2");}`;
      }),
    ).then((rules) => rules.join("\n"));
    embedCss.catch(() => { embedCss = null; });
  }
  return embedCss;
}

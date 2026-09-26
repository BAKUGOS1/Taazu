import appIcon from "../../brand-kit/logos/app-icon.svg?url";
import wordLeaf from "../../brand-kit/logos/wordmark-leaf.svg?url";
import wordCream from "../../brand-kit/logos/wordmark-cream.svg?url";
import lockupColor from "../../brand-kit/logos/lockup-color.svg?url";
import lockupCream from "../../brand-kit/logos/lockup-cream.svg?url";

/*
 * The Taazu logo everywhere in the app comes from brand-kit/logos (Nimbu Drop, concept A),
 * so a logo change there shows up in the header, login, QR survey and pitch at once.
 */

/** Orange rounded-square app icon with the Nimbu Drop. */
export function AppIcon({ className = "h-9 w-9", alt = "Taazu" }: { className?: string; alt?: string }) {
  return <img src={appIcon} alt={alt} className={`shrink-0 select-none ${className}`} draggable={false} />;
}

/** "taazu" wordmark only. Use tone="cream" on dark or orange backgrounds. */
export function Wordmark({ tone = "leaf", className = "h-5 w-auto" }: { tone?: "leaf" | "cream"; className?: string }) {
  return <img src={tone === "cream" ? wordCream : wordLeaf} alt="taazu" className={`select-none ${className}`} draggable={false} />;
}

/** Drop + "taazu" + તાજું. Use tone="cream" on dark or orange backgrounds. */
export function Lockup({ tone = "color", className = "h-10 w-auto" }: { tone?: "color" | "cream"; className?: string }) {
  return <img src={tone === "cream" ? lockupCream : lockupColor} alt="Taazu" className={`select-none ${className}`} draggable={false} />;
}

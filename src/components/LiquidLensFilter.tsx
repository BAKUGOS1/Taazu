/**
 * SVG displacement filter that gives the navigation lens real refraction.
 *
 * The filter samples a "lens map" — a squircle-shaped normal map generated on
 * a canvas at runtime — and pushes pixels outward near the rim while leaving
 * the centre clear, which is how the iOS glass lens reads. Red, green and blue
 * are displaced by slightly different amounts to produce the chromatic
 * fringing visible along the distorted edge.
 *
 * `feImage` + `feDisplacementMap` are plain SVG filter primitives (not
 * `backdrop-filter: url()`), so this path is available to WebKit as well as
 * Chromium. Where it is unsupported the filter simply renders nothing extra —
 * the lens keeps its CSS glass fill, so the failure mode is a flat blob rather
 * than a broken one.
 */
import { useEffect, useState } from 'react';

export const LENS_FILTER_ID = 'taazu-liquid-lens';

// Squircle falloff: no displacement through the middle, peaking just inside
// the rim and returning to zero outside it.
function rimProfile(t) {
  if (t >= 1 || t <= 0.5) return 0;
  const eased = (t - 0.5) / 0.5;
  return Math.sin(eased * Math.PI) ** 1.5;
}

function buildLensMap(size = 160) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d', { willReadFrequently: false });
  if (!ctx) return null;

  const image = ctx.createImageData(size, size);
  const half = size / 2;
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const nx = (x - half) / half;
      const ny = (y - half) / half;
      // Superellipse distance (n = 4) so the field matches the squircle shape.
      const t = Math.pow(Math.abs(nx) ** 4 + Math.abs(ny) ** 4, 0.25);
      const strength = rimProfile(t);
      const length = Math.hypot(nx, ny) || 1;
      const dx = (nx / length) * strength;
      const dy = (ny / length) * strength;
      const i = (y * size + x) * 4;
      image.data[i] = Math.round((dx * 0.5 + 0.5) * 255);
      image.data[i + 1] = Math.round((dy * 0.5 + 0.5) * 255);
      image.data[i + 2] = 128;
      image.data[i + 3] = 255;
    }
  }
  ctx.putImageData(image, 0, 0);
  return canvas.toDataURL('image/png');
}

export default function LiquidLensFilter() {
  const [mapUrl, setMapUrl] = useState(null);

  useEffect(() => {
    try {
      setMapUrl(buildLensMap());
    } catch {
      setMapUrl(null); // Canvas unavailable — callers fall back to flat glass.
    }
  }, []);

  if (!mapUrl) return null;

  return (
    <svg aria-hidden="true" focusable="false" className="taazu-lens-defs">
      <defs>
        <filter
          id={LENS_FILTER_ID}
          x="-12%"
          y="-12%"
          width="124%"
          height="124%"
          colorInterpolationFilters="sRGB"
        >
          <feImage href={mapUrl} preserveAspectRatio="none" result="lensMap" />
          {/* Each channel is displaced by a slightly different amount;
              recombining them leaves colour fringes where the displacement is
              strongest. The three scales stay close together on purpose — a
              wider spread separates into three visible copies instead of a
              fringe, which reads as blur. */}
          <feDisplacementMap in="SourceGraphic" in2="lensMap" scale="19" xChannelSelector="R" yChannelSelector="G" result="pushR" />
          <feDisplacementMap in="SourceGraphic" in2="lensMap" scale="17" xChannelSelector="R" yChannelSelector="G" result="pushG" />
          <feDisplacementMap in="SourceGraphic" in2="lensMap" scale="15" xChannelSelector="R" yChannelSelector="G" result="pushB" />
          <feColorMatrix in="pushR" type="matrix" result="onlyR"
            values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" />
          <feColorMatrix in="pushG" type="matrix" result="onlyG"
            values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" />
          <feColorMatrix in="pushB" type="matrix" result="onlyB"
            values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" />
          <feBlend in="onlyR" in2="onlyG" mode="screen" result="rg" />
          <feBlend in="rg" in2="onlyB" mode="screen" result="rgb" />
          {/* Restore the original coverage so the fringes do not wash the
              shape's alpha out. */}
          <feComposite in="rgb" in2="pushG" operator="in" />
        </filter>
      </defs>
    </svg>
  );
}

import { useMemo, useState } from "react";
import { resolveAsset } from "@/lib/resolveAsset";

export function AnnotatedScreenshot({
  assetId,
  alt,
  annotations,
}: {
  assetId: string;
  alt: string;
  annotations: string[];
}) {
  const resolved = resolveAsset(assetId);
  const screenSrc =
    resolved.asset?.type === "screenshot"
      ? `/assets/screens/${resolved.asset.filename}`
      : null;
  const placeholderSrc = resolved.src;

  const initial = useMemo(
    () => (resolved.isPlaceholder && screenSrc ? screenSrc : resolved.src),
    [resolved.isPlaceholder, resolved.src, screenSrc],
  );

  const [src, setSrc] = useState(initial);
  const [isPlaceholder, setIsPlaceholder] = useState(resolved.statusReady !== true);
  const labels = annotations.length ? annotations : resolved.asset?.annotations || [];

  return (
    <div>
      <div className="relative overflow-hidden rounded-xl border border-line bg-panel shadow-2xl shadow-black/40">
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className="block h-auto w-full"
          onLoad={() => {
            if (screenSrc && src === screenSrc) setIsPlaceholder(false);
          }}
          onError={() => {
            if (src !== placeholderSrc) {
              setSrc(placeholderSrc);
              setIsPlaceholder(true);
            }
          }}
        />
        {isPlaceholder ? (
          <p className="mono absolute top-3 right-3 rounded bg-canvas/80 px-2 py-1 text-[10px] text-faint">
            PLACEHOLDER — drop real WebP in public/assets/screens/
          </p>
        ) : null}
      </div>
      {labels.length ? (
        <ol className="mt-4 space-y-2">
          {labels.map((label, i) => (
            <li key={label}>
              <button
                type="button"
                className="flex w-full items-start gap-3 rounded-md border border-line px-3 py-2 text-left text-sm"
              >
                <span className="mono text-signal">{i + 1}</span>
                <span className="text-muted">{label}</span>
              </button>
            </li>
          ))}
        </ol>
      ) : null}
    </div>
  );
}

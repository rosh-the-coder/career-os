import manifest from "@manifest";

export type ManifestAsset = {
  id: string;
  type: string;
  filename: string;
  folder: string;
  placeholder?: string;
  status: string;
  caption?: string;
  annotations?: string[];
  route?: string | null;
};

const assets = (manifest as { assets: ManifestAsset[] }).assets;
const byId = new Map(assets.map((a) => [a.id, a]));

/** Resolve screenshot/animation URL. Prefer real screen file; fall back to designed placeholder. */
export function resolveAsset(id: string): {
  src: string;
  isPlaceholder: boolean;
  statusReady: boolean;
  asset?: ManifestAsset;
} {
  const asset = byId.get(id);
  if (!asset) {
    return { src: `/assets/placeholders/${id}.svg`, isPlaceholder: true, statusReady: false };
  }

  if (asset.type === "screenshot") {
    const ready = asset.status === "ready";
    if (ready) {
      return {
        src: `/assets/screens/${asset.filename}`,
        isPlaceholder: false,
        statusReady: true,
        asset,
      };
    }
    const stub = asset.filename.replace(/\.webp$/i, ".svg");
    return {
      src: `/assets/placeholders/${stub}`,
      isPlaceholder: true,
      statusReady: false,
      asset,
    };
  }

  if (asset.type === "animation" || asset.type === "diagram") {
    const file = asset.placeholder?.split("/").pop() || asset.filename;
    return {
      src: `/assets/placeholders/${file.replace(/\.json$/i, ".svg")}`,
      isPlaceholder: asset.status !== "ready",
      statusReady: asset.status === "ready",
      asset,
    };
  }

  return {
    src: `/assets/placeholders/${asset.filename}`,
    isPlaceholder: true,
    statusReady: false,
    asset,
  };
}

export function getAsset(id: string) {
  return byId.get(id);
}

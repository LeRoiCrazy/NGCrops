type CropDisplayConfig = {
  label: string;
  image?: string;
};

// Zone simple a maintenir: ajoutez ou modifiez ici les labels/images des crops.
const CROP_DISPLAY_MAP: Record<string, CropDisplayConfig> = {
  soybean: { label: "Soja" },
  sunflower: { label: "Tournesol" },
  oats: { label: "Avoine" },
  wheat: { label: "Ble" },
  barley: { label: "Orge" },
  corn: { label: "Mais" },
  rye: { label: "Seigle" },
  sorgho: { label: "Sorgho" },
  fonio: { label: "Fonio" },
  kamut: { label: "Kamut" },
  arcticoats: { label: "Avoine Arctique" },
  glazedspelt: { label: "Epeautre Glace" },
};

function fallbackLabel(cropKey: string) {
  const withSpaces = cropKey
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .trim();

  if (withSpaces.length === 0) {
    return "Crop inconnue";
  }

  return withSpaces
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

export function getCropDisplayConfig(cropKey: string): CropDisplayConfig {
  return CROP_DISPLAY_MAP[cropKey] ?? { label: fallbackLabel(cropKey) };
}
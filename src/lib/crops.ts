type CropDisplayConfig = {
  label: string;
  image?: string;
};

// Zone simple a maintenir: ajoutez ou modifiez ici les labels/images des crops.
const CROP_DISPLAY_MAP: Record<string, CropDisplayConfig> = {
  soybean: { label: "Soja", image: "/images/soja.png" },
  sunflower: { label: "Tournesol", image: "/images/sunflower.png" },
  oats: { label: "Avoine", image: "/images/avoine.png" },
  wheat: { label: "Ble", image: "/images/ble.png" },
  barley: { label: "Orge", image: "/images/orge.png" },
  corn: { label: "Mais", image: "/images/mais.png" },
  rye: { label: "Seigle", image: "/images/seigle.png" },
  sorgho: { label: "Sorgho (O.G.M)", image: "/images/sorgho.png" },
  fonio: { label: "Fonio (O.G.M)", image: "/images/fonio.png" },
  kamut: { label: "Kamut (O.G.M)", image: "/images/kamut.png" },
  arcticoats: { label: "Avoine Arctique (Edora)", image: "/images/avoinearctique.png" },
  glazedspelt: { label: "Épaufre glacé (Edora)", image: "/images/epaufre.png" },
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
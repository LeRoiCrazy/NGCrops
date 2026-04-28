type CropDisplayConfig = {
  label: string;
  image?: string;
};

const CHART_COLORS = [
  "#38bdf8",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
  "#a78bfa",
  "#14b8a6",
  "#fb7185",
  "#84cc16",
  "#f97316",
  "#06b6d4",
  "#8b5cf6",
  "#eab308",
];

const CROP_COLOR_MAP: Record<string, string> = {
  soybean: "#22c55e",
  sunflower: "#f59e0b",
  oats: "#38bdf8",
  wheat: "#eab308",
  barley: "#14b8a6",
  corn: "#f97316",
  rye: "#a78bfa",
  sorgho: "#ef4444",
  fonio: "#84cc16",
  kamut: "#8b5cf6",
  arcticoats: "#06b6d4",
  glazedspelt: "#fb7185",
};

export type CropOption = {
  value: string;
  label: string;
  image?: string;
};

export type CropOptionGroup = {
  label: string;
  options: CropOption[];
};

// Zone simple a maintenir: ajoutez ou modifiez ici les labels/images des crops.
const CROP_DISPLAY_MAP: Record<string, CropDisplayConfig> = {
  soybean: { label: "Soja", image: "/images/soja.png" },
  sunflower: { label: "Tournesol", image: "/images/sunflower.png" },
  oats: { label: "Avoine", image: "/images/avoine.png" },
  wheat: { label: "Blé", image: "/images/ble.png" },
  barley: { label: "Orge", image: "/images/orge.png" },
  corn: { label: "Maïs", image: "/images/mais.png" },
  rye: { label: "Seigle", image: "/images/seigle.png" },
  sorgho: { label: "Sorgho", image: "/images/sorgho.png" },
  fonio: { label: "Fonio", image: "/images/fonio.png" },
  kamut: { label: "Kamut", image: "/images/kamut.png" },
  arcticoats: { label: "Avoine arctique", image: "/images/avoinearctique.png" },
  glazedspelt: { label: "Épaufre glacé", image: "/images/epaufre.png" },
};

const CROP_OPTION_GROUPS: CropOptionGroup[] = [
  {
    label: "Classique",
    options: [
      { value: "wheat", label: "Blé", image: "/images/ble.png" },
      { value: "oats", label: "Avoine", image: "/images/avoine.png" },
      { value: "corn", label: "Maïs", image: "/images/mais.png" },
      { value: "barley", label: "Orge", image: "/images/orge.png" },
      { value: "rye", label: "Seigle", image: "/images/seigle.png" },
      { value: "soybean", label: "Soja", image: "/images/soja.png" },
      { value: "sunflower", label: "Tournesol", image: "/images/sunflower.png" },
    ],
  },
  {
    label: "Edora",
    options: [
      { value: "arcticoats", label: "Avoine arctique", image: "/images/avoinearctique.png" },
      { value: "glazedspelt", label: "Épaufre glacé", image: "/images/epaufre.png" },
    ],
  },
  {
    label: "O.G.M",
    options: [
      { value: "fonio", label: "Fonio", image: "/images/fonio.png" },
      { value: "kamut", label: "Kamut", image: "/images/kamut.png" },
      { value: "sorgho", label: "Sorgho", image: "/images/sorgho.png" },
    ],
  },
];

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

export function getCropOptions(): CropOption[] {
  return Object.entries(CROP_DISPLAY_MAP)
    .map(([value, config]) => ({
      value,
      label: config.label,
      image: config.image,
    }))
    .sort((a, b) => a.label.localeCompare(b.label, "fr"));
}

export function getGroupedCropOptions(): CropOptionGroup[] {
  return CROP_OPTION_GROUPS;
}

function hashCropKey(cropKey: string) {
  let hash = 0;
  for (let index = 0; index < cropKey.length; index += 1) {
    hash = (hash << 5) - hash + cropKey.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getCropChartColor(cropKey: string): string {
  const definedColor = CROP_COLOR_MAP[cropKey];

  if (definedColor) {
    return definedColor;
  }

  return CHART_COLORS[hashCropKey(cropKey) % CHART_COLORS.length];
}
import { promises as fs } from "fs";
import path from "path";

export interface CropImageValidation {
  crop: string;
  imagePath: string;
  exists: boolean;
  error?: string;
}

/**
 * Validate that all configured crop images exist in the public directory.
 * This should be called during the build process.
 */
export async function validateCropImages(): Promise<{
  valid: boolean;
  results: CropImageValidation[];
  errors: string[];
}> {
  const cropConfig = {
    soybean: "/images/soja.png",
    sunflower: "/images/sunflower.png",
    oats: "/images/avoine.png",
    wheat: "/images/ble.png",
    barley: "/images/orge.png",
    corn: "/images/mais.png",
    rye: "/images/seigle.png",
    sorgho: "/images/sorgho.png",
    fonio: "/images/fonio.png",
  };

  const results: CropImageValidation[] = [];
  const errors: string[] = [];
  const projectRoot = process.cwd();

  for (const [crop, imagePath] of Object.entries(cropConfig)) {
    const fullPath = path.join(projectRoot, "public", imagePath);
    
    try {
      await fs.access(fullPath);
      results.push({
        crop,
        imagePath,
        exists: true,
      });
    } catch {
      const error = `Image missing for crop "${crop}": ${imagePath}`;
      errors.push(error);
      results.push({
        crop,
        imagePath,
        exists: false,
        error,
      });
      console.warn(`[CropImageValidation] ${error}`);
    }
  }

  const valid = errors.length === 0;

  return {
    valid,
    results,
    errors,
  };
}

/**
 * Log crop image validation results
 */
export function logCropImageValidation(
  validation: Awaited<ReturnType<typeof validateCropImages>>
): void {
  console.log(
    `[CropImages] Validated ${validation.results.length} crops, ${validation.results.filter((r) => r.exists).length} OK, ${validation.errors.length} missing`
  );

  if (!validation.valid) {
    console.warn("[CropImages] Some images are missing. This may cause broken images in production:");
    validation.errors.forEach((err) => console.warn(`  - ${err}`));
  }
}

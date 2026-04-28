"use client";

import { useState, useCallback } from "react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { CropMarketItem } from "@/types/market";

type CropFilterProps = {
  items: CropMarketItem[];
  selectedCrops: string[];
  onSelectionChange: (cropKeys: string[]) => void;
};

export function CropFilter({ items, selectedCrops, onSelectionChange }: CropFilterProps) {
  const allCropKeys = items.map((item) => item.cropKey);
  const isAllSelected = selectedCrops.length === allCropKeys.length;

  const toggleCrop = useCallback(
    (cropKey: string) => {
      const updated = selectedCrops.includes(cropKey)
        ? selectedCrops.filter((k) => k !== cropKey)
        : [...selectedCrops, cropKey];
      onSelectionChange(updated);
    },
    [selectedCrops, onSelectionChange],
  );

  const toggleAll = useCallback(() => {
    onSelectionChange(isAllSelected ? [] : allCropKeys);
  }, [isAllSelected, allCropKeys, onSelectionChange]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground hover:bg-accent">
        🌾 Cereales ({selectedCrops.length}/{allCropKeys.length})
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel>Filtrer par cereales</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuCheckboxItem
          checked={isAllSelected}
          onCheckedChange={toggleAll}
          className="font-medium"
        >
          Selectionner tous
        </DropdownMenuCheckboxItem>
        
        <DropdownMenuSeparator />

        {items.map((item) => (
          <DropdownMenuCheckboxItem
            key={item.cropKey}
            checked={selectedCrops.includes(item.cropKey)}
            onCheckedChange={() => toggleCrop(item.cropKey)}
          >
            {item.cropLabel || item.cropKey}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

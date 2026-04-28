"use client";

import { useState, useCallback } from "react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getGroupedCropOptions } from "@/lib/crops";
import type { CropMarketItem } from "@/types/market";

type CropFilterProps = {
  items: CropMarketItem[];
  selectedCrops: string[];
  onSelectionChange: (cropKeys: string[]) => void;
};

export function CropFilter({ items, selectedCrops, onSelectionChange }: CropFilterProps) {
  const cropGroups = getGroupedCropOptions();
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
        <DropdownMenuGroup>
          <DropdownMenuLabel>Filtrer par cereales</DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        
        <DropdownMenuCheckboxItem
          checked={isAllSelected}
          onCheckedChange={toggleAll}
          className="font-medium"
        >
          Selectionner tous
        </DropdownMenuCheckboxItem>
        
        <DropdownMenuSeparator />

        {cropGroups.map((group, groupIndex) => (
          <DropdownMenuGroup key={group.label}>
            <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground uppercase">
              {group.label}
            </DropdownMenuLabel>
            {group.options.map((cropOption) => {
              const item = items.find((i) => i.cropKey === cropOption.value);
              if (!item) return null;
              
              return (
                <DropdownMenuCheckboxItem
                  key={cropOption.value}
                  checked={selectedCrops.includes(cropOption.value)}
                  onCheckedChange={() => toggleCrop(cropOption.value)}
                >
                  {cropOption.label}
                </DropdownMenuCheckboxItem>
              );
            })}
            {groupIndex < cropGroups.length - 1 && <DropdownMenuSeparator />}
          </DropdownMenuGroup>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

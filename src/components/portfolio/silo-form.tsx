"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { getGroupedCropOptions } from "@/lib/crops";

const cropGroups = getGroupedCropOptions();

export function SiloForm() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cropName, setCropName] = useState("");
  const [quantité, setQuantité] = useState("");
  const [prixAchat, setPrixAchat] = useState("");
  const [dateAchat, setDateAchat] = useState<Date | undefined>(new Date());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/portfolio/silos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cropName,
          quantité: Number(quantité),
          prixAchat: Number(prixAchat),
          dateAchat: dateAchat ? format(dateAchat, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Erreur lors de l'ajout du silo");
      }

      // Reset form
      setCropName("");
      setQuantité("");
      setPrixAchat("");
      setDateAchat(new Date());
      setIsOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger render={<Button type="button">Ajouter un silo</Button>} />
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>Ajouter un nouveau silo</DialogTitle>
        </DialogHeader>
        <Separator className="my-2" />
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="crop" className="text-sm font-medium">
              Céréale
            </label>
            <Select value={cropName} onValueChange={(value) => setCropName(value ?? "")}>
              <SelectTrigger className="w-full" id="crop">
                <SelectValue placeholder="Sélectionne une céréale" />
              </SelectTrigger>
              <SelectContent>
                {cropGroups.map((group, groupIndex) => (
                  <SelectGroup key={group.label}>
                    <SelectLabel>{group.label}</SelectLabel>
                    {group.options.map((crop) => (
                      <SelectItem key={crop.value} value={crop.value}>
                        {crop.label}
                      </SelectItem>
                    ))}
                    {groupIndex < cropGroups.length - 1 && <SelectSeparator />}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label htmlFor="quantité" className="text-sm font-medium">
              Quantité (silos)
            </label>
            <Input
              id="quantité"
              type="number"
              min="1"
              step="0.01"
              value={quantité}
              onChange={(e) => setQuantité(e.target.value)}
              placeholder="Ex: 100"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="prixAchat" className="text-sm font-medium">
              Prix d'achat par silo ($)
            </label>
            <Input
              id="prixAchat"
              type="number"
              min="0.01"
              step="0.01"
              value={prixAchat}
              onChange={(e) => setPrixAchat(e.target.value)}
              placeholder="Ex: 250.50"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="dateAchat" className="text-sm font-medium">
              Date d'achat
            </label>
            <Popover>
                <PopoverTrigger
                  render={
                    <Button
                      type="button"
                      variant="outline"
                      id="dateAchat"
                      className="w-full justify-start text-left font-normal"
                    >
                      {dateAchat ? format(dateAchat, "PPP", { locale: fr }) : <span>Choisir une date</span>}
                    </Button>
                  }
                />
                <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  className="rounded-lg border"
                  captionLayout="dropdown"
                  locale={fr}
                  mode="single"
                  selected={dateAchat}
                  onSelect={setDateAchat}
                  defaultMonth={dateAchat}
                  disabled={{ after: new Date() }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded p-3">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button
              type="submit"
              disabled={isLoading || !cropName || !quantité || !prixAchat}
              className="flex-1"
            >
              {isLoading ? "Ajout..." : "Ajouter"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="flex-1"
            >
              Annuler
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

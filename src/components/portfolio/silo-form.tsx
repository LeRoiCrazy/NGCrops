"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

const CROPS = ["Blé", "Maïs", "Orge", "Soja", "Riz", "Avoine"];

interface SiloFormProps {
  onSubmit: (data: {
    cropName: string;
    quantité: number;
    prixAchat: number;
    dateAchat: Date;
  }) => Promise<void>;
}

export function SiloForm({ onSubmit }: SiloFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [cropName, setCropName] = useState("");
  const [quantité, setQuantité] = useState("");
  const [prixAchat, setPrixAchat] = useState("");
  const [dateAchat, setDateAchat] = useState(
    new Date().toISOString().split("T")[0]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await onSubmit({
        cropName,
        quantité: Number(quantité),
        prixAchat: Number(prixAchat),
        dateAchat: new Date(dateAchat),
      });

      // Reset form
      setCropName("");
      setQuantité("");
      setPrixAchat("");
      setDateAchat(new Date().toISOString().split("T")[0]);
      setIsOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger>
        <Button>Ajouter un silo</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Ajouter un nouveau silo</DialogTitle>
        </DialogHeader>
        <Separator className="my-2" />
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="crop" className="text-sm font-medium">
              Céréale
            </label>
            <select
              id="crop"
              value={cropName}
              onChange={(e) => setCropName(e.target.value)}
              className="flex w-full rounded-md border border-input bg-input/20 px-2 py-1.5 text-xs/relaxed outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:opacity-50 dark:bg-input/30"
              required
            >
              <option value="">Sélectionne une céréale</option>
              {CROPS.map((crop) => (
                <option key={crop} value={crop}>
                  {crop}
                </option>
              ))}
            </select>
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
            <Input
              id="dateAchat"
              type="date"
              value={dateAchat}
              onChange={(e) => setDateAchat(e.target.value)}
            />
          </div>

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

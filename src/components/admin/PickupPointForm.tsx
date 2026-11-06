"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  createPickupPoint,
  updatePickupPoint,
} from "@/actions/pickup-points";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  initial?: {
    id: string;
    name: string;
    address: string;
    description: string;
    mapEmbedUrl: string;
    active: boolean;
  };
};

export function PickupPointForm({ initial }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState(initial?.name ?? "");
  const [address, setAddress] = useState(initial?.address ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [mapEmbedUrl, setMapEmbedUrl] = useState(initial?.mapEmbedUrl ?? "");
  const [active, setActive] = useState(initial?.active ?? true);

  function resetCreateForm() {
    setName("");
    setAddress("");
    setDescription("");
    setMapEmbedUrl("");
    setActive(true);
    setError(null);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const payload = {
      name,
      address,
      description,
      mapEmbedUrl,
      active,
    };

    startTransition(async () => {
      const result = initial
        ? await updatePickupPoint({ ...payload, id: initial.id })
        : await createPickupPoint(payload);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      if (initial) {
        router.push("/admin/puntos-retiro");
        router.refresh();
      } else {
        resetCreateForm();
        router.refresh();
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="pickup-name">Nombre</Label>
        <Input
          id="pickup-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Local Oro Verde"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="pickup-address">Dirección</Label>
        <Input
          id="pickup-address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Calle y número, ciudad"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="pickup-desc">Nota (opcional)</Label>
        <Textarea
          id="pickup-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          placeholder="Horarios, referencia, etc."
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="pickup-map">Mapa de Google</Label>
        <Textarea
          id="pickup-map"
          value={mapEmbedUrl}
          onChange={(e) => setMapEmbedUrl(e.target.value)}
          rows={4}
          required
          placeholder='Pegá el iframe de “Insertar un mapa” o la URL …/maps/embed?…'
          className="font-mono text-xs"
        />
        <p className="text-xs text-muted-foreground">
          En Google Maps: Compartir → Insertar un mapa → copiar HTML.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Switch
          id="pickup-active"
          checked={active}
          onCheckedChange={setActive}
        />
        <Label htmlFor="pickup-active">Visible en la home</Label>
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button type="submit" disabled={pending}>
        {pending ? (
          <>
            <Spinner />
            Guardando…
          </>
        ) : initial ? (
          "Guardar"
        ) : (
          "Agregar punto"
        )}
      </Button>
    </form>
  );
}

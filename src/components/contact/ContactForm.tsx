"use client";

import { useState, useTransition } from "react";

import { updateMyContact } from "@/actions/contact";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";

type Props = {
  initial: {
    contactName: string;
    contactPhone: string;
    contactEmail: string;
  };
};

export function ContactForm({ initial }: Props) {
  const [pending, startTransition] = useTransition();
  const [name, setName] = useState(initial.contactName);
  const [phone, setPhone] = useState(initial.contactPhone);
  const [email, setEmail] = useState(initial.contactEmail);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);

    startTransition(async () => {
      const result = await updateMyContact({
        contactName: name,
        contactPhone: phone,
        contactEmail: email,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setMessage("Datos guardados");
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="my-name">
          Nombre <span className="text-destructive">*</span>
        </Label>
        <Input
          id="my-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="my-phone">
          Teléfono <span className="text-destructive">*</span>
        </Label>
        <Input
          id="my-phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          autoComplete="tel"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="my-email">
          Email{" "}
          <span className="font-normal text-muted-foreground">(opcional)</span>
        </Label>
        <Input
          id="my-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {message ? <p className="text-sm text-primary">{message}</p> : null}
      <Button type="submit" disabled={pending}>
        {pending ? (
          <>
            <Spinner />
            Guardando…
          </>
        ) : (
          "Guardar datos"
        )}
      </Button>
    </form>
  );
}

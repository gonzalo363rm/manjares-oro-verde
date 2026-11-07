"use client";

import { useState } from "react";
import { IoCheckmark, IoShareOutline } from "react-icons/io5";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  name: string;
  url: string;
  className?: string;
  size?: "sm" | "icon" | "default";
  variant?: "outline" | "ghost" | "secondary";
  label?: string;
};

export function ShareProductButton({
  name,
  url,
  className,
  size = "icon",
  variant = "outline",
  label,
}: Props) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ title: name, text: name, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // usuario canceló share o clipboard bloqueado
    }
  }

  return (
    <Button
      type="button"
      size={size}
      variant={variant}
      className={cn("rounded-full", className)}
      onClick={handleShare}
      aria-label={copied ? "Enlace copiado" : `Compartir ${name}`}
    >
      {copied ? (
        <IoCheckmark className="size-4" aria-hidden />
      ) : (
        <IoShareOutline className="size-4" aria-hidden />
      )}
      {label ? <span className="ml-1.5">{copied ? "Copiado" : label}</span> : null}
    </Button>
  );
}

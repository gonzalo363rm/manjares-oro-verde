"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

import {
  clearScrollToSection,
  peekScrollToSection,
  SCROLL_TO_QUERY,
  scrollToSection,
} from "@/lib/scroll-to-section";

const MAX_ATTEMPTS = 60;

/** Tras navegar a `/` (o cargar con hash/?to=), hace scroll suave a la sección. */
export function HomeScrollToSection() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const toParam = searchParams.get(SCROLL_TO_QUERY);
  const scrolledFor = useRef<string | null>(null);

  useEffect(() => {
    const fromHash = window.location.hash.replace(/^#/, "") || null;
    const id = toParam || peekScrollToSection() || fromHash;
    if (!id) return;
    if (scrolledFor.current === id) return;

    window.scrollTo(0, 0);

    let cancelled = false;
    let attempt = 0;
    let raf = 0;

    const finish = () => {
      scrolledFor.current = id;
      clearScrollToSection();
      if (toParam) {
        router.replace(`/#${id}`, { scroll: false });
      } else {
        window.history.replaceState(null, "", `/#${id}`);
      }
    };

    const tryScroll = () => {
      if (cancelled) return;
      if (scrollToSection(id)) {
        finish();
        return;
      }
      attempt += 1;
      if (attempt >= MAX_ATTEMPTS) {
        clearScrollToSection();
        return;
      }
      raf = window.requestAnimationFrame(tryScroll);
    };

    raf = window.requestAnimationFrame(tryScroll);

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(raf);
    };
  }, [toParam, router]);

  return null;
}

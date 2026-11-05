"use client";

import { useEffect, useRef, useState } from "react";

type RevealFrom = "up" | "left" | "right";

type Props = {
  children: React.ReactNode;
  className?: string;
  delayMs?: number;
  from?: RevealFrom;
};

/** Scroll reveal: fade + translate desde arriba, izquierda o derecha. */
export function Reveal({
  children,
  className = "",
  delayMs = 0,
  from = "up",
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.2, rootMargin: "0px 0px -48px 0px" }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal reveal--${from} ${visible ? "is-visible" : ""} ${className}`}
      style={delayMs ? { transitionDelay: `${delayMs}ms` } : undefined}
    >
      {children}
    </div>
  );
}

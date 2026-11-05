"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ComponentProps, MouseEvent } from "react";

import {
  requestScrollToSection,
  SCROLL_TO_QUERY,
  scrollToSection,
} from "@/lib/scroll-to-section";

type Props = Omit<ComponentProps<typeof Link>, "href"> & {
  sectionId: string;
};

export function ScrollToSectionLink({
  sectionId,
  onClick,
  ...props
}: Props) {
  const pathname = usePathname();
  const router = useRouter();

  function handleClick(e: MouseEvent<HTMLAnchorElement>) {
    onClick?.(e);
    if (e.defaultPrevented) return;
    e.preventDefault();

    if (pathname === "/") {
      scrollToSection(sectionId);
      window.history.replaceState(null, "", `/#${sectionId}`);
      return;
    }

    requestScrollToSection(sectionId);
    // Query param sobrevive remounts (Strict Mode) y el soft-nav desde /admin
    router.push(`/?${SCROLL_TO_QUERY}=${encodeURIComponent(sectionId)}`);
  }

  return (
    <Link href={`/#${sectionId}`} onClick={handleClick} {...props} />
  );
}

"use client";

import Link from "next/link";

type Tab = { href: string; label: string; active: boolean };

type Props = {
  tabs: Tab[];
  onNavigate?: (href: string) => void;
};

export function CategoryTabs({ tabs, onNavigate }: Props) {
  return (
    <nav
      aria-label="Categorías"
      className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1"
    >
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className="site-nav-link site-nav-link--desktop shrink-0 px-3 py-2"
          aria-current={tab.active ? "page" : undefined}
          onClick={() => onNavigate?.(tab.href)}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}

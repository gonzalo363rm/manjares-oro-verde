import Link from "next/link";

type Tab = { href: string; label: string; active: boolean };

export function CategoryTabs({ tabs }: { tabs: Tab[] }) {
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
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}

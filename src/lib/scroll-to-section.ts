export const SCROLL_TO_SECTION_KEY = "manjares-scroll-to";
export const SCROLL_TO_QUERY = "to";

export function requestScrollToSection(id: string) {
  try {
    sessionStorage.setItem(SCROLL_TO_SECTION_KEY, id);
  } catch {
    // ignore
  }
}

export function peekScrollToSection(): string | null {
  try {
    return sessionStorage.getItem(SCROLL_TO_SECTION_KEY);
  } catch {
    return null;
  }
}

export function clearScrollToSection() {
  try {
    sessionStorage.removeItem(SCROLL_TO_SECTION_KEY);
  } catch {
    // ignore
  }
}

export function scrollToSection(id: string): boolean {
  const el = document.getElementById(id);
  if (!el) return false;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
  return true;
}

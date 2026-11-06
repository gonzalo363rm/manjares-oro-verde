import { GoogleAnalytics as NextGoogleAnalytics } from "@next/third-parties/google";

const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim();

/** GA4 — solo se monta si hay `NEXT_PUBLIC_GA_MEASUREMENT_ID`. */
export function GoogleAnalytics() {
  if (!gaId || !gaId.startsWith("G-")) return null;
  return <NextGoogleAnalytics gaId={gaId} />;
}

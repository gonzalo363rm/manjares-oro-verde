import { DM_Sans, Inter, Montserrat_Alternates, DM_Serif_Display } from "next/font/google";

export const inter = Inter({ subsets: ["latin"] });

export const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

export const titleFont = DM_Serif_Display({
  style: ["italic"],
  subsets: ["latin", "latin-ext"],
  weight: ["400"],
});

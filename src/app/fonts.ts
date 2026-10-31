import { Cormorant_Garamond, DM_Sans } from "next/font/google";

export const headingFont = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["500", "600"],
  display: "swap",
});

export const bodyFont = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const fontVariables = `${headingFont.variable} ${bodyFont.variable}`;

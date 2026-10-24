import type { Metadata, Viewport } from "next";
import { Caveat, Nunito_Sans } from "next/font/google";
import CleanKitchenUltimate from "./CleanKitchenUltimate";
import "../components/clean-ui.css";

const nunitoSans = Nunito_Sans({
  subsets: ["latin"],
  variable: "--font-nunito",
  display: "swap",
});

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-caveat",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Clean Kitchen Ultimate – Nora Kitchen",
  description:
    "4,000+ recipe ideas, smart kitchen tools and 10 premium guides.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#fbfaf9",
};

export default function Page() {
  return (
    <div className={`nkw flex-1 ${nunitoSans.variable} ${caveat.variable}`}>
      <CleanKitchenUltimate />
    </div>
  );
}

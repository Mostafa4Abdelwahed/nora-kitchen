import type { Metadata, Viewport } from "next";
import { Caveat, Nunito_Sans } from "next/font/google";
import CleanBakeApp from "./CleanBakeApp";
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
  title: "Clean Bake App – Nora Kitchen",
  description:
    "400 recipes, portion calculator, grocery list and premium bonuses.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#fbfaf9",
};

export default function Page() {
  return (
    <div className={`nkw flex-1 ${nunitoSans.variable} ${caveat.variable}`}>
      <CleanBakeApp />
    </div>
  );
}

import type { Metadata, Viewport } from "next";
import { Caveat, Nunito_Sans } from "next/font/google";
import CleanCakesApp from "./CleanCakesApp";
import "./styles.css";

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
  title: "Clean Cakes App – Nora Kitchen",
  description:
    "410 complete sugar-free baking recipes plus premium bonus guides.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#fbfaf9",
};

export default function Page() {
  return (
    <div className={`cc flex-1 ${nunitoSans.variable} ${caveat.variable}`}>
      <CleanCakesApp />
    </div>
  );
}

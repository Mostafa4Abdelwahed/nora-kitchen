import type { Metadata } from "next";
import { DM_Sans, Playfair_Display } from "next/font/google";
import CleanCakesApp from "./CleanCakesApp";
import "./styles.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Clean Cakes App – Nora Kitchen",
  description:
    "410 complete sugar-free baking recipes plus premium bonus guides.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <div className={`cc flex-1 ${dmSans.variable} ${playfairDisplay.variable}`}>
      <CleanCakesApp />
    </div>
  );
}

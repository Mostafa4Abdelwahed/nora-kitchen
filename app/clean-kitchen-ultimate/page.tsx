import type { Metadata, Viewport } from "next";
import CleanKitchenUltimate from "./CleanKitchenUltimate";
import "./styles.css";

export const metadata: Metadata = {
  title: "Clean Kitchen Ultimate – Nora Kitchen",
  description:
    "4,000+ recipe ideas, smart kitchen tools and 10 premium guides.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#0d6e39",
};

export default function Page() {
  return (
    <div className="cku flex-1">
      <CleanKitchenUltimate />
    </div>
  );
}

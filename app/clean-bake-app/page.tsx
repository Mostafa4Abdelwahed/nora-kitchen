import type { Metadata } from "next";
import CleanBakeApp from "./CleanBakeApp";
import "./styles.css";

export const metadata: Metadata = {
  title: "Clean Bake App – Nora Kitchen",
  description:
    "400 recipes, portion calculator, grocery list and premium bonuses.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <div className="cb flex-1">
      <CleanBakeApp />
    </div>
  );
}

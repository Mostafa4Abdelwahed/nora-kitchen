"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS: { href: string; label: string }[] = [
  { href: "/clean-cakes-app", label: "Clean Cakes" },
  { href: "/clean-bake-app", label: "Clean Bake" },
  { href: "/clean-kitchen-ultimate", label: "Clean Kitchen" },
];

export default function AppSwitcher() {
  const pathname = usePathname();
  return (
    <div style={{ display: "flex", gap: 8, overflow: "auto" }}>
      {LINKS.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className={`tab${pathname === l.href ? " on" : ""}`}
        >
          {l.label}
        </Link>
      ))}
    </div>
  );
}

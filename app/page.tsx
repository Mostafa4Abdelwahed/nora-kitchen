import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

const APPS = [
  {
    href: "/clean-cakes-app",
    emoji: "🍰",
    title: "Clean Cakes Library",
    desc: "410 sugar-free baking recipes, frosting book, sweetener decoder and first-bite fixes.",
    theme: { card: "#f9ead5", text: "#704b34", accent: "#a06a3d" },
  },
  {
    href: "/clean-bake-app",
    emoji: "🥗",
    title: "Clean Bake App",
    desc: "400 recipes, portion calculator, grocery list, metabolic condition guides and golden tea.",
    theme: { card: "#edf9f1", text: "#0b6f35", accent: "#12a047" },
  },
  {
    href: "/clean-kitchen-ultimate",
    emoji: "🍽️",
    title: "Clean Kitchen Ultimate",
    desc: "4,000+ recipe ideas, smart kitchen tools, pantry tracker and 10 premium guides.",
    theme: { card: "#eef7fd", text: "#12688f", accent: "#1889b7" },
  },
];

export const metadata: Metadata = {
  title: "Nora's Kitchen",
  description:
    "Nora's Kitchen — clean cakes, clean bake and the ultimate clean kitchen recipe collections, installable and available offline.",
};

export default function Home() {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "48px 20px",
        fontFamily: "Arial, sans-serif",
        background: "linear-gradient(180deg, #fffdf7, #f4f1ea)",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 14,
          textAlign: "center",
          marginBottom: 40,
        }}
      >
        <Image
          src="/logo.png"
          alt="Nora's Kitchen logo"
          width={96}
          height={96}
          style={{ borderRadius: 20 }}
          priority
        />
        <h1
          style={{
            margin: 0,
            fontSize: 32,
            color: "#2b2118",
            letterSpacing: "-0.5px",
          }}
        >
          Nora&apos;s Kitchen
        </h1>
        <p style={{ margin: 0, color: "#6d6257", maxWidth: 480, lineHeight: 1.6 }}>
          Clean, sugar-free cooking and baking libraries with smart tools —
          installable as an app and available offline.
        </p>
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 20,
          justifyContent: "center",
          maxWidth: 960,
        }}
      >
        {APPS.map((a) => (
          <Link
            key={a.href}
            href={a.href}
            style={{
              display: "block",
              width: 280,
              padding: 24,
              borderRadius: 18,
              background: a.theme.card,
              textDecoration: "none",
              transition: "transform .15s ease, box-shadow .15s ease",
            }}
          >
            <div style={{ fontSize: 40 }}>{a.emoji}</div>
            <h2
              style={{
                margin: "10px 0 8px",
                fontSize: 20,
                color: a.theme.text,
              }}
            >
              {a.title}
            </h2>
            <p
              style={{
                margin: 0,
                fontSize: 14,
                lineHeight: 1.6,
                color: a.theme.text,
              }}
            >
              {a.desc}
            </p>
            <div
              style={{
                marginTop: 16,
                display: "inline-block",
                padding: "8px 16px",
                borderRadius: 999,
                background: a.theme.accent,
                color: "#fff",
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              Open app →
            </div>
          </Link>
        ))}
      </div>

      <p
        style={{
          marginTop: 48,
          fontSize: 13,
          color: "#8a7f72",
          textAlign: "center",
        }}
      >
        Add this site to your home screen to install Nora&apos;s Kitchen as an
        app.
      </p>
    </div>
  );
}

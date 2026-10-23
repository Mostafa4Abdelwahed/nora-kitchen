import type { Metadata } from "next";
import type { Viewport } from "next";

export const metadata: Metadata = {
  title: "Offline — Nora's Kitchen",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#12a047",
};

export default function OfflinePage() {
  return (
    <div
      style={{
        minHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        fontFamily: "Arial, sans-serif",
        textAlign: "center",
        padding: 24,
      }}
    >
      <div style={{ fontSize: 56 }}>🍳</div>
      <h1 style={{ margin: 0, fontSize: 24 }}>You are offline</h1>
      <p style={{ margin: 0, color: "#555", maxWidth: 360 }}>
        This page needs a connection. Your recipes and saved favorites are
        still available on the pages you already visited.
      </p>
    </div>
  );
}

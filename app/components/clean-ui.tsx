"use client";

import Image from "next/image";

export const PAGE = 40;

export const ICONS = {
  search: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
    </svg>
  ),
  heart: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 20.4C5.7 16.3 2.8 12.7 2.8 9.2 2.8 6.4 5 4.2 7.8 4.2c1.7 0 3.3.9 4.2 2.3a5 5 0 0 1 4.2-2.3c2.8 0 5 2.2 5 5 0 3.5-2.9 7.1-9.2 11.2z" />
    </svg>
  ),
  burger: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  ),
  cart: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="9" cy="20" r="1.6" />
      <circle cx="17" cy="20" r="1.6" />
      <path d="M3 3h2.5l1.2 12.2a1.4 1.4 0 0 0 1.4 1.3h8.5a1.4 1.4 0 0 0 1.4-1.2L19.3 7H6" />
    </svg>
  ),
};

const STAR_PATH =
  "M12 2.8l2.85 5.77 6.37.93-4.61 4.49 1.09 6.34L12 17.35l-5.7 2.98 1.09-6.34-4.61-4.49 6.37-.93z";

function Star({ pct }: { pct: number }) {
  return (
    <span className="star" aria-hidden="true">
      <svg viewBox="0 0 24 24">
        <path d={STAR_PATH} />
      </svg>
      <span className="fill" style={{ width: `${Math.round(pct)}%` }}>
        <svg viewBox="0 0 24 24">
          <path d={STAR_PATH} />
        </svg>
      </span>
    </span>
  );
}

export function Stars({ value }: { value: number }) {
  return (
    <span className="stars" aria-hidden="true">
      {[0, 1, 2, 3, 4].map((i) => (
        <Star key={i} pct={Math.max(0, Math.min(1, value - i)) * 100} />
      ))}
    </span>
  );
}

export function Logo({ onHome }: { onHome: () => void }) {
  return (
    <a
      className="logo"
      href="#"
      aria-label="Nora Kitchen apps home"
      onClick={(e) => {
        e.preventDefault();
        onHome();
      }}
    >
      <Image
        className="logoImg m"
        src="/logo-mobile.png"
        alt="Clean Cakes App"
        width={1254}
        height={1254}
        priority
      />
      <Image
        className="logoImg d"
        src="/logo-desktop.png"
        alt="Clean Cakes App"
        width={2172}
        height={724}
        priority
      />
    </a>
  );
}

export function ratingFor(seed: number) {
  return (4.55 + (seed % 5) * 0.09).toFixed(1);
}

export function reviewsFor(seed: number) {
  return 180 + ((seed * 71) % 320);
}

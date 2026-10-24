"use client";

import { useEffect, useState } from "react";

const TRIGGER_CARD = 30;

export default function ScrollTop({ hidden = false }: { hidden?: boolean }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let frame = 0;

    function update() {
      frame = 0;
      const cards = Array.from(
        document.querySelectorAll<HTMLElement>(".grid .card"),
      ).filter((el) => el.offsetParent !== null);
      const anchor = cards[TRIGGER_CARD - 1] ?? cards[cards.length - 1];
      const passed = anchor
        ? anchor.getBoundingClientRect().bottom <= window.innerHeight
        : window.scrollY > window.innerHeight;

      const footTop = document.querySelector<HTMLElement>(".footTop");
      const rect = footTop?.getBoundingClientRect();
      const footVisible = rect
        ? rect.top <= window.innerHeight && rect.bottom >= 0
        : false;

      setShow(passed && !footVisible);
    }

    function schedule() {
      if (!frame) frame = window.requestAnimationFrame(update);
    }

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  if (!show || hidden) return null;

  return (
    <button
      type="button"
      className="toTop"
      aria-label="Scroll back to top"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 19V5" />
        <path d="M5 12l7-7 7 7" />
      </svg>
    </button>
  );
}

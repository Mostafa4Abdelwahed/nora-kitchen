"use client";

import { useState } from "react";

const MESSENGER_URL = "https://www.m.me/noraaskitchen";

export default function ContactButton() {
  const [showTip, setShowTip] = useState(true);

  return (
    <div className="contactWrap">
      {showTip && (
        <a
          className="contactTip"
          href={MESSENGER_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => setShowTip(false)}
        >
          Need Help ? Talk to me on Facebook.
        </a>
      )}
      <a
        className="contactBtn"
        href={MESSENGER_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contact us on Messenger"
        onClick={() => setShowTip(false)}
      >
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 0C5.373 0 0 4.974 0 11.111c0 3.498 1.744 6.614 4.469 8.654V24l4.088-2.242c1.092.3 2.246.464 3.443.464 6.627 0 12-4.974 12-11.111S18.627 0 12 0zm1.191 14.963l-3.055-3.26-5.963 3.26L10.732 8l3.131 3.26L19.752 8l-6.561 6.963z" />
        </svg>
      </a>
    </div>
  );
}

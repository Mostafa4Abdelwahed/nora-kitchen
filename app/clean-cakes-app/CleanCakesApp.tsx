"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import AppSwitcher from "../components/AppSwitcher";
import { useLocalList, setLocalList } from "../components/useLocalList";
import {
  fixes,
  frostings,
  recipes,
  shopping,
  sweeteners,
  type Recipe,
} from "./data";

type View = "recipes" | "bonuses" | "sweetener" | "frosting" | "fix" | "tools";

const CATEGORIES = [
  "Cakes",
  "Cupcakes",
  "Cheesecakes",
  "Loaves & Breads",
  "Muffins",
  "Bars & No-Bake",
];

const CAT_TAG: Record<string, string> = {
  Cakes: "Healthy",
  Cupcakes: "Festive",
  Cheesecakes: "Creamy",
  "Loaves & Breads": "Breakfast",
  Muffins: "Breakfast",
  "Bars & No-Bake": "Quick",
};

const COVER_CLASS: Record<string, string> = {
  Cakes: "gcakes",
  Cupcakes: "gcup",
  Cheesecakes: "gcheese",
  "Loaves & Breads": "gloaf",
  Muffins: "gmuffin",
  "Bars & No-Bake": "gbars",
};

const BONUSES = [
  {
    emoji: "📙",
    title: "The Sweetener Decoder",
    desc: "A practical quick-reference guide to sweetness, browning, moisture and texture.",
    value: "$39 value",
    view: "sweetener" as View,
    cta: "Open Guide",
  },
  {
    emoji: "📕",
    title: "The Frosting Book",
    desc: "20 complete sugar-free frosting, ganache, glaze and topping recipes.",
    value: "$47 value",
    view: "frosting" as View,
    cta: "Open Book",
  },
  {
    emoji: "📗",
    title: "First Bite Fix",
    desc: "20 common baking problems, likely causes and practical fixes.",
    value: "$29 value",
    view: "fix" as View,
    cta: "Open Guide",
  },
];

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

function Stars({ value }: { value: number }) {
  return (
    <span className="stars" aria-hidden="true">
      {[0, 1, 2, 3, 4].map((i) => (
        <Star key={i} pct={Math.max(0, Math.min(1, value - i)) * 100} />
      ))}
    </span>
  );
}

const ICONS = {
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
};

function ratingFor(seed: number) {
  return (4.55 + (seed % 5) * 0.09).toFixed(1);
}

function reviewsFor(seed: number) {
  return 180 + ((seed * 71) % 320);
}

function tagsFor(r: Recipe) {
  return [CAT_TAG[r.cat] ?? "Healthy", r.level, "No Sugar"];
}

function summaryFor(r: Recipe) {
  let oven = "See method";
  let pan = "See method";
  const bake = r.time;
  const all = (r.steps || []).join(" ");
  const temp = all.match(/(\d{3})°F\s*\((\d{3})°C\)/);
  if (temp) oven = `${temp[1]}°F / ${temp[2]}°C`;
  if (r.cat === "Cakes") pan = "8-inch round";
  else if (r.cat === "Cupcakes" || r.cat === "Muffins") pan = "12-cup muffin pan";
  else if (r.cat === "Cheesecakes") pan = "8-inch springform";
  else if (r.cat === "Loaves & Breads") pan = "8×4-inch loaf pan";
  else if (r.cat === "Bars & No-Bake") pan = "8-inch square";
  return { oven, pan, bake };
}

const PAGE = 40;

export default function CleanCakesApp() {
  const [view, setView] = useState<View>("recipes");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [level, setLevel] = useState("All");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [completedOnly, setCompletedOnly] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [limit, setLimit] = useState(PAGE);
  const sentinel = useRef<HTMLButtonElement | null>(null);
  const favs = useLocalList<number>("cc_favs");
  const completed = useLocalList<number>("cc_done");
  const [openRecipeId, setOpenRecipeId] = useState<number | null>(null);
  const [openFrostIndex, setOpenFrostIndex] = useState<number | null>(null);

  useEffect(() => {
    document.body.style.overflow =
      openRecipeId !== null || openFrostIndex !== null || drawer
        ? "hidden"
        : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [openRecipeId, openFrostIndex, drawer]);

  const q = search.trim().toLowerCase();
  const rows = recipes.filter((r) => {
    const qok =
      !q ||
      `${r.title} ${r.desc} ${r.cat} ${(r.ingredients || []).join(" ")}`
        .toLowerCase()
        .includes(q);
    const cok = category === "All" || r.cat === category;
    const lok = level === "All" || r.level === level;
    const fok = !favoritesOnly || favs.includes(r.id);
    const dok = !completedOnly || completed.includes(r.id);
    return qok && cok && lok && fok && dok;
  });

  const visibleCount = Math.min(limit, rows.length);
  const visible = rows.slice(0, visibleCount);
  const hasMore = visibleCount < rows.length;

  const filterKey = `${search}|${category}|${level}|${favoritesOnly}|${completedOnly}|${view}`;
  const [prevKey, setPrevKey] = useState(filterKey);  if (prevKey !== filterKey) {
    setPrevKey(filterKey);
    setLimit(PAGE);
  }

  useEffect(() => {
    const el = sentinel.current;
    if (!el || !hasMore) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setLimit((l) => l + PAGE);
        }
      },
      { rootMargin: "700px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [hasMore, view]);

  function loadMore() {
    setLimit((l) => l + PAGE);
  }

  const openRecipe =
    openRecipeId !== null
      ? recipes.find((r) => r.id === openRecipeId) ?? null
      : null;
  const openFrost =
    openFrostIndex !== null ? frostings[openFrostIndex] ?? null : null;

  function toggleFav(id: number) {
    const next = favs.includes(id)
      ? favs.filter((x) => x !== id)
      : [...favs, id];
    setLocalList("cc_favs", next);
  }

  function toggleDone(id: number) {
    const next = completed.includes(id)
      ? completed.filter((x) => x !== id)
      : [...completed, id];
    setLocalList("cc_done", next);
  }

  function toggleFavorites() {
    setFavoritesOnly((v) => !v);
    setCompletedOnly(false);
    setView("recipes");
  }

  function toggleCompleted() {
    setCompletedOnly((v) => !v);
    setFavoritesOnly(false);
    setView("recipes");
  }

  function resetFilterToggles() {
    setFavoritesOnly(false);
    setCompletedOnly(false);
  }

  function focusSearch() {
    document.getElementById("cc-search")?.focus();
  }

  function goHome() {
    setView("recipes");
    setCategory("All");
    setSearch("");
    resetFilterToggles();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <>
      <header className="top">
        <div className="wrap topin">
          <button
            className="burger"
            aria-label="Open menu"
            onClick={() => setDrawer(true)}
          >
            {ICONS.burger}
          </button>

          <a
            className="logo"
            href="#"
            aria-label="Clean Cakes App home"
            onClick={(e) => {
              e.preventDefault();
              goHome();
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

          <nav className="navRight">
            <AppSwitcher />
            <button className="iconBtn" aria-label="Search" onClick={focusSearch}>
              {ICONS.search}
            </button>
          </nav>

          <button className="iconBtn mSearch" aria-label="Search" onClick={focusSearch}>
            {ICONS.search}
          </button>
        </div>
      </header>

      <div className="wrap find">
        <div className="searchBar">
          {ICONS.search}
          <input
            id="cc-search"
            placeholder={`Search ${recipes.length}+ recipes...`}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              resetFilterToggles();
              if (view !== "recipes") setView("recipes");
            }}
          />
        </div>
      </div>

      <main className="wrap">
        <section id="recipesView" className={view === "recipes" ? undefined : "secHide"}>
          <div className="pillsRow">
            {["All", ...CATEGORIES].map((c) => (
              <button
                key={c}
                className={`pillC${category === c ? " on" : ""}`}
                onClick={() => {
                  setCategory(c);
                  resetFilterToggles();
                }}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="resultRow">
            <p className="count">
              {favoritesOnly ? "Favorites • " : ""}
              {completedOnly ? "Completed • " : ""}
              {rows.length} of {recipes.length} recipes
            </p>
            <div className="miniCtl">
              <select
                id="cc-level"
                className={`mini${level !== "All" ? " on" : ""}`}
                value={level}
                aria-label="Filter by level"
                onChange={(e) => {
                  setLevel(e.target.value);
                  resetFilterToggles();
                }}
              >
                <option value="All">Level: All</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
              </select>
              <button
                className={`mini sq${favoritesOnly ? " on" : ""}`}
                aria-label="Show only favorites"
                aria-pressed={favoritesOnly}
                onClick={toggleFavorites}
              >
                {ICONS.heart}
              </button>
              <button
                className={`mini sq${completedOnly ? " on" : ""}`}
                aria-label="Show only completed"
                aria-pressed={completedOnly}
                onClick={toggleCompleted}
              >
                ✓
              </button>
            </div>
          </div>

          <div id="recipeGrid" className="grid">
            {rows.length ? (
              visible.map((r) => {
                const done = completed.includes(r.id);
                const fav = favs.includes(r.id);
                return (
                  <article
                    key={r.id}
                    className="card"
                    role="button"
                    tabIndex={0}
                    onClick={() => setOpenRecipeId(r.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setOpenRecipeId(r.id);
                      }
                    }}
                  >
                    <div className={`cover ${COVER_CLASS[r.cat] ?? "gcakes"}`}>
                      {done && <span className="coverDone">✓ Done</span>}
                      <span className="food">{r.emoji}</span>
                      <button
                        className={`heartBtn${fav ? " on" : ""}`}
                        aria-label={fav ? "Remove from favorites" : "Add to favorites"}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFav(r.id);
                        }}
                      >
                        {ICONS.heart}
                      </button>
                    </div>
                    <div className="body">
                      <h3>{r.title}</h3>
                      <div className="rate">
                        <Stars value={Number(ratingFor(r.id))} />
                        <span className="num">{ratingFor(r.id)}</span>
                        <small>({reviewsFor(r.id)})</small>
                      </div>
                      <div className="tags">
                        {done && <span className="tag solid">✓ Done</span>}
                        {tagsFor(r).map((t) => (
                          <span key={t} className="tag">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </article>
                );
              })
            ) : (
              <div className="empty">No recipes match these filters.</div>
            )}
            {hasMore && (
              <button
                ref={sentinel}
                className="loadTile"
                onClick={loadMore}
                aria-label={`Load more recipes — showing ${visibleCount} of ${rows.length}`}
              >
                <span className="loadPlus" aria-hidden="true">
                  +
                </span>
                <b>Load more</b>
                <small>{visibleCount} of {rows.length} recipes shown</small>
              </button>
            )}
          </div>
        </section>

        <section
          id="bonusesView"
          className={view === "bonuses" ? undefined : "secHide"}
        >
          <div className="sectionHead">
            <h2>Your Premium Bonuses</h2>
            <p>All included with your purchase.</p>
          </div>
          <div className="bonusGrid">
            {BONUSES.map((b) => (
              <div key={b.title} className="bonus">
                <div className="bicon">{b.emoji}</div>
                <h3>{b.title}</h3>
                <p>{b.desc}</p>
                <div className="valueRow">
                  <span className="value">{b.value}</span>
                  <span className="freePill">INCLUDED</span>
                </div>
                <button className="btnGreen" onClick={() => setView(b.view)}>
                  {b.cta}
                </button>
              </div>
            ))}
          </div>
        </section>

        <section
          id="sweetenerView"
          className={view === "sweetener" ? undefined : "secHide"}
        >
          <div className="sectionHead">
            <h2>The Sweetener Decoder</h2>
            <p>Quick-reference guide for recipe formulation.</p>
          </div>
          <div className="panel">
            <div className="tableWrap">
              <table>
                <thead>
                  <tr>
                    <th>Sweetener</th>
                    <th>Taste</th>
                    <th>Browning</th>
                    <th>Moisture</th>
                    <th>Best Uses</th>
                    <th>Watch For</th>
                  </tr>
                </thead>
                <tbody>
                  {sweeteners.map((row) => (
                    <tr key={row[0]}>
                      {row.map((cell, j) => (
                        <td key={j}>{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="note">
              <b>Important:</b> sweetener products vary by brand and
              formulation. The recipes use granulated allulose or a clearly
              labeled 1:1 granulated baking sweetener in the exact cup amount
              shown. If your product is not 1:1, use the conversion printed on
              its package.
            </p>
          </div>
        </section>

        <section
          id="frostingView"
          className={view === "frosting" ? undefined : "secHide"}
        >
          <div className="sectionHead">
            <h2>The Frosting Book</h2>
            <p>20 complete frosting and finishing recipes.</p>
          </div>
          <div className="grid">
            {frostings.map((f, i) => (
              <article
                key={f[0]}
                className="card"
                role="button"
                tabIndex={0}
                onClick={() => setOpenFrostIndex(i)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setOpenFrostIndex(i);
                  }
                }}
              >
                <div className="cover soft">
                  <span className="food">{f[1]}</span>
                </div>
                <div className="body">
                  <h3>{f[0]}</h3>
                  <div className="rate">
                    <Stars value={Number(ratingFor(43 + i))} />
                    <span className="num">{ratingFor(43 + i)}</span>
                    <small>({reviewsFor(43 + i)})</small>
                  </div>
                  <div className="tags">
                    <span className="tag">Sugar Free</span>
                    <span className="tag">Bonus Recipe {i + 1}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="fixView" className={view === "fix" ? undefined : "secHide"}>
          <div className="sectionHead">
            <h2>First Bite Fix</h2>
            <p>
              Find the problem, understand the likely cause and use the
              suggested fix.
            </p>
          </div>
          <div className="guideGrid">
            {fixes.map((f) => (
              <div key={f[0]} className="guide">
                <div className="fixTop">
                  <span className="fixIcon">⚠️</span>
                  <b>{f[0]}</b>
                </div>
                <small>
                  <b>Likely cause:</b> {f[1]}
                </small>
                <small>
                  <b>Try this:</b> {f[2]}
                </small>
              </div>
            ))}
          </div>
        </section>

        <section
          id="toolsView"
          className={view === "tools" ? undefined : "secHide"}
        >
          <div className="sectionHead">
            <h2>Baking Tools &amp; Pantry</h2>
            <p>Quick reference before you start baking.</p>
          </div>
          <div className="toolGrid">
            {Object.entries(shopping).map(([k, v]) => (
              <div key={k} className="checklist">
                <h3>{k}</h3>
                {v.map((x) => (
                  <label key={x} className="check">
                    <input type="checkbox" /> <span>{x}</span>
                  </label>
                ))}
              </div>
            ))}
          </div>
          <div className="panel" style={{ marginTop: 16 }}>
            <h3>Quick US Baking Conversions</h3>
            <div className="tableWrap">
              <table>
                <thead>
                  <tr>
                    <th>US</th>
                    <th>Approx. Metric</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>1 cup liquid</td>
                    <td>240 mL</td>
                  </tr>
                  <tr>
                    <td>1 tbsp</td>
                    <td>15 mL</td>
                  </tr>
                  <tr>
                    <td>1 tsp</td>
                    <td>5 mL</td>
                  </tr>
                  <tr>
                    <td>8 oz cream cheese</td>
                    <td>226 g</td>
                  </tr>
                  <tr>
                    <td>1 stick butter</td>
                    <td>113 g</td>
                  </tr>
                  <tr>
                    <td>350°F</td>
                    <td>175°C</td>
                  </tr>
                  <tr>
                    <td>325°F</td>
                    <td>165°C</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>

      {drawer && (
        <div
          className="drawer open"
          onClick={(e) => {
            if (e.target === e.currentTarget) setDrawer(false);
          }}
        >
          <div className="drawerBox">
            <div className="drawerHead">
              <Image
                className="drawerLogo"
                src="/logo-mobile.png"
                alt="Clean Cakes App"
                width={1254}
                height={1254}
              />
              <button className="close" aria-label="Close menu" onClick={() => setDrawer(false)}>
                ×
              </button>
            </div>
            <div className="drawerLabel">Switch app</div>
            <AppSwitcher />
            <div className="drawerLabel">My library</div>
            <button
              className={`drawerLink${favoritesOnly ? " on" : ""}`}
              onClick={() => {
                toggleFavorites();
                setDrawer(false);
              }}
            >
              ♥ Favorites
            </button>
            <button
              className={`drawerLink${completedOnly ? " on" : ""}`}
              onClick={() => {
                toggleCompleted();
                setDrawer(false);
              }}
            >
              ✓ Completed
            </button>
          </div>
        </div>
      )}

      {openRecipe && (
        <div
          className="modal open"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpenRecipeId(null);
          }}
        >
          <div className="box">
            <button className="close" onClick={() => setOpenRecipeId(null)}>
              ×
            </button>
            <div className="mhead">
              <div className={`mcover ${COVER_CLASS[openRecipe.cat] ?? "gcakes"}`}>
                <span className="food">{openRecipe.emoji}</span>
              </div>
              <div className="mheadInfo">
                <span className="badge">
                  {openRecipe.cat} • Recipe #{openRecipe.id}
                </span>
                <h2>{openRecipe.title}</h2>
                <p>{openRecipe.desc}</p>
              </div>
            </div>
            <div className="modalBody">
              {(() => {
                const s = summaryFor(openRecipe);
                return (
                  <div className="recipeSummary">
                    <div>
                      <b>🌡 Temperature</b>
                      <small>{s.oven}</small>
                    </div>
                    <div>
                      <b>🥧 Pan / Format</b>
                      <small>{s.pan}</small>
                    </div>
                    <div>
                      <b>⏱ Total Time</b>
                      <small>{s.bake}</small>
                    </div>
                  </div>
                );
              })()}
              <div className="exactNote">
                <b>Before you start:</b> Measure each ingredient exactly as
                listed below. Sweetener, cocoa, milk, flour and other
                recipe-specific additions are shown with their amounts.
              </div>
              <div className="msec">
                <h3>
                  Ingredients
                  <span className="cnt">{openRecipe.ingredients.length}</span>
                </h3>
                <ul className="ings">
                  {openRecipe.ingredients.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
              </div>
              <div className="msec">
                <h3>
                  Method
                  <span className="cnt">{openRecipe.steps.length} steps</span>
                </h3>
                <ol className="steps">
                  {openRecipe.steps.map((x, i) => (
                    <li key={i}>{x}</li>
                  ))}
                </ol>
                <div className="note">
                  <b>Baker&apos;s note:</b> {openRecipe.note}
                </div>
                <div className="note gray">
                  <b>Blood-sugar note:</b> No-added-sugar does not mean
                  carb-free. Check the total carbohydrates in your
                  ingredients and serving size, and follow your personal
                  diabetes care plan.
                </div>
              </div>
            </div>
            <div className="modalFoot">
              <button
                className={`btnGreen light favBtn${favs.includes(openRecipe.id) ? " on" : ""}`}
                onClick={() => toggleFav(openRecipe.id)}
              >
                {favs.includes(openRecipe.id)
                  ? "♥ Favorited"
                  : "♡ Add to Favorites"}
              </button>
              <button
                className="btnGreen doneBtn"
                onClick={() => toggleDone(openRecipe.id)}
              >
                {completed.includes(openRecipe.id)
                  ? "✓ Completed — Click to Undo"
                  : "Mark This Recipe Complete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {openFrost && (
        <div
          className="modal open"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpenFrostIndex(null);
          }}
        >
          <div className="box">
            <button className="close" onClick={() => setOpenFrostIndex(null)}>
              ×
            </button>
            <div className="mhead">
              <div className="mcover soft">
                <span className="food">{openFrost[1]}</span>
              </div>
              <div className="mheadInfo">
                <span className="badge">The Frosting Book • Bonus</span>
                <h2>{openFrost[0]}</h2>
              </div>
            </div>
            <div className="modalBody">
              <div className="msec">
                <h3>
                  Ingredients
                  <span className="cnt">{openFrost[2].length}</span>
                </h3>
                <ul className="ings">
                  {openFrost[2].map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
              </div>
              <div className="msec">
                <h3>
                  Method
                  <span className="cnt">{openFrost[3].length} steps</span>
                </h3>
                <ol className="steps">
                  {openFrost[3].map((x, i) => (
                    <li key={i}>{x}</li>
                  ))}
                </ol>
                <div className="note gray">
                  <b>Blood-sugar note:</b> Sugar-free does not mean
                  carbohydrate-free. Check labels, total carbs and serving
                  size according to your care plan.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <footer className="foot">
        <div className="footApps">
          <span>Explore more apps</span>
          <AppSwitcher />
        </div>
        <p>
          For general recipe information only — not medical advice.
          “Sugar-free” or “no added sugar” does not mean carbohydrate-free or
          guaranteed to prevent a blood-glucose rise. Flour, milk, fruit,
          chocolate, portion size and sweetener formulation can all affect
          total carbohydrates and individual glucose response. If you manage
          diabetes, use the carbohydrate and portion guidance from your
          clinician or dietitian, check product labels, and monitor your
          response as directed in your care plan.
        </p>
      </footer>
    </>
  );
}

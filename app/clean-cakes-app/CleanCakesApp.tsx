"use client";

import { useEffect, useState } from "react";
import AppSwitcher from "../components/AppSwitcher";
import {
  fixes,
  frostings,
  recipes,
  shopping,
  sweeteners,
  type Recipe,
} from "./data";

type View = "recipes" | "bonuses" | "sweetener" | "frosting" | "fix" | "tools";

const TABS: { id: View; label: string }[] = [
  { id: "recipes", label: "🍰 410 Recipes" },
  { id: "bonuses", label: "🎁 Bonuses" },
  { id: "sweetener", label: "🥄 Sweetener Decoder" },
  { id: "frosting", label: "📕 Frosting Book" },
  { id: "fix", label: "🛠 First Bite Fix" },
  { id: "tools", label: "📋 Baking Tools" },
];

const CATEGORIES = [
  "Cakes",
  "Cupcakes",
  "Cheesecakes",
  "Loaves & Breads",
  "Muffins",
  "Bars & No-Bake",
];

function safeLoad(key: string): number[] {
  try {
    const value = JSON.parse(window.localStorage.getItem(key) || "[]");
    return Array.isArray(value) ? (value as number[]) : [];
  } catch {
    return [];
  }
}

function safeStore(key: string, value: number[]) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {}
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

export default function CleanCakesApp() {
  const [view, setView] = useState<View>("recipes");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [level, setLevel] = useState("All");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [completedOnly, setCompletedOnly] = useState(false);
  const [favs, setFavs] = useState<number[]>([]);
  const [completed, setCompleted] = useState<number[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [openRecipeId, setOpenRecipeId] = useState<number | null>(null);
  const [openFrostIndex, setOpenFrostIndex] = useState<number | null>(null);

  useEffect(() => {
    setFavs(safeLoad("cc_favs"));
    setCompleted(safeLoad("cc_done"));
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) safeStore("cc_favs", favs);
  }, [favs, loaded]);

  useEffect(() => {
    if (loaded) safeStore("cc_done", completed);
  }, [completed, loaded]);

  useEffect(() => {
    document.body.style.overflow =
      openRecipeId !== null || openFrostIndex !== null ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [openRecipeId, openFrostIndex]);

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
  const resultText =
    (favoritesOnly ? "Favorites • " : "") +
    (completedOnly ? "Completed • " : "") +
    `${rows.length} recipes shown`;

  const openRecipe =
    openRecipeId !== null
      ? recipes.find((r) => r.id === openRecipeId) ?? null
      : null;
  const openFrost =
    openFrostIndex !== null ? frostings[openFrostIndex] ?? null : null;

  function toggleFav(id: number) {
    setFavs((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function toggleDone(id: number) {
    setCompleted((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
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

  return (
    <>
      <header className="top">
        <div className="wrap topin">
          <div className="brand">
            <div className="mark">🍰</div>
            <div>
              Clean Cakes Library
              <small>410 recipes + premium bonuses</small>
            </div>
          </div>
          <AppSwitcher />
        </div>
      </header>

      <section className="wrap hero">
        <div className="heroBox">
          <div>
            <span className="kicker">YOUR PURCHASE • LIFETIME ACCESS</span>
            <h1>Your Complete Sugar-Free Baking Library</h1>
            <p>
              410 complete recipes plus The Sweetener Decoder, The Frosting
              Book, First Bite Fix, pantry checklists and baking tools —
              organized in one easy web app.
            </p>
          </div>
          <div className="stats">
            <div className="stat">
              <b>410</b>
              <span>Complete recipes</span>
            </div>
            <div className="stat">
              <b>3</b>
              <span>Premium bonuses</span>
            </div>
            <div className="stat">
              <b>6</b>
              <span>Main recipe sections</span>
            </div>
            <div className="stat">
              <b>{completed.length}</b>
              <span>Recipes completed</span>
            </div>
          </div>
        </div>
      </section>

      <main className="wrap">
        <div className="toolbar">
          <input
            id="cc-search"
            className="field"
            placeholder="Search chocolate, lemon, berry, cinnamon..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              resetFilterToggles();
            }}
          />
          <select
            id="cc-category"
            className="field"
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              resetFilterToggles();
            }}
          >
            <option value="All">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <select
            id="cc-level"
            className="field"
            value={level}
            onChange={(e) => {
              setLevel(e.target.value);
              resetFilterToggles();
            }}
          >
            <option>All</option>
            <option>Easy</option>
            <option>Medium</option>
          </select>
        </div>

        <div className="tabs">
          {TABS.map((t) => (
            <button
              key={t.id}
              className={`tab${view === t.id ? " on" : ""}`}
              onClick={() => setView(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <section
          id="recipesView"
          className={view === "recipes" ? undefined : "hide"}
        >
          <div className="sectionHead">
            <div>
              <h2>Recipe Library</h2>
              <p id="ccResultText">{resultText}</p>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn light" onClick={toggleFavorites}>
                ♡ Favorites
              </button>
              <button className="btn light" onClick={toggleCompleted}>
                ✓ Completed
              </button>
            </div>
          </div>
          <div id="recipeGrid" className="grid">
            {rows.length ? (
              rows.map((r) => (
                <article key={r.id} className="card">
                  <div className="cover">
                    <span className="pill">{r.cat}</span>
                    <button
                      className={`heart${favs.includes(r.id) ? " on" : ""}`}
                      onClick={() => toggleFav(r.id)}
                    >
                      {favs.includes(r.id) ? "♥" : "♡"}
                    </button>
                    {r.emoji}
                  </div>
                  <div className="body">
                    <h3>{r.title}</h3>
                    <div className="meta">
                      #{r.id} • ⏱ {r.time} • {r.level}
                    </div>
                    <p>{r.desc}</p>
                    <div className="progress">
                      <span
                        style={{ width: completed.includes(r.id) ? "100%" : "0%" }}
                      />
                    </div>
                    <div className="actions">
                      <button
                        className="btn primary"
                        onClick={() => setOpenRecipeId(r.id)}
                      >
                        View Recipe
                      </button>
                      <button
                        className="btn light"
                        onClick={() => toggleDone(r.id)}
                      >
                        {completed.includes(r.id) ? "✓ Done" : "Mark Done"}
                      </button>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="empty">No recipes match these filters.</div>
            )}
          </div>
        </section>

        <section
          id="bonusesView"
          className={view === "bonuses" ? undefined : "hide"}
        >
          <div className="sectionHead">
            <div>
              <h2>Your Premium Bonuses</h2>
              <p>All included with your purchase.</p>
            </div>
          </div>
          <div className="bonusGrid">
            <div className="bonus">
              <div className="book">📙</div>
              <h3>The Sweetener Decoder</h3>
              <p>
                A practical quick-reference guide to sweetness, browning,
                moisture and texture.
              </p>
              <span className="value">$39 value</span>
              <span className="free">INCLUDED</span>
              <br />
              <br />
              <button className="btn primary" onClick={() => setView("sweetener")}>
                Open Guide
              </button>
            </div>
            <div className="bonus">
              <div className="book">📕</div>
              <h3>The Frosting Book</h3>
              <p>
                20 complete sugar-free frosting, ganache, glaze and topping
                recipes.
              </p>
              <span className="value">$47 value</span>
              <span className="free">INCLUDED</span>
              <br />
              <br />
              <button className="btn primary" onClick={() => setView("frosting")}>
                Open Book
              </button>
            </div>
            <div className="bonus">
              <div className="book">📗</div>
              <h3>First Bite Fix</h3>
              <p>20 common baking problems, likely causes and practical fixes.</p>
              <span className="value">$29 value</span>
              <span className="free">INCLUDED</span>
              <br />
              <br />
              <button className="btn primary" onClick={() => setView("fix")}>
                Open Guide
              </button>
            </div>
          </div>
        </section>

        <section
          id="sweetenerView"
          className={view === "sweetener" ? undefined : "hide"}
        >
          <div className="sectionHead">
            <div>
              <h2>The Sweetener Decoder</h2>
              <p>Quick-reference guide for recipe formulation.</p>
            </div>
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
          className={view === "frosting" ? undefined : "hide"}
        >
          <div className="sectionHead">
            <div>
              <h2>The Frosting Book</h2>
              <p>20 complete frosting and finishing recipes.</p>
            </div>
          </div>
          <div className="grid">
            {frostings.map((f, i) => (
              <article key={f[0]} className="card">
                <div className="cover">
                  {f[1]}
                  <span className="pill">Bonus Recipe {i + 1}</span>
                </div>
                <div className="body">
                  <h3>{f[0]}</h3>
                  <p>{f[2].slice(0, 2).join(" • ")}</p>
                  <div className="actions">
                    <button
                      className="btn primary"
                      onClick={() => setOpenFrostIndex(i)}
                    >
                      View Recipe
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="fixView" className={view === "fix" ? undefined : "hide"}>
          <div className="sectionHead">
            <div>
              <h2>First Bite Fix</h2>
              <p>
                Find the problem, understand the likely cause and use the
                suggested fix.
              </p>
            </div>
          </div>
          <div className="guideGrid">
            {fixes.map((f) => (
              <div key={f[0]} className="guide">
                <b>{f[0]}</b>
                <small>
                  <b style={{ marginTop: 7 }}>Likely cause:</b>
                  {f[1]}
                  <b style={{ marginTop: 7 }}>Try this:</b>
                  {f[2]}
                </small>
              </div>
            ))}
          </div>
        </section>

        <section id="toolsView" className={view === "tools" ? undefined : "hide"}>
          <div className="sectionHead">
            <div>
              <h2>Baking Tools &amp; Pantry</h2>
              <p>Quick reference before you start baking.</p>
            </div>
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
          <div className="panel" style={{ marginTop: 15 }}>
            <h3>Quick US Baking Conversions</h3>
            <div className="tableWrap">
              <table>
                <tbody>
                  <tr>
                    <th>US</th>
                    <th>Approx. Metric</th>
                  </tr>
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
            <div>
              <span className="badge">
                {openRecipe.cat} • Recipe #{openRecipe.id}
              </span>
              <h2>
                {openRecipe.emoji} {openRecipe.title}
              </h2>
              <p>{openRecipe.desc}</p>
              <div className="recipeCheck">
                <span>✓ Exact ingredient amounts</span>
                <span>✓ Oven temperature</span>
                <span>✓ Baking / chilling time</span>
              </div>
              {(() => {
                const s = summaryFor(openRecipe);
                return (
                  <div className="recipeSummary">
                    <div>
                      <b>Temperature</b>
                      <small>{s.oven}</small>
                    </div>
                    <div>
                      <b>Pan / Format</b>
                      <small>{s.pan}</small>
                    </div>
                    <div>
                      <b>Total Time</b>
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
              <div className="cols">
                <div>
                  <h3>Ingredients — Exact Amounts</h3>
                  <ul>
                    {openRecipe.ingredients.map((x) => (
                      <li key={x}>{x}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3>Method</h3>
                  <ol>
                    {openRecipe.steps.map((x, i) => (
                      <li key={i}>{x}</li>
                    ))}
                  </ol>
                  <div className="note">
                    <b>Baker&apos;s note:</b> {openRecipe.note}
                  </div>
                  <div className="note" style={{ marginTop: 10 }}>
                    <b>Blood-sugar note:</b> No-added-sugar does not mean
                    carb-free. Check the total carbohydrates in your
                    ingredients and serving size, and follow your personal
                    diabetes care plan.
                  </div>
                </div>
              </div>
              <button
                className="btn primary doneBtn"
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
            <div>
              <h2>
                {openFrost[1]} {openFrost[0]}
              </h2>
              <div className="cols">
                <div>
                  <h3>Ingredients</h3>
                  <ul>
                    {openFrost[2].map((x) => (
                      <li key={x}>{x}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3>Method</h3>
                  <ol>
                    {openFrost[3].map((x, i) => (
                      <li key={i}>{x}</li>
                    ))}
                  </ol>
                  <div className="note">
                    <b>Blood-sugar note:</b> Sugar-free does not mean
                    carbohydrate-free. Check labels, total carbs and serving
                    size according to your care plan.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <footer>
        For general recipe information only — not medical advice. “Sugar-free”
        or “no added sugar” does not mean carbohydrate-free or guaranteed to
        prevent a blood-glucose rise. Flour, milk, fruit, chocolate, portion
        size and sweetener formulation can all affect total carbohydrates and
        individual glucose response. If you manage diabetes, use the
        carbohydrate and portion guidance from your clinician or dietitian,
        check product labels, and monitor your response as directed in your
        care plan.
      </footer>
    </>
  );
}

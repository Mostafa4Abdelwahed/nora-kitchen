"use client";

import { useEffect, useState } from "react";
import AppSwitcher from "../components/AppSwitcher";
import { useLocalList, setLocalList } from "../components/useLocalList";
import {
  CATEGORIES,
  goldenTea,
  medGuide,
  metabolic,
  recipes,
  shopping,
  type BonusRecipe,
  type Recipe,
} from "./data";

type View =
  | "recipes"
  | "calculator"
  | "grocery"
  | "bonuses"
  | "metabolic"
  | "meds"
  | "tea"
  | "tools";

const TABS: { id: View; label: string }[] = [
  { id: "recipes", label: "🥗 400 Recipes" },
  { id: "calculator", label: "🧮 Portion Calculator" },
  { id: "grocery", label: "🛒 Grocery List" },
  { id: "bonuses", label: "⭐ Bonuses" },
  { id: "metabolic", label: "🥗 Metabolic Recipes" },
  { id: "meds", label: "⚠ Medication & Supplement Guide" },
  { id: "tea", label: "🍵 Golden Tea" },
  { id: "tools", label: "📋 Pantry" },
];

export default function CleanBakeApp() {
  const [view, setView] = useState<View>("recipes");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [level, setLevel] = useState("All");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [completedOnly, setCompletedOnly] = useState(false);
  const favs = useLocalList<number>("cb_favs");
  const completed = useLocalList<number>("cb_done");
  const grocery = useLocalList<string>("cb_grocery");
  const [openRecipeId, setOpenRecipeId] = useState<number | null>(null);
  const [openMetabolicIndex, setOpenMetabolicIndex] = useState<number | null>(
    null,
  );
  const [calcRecipeId, setCalcRecipeId] = useState<number>(recipes[0].id);
  const [newServings, setNewServings] = useState<string>("2");

  useEffect(() => {
    document.body.style.overflow =
      openRecipeId !== null || openMetabolicIndex !== null ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [openRecipeId, openMetabolicIndex]);

  const q = search.trim().toLowerCase();
  const rows = recipes.filter((r) => {
    const qok =
      !q || `${r.title} ${r.desc} ${r.cat}`.toLowerCase().includes(q);
    return (
      qok &&
      (category === "All" || r.cat === category) &&
      (level === "All" || r.level === level) &&
      (!favoritesOnly || favs.includes(r.id)) &&
      (!completedOnly || completed.includes(r.id))
    );
  });
  const resultText =
    (favoritesOnly ? "Favorites • " : "") +
    (completedOnly ? "Completed • " : "") +
    `${rows.length} recipes shown`;

  const openRecipe =
    openRecipeId !== null
      ? recipes.find((r) => r.id === openRecipeId) ?? null
      : null;
  const openMetabolic =
    openMetabolicIndex !== null ? metabolic[openMetabolicIndex] : null;

  const calcRecipe =
    recipes.find((r) => r.id === calcRecipeId) ?? recipes[0];
  const targetServings = Math.max(1, Number(newServings) || 1);
  const ratio = targetServings / calcRecipe.servings;

  function toggleFav(id: number) {
    const next = favs.includes(id)
      ? favs.filter((x) => x !== id)
      : [...favs, id];
    setLocalList("cb_favs", next);
  }

  function toggleDone(id: number) {
    const next = completed.includes(id)
      ? completed.filter((x) => x !== id)
      : [...completed, id];
    setLocalList("cb_done", next);
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

  function addRecipeToGrocery(r: Recipe | BonusRecipe) {
    const set = new Set(grocery);
    r.ingredients.forEach((x) => set.add(x));
    const next = [...set];
    setLocalList("cb_grocery", next);
  }

  function removeGrocery(i: number) {
    const next = grocery.filter((_, j) => j !== i);
    setLocalList("cb_grocery", next);
  }

  function clearGrocery() {
    setLocalList("cb_grocery", []);
  }

  return (
    <>
      <header className="top">
        <div className="wrap topin">
          <div className="brand">
            <div className="mark">🥗</div>
            <div>
              Clean Bake App
              <small>400 recipes • lifetime access</small>
            </div>
          </div>
          <AppSwitcher />
        </div>
      </header>

      <section className="wrap hero">
        <div className="heroBox">
          <div>
            <span className="kicker">LIFETIME ACCESS</span>
            <h1>Your Complete Clean Bake Recipe App</h1>
            <p>
              400 recipes, built-in portion calculator, automatic grocery list
              and three premium bonuses — all organized in one simple app.
            </p>
          </div>
          <div className="stats">
            <div className="stat">
              <b>400</b>
              <span>Complete recipes</span>
            </div>
            <div className="stat">
              <b>3</b>
              <span>Premium bonuses</span>
            </div>
            <div className="stat">
              <b>8</b>
              <span>Recipe categories</span>
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
            className="field"
            placeholder="Search bread, chocolate, breakfast, lemon..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              resetFilterToggles();
            }}
          />
          <select
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

        <section id="recipesView" className={view === "recipes" ? undefined : "hide"}>
          <div className="sectionHead">
            <div>
              <h2>Recipe Library</h2>
              <p>{resultText}</p>
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
          <div className="grid">
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
                        onClick={() => addRecipeToGrocery(r)}
                      >
                        + Grocery
                      </button>
                      <button className="btn light" onClick={() => toggleDone(r.id)}>
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
          id="calculatorView"
          className={view === "calculator" ? undefined : "hide"}
        >
          <div className="sectionHead">
            <div>
              <h2>Built-In Portion Calculator</h2>
              <p>Scale a recipe to the serving size you want.</p>
            </div>
          </div>
          <div className="calc">
            <div className="calcBox">
              <h3>Select a recipe</h3>
              <select
                className="field"
                value={calcRecipeId}
                onChange={(e) => setCalcRecipeId(Number(e.target.value))}
              >
                {recipes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.title}
                  </option>
                ))}
              </select>
              <br />
              <br />
              <label>Original servings</label>
              <div className="calcResult">{calcRecipe.servings}</div>
            </div>
            <div className="calcBox">
              <h3>New serving size</h3>
              <input
                className="field"
                type="number"
                min={1}
                value={newServings}
                onChange={(e) => setNewServings(e.target.value)}
              />
              <br />
              <br />
              <label>Scale factor</label>
              <div className="calcResult">× {ratio.toFixed(2)}</div>
            </div>
          </div>
          <div className="panel" style={{ marginTop: 15 }}>
            <h3>Adjusted Ingredients</h3>
            <div className="guideGrid">
              {calcRecipe.ingredients.map((x) => (
                <div key={x} className="guide">
                  <b>{x}</b>
                  <small>
                    Scale factor: × {ratio.toFixed(2)} for {targetServings}{" "}
                    servings
                  </small>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="groceryView" className={view === "grocery" ? undefined : "hide"}>
          <div className="sectionHead">
            <div>
              <h2>Automatic Grocery List</h2>
              <p>Add ingredients from any recipe with one click.</p>
            </div>
          </div>
          <div className="panel">
            <button className="btn light" onClick={clearGrocery}>
              Clear List
            </button>
            <div style={{ marginTop: 10 }}>
              {grocery.length ? (
                grocery.map((x, i) => (
                  <div key={i} className="groceryItem">
                    <label>
                      <input type="checkbox" /> {x}
                    </label>
                    <button className="btn light" onClick={() => removeGrocery(i)}>
                      Remove
                    </button>
                  </div>
                ))
              ) : (
                <div className="empty">
                  Your grocery list is empty. Add ingredients from any recipe.
                </div>
              )}
            </div>
          </div>
        </section>

        <section id="bonusesView" className={view === "bonuses" ? undefined : "hide"}>
          <div className="sectionHead">
            <div>
              <h2>Your Premium Bonuses</h2>
              <p>Included with your access.</p>
            </div>
          </div>
          <div className="bonusGrid">
            <div className="bonus">
              <div className="book">⭐</div>
              <h3>Metabolic Recipes</h3>
              <p>
                Protein- and fiber-forward meal ideas using measured portions
                and everyday ingredients.
              </p>
              <span className="included">INCLUDED</span>
              <br />
              <br />
              <button className="btn primary" onClick={() => setView("metabolic")}>
                Open Bonus
              </button>
            </div>
            <div className="bonus">
              <div className="book">⚠️</div>
              <h3>The Blacklist of Medications and Supplements</h3>
              <p>
                A safety-awareness guide for medication, supplement, herb and
                tea combinations to review with your doctor or pharmacist.
              </p>
              <span className="included">INCLUDED</span>
              <br />
              <br />
              <button className="btn primary" onClick={() => setView("meds")}>
                Open Bonus
              </button>
            </div>
            <div className="bonus">
              <div className="book">🍵</div>
              <h3>The Golden Tea Recipe</h3>
              <p>
                A simple warm turmeric, cinnamon and ginger tea recipe for your
                kitchen routine.
              </p>
              <span className="included">INCLUDED</span>
              <br />
              <br />
              <button className="btn primary" onClick={() => setView("tea")}>
                Open Bonus
              </button>
            </div>
          </div>
        </section>

        <section
          id="metabolicView"
          className={view === "metabolic" ? undefined : "hide"}
        >
          <div className="sectionHead">
            <div>
              <h2>Metabolic Recipes</h2>
              <p>24 bonus protein- and fiber-forward recipe ideas.</p>
            </div>
          </div>
          <div className="grid">
            {metabolic.map((r, i) => (
              <article key={i} className="card">
                <div className="cover">
                  ⭐
                  <span className="pill">Bonus Recipe {i + 1}</span>
                </div>
                <div className="body">
                  <h3>{r.title}</h3>
                  <p>{r.desc}</p>
                  <div className="actions">
                    <button
                      className="btn primary"
                      onClick={() => setOpenMetabolicIndex(i)}
                    >
                      View Recipe
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="medsView" className={view === "meds" ? undefined : "hide"}>
          <div className="sectionHead">
            <div>
              <h2>The Blacklist of Medications and Supplements</h2>
              <p>Safety-awareness guide — not a stop-medication list.</p>
            </div>
          </div>
          <div className="panel">
            <div className="note">
              <b>
                Important: Never stop, reduce, replace, or change a prescribed
                medicine because of this guide. Review medication, supplement,
                herb and tea combinations with your doctor or pharmacist.
              </b>
            </div>
            <div className="guideGrid" style={{ marginTop: 15 }}>
              {medGuide.map((x) => (
                <div key={x[0]} className="guide">
                  <b>{x[0]}</b>
                  <small>{x[1]}</small>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="teaView" className={view === "tea" ? undefined : "hide"}>
          <div className="sectionHead">
            <div>
              <h2>The Golden Tea Recipe</h2>
              <p>Bonus kitchen recipe.</p>
            </div>
          </div>
          <div className="panel">
            <div className="cols">
              <div>
                <h3>Ingredients</h3>
                <ul>
                  {goldenTea.ingredients.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3>Method</h3>
                <ol>
                  {goldenTea.steps.map((x, i) => (
                    <li key={i}>{x}</li>
                  ))}
                </ol>
                <div className="note">{goldenTea.note}</div>
              </div>
            </div>
          </div>
        </section>

        <section id="toolsView" className={view === "tools" ? undefined : "hide"}>
          <div className="sectionHead">
            <div>
              <h2>Pantry &amp; Grocery Starter</h2>
              <p>Quick reference for common ingredients.</p>
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
                    <b>Note:</b> {openRecipe.note}
                  </div>
                </div>
              </div>
              <div className="actions">
                <button
                  className="btn gold"
                  onClick={() => addRecipeToGrocery(openRecipe)}
                >
                  Add Ingredients to Grocery List
                </button>
                <button
                  className="btn primary"
                  onClick={() => toggleDone(openRecipe.id)}
                >
                  {completed.includes(openRecipe.id)
                    ? "✓ Completed — Undo"
                    : "Mark Complete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {openMetabolic && (
        <div
          className="modal open"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpenMetabolicIndex(null);
          }}
        >
          <div className="box">
            <button className="close" onClick={() => setOpenMetabolicIndex(null)}>
              ×
            </button>
            <div>
              <span className="badge">Metabolic Recipes • Bonus</span>
              <h2>
                ⭐ {openMetabolic.title}
              </h2>
              <p>{openMetabolic.desc}</p>
              <div className="cols">
                <div>
                  <h3>Ingredients</h3>
                  <ul>
                    {openMetabolic.ingredients.map((x) => (
                      <li key={x}>{x}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3>Method</h3>
                  <ol>
                    {openMetabolic.steps.map((x, i) => (
                      <li key={i}>{x}</li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <footer>
        For general recipe and educational information only. Not medical advice.
        If you manage diabetes or another medical condition, use carbohydrate
        portions and ingredients that fit your individual care plan, and do not
        change medications without professional guidance.
      </footer>
    </>
  );
}

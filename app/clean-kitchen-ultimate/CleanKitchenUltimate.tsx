"use client";

import { useEffect, useState } from "react";
import AppSwitcher from "../components/AppSwitcher";
import { useLocalList, setLocalList } from "../components/useLocalList";
import { bonuses, CATEGORIES, recipes, type Recipe } from "./data";

type View = "recipes" | "calculator" | "grocery" | "pantry" | "cook" | "bonuses";

const TABS: { id: View; label: string }[] = [
  { id: "recipes", label: "🍽️ 4,000 Recipes" },
  { id: "calculator", label: "🧮 Portion Calculator" },
  { id: "grocery", label: "🛒 Grocery List" },
  { id: "pantry", label: "🥫 Pantry Tracker" },
  { id: "cook", label: "🔎 What Can I Cook?" },
  { id: "bonuses", label: "🎁 10 Bonuses" },
];

const PAGE_SIZE = 60;

export default function CleanKitchenUltimate() {
  const [view, setView] = useState<View>("recipes");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [level, setLevel] = useState("All");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [completedOnly, setCompletedOnly] = useState(false);
  const favs = useLocalList<number>("cku_favs");
  const completed = useLocalList<number>("cku_done");
  const grocery = useLocalList<string>("cku_grocery");
  const pantry = useLocalList<string>("cku_pantry");
  const [currentPage, setCurrentPage] = useState(1);
  const [openRecipeId, setOpenRecipeId] = useState<number | null>(null);
  const [openBonusIndex, setOpenBonusIndex] = useState<number | null>(null);
  const [calcRecipeId, setCalcRecipeId] = useState<number>(recipes[0].id);
  const [newServings, setNewServings] = useState<string>("2");
  const [pantryInput, setPantryInput] = useState("");
  const [ingredientSearch, setIngredientSearch] = useState("");
  const [cookResults, setCookResults] = useState<Recipe[] | null>(null);

  useEffect(() => {
    document.body.style.overflow =
      openRecipeId !== null || openBonusIndex !== null ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [openRecipeId, openBonusIndex]);

  const q = search.trim().toLowerCase();
  const rows = recipes.filter((r) => {
    const qok =
      !q ||
      `${r.title} ${r.desc} ${r.cat} ${r.ingredients.join(" ")}`
        .toLowerCase()
        .includes(q);
    return (
      qok &&
      (category === "All" || r.cat === category) &&
      (level === "All" || r.level === level) &&
      (!favoritesOnly || favs.includes(r.id)) &&
      (!completedOnly || completed.includes(r.id))
    );
  });
  const shown = rows.slice(0, currentPage * PAGE_SIZE);
  const resultText = `${rows.length.toLocaleString()} recipes found • showing ${shown.length.toLocaleString()}`;

  const openRecipe =
    openRecipeId !== null
      ? recipes.find((r) => r.id === openRecipeId) ?? null
      : null;
  const openBonus =
    openBonusIndex !== null ? bonuses[openBonusIndex] : null;

  const calcRecipe = recipes.find((r) => r.id === calcRecipeId) ?? recipes[0];
  const targetServings = Math.max(1, Number(newServings) || 1);
  const ratio = targetServings / calcRecipe.servings;

  function toggleFav(id: number) {
    const next = favs.includes(id)
      ? favs.filter((x) => x !== id)
      : [...favs, id];
    setLocalList("cku_favs", next);
  }

  function toggleDone(id: number) {
    const next = completed.includes(id)
      ? completed.filter((x) => x !== id)
      : [...completed, id];
    setLocalList("cku_done", next);
  }

  function toggleFavorites() {
    setFavoritesOnly((v) => !v);
    setCompletedOnly(false);
    setCurrentPage(1);
    setView("recipes");
  }

  function toggleCompleted() {
    setCompletedOnly((v) => !v);
    setFavoritesOnly(false);
    setCurrentPage(1);
    setView("recipes");
  }

  function resetFilterToggles() {
    setFavoritesOnly(false);
    setCompletedOnly(false);
  }

  function addRecipeToGrocery(r: Recipe) {
    const set = new Set(grocery);
    r.ingredients.forEach((x) => set.add(x));
    const next = [...set];
    setLocalList("cku_grocery", next);
  }

  function removeGrocery(i: number) {
    const next = grocery.filter((_, j) => j !== i);
    setLocalList("cku_grocery", next);
  }

  function clearGrocery() {
    setLocalList("cku_grocery", []);
  }

  function addPantry() {
    const v = pantryInput.trim();
    if (!v) return;
    if (pantry.includes(v)) {
      setPantryInput("");
      return;
    }
    const next = [...pantry, v];
    setLocalList("cku_pantry", next);
    setPantryInput("");
  }

  function removePantry(i: number) {
    const next = pantry.filter((_, j) => j !== i);
    setLocalList("cku_pantry", next);
  }

  function findByIngredients() {
    const terms = ingredientSearch
      .toLowerCase()
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);
    if (!terms.length) {
      setCookResults([]);
      return;
    }
    const matches = recipes
      .filter((r) => {
        const hay = (r.ingredients.join(" ") + " " + r.title).toLowerCase();
        return terms.every((t) => hay.includes(t));
      })
      .slice(0, 30);
    setCookResults(matches);
  }

  return (
    <>
      <header className="top">
        <div className="wrap topin">
          <div className="brand">
            <div className="mark">🥗</div>
            <div>
              Clean Kitchen Ultimate
              <small>4,000+ Recipes • Smart Tools • 10 Premium Guides</small>
            </div>
          </div>
          <AppSwitcher />
        </div>
      </header>

      <section className="wrap hero">
        <div className="heroBox">
          <div>
            <span className="kicker">PREMIUM LIFETIME ACCESS</span>
            <h1>Your Entire Kitchen In One Powerful App</h1>
            <p>
              4,000+ recipe ideas across breakfast, lunch, dinner, breads, air
              fryer meals, slow cooker meals, one-pot dishes, snacks, soups,
              salads, drinks and more — plus planning tools, pantry tracking,
              grocery lists and premium guides.
            </p>
          </div>
          <div className="stats">
            <div className="stat">
              <b>4,000+</b>
              <span>Recipe ideas</span>
            </div>
            <div className="stat">
              <b>10</b>
              <span>Premium guides</span>
            </div>
            <div className="stat">
              <b>10</b>
              <span>Main recipe sections</span>
            </div>
            <div className="stat">
              <b>{completed.length}</b>
              <span>Recipes tried</span>
            </div>
          </div>
        </div>
        <div className="dashboard">
          <div className="dash">
            <b>{favs.length}</b>
            <span>Favorites</span>
          </div>
          <div className="dash">
            <b>{grocery.length}</b>
            <span>Grocery items</span>
          </div>
          <div className="dash">
            <b>{pantry.length}</b>
            <span>Pantry items</span>
          </div>
          <div className="dash">
            <b>0</b>
            <span>Planned meals</span>
          </div>
        </div>
      </section>

      <main className="wrap">
        <div className="toolbar">
          <input
            className="field"
            placeholder="Search chicken, lemon, air fryer..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
              resetFilterToggles();
            }}
          />
          <select
            className="field"
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setCurrentPage(1);
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
              setCurrentPage(1);
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
              <h2>Ultimate Recipe Library</h2>
              <p>{resultText}</p>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn light" onClick={toggleFavorites}>
                ♡ Favorites
              </button>
              <button className="btn light" onClick={toggleCompleted}>
                ✓ Tried
              </button>
            </div>
          </div>
          <div className="grid">
            {shown.length ? (
              shown.map((r) => (
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
                      <button
                        className="btn light"
                        onClick={() => toggleDone(r.id)}
                      >
                        {completed.includes(r.id) ? "✓ Tried" : "Mark Tried"}
                      </button>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="empty">No recipes match.</div>
            )}
            {rows.length > shown.length && (
              <div className="empty">
                <button
                  className="btn primary"
                  onClick={() => setCurrentPage((p) => p + 1)}
                >
                  Load More Recipes
                </button>
              </div>
            )}
          </div>
        </section>

        <section
          id="calculatorView"
          className={view === "calculator" ? undefined : "hide"}
        >
          <div className="sectionHead">
            <div>
              <h2>Portion Calculator</h2>
              <p>Scale any recipe to the number of servings you need.</p>
            </div>
          </div>
          <div className="toolGrid">
            <div className="toolBox">
              <h3>Select Recipe</h3>
              <select
                className="field"
                value={calcRecipeId}
                onChange={(e) => setCalcRecipeId(Number(e.target.value))}
              >
                {recipes.slice(0, 1000).map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.title}
                  </option>
                ))}
              </select>
              <br />
              <br />
              <label>Original servings</label>
              <div style={{ fontSize: 28, fontWeight: 900, color: "var(--green2)" }}>
                {calcRecipe.servings}
              </div>
            </div>
            <div className="toolBox">
              <h3>New Serving Size</h3>
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
              <div style={{ fontSize: 28, fontWeight: 900, color: "var(--green2)" }}>
                × {ratio.toFixed(2)}
              </div>
            </div>
          </div>
          <div className="panel" style={{ marginTop: 15 }}>
            <h3>Adjusted Ingredients</h3>
            <div className="guideGrid">
              {calcRecipe.ingredients.map((x) => (
                <div key={x} className="guide">
                  <b>{x}</b>
                  <small>
                    Multiply the listed amount by × {ratio.toFixed(2)} for{" "}
                    {targetServings} serving{targetServings === 1 ? "" : "s"}.
                  </small>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          id="groceryView"
          className={view === "grocery" ? undefined : "hide"}
        >
          <div className="sectionHead">
            <div>
              <h2>Automatic Grocery List</h2>
              <p>Add ingredients from recipes with one click.</p>
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
                    <button
                      className="btn light"
                      onClick={() => removeGrocery(i)}
                    >
                      Remove
                    </button>
                  </div>
                ))
              ) : (
                <div className="empty">Your grocery list is empty.</div>
              )}
            </div>
          </div>
        </section>

        <section
          id="pantryView"
          className={view === "pantry" ? undefined : "hide"}
        >
          <div className="sectionHead">
            <div>
              <h2>Pantry Tracker</h2>
              <p>Keep track of what you already have.</p>
            </div>
          </div>
          <div className="panel">
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <input
                className="field"
                placeholder="Add pantry item..."
                style={{ maxWidth: 500 }}
                value={pantryInput}
                onChange={(e) => setPantryInput(e.target.value)}
              />
              <button className="btn primary" onClick={addPantry}>
                Add Item
              </button>
            </div>
            <div style={{ marginTop: 12 }}>
              {pantry.length ? (
                pantry.map((x, i) => (
                  <div key={i} className="pantryItem">
                    <span>{x}</span>
                    <button
                      className="btn light"
                      onClick={() => removePantry(i)}
                    >
                      Remove
                    </button>
                  </div>
                ))
              ) : (
                <div className="empty">No pantry items saved.</div>
              )}
            </div>
          </div>
        </section>

        <section
          id="cookView"
          className={view === "cook" ? undefined : "hide"}
        >
          <div className="sectionHead">
            <div>
              <h2>What Can I Cook?</h2>
              <p>Search recipes using ingredients you already have.</p>
            </div>
          </div>
          <div className="panel">
            <input
              className="field"
              placeholder="Example: chicken, tomato, lemon"
              value={ingredientSearch}
              onChange={(e) => setIngredientSearch(e.target.value)}
            />
            <div style={{ marginTop: 10 }}>
              <button className="btn primary" onClick={findByIngredients}>
                Find Recipes
              </button>
            </div>
            <div className="grid" style={{ marginTop: 15 }}>
              {cookResults &&
                (cookResults.length ? (
                  cookResults.map((r) => (
                    <article key={r.id} className="card">
                      <div className="cover">
                        {r.emoji}
                        <span className="pill">{r.cat}</span>
                      </div>
                      <div className="body">
                        <h3>{r.title}</h3>
                        <p>{r.desc}</p>
                        <button
                          className="btn primary"
                          onClick={() => setOpenRecipeId(r.id)}
                        >
                          View Recipe
                        </button>
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="empty">
                    {ingredientSearch.trim()
                      ? "No exact matches. Try fewer ingredients."
                      : "Enter ingredients first."}
                  </div>
                ))}
            </div>
          </div>
        </section>

        <section
          id="bonusesView"
          className={view === "bonuses" ? undefined : "hide"}
        >
          <div className="sectionHead">
            <div>
              <h2>10 Premium Guides</h2>
              <p>Included with Clean Kitchen Ultimate.</p>
            </div>
          </div>
          <div className="bonusGrid">
            {bonuses.map((b, i) => (
              <div key={b[1]} className="bonus">
                <h3>
                  {b[0]} {b[1]}
                </h3>
                <p>{b[2]}</p>
                <span className="included">PREMIUM GUIDE INCLUDED</span>
                <br />
                <br />
                <button
                  className="btn primary"
                  onClick={() => setOpenBonusIndex(i)}
                >
                  Open Guide
                </button>
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
                  <h3>Ingredients</h3>
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
                  <p>
                    <b>Kitchen Note:</b> {openRecipe.note}
                  </p>
                </div>
              </div>
              <div className="actions">
                <button
                  className="btn gold"
                  onClick={() => addRecipeToGrocery(openRecipe)}
                >
                  Add Ingredients to Grocery
                </button>
                <button
                  className="btn primary"
                  onClick={() => toggleDone(openRecipe.id)}
                >
                  {completed.includes(openRecipe.id)
                    ? "✓ Tried — Undo"
                    : "Mark As Tried"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {openBonus && (
        <div
          className="modal open"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpenBonusIndex(null);
          }}
        >
          <div className="box">
            <button className="close" onClick={() => setOpenBonusIndex(null)}>
              ×
            </button>
            <div>
              <span className="badge">
                Premium Guide {(openBonusIndex ?? 0) + 1} of 10
              </span>
              <h2>
                {openBonus[0]} {openBonus[1]}
              </h2>
              <p>{openBonus[2]}</p>
              <div className="panel">
                <p>
                  This guide is designed as a practical companion to the recipe
                  app. Use it to organize meals, prep ingredients, and make the
                  library easier to use in everyday life.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <footer>
        For general recipe and meal-planning information only. Individual
        dietary needs vary.
      </footer>
    </>
  );
}

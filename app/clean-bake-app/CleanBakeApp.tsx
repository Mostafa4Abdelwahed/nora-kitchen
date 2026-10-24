"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import AppSwitcher from "../components/AppSwitcher";
import {
  PAGE,
  ICONS,
  Logo,
  Stars,
  ratingFor,
  reviewsFor,
} from "../components/clean-ui";
import { useLocalList, setLocalList } from "../components/useLocalList";
import {
  CATEGORIES,
  goldenTea,
  medGuide,
  metabolic,
  recipes,
  shopping,
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

const CAT_TAG: Record<string, string> = {
  Breakfast: "High Protein",
  Breads: "Fresh",
  Desserts: "Sweet",
  Snacks: "Quick",
  Drinks: "Refreshing",
  Sides: "Healthy",
};

const COVER_CLASS: Record<string, string> = {
  Breakfast: "gbreak",
  Breads: "gloaf",
  Desserts: "gdessert",
  Snacks: "gsnack",
  Drinks: "gdrink",
  Sides: "gside",
};

export default function CleanBakeApp() {
  const [view, setView] = useState<View>("recipes");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [level, setLevel] = useState("All");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [completedOnly, setCompletedOnly] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [limit, setLimit] = useState(PAGE);
  const sentinel = useRef<HTMLButtonElement | null>(null);
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
      openRecipeId !== null || openMetabolicIndex !== null || drawer
        ? "hidden"
        : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [openRecipeId, openMetabolicIndex, drawer]);

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

  const visibleCount = Math.min(limit, rows.length);
  const visible = rows.slice(0, visibleCount);
  const hasMore = visibleCount < rows.length;

  const filterKey = `${search}|${category}|${level}|${favoritesOnly}|${completedOnly}|${view}`;
  const [prevKey, setPrevKey] = useState(filterKey);
  if (prevKey !== filterKey) {
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

  const openRecipe =
    openRecipeId !== null
      ? recipes.find((r) => r.id === openRecipeId) ?? null
      : null;
  const openMetabolic =
    openMetabolicIndex !== null ? metabolic[openMetabolicIndex] ?? null : null;

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

  function addRecipeToGrocery(ingredients: string[]) {
    const set = new Set(grocery);
    ingredients.forEach((x) => set.add(x));
    setLocalList("cb_grocery", [...set]);
  }

  function removeGrocery(i: number) {
    const next = grocery.filter((_, j) => j !== i);
    setLocalList("cb_grocery", next);
  }

  function clearGrocery() {
    setLocalList("cb_grocery", []);
  }

  function focusSearch() {
    document.getElementById("cb-search")?.focus();
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

          <Logo onHome={goHome} />

          <nav className="navRight">
            <AppSwitcher />
            <button className="iconBtn" aria-label="Search" onClick={focusSearch}>
              {ICONS.search}
            </button>
          </nav>

          <button
            className="iconBtn mSearch"
            aria-label="Search"
            onClick={focusSearch}
          >
            {ICONS.search}
          </button>
        </div>
      </header>

      <div className="wrap find">
        <div className="searchBar">
          {ICONS.search}
          <input
            id="cb-search"
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
        <section
          id="recipesView"
          className={view === "recipes" ? undefined : "secHide"}
        >
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

          <div className="grid">
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
                    <div className={`cover ${COVER_CLASS[r.cat] ?? "gloaf"}`}>
                      {done && <span className="coverDone">✓ Done</span>}
                      <span className="food">{r.emoji}</span>
                      <button
                        className={`heartBtn${fav ? " on" : ""}`}
                        aria-label={
                          fav ? "Remove from favorites" : "Add to favorites"
                        }
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
                        {[
                          CAT_TAG[r.cat] ?? "Healthy",
                          r.level,
                          "Balanced",
                        ].map((t) => (
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
                onClick={() => setLimit((l) => l + PAGE)}
                aria-label={`Load more recipes — showing ${visibleCount} of ${rows.length}`}
              >
                <span className="loadPlus" aria-hidden="true">
                  +
                </span>
                <b>Load more</b>
                <small>
                  {visibleCount} of {rows.length} recipes shown
                </small>
              </button>
            )}
          </div>
        </section>

        <section
          id="calculatorView"
          className={view === "calculator" ? undefined : "secHide"}
        >
          <div className="sectionHead">
            <h2>Built-In Portion Calculator</h2>
            <p>Scale a recipe to the serving size you want.</p>
          </div>
          <div className="calGrid">
            <div className="calcBox">
              <h3>Select a recipe</h3>
              <select
                className="field"
                value={calcRecipeId}
                aria-label="Recipe to scale"
                onChange={(e) => setCalcRecipeId(Number(e.target.value))}
              >
                {recipes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.title}
                  </option>
                ))}
              </select>
              <label>Original servings</label>
              <div className="calcNum">{calcRecipe.servings}</div>
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
              <label>Scale factor</label>
              <div className="calcNum">× {ratio.toFixed(2)}</div>
            </div>
          </div>
          <div className="panel" style={{ marginTop: 16 }}>
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

        <section
          id="groceryView"
          className={view === "grocery" ? undefined : "secHide"}
        >
          <div className="sectionHead">
            <h2>Automatic Grocery List</h2>
            <p>Add ingredients from any recipe with one click.</p>
          </div>
          <div className="panel">
            <div className="toolRowBetween">
              <span className="cnt">{grocery.length} items</span>
              {grocery.length > 0 && (
                <button className="removeItem" onClick={clearGrocery}>
                  Clear List
                </button>
              )}
            </div>
            {grocery.length ? (
              grocery.map((x, i) => (
                <div key={`${x}-${i}`} className="listItem">
                  <label>
                    <input type="checkbox" /> {x}
                  </label>
                  <button
                    className="removeItem"
                    onClick={() => removeGrocery(i)}
                  >
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
        </section>

        <section
          id="bonusesView"
          className={view === "bonuses" ? undefined : "secHide"}
        >
          <div className="sectionHead">
            <h2>Your Premium Bonuses</h2>
            <p>Included with your access.</p>
          </div>
          <div className="bonusGrid">
            <div className="bonus">
              <div className="bicon">🥗</div>
              <h3>Metabolic Recipes</h3>
              <p>
                Protein- and fiber-forward meal ideas using measured portions
                and everyday ingredients.
              </p>
              <div className="valueRow">
                <span className="freePill">INCLUDED</span>
              </div>
              <button className="btnGreen" onClick={() => setView("metabolic")}>
                Open Bonus
              </button>
            </div>
            <div className="bonus">
              <div className="bicon">⚠️</div>
              <h3>The Blacklist of Medications and Supplements</h3>
              <p>
                A safety-awareness guide for medication, supplement, herb and
                tea combinations to review with your doctor or pharmacist.
              </p>
              <div className="valueRow">
                <span className="freePill">INCLUDED</span>
              </div>
              <button className="btnGreen" onClick={() => setView("meds")}>
                Open Bonus
              </button>
            </div>
            <div className="bonus">
              <div className="bicon">🍵</div>
              <h3>The Golden Tea Recipe</h3>
              <p>
                A simple warm turmeric, cinnamon and ginger tea recipe for your
                kitchen routine.
              </p>
              <div className="valueRow">
                <span className="freePill">INCLUDED</span>
              </div>
              <button className="btnGreen" onClick={() => setView("tea")}>
                Open Bonus
              </button>
            </div>
          </div>
        </section>

        <section
          id="metabolicView"
          className={view === "metabolic" ? undefined : "secHide"}
        >
          <div className="sectionHead">
            <h2>Metabolic Recipes</h2>
            <p>24 bonus protein- and fiber-forward recipe ideas.</p>
          </div>
          <div className="grid">
            {metabolic.map((r, i) => (
              <article
                key={`${r.title}-${i}`}
                className="card"
                role="button"
                tabIndex={0}
                onClick={() => setOpenMetabolicIndex(i)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setOpenMetabolicIndex(i);
                  }
                }}
              >
                <div className="cover soft">
                  <span className="food">{r.emoji}</span>
                </div>
                <div className="body">
                  <h3>{r.title}</h3>
                  <div className="rate">
                    <Stars value={Number(ratingFor(77 + i))} />
                    <span className="num">{ratingFor(77 + i)}</span>
                    <small>({reviewsFor(77 + i)})</small>
                  </div>
                  <div className="tags">
                    <span className="tag">High Protein</span>
                    <span className="tag">Bonus Recipe {i + 1}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section
          id="medsView"
          className={view === "meds" ? undefined : "secHide"}
        >
          <div className="sectionHead">
            <h2>The Blacklist of Medications and Supplements</h2>
            <p>Safety-awareness guide — not a stop-medication list.</p>
          </div>
          <div className="panel">
            <div className="note" style={{ marginBottom: 16 }}>
              <b>
                Important: Never stop, reduce, replace, or change a prescribed
                medicine because of this guide.
              </b>{" "}
              Review medication, supplement, herb and tea combinations with
              your doctor or pharmacist.
            </div>
            <div className="guideGrid">
              {medGuide.map((x) => (
                <div key={x[0]} className="guide">
                  <b>{x[0]}</b>
                  <small>{x[1]}</small>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="teaView" className={view === "tea" ? undefined : "secHide"}>
          <div className="sectionHead">
            <h2>The Golden Tea Recipe</h2>
            <p>Bonus kitchen recipe.</p>
          </div>
          <div className="panel">
            <div className="msec">
              <h3>
                Ingredients
                <span className="cnt">{goldenTea.ingredients.length}</span>
              </h3>
              <ul className="ings">
                {goldenTea.ingredients.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </div>
            <div className="msec" style={{ marginBottom: 0 }}>
              <h3>
                Method
                <span className="cnt">{goldenTea.steps.length} steps</span>
              </h3>
              <ol className="steps">
                {goldenTea.steps.map((x, i) => (
                  <li key={i}>{x}</li>
                ))}
              </ol>
              <div className="note" style={{ marginTop: 14, marginBottom: 0 }}>
                <b>Tip:</b> {goldenTea.note}
              </div>
            </div>
          </div>
        </section>

        <section
          id="toolsView"
          className={view === "tools" ? undefined : "secHide"}
        >
          <div className="sectionHead">
            <h2>Pantry &amp; Grocery Starter</h2>
            <p>Quick reference for common ingredients.</p>
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
                alt="Clean Bake App"
                width={1254}
                height={1254}
              />
              <button
                className="close"
                aria-label="Close menu"
                onClick={() => setDrawer(false)}
              >
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
              <div
                className={`mcover ${COVER_CLASS[openRecipe.cat] ?? "gloaf"}`}
              >
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
              <div className="recipeSummary">
                <div>
                  <b>👥 Servings</b>
                  <small>{openRecipe.servings}</small>
                </div>
                <div>
                  <b>⏱ Total Time</b>
                  <small>{openRecipe.time}</small>
                </div>
                <div>
                  <b>🧾 Ingredients</b>
                  <small>{openRecipe.ingredients.length}</small>
                </div>
              </div>
              <div className="exactNote">
                <b>Before you start:</b> Measure each ingredient exactly as
                listed below, then use the Portion Calculator if you need a
                different number of servings.
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
              <div className="msec" style={{ marginBottom: 14 }}>
                <h3>
                  Method
                  <span className="cnt">{openRecipe.steps.length} steps</span>
                </h3>
                <ol className="steps">
                  {openRecipe.steps.map((x, i) => (
                    <li key={i}>{x}</li>
                  ))}
                </ol>
                <div className="note" style={{ marginTop: 14, marginBottom: 0 }}>
                  <b>Note:</b> {openRecipe.note}
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
                  : "♡ Favorite"}
              </button>
              <button
                className="btnGreen light"
                onClick={() => addRecipeToGrocery(openRecipe.ingredients)}
              >
                🛒 Grocery
              </button>
              <button
                className="btnGreen doneBtn"
                onClick={() => toggleDone(openRecipe.id)}
              >
                {completed.includes(openRecipe.id)
                  ? "✓ Completed — Undo"
                  : "Mark Complete"}
              </button>
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
            <button
              className="close"
              onClick={() => setOpenMetabolicIndex(null)}
            >
              ×
            </button>
            <div className="mhead">
              <div className="mcover soft">
                <span className="food">{openMetabolic.emoji}</span>
              </div>
              <div className="mheadInfo">
                <span className="badge">Metabolic Recipes • Bonus</span>
                <h2>{openMetabolic.title}</h2>
                <p>{openMetabolic.desc}</p>
              </div>
            </div>
            <div className="modalBody">
              <div className="recipeSummary">
                <div>
                  <b>👥 Servings</b>
                  <small>{openMetabolic.servings}</small>
                </div>
                <div>
                  <b>🧾 Ingredients</b>
                  <small>{openMetabolic.ingredients.length}</small>
                </div>
                <div>
                  <b>⭐ Bonus</b>
                  <small>Metabolic recipe</small>
                </div>
              </div>
              <div className="msec">
                <h3>
                  Ingredients
                  <span className="cnt">
                    {openMetabolic.ingredients.length}
                  </span>
                </h3>
                <ul className="ings">
                  {openMetabolic.ingredients.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
              </div>
              <div className="msec" style={{ marginBottom: 0 }}>
                <h3>
                  Method
                  <span className="cnt">{openMetabolic.steps.length} steps</span>
                </h3>
                <ol className="steps">
                  {openMetabolic.steps.map((x, i) => (
                    <li key={i}>{x}</li>
                  ))}
                </ol>
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
          For general recipe and educational information only. Not medical
          advice. If you manage diabetes or another medical condition, use
          carbohydrate portions and ingredients that fit your individual care
          plan, and do not change medications without professional guidance.
        </p>
      </footer>
    </>
  );
}

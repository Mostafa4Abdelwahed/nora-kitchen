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
import { bonuses, CATEGORIES, recipes } from "./data";

type View =
  | "recipes"
  | "calculator"
  | "grocery"
  | "pantry"
  | "cook"
  | "bonuses";

const CAT_TAG: Record<string, string> = {
  Breakfast: "Healthy",
  Breads: "Fresh",
  Lunches: "Balanced",
  Dinners: "Family",
  Snacks: "Quick",
};

const COVER_CLASS: Record<string, string> = {
  Breakfast: "gbreak",
  Breads: "gloaf",
  Lunches: "gmeal",
  Dinners: "gdinner",
  Snacks: "gsnack",
};

export default function CleanKitchenUltimate() {
  const [view, setView] = useState<View>("recipes");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [level, setLevel] = useState("All");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [completedOnly, setCompletedOnly] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [limit, setLimit] = useState(PAGE);
  const sentinel = useRef<HTMLButtonElement | null>(null);
  const favs = useLocalList<number>("cku_favs");
  const completed = useLocalList<number>("cku_done");
  const grocery = useLocalList<string>("cku_grocery");
  const pantry = useLocalList<string>("cku_pantry");
  const [openRecipeId, setOpenRecipeId] = useState<number | null>(null);
  const [openBonusIndex, setOpenBonusIndex] = useState<number | null>(null);
  const [calcRecipeId, setCalcRecipeId] = useState<number>(recipes[0].id);
  const [newServings, setNewServings] = useState<string>("2");
  const [pantryInput, setPantryInput] = useState("");
  const [ingredientSearch, setIngredientSearch] = useState("");
  const [cookResults, setCookResults] = useState<null | "searching" | "done">(
    null,
  );
  const [cookFound, setCookFound] = useState<typeof recipes>([]);

  useEffect(() => {
    document.body.style.overflow =
      openRecipeId !== null || openBonusIndex !== null || drawer
        ? "hidden"
        : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [openRecipeId, openBonusIndex, drawer]);

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
  const openBonus =
    openBonusIndex !== null ? bonuses[openBonusIndex] ?? null : null;

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
    setLocalList("cku_grocery", [...set]);
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
    setLocalList("cku_pantry", [...pantry, v]);
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
      setCookFound([]);
      setCookResults("done");
      return;
    }
    const matches = recipes
      .filter((r) => {
        const hay = (r.ingredients.join(" ") + " " + r.title).toLowerCase();
        return terms.every((t) => hay.includes(t));
      })
      .slice(0, 30);
    setCookFound(matches);
    setCookResults("done");
  }

  function focusSearch() {
    document.getElementById("cku-search")?.focus();
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
            id="cku-search"
            placeholder={`Search 4,000+ recipes...`}
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
              {completedOnly ? "Tried • " : ""}
              {rows.length.toLocaleString()} of{" "}
              {recipes.length.toLocaleString()} recipes
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
                aria-label="Show only tried"
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
                    <div className={`cover ${COVER_CLASS[r.cat] ?? "gmeal"}`}>
                      {done && <span className="coverDone">✓ Tried</span>}
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
                        <Stars value={Number(ratingFor((r.id * 7) % 9973))} />
                        <span className="num">{ratingFor((r.id * 7) % 9973)}</span>
                        <small>({reviewsFor((r.id * 7) % 9973)})</small>
                      </div>
                      <div className="tags">
                        {done && <span className="tag solid">✓ Tried</span>}
                        {[CAT_TAG[r.cat] ?? "Family", r.level, "No Sugar"].map(
                          (t) => (
                            <span key={t} className="tag">
                              {t}
                            </span>
                          ),
                        )}
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
                  {visibleCount.toLocaleString()} of{" "}
                  {rows.length.toLocaleString()} recipes shown
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
            <h2>Portion Calculator</h2>
            <p>Scale any recipe to the number of servings you need.</p>
          </div>
          <div className="calGrid">
            <div className="calcBox">
              <h3>Select recipe</h3>
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
          className={view === "grocery" ? undefined : "secHide"}
        >
          <div className="sectionHead">
            <h2>Automatic Grocery List</h2>
            <p>Add ingredients from recipes with one click.</p>
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
              <div className="empty">Your grocery list is empty.</div>
            )}
          </div>
        </section>

        <section
          id="pantryView"
          className={view === "pantry" ? undefined : "secHide"}
        >
          <div className="sectionHead">
            <h2>Pantry Tracker</h2>
            <p>Keep track of what you already have.</p>
          </div>
          <div className="panel">
            <div className="pantryAdd">
              <input
                className="field"
                placeholder="Add pantry item..."
                value={pantryInput}
                onChange={(e) => setPantryInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addPantry();
                  }
                }}
              />
              <button className="btnGreen" onClick={addPantry}>
                Add Item
              </button>
            </div>
            <div className="toolRowBetween" style={{ marginTop: 14 }}>
              <span className="cnt">{pantry.length} items</span>
            </div>
            {pantry.length ? (
              pantry.map((x, i) => (
                <div key={`${x}-${i}`} className="listItem">
                  <span>{x}</span>
                  <button
                    className="removeItem"
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
        </section>

        <section
          id="cookView"
          className={view === "cook" ? undefined : "secHide"}
        >
          <div className="sectionHead">
            <h2>What Can I Cook?</h2>
            <p>Search recipes using ingredients you already have.</p>
          </div>
          <div className="panel">
            <div className="pantryAdd">
              <input
                className="field"
                placeholder="Example: chicken, tomato, lemon"
                value={ingredientSearch}
                onChange={(e) => setIngredientSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    findByIngredients();
                  }
                }}
              />
              <button className="btnGreen" onClick={findByIngredients}>
                Find Recipes
              </button>
            </div>
            {cookResults ? (
              <div className="grid" style={{ marginTop: 16 }}>
                {cookFound.length ? (
                  cookFound.map((r) => (
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
                      <div className={`cover ${COVER_CLASS[r.cat] ?? "gmeal"}`}>
                        <span className="food">{r.emoji}</span>
                        <div className="tags" style={{ position: "absolute", left: 12, bottom: 10, zIndex: 2, margin: 0 }}>
                          <span className="tag">{r.cat}</span>
                        </div>
                      </div>
                      <div className="body">
                        <h3>{r.title}</h3>
                        <div className="rate">
                          <Stars value={Number(ratingFor(r.id))} />
                          <span className="num">{ratingFor(r.id)}</span>
                          <small>({reviewsFor(r.id)})</small>
                        </div>
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="empty">
                    {ingredientSearch.trim()
                      ? "No exact matches. Try fewer ingredients."
                      : "Enter ingredients first."}
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </section>

        <section
          id="bonusesView"
          className={view === "bonuses" ? undefined : "secHide"}
        >
          <div className="sectionHead">
            <h2>10 Premium Guides</h2>
            <p>Included with Clean Kitchen Ultimate.</p>
          </div>
          <div className="bonusGrid">
            {bonuses.map((b, i) => (
              <div key={b[1]} className="bonus">
                <div className="bicon">{b[0]}</div>
                <h3>{b[1]}</h3>
                <p>{b[2]}</p>
                <div className="valueRow">
                  <span className="freePill">PREMIUM GUIDE INCLUDED</span>
                </div>
                <button
                  className="btnGreen"
                  onClick={() => setOpenBonusIndex(i)}
                >
                  Open Guide
                </button>
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
                alt="Clean Kitchen Ultimate"
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
              ✓ Tried
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
              <div className={`mcover ${COVER_CLASS[openRecipe.cat] ?? "gmeal"}`}>
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
              <div className="msec" style={{ marginBottom: 0 }}>
                <h3>
                  Method
                  <span className="cnt">{openRecipe.steps.length} steps</span>
                </h3>
                <ol className="steps">
                  {openRecipe.steps.map((x, i) => (
                    <li key={i}>{x}</li>
                  ))}
                </ol>
                <div className="note gray" style={{ marginTop: 14 }}>
                  <b>Kitchen Note:</b> {openRecipe.note}
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
                  ? "✓ Tried — Undo"
                  : "Mark As Tried"}
              </button>
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
            <div className="mhead">
              <div className="mcover soft">
                <span className="food">{openBonus[0]}</span>
              </div>
              <div className="mheadInfo">
                <span className="badge">
                  Premium Guide {(openBonusIndex ?? 0) + 1} of{" "}
                  {bonuses.length}
                </span>
                <h2>{openBonus[1]}</h2>
                <p>{openBonus[2]}</p>
              </div>
            </div>
            <div className="modalBody">
              <div className="note gray">
                <b>About this guide:</b> This guide is designed as a practical
                companion to the recipe app. Use it to organize meals, prep
                ingredients, and make the library easier to use in everyday
                life.
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
          For general recipe and meal-planning information only. Individual
          dietary needs vary.
        </p>
      </footer>
    </>
  );
}

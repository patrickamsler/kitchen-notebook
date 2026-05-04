/* Recipe components — list, card, detail, form, search */
const { useState, useEffect, useMemo, useRef } = React;

/* ---------- Icons ---------- */
const Icon = {
  Search: () => (
    <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" strokeLinecap="round" />
    </svg>
  ),
  Plus: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="14" height="14">
      <path d="M12 5v14M5 12h14" strokeLinecap="round" />
    </svg>
  ),
  X: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" width="14" height="14">
      <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
    </svg>
  ),
  ArrowLeft: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" width="14" height="14">
      <path d="M19 12H5M12 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  ArrowRight: () => (
    <svg className="arrow" viewBox="0 0 24 12" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M0 6h22M17 1l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Edit: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="14" height="14">
      <path d="M14 4l6 6L8 22H2v-6L14 4z" strokeLinejoin="round" />
    </svg>
  ),
  Trash: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="14" height="14">
      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M5 6l1 14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-14" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  ),
  Up: () => (
    <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="m3 7 3-3 3 3" strokeLinecap="round" strokeLinejoin="round" /></svg>
  ),
  Down: () => (
    <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="m3 5 3 3 3-3" strokeLinecap="round" strokeLinejoin="round" /></svg>
  ),
  Caret: () => (
    <svg className="caret" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="m3 5 3 3 3-3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Basket: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="14" height="14">
      <path d="M3 8h18l-2 11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L3 8z" strokeLinejoin="round" />
      <path d="M8 8 12 3l4 5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Check: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12">
      <path d="m4 12 5 5L20 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

/* ---------- Storage ---------- */
const STORAGE_KEY = "recipe-book::recipes::v1";
const SHOPPING_KEY = "recipe-book::shopping::v1";

const storage = {
  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return null;
      return parsed;
    } catch (e) { return null; }
  },
  save(recipes) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes)); }
    catch (e) {}
  },
  loadShopping() {
    try {
      const raw = localStorage.getItem(SHOPPING_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return null;
      return parsed;
    } catch (e) { return null; }
  },
  saveShopping(items) {
    try { localStorage.setItem(SHOPPING_KEY, JSON.stringify(items)); }
    catch (e) {}
  },
};

const uid = () => Math.random().toString(36).slice(2, 10);

/* ---------- Recipe types & sort options ---------- */
const RECIPE_TYPES = [
  { value: "starter",  label: "Starter"  },
  { value: "main",     label: "Main"     },
  { value: "dessert",  label: "Dessert"  },
  { value: "italian",  label: "Italian"  },
  { value: "asian",    label: "Asian"    },
];
const TYPE_LABEL = Object.fromEntries(RECIPE_TYPES.map(t => [t.value, t.label]));

const SORT_OPTIONS = [
  { value: "newest",   label: "Newest first" },
  { value: "oldest",   label: "Oldest first" },
  { value: "az",       label: "A → Z"        },
  { value: "za",       label: "Z → A"        },
];

/* ---------- Search Bar ---------- */
function SearchBar({ value, onChange, count, total }) {
  return (
    <div className="search">
      <Icon.Search />
      <input
        type="text"
        placeholder="Search recipes by title…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete="off"
        spellCheck={false}
      />
      {value && (
        <span className="search-count">
          {count} / {total}
        </span>
      )}
    </div>
  );
}

/* ---------- Recipe Card ---------- */
function RecipeCard({ recipe, onOpen, index }) {
  const created = new Date(recipe.createdAt);
  const month = created.toLocaleString("en-US", { month: "short" }).toUpperCase();
  const day = created.getDate();
  const year = created.getFullYear();
  const num = String(index + 1).padStart(2, "0");
  const types = Array.isArray(recipe.types) ? recipe.types : (recipe.type ? [recipe.type] : []);

  return (
    <article className="card" onClick={onOpen}>
      <div className="card-meta">
        <span>№ {num}</span>
        {types.length > 0 && (
          <span className="card-types">
            {types.map(t => (
              <span key={t} className="card-type">{TYPE_LABEL[t] || t}</span>
            ))}
          </span>
        )}
      </div>
      <h2 className="card-title">{recipe.title}</h2>
      <p className="card-desc">{recipe.description}</p>
      <div className="card-foot">
        <span>{month} {day} · {year}</span>
        <span className="card-stats">{recipe.ingredients.length} ingr · {recipe.steps.length} steps</span>
        <span className="card-open">Open <Icon.ArrowRight /></span>
      </div>
    </article>
  );
}

/* ---------- Filter & Sort Bar ---------- */
function FilterBar({ activeTypes, toggleType, clearTypes, sort, setSort, counts }) {
  return (
    <div className="filterbar">
      <div className="filter-row">
        <span className="filter-label">Filter</span>
        <div className="chip-list" role="group" aria-label="Filter by recipe type">
          <button
            className={"chip" + (activeTypes.size === 0 ? " chip-active" : "")}
            onClick={clearTypes}
            type="button"
          >
            All <span className="chip-count">{counts.__all}</span>
          </button>
          {RECIPE_TYPES.map(t => {
            const c = counts[t.value] || 0;
            const active = activeTypes.has(t.value);
            return (
              <button
                key={t.value}
                className={"chip" + (active ? " chip-active" : "") + (c === 0 ? " chip-empty" : "")}
                onClick={() => toggleType(t.value)}
                type="button"
                disabled={c === 0 && !active}
              >
                {t.label} <span className="chip-count">{c}</span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="sort-row">
        <label className="filter-label" htmlFor="sort-select">Sort</label>
        <div className="sort-select-wrap">
          <select
            id="sort-select"
            className="sort-select"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            {SORT_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <Icon.Caret />
        </div>
      </div>
    </div>
  );
}

/* ---------- Recipe List ---------- */
function RecipeList({ recipes, query, setQuery, activeTypes, toggleType, clearTypes, sort, setSort, onOpen, onNew }) {
  // Counts BEFORE type filtering (after search) so users see what's available
  const searched = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return recipes;
    return recipes.filter(r => r.title.toLowerCase().includes(q));
  }, [recipes, query]);

  const counts = useMemo(() => {
    const c = { __all: searched.length };
    for (const r of searched) {
      const types = Array.isArray(r.types) ? r.types : (r.type ? [r.type] : []);
      for (const t of types) c[t] = (c[t] || 0) + 1;
    }
    return c;
  }, [searched]);

  const filtered = useMemo(() => {
    let list = searched;
    if (activeTypes.size > 0) {
      list = list.filter(r => {
        const types = Array.isArray(r.types) ? r.types : (r.type ? [r.type] : []);
        return types.some(t => activeTypes.has(t));
      });
    }
    const sorted = [...list];
    switch (sort) {
      case "oldest":
        sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case "az":
        sorted.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "za":
        sorted.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case "newest":
      default:
        sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
    }
    return sorted;
  }, [searched, activeTypes, sort]);

  const hasActiveFilters = activeTypes.size > 0 || query.trim().length > 0;

  return (
    <div className="view-fade-enter">
      <div className="toolbar">
        <SearchBar value={query} onChange={setQuery} count={filtered.length} total={recipes.length} />
        <button className="btn btn-primary" onClick={onNew}>
          <Icon.Plus /> New recipe
        </button>
      </div>

      <FilterBar
        activeTypes={activeTypes}
        toggleType={toggleType}
        clearTypes={clearTypes}
        sort={sort}
        setSort={setSort}
        counts={counts}
      />

      {filtered.length === 0 ? (
        <div className="empty">
          <h3>{hasActiveFilters ? "Nothing matches those filters." : "Your shelf is empty."}</h3>
          <p>{hasActiveFilters ? "Try a different word, or clear the filters." : "Add your first recipe to get started."}</p>
          {hasActiveFilters
            ? <button className="btn" onClick={() => { setQuery(""); clearTypes(); }}>Clear all filters</button>
            : <button className="btn btn-accent" onClick={onNew}><Icon.Plus /> Add a recipe</button>}
        </div>
      ) : (
        <div className="grid">
          {filtered.map((r) => (
            <RecipeCard key={r.id} recipe={r} index={recipes.indexOf(r)} onOpen={() => onOpen(r.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- Recipe Detail ---------- */
function RecipeDetail({ recipe, onBack, onEdit, onDelete, onAddToShopping, onRemoveFromShopping, alreadyOnList }) {
  const [confirming, setConfirming] = useState(false);
  const [checkedIngs, setCheckedIngs] = useState(new Set());
  const [doneSteps, setDoneSteps] = useState(new Set());
  const [flash, setFlash] = useState(null); // { kind: 'add'|'remove' }
  const flashTimer = useRef(null);

  // Reset on recipe change
  useEffect(() => {
    setCheckedIngs(new Set());
    setDoneSteps(new Set());
    setConfirming(false);
    setFlash(null);
  }, [recipe.id]);

  // Cleanup timer
  useEffect(() => () => clearTimeout(flashTimer.current), []);

  const toggleIngChecked = (id) => {
    setCheckedIngs(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };
  const toggleShoppingFor = (ing) => {
    const onList = alreadyOnList && alreadyOnList.has(`${recipe.id}::${ing.id}`);
    if (onList) {
      onRemoveFromShopping(recipe.id, ing.id);
      setFlash({ kind: 'remove' });
    } else {
      onAddToShopping(recipe, [ing]);
      setFlash({ kind: 'add' });
    }
    clearTimeout(flashTimer.current);
    flashTimer.current = setTimeout(() => setFlash(null), 1800);
  };
  const toggleStep = (id) => {
    setDoneSteps(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const created = new Date(recipe.createdAt);
  const dateStr = created.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  return (
    <div className="detail">
      <div className="back-row">
        <button className="back-link" onClick={onBack}>
          <Icon.ArrowLeft /> All recipes
        </button>
        <div className="detail-actions">
          {confirming ? (
            <div className="confirm-bar">
              <span className="label">Delete this recipe?</span>
              <button className="btn btn-ghost" onClick={() => setConfirming(false)}>Cancel</button>
              <button className="btn btn-danger" onClick={onDelete}>Yes, delete</button>
            </div>
          ) : (
            <>
              <button className="btn btn-ghost" onClick={() => setConfirming(true)}>
                <Icon.Trash /> Delete
              </button>
              <button className="btn" onClick={onEdit}>
                <Icon.Edit /> Edit
              </button>
            </>
          )}
        </div>
      </div>

      <header className="detail-hero">
        <div>
          <div className="detail-eyebrow">
            From the kitchen · Saved {dateStr}
            {(() => {
              const ts = Array.isArray(recipe.types) ? recipe.types : (recipe.type ? [recipe.type] : []);
              if (ts.length === 0) return null;
              return (
                <> · <span className="detail-type">{ts.map(t => TYPE_LABEL[t] || t).join(" · ")}</span></>
              );
            })()}
          </div>
          <h1 className="detail-title">{recipe.title}</h1>
          <p className="detail-desc">{recipe.description}</p>
        </div>
      </header>

      <div className="detail-body">
        <aside className="ingredients">
          <h3 className="section-label">Ingredients</h3>
          <ul className="ingredients-list ingredients-select">
            {recipe.ingredients.map(ing => {
              const checked = checkedIngs.has(ing.id);
              const onList = alreadyOnList && alreadyOnList.has(`${recipe.id}::${ing.id}`);
              return (
                <li
                  key={ing.id}
                  className={"ing-row" + (checked ? " checked" : "") + (onList ? " on-list" : "")}
                  onClick={() => toggleIngChecked(ing.id)}
                >
                  <span className="ing-name">{ing.name}</span>
                  <span className="ing-amount">{ing.amount}</span>
                  <button
                    type="button"
                    className={"ing-quickadd" + (onList ? " is-on-list" : "")}
                    onClick={(e) => { e.stopPropagation(); toggleShoppingFor(ing); }}
                    aria-label={onList ? "Remove from shopping list" : "Add to shopping list"}
                    title={onList ? "On your list — tap to remove" : "Add to shopping list"}
                  >
                    {onList ? <Icon.Check /> : <Icon.Plus />}
                  </button>
                </li>
              );
            })}
          </ul>

          <p className="ing-hint">
            {flash?.kind === 'add' ? (
              <span className="ing-actionbar-toast">
                <Icon.Check /> Added to your shopping list
              </span>
            ) : flash?.kind === 'remove' ? (
              <span className="ing-actionbar-toast is-remove">
                <Icon.X /> Removed from your shopping list
              </span>
            ) : (
              <>Tap a row to check it off · Tap <span className="hint-glyph plus">+</span> to add to your shopping list (tap again to remove)</>
            )}
          </p>
        </aside>

        <div>
          <h3 className="section-label">Method</h3>
          <ol className="steps">
            {[...recipe.steps].sort((a,b) => a.order - b.order).map(step => (
              <li
                key={step.id}
                className={"step" + (doneSteps.has(step.id) ? " done" : "")}
                onClick={() => toggleStep(step.id)}
              >
                <span className="step-num">{String(step.order).padStart(2, "0")}</span>
                <span className="step-text">{step.description}</span>
              </li>
            ))}
          </ol>

          {recipe.notes && recipe.notes.trim() && (
            <section className="notes-section">
              <h3 className="section-label">Notes from the cook</h3>
              {(() => {
                const items = recipe.notes
                  .split(/\n+|(?:^|\s)[•\-–]\s+/g)
                  .map(s => s.trim())
                  .filter(Boolean);
                if (items.length <= 1) {
                  // Single block — split on sentence boundaries (. ! ?) followed by space + capital
                  const sentences = recipe.notes
                    .split(/(?<=[.!?])\s+(?=[A-Z])/)
                    .map(s => s.trim())
                    .filter(Boolean);
                  return (
                    <ul className="notes-list">
                      {sentences.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  );
                }
                return (
                  <ul className="notes-list">
                    {items.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                );
              })()}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- Recipe Form ---------- */
function RecipeForm({ initial, onSave, onCancel }) {
  const [title, setTitle] = useState(initial?.title || "");
  const [types, setTypes] = useState(() => {
    if (Array.isArray(initial?.types)) return new Set(initial.types);
    if (initial?.type) return new Set([initial.type]);
    return new Set();
  });
  const [description, setDescription] = useState(initial?.description || "");
  const [ingredients, setIngredients] = useState(
    initial?.ingredients?.length ? initial.ingredients : [{ id: uid(), amount: "", name: "" }]
  );
  const [steps, setSteps] = useState(
    initial?.steps?.length ? initial.steps : [{ id: uid(), order: 1, description: "" }]
  );
  const [notes, setNotes] = useState(initial?.notes || "");
  const titleRef = useRef(null);

  useEffect(() => {
    if (!initial && titleRef.current) titleRef.current.focus();
  }, []);

  const updateIng = (id, field, value) => {
    setIngredients(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i));
  };
  const addIng = () => setIngredients(prev => [...prev, { id: uid(), amount: "", name: "" }]);
  const removeIng = (id) => setIngredients(prev => prev.length > 1 ? prev.filter(i => i.id !== id) : prev);

  const updateStep = (id, value) => {
    setSteps(prev => prev.map(s => s.id === id ? { ...s, description: value } : s));
  };
  const addStep = () => setSteps(prev => [...prev, { id: uid(), order: prev.length + 1, description: "" }]);
  const removeStep = (id) => setSteps(prev => {
    if (prev.length <= 1) return prev;
    return prev.filter(s => s.id !== id).map((s, i) => ({ ...s, order: i + 1 }));
  });
  const moveStep = (id, dir) => {
    setSteps(prev => {
      const idx = prev.findIndex(s => s.id === id);
      const target = idx + dir;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[target]] = [next[target], next[idx]];
      return next.map((s, i) => ({ ...s, order: i + 1 }));
    });
  };

  const canSave = title.trim().length > 0;

  const handleSave = () => {
    if (!canSave) return;
    const cleaned = {
      id: initial?.id || uid(),
      title: title.trim(),
      types: Array.from(types),
      description: description.trim(),
      ingredients: ingredients
        .filter(i => i.name.trim() || i.amount.trim())
        .map(i => ({ ...i, name: i.name.trim(), amount: i.amount.trim() })),
      steps: steps
        .filter(s => s.description.trim())
        .map((s, i) => ({ id: s.id, order: i + 1, description: s.description.trim() })),
      notes: notes.trim(),
      createdAt: initial?.createdAt || new Date().toISOString(),
    };
    onSave(cleaned);
  };

  return (
    <div className="form">
      <div className="back-row">
        <button className="back-link" onClick={onCancel}>
          <Icon.ArrowLeft /> {initial ? "Back to recipe" : "Back to all recipes"}
        </button>
      </div>

      <div className="form-header">
        <div className="detail-eyebrow">{initial ? "Editing" : "New entry"}</div>
        <h1>{initial ? title || "Untitled" : "New recipe"}</h1>
      </div>

      <div className="field">
        <label className="field-label">Title</label>
        <input
          ref={titleRef}
          className="title-input"
          type="text"
          placeholder="What are you making?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className="field">
        <label className="field-label">Type <span className="field-hint">— pick one or more</span></label>
        <div className="chip-list chip-list-form">
          {RECIPE_TYPES.map(t => {
            const active = types.has(t.value);
            return (
              <button
                key={t.value}
                type="button"
                className={"chip" + (active ? " chip-active" : "")}
                onClick={() => {
                  setTypes(prev => {
                    const next = new Set(prev);
                    next.has(t.value) ? next.delete(t.value) : next.add(t.value);
                    return next;
                  });
                }}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="field">
        <label className="field-label">Short description</label>
        <textarea
          placeholder="A line or two — what's the spirit of this dish?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
        />
      </div>

      <div className="field">
        <label className="field-label">Ingredients</label>
        <div className="row-list">
          {ingredients.map((ing) => (
            <div className="ingredient-row" key={ing.id}>
              <input
                className="amt"
                type="text"
                placeholder="2 tbsp"
                value={ing.amount}
                onChange={(e) => updateIng(ing.id, "amount", e.target.value)}
              />
              <input
                type="text"
                placeholder="Ingredient name"
                value={ing.name}
                onChange={(e) => updateIng(ing.id, "name", e.target.value)}
              />
              <button className="btn-icon" onClick={() => removeIng(ing.id)} aria-label="Remove" disabled={ingredients.length <= 1}>
                <Icon.X />
              </button>
            </div>
          ))}
        </div>
        <button className="add-row-btn" onClick={addIng}>
          <Icon.Plus /> Add ingredient
        </button>
      </div>

      <div className="field">
        <label className="field-label">Steps</label>
        <div className="row-list">
          {steps.map((step, idx) => (
            <div className="step-row" key={step.id}>
              <span className="num">{idx + 1}</span>
              <input
                type="text"
                placeholder="Describe this step…"
                value={step.description}
                onChange={(e) => updateStep(step.id, e.target.value)}
              />
              <div className="reorder">
                <button onClick={() => moveStep(step.id, -1)} disabled={idx === 0} aria-label="Move up"><Icon.Up /></button>
                <button onClick={() => moveStep(step.id, +1)} disabled={idx === steps.length - 1} aria-label="Move down"><Icon.Down /></button>
              </div>
              <button className="btn-icon" onClick={() => removeStep(step.id)} aria-label="Remove step" disabled={steps.length <= 1}>
                <Icon.X />
              </button>
            </div>
          ))}
        </div>
        <button className="add-row-btn" onClick={addStep}>
          <Icon.Plus /> Add step
        </button>
      </div>

      <div className="field">
        <label className="field-label">Notes</label>
        <textarea
          placeholder="Tips, substitutions, what worked, what didn't…"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
        />
      </div>

      <div className="form-footer">
        <button className="btn btn-ghost" onClick={onCancel}>Cancel</button>
        <div className="right">
          <button className="btn btn-primary" onClick={handleSave} disabled={!canSave} style={{ opacity: canSave ? 1 : 0.5, cursor: canSave ? "pointer" : "not-allowed" }}>
            {initial ? "Save changes" : "Save recipe"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Shopping List View ---------- */
function ShoppingList({ items, recipes, onBack, onToggle, onRemove, onClearChecked, onClearAll, onOpenRecipe }) {
  const total = items.length;
  const checked = items.filter(i => i.checked).length;
  const remaining = total - checked;

  // Group by recipe (in insertion order — earliest item per recipe defines order)
  const groups = useMemo(() => {
    const seen = new Map();
    for (const it of items) {
      if (!seen.has(it.recipeId)) seen.set(it.recipeId, []);
      seen.get(it.recipeId).push(it);
    }
    return Array.from(seen.entries()).map(([recipeId, list]) => {
      const recipe = recipes.find(r => r.id === recipeId);
      return {
        recipeId,
        recipe,
        title: recipe ? recipe.title : list[0].recipeTitle || "Removed recipe",
        items: list,
      };
    });
  }, [items, recipes]);

  return (
    <div className="shopping view-fade-enter">
      <div className="back-row">
        <button className="back-link" onClick={onBack}>
          <Icon.ArrowLeft /> All recipes
        </button>
        {total > 0 && (
          <div className="detail-actions">
            {checked > 0 && (
              <button className="btn btn-ghost" onClick={onClearChecked}>
                Clear {checked} checked
              </button>
            )}
            <button className="btn btn-danger" onClick={() => {
              if (confirm("Empty your shopping list?")) onClearAll();
            }}>
              <Icon.Trash /> Empty list
            </button>
          </div>
        )}
      </div>

      <header className="shopping-hero">
        <div className="detail-eyebrow">
          The market list · {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </div>
        <h1 className="detail-title">Shopping<br />list</h1>
        {total > 0 ? (
          <p className="shopping-tally">
            <span className="tally-num">{remaining}</span>
            <span className="tally-lbl">to buy</span>
            {checked > 0 && (
              <>
                <span className="tally-sep">·</span>
                <span className="tally-num tally-num-soft">{checked}</span>
                <span className="tally-lbl">in the basket</span>
              </>
            )}
            <span className="tally-sep">·</span>
            <span className="tally-num tally-num-soft">{groups.length}</span>
            <span className="tally-lbl">{groups.length === 1 ? "recipe" : "recipes"}</span>
          </p>
        ) : (
          <p className="detail-desc">Nothing here yet — open a recipe and tap the ingredients you need to pick up.</p>
        )}
      </header>

      {total === 0 ? (
        <div className="empty shopping-empty">
          <h3>Your basket is empty.</h3>
          <p>Pick a recipe, select ingredients, and they'll land here.</p>
          <button className="btn btn-accent" onClick={onBack}>
            Browse recipes <Icon.ArrowRight />
          </button>
        </div>
      ) : (
        <div className="shopping-body">
          {groups.map(group => (
            <section className="shopping-group" key={group.recipeId}>
              <header className="shopping-group-head">
                <div className="shopping-group-meta">From the recipe</div>
                {group.recipe ? (
                  <button
                    className="shopping-group-title"
                    onClick={() => onOpenRecipe(group.recipeId)}
                  >
                    {group.title} <Icon.ArrowRight />
                  </button>
                ) : (
                  <span className="shopping-group-title is-stale">{group.title}</span>
                )}
                <span className="shopping-group-count">
                  {group.items.length} {group.items.length === 1 ? "item" : "items"}
                </span>
              </header>
              <ul className="shopping-list">
                {group.items.map(item => (
                  <li
                    key={item.id}
                    className={"shopping-item" + (item.checked ? " checked" : "")}
                  >
                    <button
                      type="button"
                      className={"ing-check" + (item.checked ? " checked" : "")}
                      onClick={() => onToggle(item.id)}
                      aria-label={item.checked ? "Mark as not bought" : "Mark as bought"}
                    >
                      {item.checked && <Icon.Check />}
                    </button>
                    <span className="ing-name" onClick={() => onToggle(item.id)}>{item.name}</span>
                    <span className="ing-amount">{item.amount || "—"}</span>
                    <button
                      type="button"
                      className="btn-icon shopping-remove"
                      onClick={() => onRemove(item.id)}
                      aria-label="Remove"
                    >
                      <Icon.X />
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

Object.assign(window, { Icon, storage, uid, RECIPE_TYPES, TYPE_LABEL, SORT_OPTIONS, SearchBar, FilterBar, RecipeCard, RecipeList, RecipeDetail, RecipeForm, ShoppingList });

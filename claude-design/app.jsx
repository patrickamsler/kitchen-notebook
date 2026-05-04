/* Main app — view orchestration + persistence */
const { useState, useEffect, useMemo } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "terracotta",
  "titleScale": 1.0
}/*EDITMODE-END*/;

function App() {
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [mounted, setMounted] = useState(false);
  const [recipes, setRecipes] = useState([]);
  const [shopping, setShopping] = useState([]);
  const [view, setView] = useState({ name: "list" }); // list | detail | form | shopping
  const [query, setQuery] = useState("");
  const [activeTypes, setActiveTypes] = useState(() => new Set());
  const [sort, setSort] = useState("newest");

  const toggleType = (t) => {
    setActiveTypes(prev => {
      const next = new Set(prev);
      next.has(t) ? next.delete(t) : next.add(t);
      return next;
    });
  };
  const clearTypes = () => setActiveTypes(new Set());

  // SSR-safe hydration: load from localStorage after mount
  useEffect(() => {
    const stored = storage.load();
    setRecipes(stored && stored.length ? stored : window.SEED_RECIPES);
    const cart = storage.loadShopping();
    if (cart) setShopping(cart);
    setMounted(true);
  }, []);

  // Persist
  useEffect(() => {
    if (mounted) storage.save(recipes);
  }, [recipes, mounted]);
  useEffect(() => {
    if (mounted) storage.saveShopping(shopping);
  }, [shopping, mounted]);

  // Apply accent tweak
  useEffect(() => {
    document.body.dataset.accent = tweaks.accent;
  }, [tweaks.accent]);

  useEffect(() => {
    document.documentElement.style.setProperty("--title-scale", tweaks.titleScale);
  }, [tweaks.titleScale]);

  const openRecipe = (id) => setView({ name: "detail", id });
  const editRecipe = (id) => setView({ name: "form", id });
  const newRecipe = () => setView({ name: "form", id: null });
  const goList = () => setView({ name: "list" });
  const goShopping = () => setView({ name: "shopping" });

  const saveRecipe = (recipe) => {
    setRecipes(prev => {
      const existing = prev.findIndex(r => r.id === recipe.id);
      if (existing >= 0) {
        const next = [...prev];
        next[existing] = recipe;
        return next;
      }
      return [recipe, ...prev];
    });
    setView({ name: "detail", id: recipe.id });
  };

  const deleteRecipe = (id) => {
    setRecipes(prev => prev.filter(r => r.id !== id));
    setView({ name: "list" });
  };

  /* ---------- Shopping list actions ---------- */
  const addToShopping = (recipe, picked) => {
    setShopping(prev => {
      const existingKeys = new Set(prev.map(it => `${it.recipeId}::${it.ingredientId}`));
      const fresh = picked
        .filter(p => !existingKeys.has(`${recipe.id}::${p.id}`))
        .map(p => ({
          id: uid(),
          recipeId: recipe.id,
          recipeTitle: recipe.title,
          ingredientId: p.id,
          name: p.name,
          amount: p.amount,
          checked: false,
          addedAt: new Date().toISOString(),
        }));
      return [...prev, ...fresh];
    });
  };
  const removeFromShopping = (recipeId, ingredientId) => {
    setShopping(prev => prev.filter(it => !(it.recipeId === recipeId && it.ingredientId === ingredientId)));
  };
  const toggleShoppingItem = (id) => {
    setShopping(prev => prev.map(it => it.id === id ? { ...it, checked: !it.checked } : it));
  };
  const removeShoppingItem = (id) => {
    setShopping(prev => prev.filter(it => it.id !== id));
  };
  const clearChecked = () => setShopping(prev => prev.filter(it => !it.checked));
  const clearAll = () => setShopping([]);

  // Build a Set of "recipeId::ingredientId" keys already on the list — for showing "on list" badges
  const onListKeys = useMemo(() => {
    return new Set(shopping.map(it => `${it.recipeId}::${it.ingredientId}`));
  }, [shopping]);

  const resetSeeds = () => {
    if (confirm("Reset to seed recipes? Your changes will be lost.")) {
      setRecipes(window.SEED_RECIPES);
      storage.save(window.SEED_RECIPES);
      setView({ name: "list" });
    }
  };

  if (!mounted) {
    return <div className="app" style={{ opacity: 0 }} />;
  }

  const current = view.id ? recipes.find(r => r.id === view.id) : null;
  const totalCount = recipes.length;
  const pendingCount = shopping.filter(it => !it.checked).length;

  return (
    <>
      <div className="app">
        <header className="masthead">
          <div className="masthead-left">
            <span className="eyebrow">Vol. 01 · Personal Edition</span>
            <h1 className="wordmark" onClick={goList} style={{ cursor: "pointer" }}>
              The <em>Kitchen</em><br />Notebook
            </h1>
          </div>
          <div className="masthead-meta">
            <button
              type="button"
              className={"shopping-pill" + (view.name === "shopping" ? " is-active" : "") + (pendingCount > 0 ? " has-items" : "")}
              onClick={goShopping}
              aria-label="Open shopping list"
            >
              <Icon.Basket />
              <span className="shopping-pill-label">Shopping list</span>
              <span className="shopping-pill-count">{pendingCount}</span>
            </button>
            <span>{totalCount} {totalCount === 1 ? "recipe" : "recipes"} · Last edit {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
          </div>
        </header>

        {view.name === "list" && (
          <RecipeList
            recipes={recipes}
            query={query}
            setQuery={setQuery}
            activeTypes={activeTypes}
            toggleType={toggleType}
            clearTypes={clearTypes}
            sort={sort}
            setSort={setSort}
            onOpen={openRecipe}
            onNew={newRecipe}
          />
        )}

        {view.name === "detail" && current && (
          <RecipeDetail
            key={current.id}
            recipe={current}
            onBack={goList}
            onEdit={() => editRecipe(current.id)}
            onDelete={() => deleteRecipe(current.id)}
            onAddToShopping={addToShopping}
            onRemoveFromShopping={removeFromShopping}
            alreadyOnList={onListKeys}
          />
        )}

        {view.name === "detail" && !current && (
          <div className="empty">
            <h3>Recipe not found.</h3>
            <button className="btn" onClick={goList}>Back to all recipes</button>
          </div>
        )}

        {view.name === "form" && (
          <RecipeForm
            key={view.id || "new"}
            initial={current || null}
            onSave={saveRecipe}
            onCancel={() => view.id ? setView({ name: "detail", id: view.id }) : goList()}
          />
        )}

        {view.name === "shopping" && (
          <ShoppingList
            items={shopping}
            recipes={recipes}
            onBack={goList}
            onToggle={toggleShoppingItem}
            onRemove={removeShoppingItem}
            onClearChecked={clearChecked}
            onClearAll={clearAll}
            onOpenRecipe={openRecipe}
          />
        )}
      </div>

      <TweaksPanel title="Tweaks">
        <TweakSection title="Accent">
          <TweakRadio
            value={tweaks.accent}
            onChange={(v) => setTweak("accent", v)}
            options={[
              { value: "terracotta", label: "Terracotta" },
              { value: "sage", label: "Sage" },
              { value: "plum", label: "Plum" },
            ]}
          />
        </TweakSection>
        <TweakSection title="Title scale">
          <TweakSlider
            value={tweaks.titleScale}
            min={0.7} max={1.3} step={0.05}
            onChange={(v) => setTweak("titleScale", v)}
          />
        </TweakSection>
        <TweakSection title="Data">
          <TweakButton onClick={resetSeeds}>Reset to seed recipes</TweakButton>
        </TweakSection>
      </TweaksPanel>
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);

'use client';

import { useState, useRef, useEffect, useTransition } from 'react';
import Link from 'next/link';
import styles from './RecipeForm.module.scss';
import type { Recipe, RecipeType } from '@/lib/types';
import { RECIPE_TYPES } from './constants';
import { IconArrowLeft, IconPlus, IconX, IconUp, IconDown } from '@/components/icons/Icon';
import { Button, IconButton } from '@/components/ui/Button';
import { createRecipeAction, updateRecipeAction } from '@/app/actions/recipes';

const cx = (...c: (string | false | undefined | null)[]) => c.filter(Boolean).join(' ');

// Negative IDs are temporary client-only keys for new rows not yet saved to DB
let _tempId = 0;
const nextTempId = () => --_tempId;

interface IngItem { id: number; amount: string; name: string; }
interface StepItem { id: number; order: number; description: string; }

interface Props {
  initial: Recipe | null;
}

export default function RecipeForm({ initial }: Props) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [types, setTypes] = useState<Set<RecipeType>>(() => {
    if (initial?.types?.length) return new Set(initial.types);
    return new Set();
  });
  const [description, setDescription] = useState(initial?.description ?? '');
  const [ingredients, setIngredients] = useState<IngItem[]>(
    initial?.ingredients?.length ? initial.ingredients : [{ id: nextTempId(), amount: '', name: '' }]
  );
  const [steps, setSteps] = useState<StepItem[]>(
    initial?.steps?.length ? initial.steps : [{ id: nextTempId(), order: 1, description: '' }]
  );
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [pending, startTransition] = useTransition();
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!initial && titleRef.current) titleRef.current.focus();
  }, []);

  const updateIng = (id: number, field: keyof IngItem, value: string) => {
    setIngredients(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i));
  };
  const addIng = () => setIngredients(prev => [...prev, { id: nextTempId(), amount: '', name: '' }]);
  const removeIng = (id: number) => setIngredients(prev => prev.length > 1 ? prev.filter(i => i.id !== id) : prev);

  const updateStep = (id: number, value: string) => {
    setSteps(prev => prev.map(s => s.id === id ? { ...s, description: value } : s));
  };
  const addStep = () => setSteps(prev => [...prev, { id: nextTempId(), order: prev.length + 1, description: '' }]);
  const removeStep = (id: number) => setSteps(prev => {
    if (prev.length <= 1) return prev;
    return prev.filter(s => s.id !== id).map((s, i) => ({ ...s, order: i + 1 }));
  });
  const moveStep = (id: number, dir: number) => {
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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSave) return;
    const form = e.currentTarget;
    const formData = new FormData(form);

    formData.delete('ingredient_id');
    formData.delete('ingredient_amount');
    formData.delete('ingredient_name');
    formData.delete('step_id');
    formData.delete('step_description');

    for (const ing of ingredients) {
      // Negative IDs are temp client keys — send 0 to signal "new row" to the server
      formData.append('ingredient_id', ing.id > 0 ? String(ing.id) : '0');
      formData.append('ingredient_amount', ing.amount);
      formData.append('ingredient_name', ing.name);
    }
    for (const step of steps) {
      formData.append('step_id', step.id > 0 ? String(step.id) : '0');
      formData.append('step_description', step.description);
    }

    startTransition(() => {
      if (initial) {
        updateRecipeAction(initial.id, initial.uid, formData);
      } else {
        createRecipeAction(formData);
      }
    });
  };

  const backHref = initial ? `/recipes/${initial.uid}` : '/';

  return (
    <div className={styles.form}>
      <div className={styles.backRow}>
        <Link href={backHref} className={styles.backLink}>
          <IconArrowLeft /> {initial ? 'Back to recipe' : 'Back to all recipes'}
        </Link>
      </div>

      <div className={styles.formHeader}>
        <div className={styles.eyebrow}>{initial ? 'Editing' : 'New entry'}</div>
        <h1 className={styles.formTitle}>{initial ? (title || 'Untitled') : 'New recipe'}</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <input type="hidden" name="title" value={title} />
        <input type="hidden" name="description" value={description} />
        <input type="hidden" name="notes" value={notes} />
        {Array.from(types).map(t => (
          <input key={t} type="hidden" name="types" value={t} />
        ))}

        <div className={styles.field}>
          <label className={styles.fieldLabel} htmlFor="title-input">Title</label>
          <input
            ref={titleRef}
            id="title-input"
            type="text"
            className={styles.titleInput}
            placeholder="What are you making?"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <span className={styles.fieldLabel}>Type <span className={styles.fieldHint}>— pick one or more</span></span>
          <div className={styles.chipList}>
            {RECIPE_TYPES.map(t => {
              const active = types.has(t.value);
              return (
                <button
                  key={t.value}
                  type="button"
                  className={cx(styles.chip, active && styles.chipActive)}
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

        <div className={styles.field}>
          <label className={styles.fieldLabel} htmlFor="description-input">Short description</label>
          <textarea
            id="description-input"
            className={styles.textarea}
            placeholder="A line or two — what's the spirit of this dish?"
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={2}
          />
        </div>

        <div className={styles.field}>
          <span className={styles.fieldLabel}>Ingredients</span>
          <div className={styles.rowList}>
            {ingredients.map(ing => (
              <div key={ing.id} className={styles.ingRow}>
                <input
                  type="text"
                  className={styles.amtInput}
                  placeholder="2 tbsp"
                  value={ing.amount}
                  onChange={e => updateIng(ing.id, 'amount', e.target.value)}
                />
                <input
                  type="text"
                  className={styles.ingInput}
                  placeholder="Ingredient name"
                  value={ing.name}
                  onChange={e => updateIng(ing.id, 'name', e.target.value)}
                />
                <IconButton
                  type="button"
                  onClick={() => removeIng(ing.id)}
                  disabled={ingredients.length <= 1}
                  aria-label="Remove ingredient"
                >
                  <IconX />
                </IconButton>
              </div>
            ))}
          </div>
          <button type="button" className={styles.addRowBtn} onClick={addIng}>
            <IconPlus /> Add ingredient
          </button>
        </div>

        <div className={styles.field}>
          <span className={styles.fieldLabel}>Steps</span>
          <div className={styles.rowList}>
            {steps.map((step, idx) => (
              <div key={step.id} className={styles.stepRow}>
                <span className={styles.stepNum}>{idx + 1}</span>
                <input
                  type="text"
                  className={styles.stepInput}
                  placeholder="Describe this step…"
                  value={step.description}
                  onChange={e => updateStep(step.id, e.target.value)}
                />
                <div className={styles.reorderWrap}>
                  <button
                    type="button"
                    className={styles.reorderBtn}
                    onClick={() => moveStep(step.id, -1)}
                    disabled={idx === 0}
                    aria-label="Move step up"
                  >
                    <IconUp />
                  </button>
                  <button
                    type="button"
                    className={styles.reorderBtn}
                    onClick={() => moveStep(step.id, 1)}
                    disabled={idx === steps.length - 1}
                    aria-label="Move step down"
                  >
                    <IconDown />
                  </button>
                </div>
                <IconButton
                  type="button"
                  onClick={() => removeStep(step.id)}
                  disabled={steps.length <= 1}
                  aria-label="Remove step"
                >
                  <IconX />
                </IconButton>
              </div>
            ))}
          </div>
          <button type="button" className={styles.addRowBtn} onClick={addStep}>
            <IconPlus /> Add step
          </button>
        </div>

        <div className={styles.field}>
          <label className={styles.fieldLabel} htmlFor="notes-input">Notes</label>
          <textarea
            id="notes-input"
            className={styles.textarea}
            placeholder="Tips, substitutions, what worked, what didn't…"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={4}
          />
        </div>

        <div className={styles.footer}>
          <Link href={backHref} style={{ textDecoration: 'none' }}>
            <Button type="button" $variant="ghost">Cancel</Button>
          </Link>
          <div className={styles.footerRight}>
            <Button
              type="submit"
              $variant="primary"
              disabled={!canSave || pending}
              style={{ opacity: canSave ? 1 : 0.5 }}
            >
              {pending ? 'Saving…' : (initial ? 'Save changes' : 'Save recipe')}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

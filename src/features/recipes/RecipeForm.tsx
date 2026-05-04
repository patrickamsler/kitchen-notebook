'use client';

import { useState, useRef, useEffect, useTransition } from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import type { Recipe, RecipeType } from '@/lib/types';
import { RECIPE_TYPES } from './constants';
import { IconArrowLeft, IconPlus, IconX, IconUp, IconDown } from '@/components/icons/Icon';
import { Button, IconButton } from '@/components/ui/Button';
import { uid } from '@/lib/uid';
import { createRecipeAction, updateRecipeAction } from '@/app/actions/recipes';

const Form = styled.div`
  animation: fadeSlide ${({ theme }) => theme.transitions.med} ease-out;
`;

const BackRow = styled.div`
  margin-bottom: 32px;
`;

const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 0;
  color: ${({ theme }) => theme.colors.inkSoft};
  font-size: 13px;
  letter-spacing: 0.02em;
  transition: color ${({ theme }) => theme.transitions.fast}, gap ${({ theme }) => theme.transitions.fast};
  text-decoration: none;
  background: none;
  border: none;
  cursor: pointer;

  &:hover { color: ${({ theme }) => theme.colors.accentInk}; gap: 12px; }
`;

const FormHeader = styled.div`
  margin-bottom: 36px;
  padding-bottom: 28px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.hair};
`;

const FormTitle = styled.h1`
  font-family: ${({ theme }) => theme.fonts.serif};
  font-weight: 300;
  font-size: 56px;
  letter-spacing: -0.02em;
  margin: 8px 0 0;
  font-variation-settings: 'opsz' 144, 'SOFT' 50;
`;

const Eyebrow = styled.div`
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: 11px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.accentInk};
`;

const Field = styled.div`
  margin-bottom: 32px;
`;

const FieldLabel = styled.label`
  display: block;
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: 11px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.muted};
  margin-bottom: 10px;
`;

const FieldHint = styled.span`
  font-family: ${({ theme }) => theme.fonts.serif};
  font-style: italic;
  font-size: 12px;
  font-weight: 350;
  color: ${({ theme }) => theme.colors.muted};
  letter-spacing: 0;
  text-transform: none;
  margin-left: 6px;
`;

const TextInput = styled.input`
  width: 100%;
  background: ${({ theme }) => theme.colors.bgElev};
  border: 1px solid ${({ theme }) => theme.colors.hair};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: 14px 16px;
  font-size: 16px;
  outline: none;
  transition: border-color ${({ theme }) => theme.transitions.fast},
              box-shadow ${({ theme }) => theme.transitions.fast};
  font-family: ${({ theme }) => theme.fonts.sans};

  &:focus {
    border-color: ${({ theme }) => theme.colors.accent};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.accentSoft};
  }
`;

const TitleInput = styled(TextInput)`
  font-family: ${({ theme }) => theme.fonts.serif};
  font-weight: 350;
  font-size: 28px;
  padding: 18px 20px;
  font-variation-settings: 'opsz' 36;
`;

const Textarea = styled.textarea`
  width: 100%;
  background: ${({ theme }) => theme.colors.bgElev};
  border: 1px solid ${({ theme }) => theme.colors.hair};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: 14px 16px;
  font-size: 17px;
  outline: none;
  transition: border-color ${({ theme }) => theme.transitions.fast},
              box-shadow ${({ theme }) => theme.transitions.fast};
  font-family: ${({ theme }) => theme.fonts.serif};
  font-style: italic;
  resize: vertical;
  min-height: 100px;
  line-height: 1.55;

  &:focus {
    border-color: ${({ theme }) => theme.colors.accent};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.accentSoft};
  }
`;

const ChipList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

interface ChipProps {
  $active: boolean;
}

const Chip = styled.button<ChipProps>`
  display: inline-flex;
  align-items: baseline;
  gap: 8px;
  padding: 7px 13px;
  border-radius: 999px;
  border: 1px solid ${({ $active, theme }) => $active ? theme.colors.ink : theme.colors.hairStrong};
  background: ${({ $active, theme }) => $active ? theme.colors.ink : theme.colors.bgElev};
  color: ${({ $active, theme }) => $active ? theme.colors.bg : theme.colors.inkSoft};
  font-family: ${({ theme }) => theme.fonts.serif};
  font-weight: 350;
  font-size: 14px;
  font-variation-settings: 'opsz' 14;
  letter-spacing: 0.005em;
  transition: all ${({ theme }) => theme.transitions.fast};
  line-height: 1.2;
  cursor: pointer;

  &:hover {
    color: ${({ $active }) => $active ? '#fff' : 'inherit'};
    border-color: ${({ $active, theme }) => $active ? theme.colors.accentInk : theme.colors.ink};
    background: ${({ $active, theme }) => $active ? theme.colors.accentInk : theme.colors.bgElev};
  }
`;

const RowList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
`;

const IngRow = styled.div`
  display: grid;
  grid-template-columns: 130px 1fr auto;
  gap: 8px;
  align-items: center;
`;

const AmtInput = styled(TextInput)`
  padding: 11px 14px;
  font-size: 12px;
  font-family: ${({ theme }) => theme.fonts.mono};
  letter-spacing: 0.04em;
`;

const IngInput = styled(TextInput)`
  padding: 11px 14px;
  font-size: 14px;
`;

const StepRow = styled.div`
  display: grid;
  grid-template-columns: 36px 1fr auto auto;
  gap: 8px;
  align-items: center;
  padding: 10px;
  background: ${({ theme }) => theme.colors.bgElev};
  border: 1px solid ${({ theme }) => theme.colors.hair};
  border-radius: ${({ theme }) => theme.radii.md};
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover { border-color: ${({ theme }) => theme.colors.hairStrong}; }
`;

const StepNum = styled.span`
  font-family: ${({ theme }) => theme.fonts.serif};
  font-style: italic;
  font-size: 20px;
  color: ${({ theme }) => theme.colors.accentInk};
  text-align: center;
`;

const StepInput = styled(TextInput)`
  background: transparent;
  border: 1px solid transparent;
  padding: 10px 12px;
  font-size: 14px;

  &:focus { background: ${({ theme }) => theme.colors.bg}; border-color: ${({ theme }) => theme.colors.accent}; }
`;

const ReorderWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const ReorderBtn = styled.button`
  width: 24px;
  height: 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid ${({ theme }) => theme.colors.hair};
  border-radius: 3px;
  color: ${({ theme }) => theme.colors.muted};
  padding: 0;
  transition: all ${({ theme }) => theme.transitions.fast};
  cursor: pointer;

  &:hover:not(:disabled) { color: ${({ theme }) => theme.colors.ink}; border-color: ${({ theme }) => theme.colors.ink}; }
  &:disabled { opacity: 0.3; cursor: not-allowed; }

  svg { width: 10px; height: 10px; }
`;

const AddRowBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: transparent;
  border: 1px dashed ${({ theme }) => theme.colors.hairStrong};
  border-radius: ${({ theme }) => theme.radii.md};
  color: ${({ theme }) => theme.colors.inkSoft};
  font-size: 13px;
  transition: all ${({ theme }) => theme.transitions.fast};
  cursor: pointer;
  font-family: inherit;

  svg { width: 12px; height: 12px; }

  &:hover {
    border-color: ${({ theme }) => theme.colors.accent};
    color: ${({ theme }) => theme.colors.accentInk};
    border-style: solid;
  }
`;

const Footer = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding-top: 28px;
  margin-top: 40px;
  border-top: 1px solid ${({ theme }) => theme.colors.hair};
`;

const FooterRight = styled.div`
  display: flex;
  gap: 10px;
`;

interface IngItem { id: string; amount: string; name: string; }
interface StepItem { id: string; order: number; description: string; }

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
    initial?.ingredients?.length ? initial.ingredients : [{ id: uid(), amount: '', name: '' }]
  );
  const [steps, setSteps] = useState<StepItem[]>(
    initial?.steps?.length ? initial.steps : [{ id: uid(), order: 1, description: '' }]
  );
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [pending, startTransition] = useTransition();
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!initial && titleRef.current) titleRef.current.focus();
  }, []);

  const updateIng = (id: string, field: keyof IngItem, value: string) => {
    setIngredients(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i));
  };
  const addIng = () => setIngredients(prev => [...prev, { id: uid(), amount: '', name: '' }]);
  const removeIng = (id: string) => setIngredients(prev => prev.length > 1 ? prev.filter(i => i.id !== id) : prev);

  const updateStep = (id: string, value: string) => {
    setSteps(prev => prev.map(s => s.id === id ? { ...s, description: value } : s));
  };
  const addStep = () => setSteps(prev => [...prev, { id: uid(), order: prev.length + 1, description: '' }]);
  const removeStep = (id: string) => setSteps(prev => {
    if (prev.length <= 1) return prev;
    return prev.filter(s => s.id !== id).map((s, i) => ({ ...s, order: i + 1 }));
  });
  const moveStep = (id: string, dir: number) => {
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

    // Rebuild arrays from state since dynamic fields need correct values
    formData.delete('ingredient_id');
    formData.delete('ingredient_amount');
    formData.delete('ingredient_name');
    formData.delete('step_id');
    formData.delete('step_description');

    for (const ing of ingredients) {
      formData.append('ingredient_id', ing.id);
      formData.append('ingredient_amount', ing.amount);
      formData.append('ingredient_name', ing.name);
    }
    for (const step of steps) {
      formData.append('step_id', step.id);
      formData.append('step_description', step.description);
    }

    startTransition(() => {
      if (initial) {
        updateRecipeAction(initial.id, initial.createdAt, formData);
      } else {
        createRecipeAction(formData);
      }
    });
  };

  const backHref = initial ? `/recipes/${initial.id}` : '/';

  return (
    <Form>
      <BackRow>
        <BackLink href={backHref}>
          <IconArrowLeft /> {initial ? 'Back to recipe' : 'Back to all recipes'}
        </BackLink>
      </BackRow>

      <FormHeader>
        <Eyebrow>{initial ? 'Editing' : 'New entry'}</Eyebrow>
        <FormTitle>{initial ? (title || 'Untitled') : 'New recipe'}</FormTitle>
      </FormHeader>

      <form onSubmit={handleSubmit}>
        <input type="hidden" name="title" value={title} />
        <input type="hidden" name="description" value={description} />
        <input type="hidden" name="notes" value={notes} />
        {Array.from(types).map(t => (
          <input key={t} type="hidden" name="types" value={t} />
        ))}

        <Field>
          <FieldLabel htmlFor="title-input">Title</FieldLabel>
          <TitleInput
            ref={titleRef}
            id="title-input"
            type="text"
            placeholder="What are you making?"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
        </Field>

        <Field>
          <FieldLabel>Type <FieldHint>— pick one or more</FieldHint></FieldLabel>
          <ChipList>
            {RECIPE_TYPES.map(t => {
              const active = types.has(t.value);
              return (
                <Chip
                  key={t.value}
                  type="button"
                  $active={active}
                  onClick={() => {
                    setTypes(prev => {
                      const next = new Set(prev);
                      next.has(t.value) ? next.delete(t.value) : next.add(t.value);
                      return next;
                    });
                  }}
                >
                  {t.label}
                </Chip>
              );
            })}
          </ChipList>
        </Field>

        <Field>
          <FieldLabel htmlFor="description-input">Short description</FieldLabel>
          <Textarea
            id="description-input"
            placeholder="A line or two — what's the spirit of this dish?"
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={2}
          />
        </Field>

        <Field>
          <FieldLabel>Ingredients</FieldLabel>
          <RowList>
            {ingredients.map(ing => (
              <IngRow key={ing.id}>
                <AmtInput
                  type="text"
                  placeholder="2 tbsp"
                  value={ing.amount}
                  onChange={e => updateIng(ing.id, 'amount', e.target.value)}
                />
                <IngInput
                  type="text"
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
              </IngRow>
            ))}
          </RowList>
          <AddRowBtn type="button" onClick={addIng}>
            <IconPlus /> Add ingredient
          </AddRowBtn>
        </Field>

        <Field>
          <FieldLabel>Steps</FieldLabel>
          <RowList>
            {steps.map((step, idx) => (
              <StepRow key={step.id}>
                <StepNum>{idx + 1}</StepNum>
                <StepInput
                  type="text"
                  placeholder="Describe this step…"
                  value={step.description}
                  onChange={e => updateStep(step.id, e.target.value)}
                />
                <ReorderWrap>
                  <ReorderBtn
                    type="button"
                    onClick={() => moveStep(step.id, -1)}
                    disabled={idx === 0}
                    aria-label="Move step up"
                  >
                    <IconUp />
                  </ReorderBtn>
                  <ReorderBtn
                    type="button"
                    onClick={() => moveStep(step.id, 1)}
                    disabled={idx === steps.length - 1}
                    aria-label="Move step down"
                  >
                    <IconDown />
                  </ReorderBtn>
                </ReorderWrap>
                <IconButton
                  type="button"
                  onClick={() => removeStep(step.id)}
                  disabled={steps.length <= 1}
                  aria-label="Remove step"
                >
                  <IconX />
                </IconButton>
              </StepRow>
            ))}
          </RowList>
          <AddRowBtn type="button" onClick={addStep}>
            <IconPlus /> Add step
          </AddRowBtn>
        </Field>

        <Field>
          <FieldLabel htmlFor="notes-input">Notes</FieldLabel>
          <Textarea
            id="notes-input"
            placeholder="Tips, substitutions, what worked, what didn't…"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={4}
          />
        </Field>

        <Footer>
          <Link href={backHref} style={{ textDecoration: 'none' }}>
            <Button type="button" $variant="ghost" as="span">Cancel</Button>
          </Link>
          <FooterRight>
            <Button
              type="submit"
              $variant="primary"
              disabled={!canSave || pending}
              style={{ opacity: canSave ? 1 : 0.5 }}
            >
              {pending ? 'Saving…' : (initial ? 'Save changes' : 'Save recipe')}
            </Button>
          </FooterRight>
        </Footer>
      </form>
    </Form>
  );
}

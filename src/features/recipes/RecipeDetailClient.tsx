'use client';

import { useState, useRef, useEffect, useTransition } from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import type { Recipe, ShoppingItem } from '@/lib/types';
import { useTweaks } from '@/providers/TweaksProvider';
import { TYPE_LABEL } from './constants';
import {
  IconArrowLeft, IconEdit, IconTrash, IconPlus, IconCheck, IconX, IconArrowRight
} from '@/components/icons/Icon';
import { Button, IconButton } from '@/components/ui/Button';
import { deleteRecipeAction } from '@/app/actions/recipes';
import { addShoppingItemsAction, removeShoppingByIngredientAction } from '@/app/actions/shopping';

/* ---- Styled shells ---- */
const Detail = styled.div`
  animation: fadeSlide ${({ theme }) => theme.transitions.med} ease-out;
`;

const BackRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
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

  &:hover { color: ${({ theme }) => theme.colors.accentInk}; gap: 12px; }
`;

const Actions = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const ConfirmBar = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background: ${({ theme }) => theme.colors.bgSunk};
  border: 1px solid ${({ theme }) => theme.colors.hairStrong};
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: 13px;
  animation: fadeSlide 160ms ease-out;
`;

const ConfirmLabel = styled.span`
  color: ${({ theme }) => theme.colors.inkSoft};
`;

const Hero = styled.header`
  padding-bottom: 40px;
  margin-bottom: 40px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.hair};
`;

const Eyebrow = styled.div`
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: 11px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.accentInk};
  margin-bottom: 16px;
`;

const DetailType = styled.span`
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: 11px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.accentInk};
`;

interface TitleProps {
  $scale: number;
}

const Title = styled.h1<TitleProps>`
  font-family: ${({ theme }) => theme.fonts.serif};
  font-weight: 300;
  font-size: ${({ $scale }) => 84 * $scale}px;
  line-height: 0.95;
  letter-spacing: -0.025em;
  font-variation-settings: 'opsz' 144, 'SOFT' 30;
  margin: 0 0 24px;
  text-wrap: balance;

  @media (max-width: 720px) {
    font-size: ${({ $scale }) => 48 * $scale}px;
  }
`;

const Desc = styled.p`
  font-family: ${({ theme }) => theme.fonts.serif};
  font-style: italic;
  font-weight: 300;
  font-size: 21px;
  line-height: 1.4;
  color: ${({ theme }) => theme.colors.inkSoft};
  max-width: 620px;
  margin: 0 0 32px;
  text-wrap: pretty;
`;

const Body = styled.div`
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 80px;
  align-items: start;

  @media (max-width: 920px) {
    grid-template-columns: 1fr;
    gap: 48px;
  }
`;

const IngredientsAside = styled.aside`
  position: sticky;
  top: 32px;

  @media (max-width: 920px) {
    position: static;
    top: auto;
  }
`;

const IngredientsHead = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 4px;
`;

const SectionLabel = styled.h3`
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: 11px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.accentInk};
  margin: 0 0 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.accent};
  display: inline-block;
`;

const IngList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
`;

interface IngRowProps {
  $checked: boolean;
}

const IngRow = styled.li<IngRowProps>`
  display: grid;
  grid-template-columns: 1fr auto 28px;
  gap: 14px;
  align-items: baseline;
  padding: 14px 8px 14px 4px;
  margin: 0 -8px 0 -4px;
  border-bottom: 1px dotted ${({ theme }) => theme.colors.hairStrong};
  border-radius: ${({ theme }) => theme.radii.sm};
  cursor: pointer;
  transition: background ${({ theme }) => theme.transitions.fast},
              padding ${({ theme }) => theme.transitions.fast};
  position: relative;

  &:hover { background: ${({ theme }) => theme.colors.bgSunk}; padding-left: 8px; }
`;

interface IngNameProps {
  $checked: boolean;
}

const IngName = styled.span<IngNameProps>`
  font-family: ${({ theme }) => theme.fonts.serif};
  font-size: 17px;
  font-weight: 350;
  font-variation-settings: 'opsz' 14;
  color: ${({ $checked, theme }) => $checked ? theme.colors.muted : theme.colors.ink};
  text-decoration: ${({ $checked }) => $checked ? 'line-through' : 'none'};
  text-decoration-color: ${({ theme }) => theme.colors.hairStrong};
  transition: color ${({ theme }) => theme.transitions.fast};
`;

interface IngAmountProps {
  $checked: boolean;
}

const IngAmount = styled.span<IngAmountProps>`
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: 11px;
  letter-spacing: 0.05em;
  color: ${({ $checked, theme }) => $checked ? theme.colors.muted : theme.colors.accentInk};
  text-align: right;
  white-space: nowrap;
  text-decoration: ${({ $checked }) => $checked ? 'line-through' : 'none'};
  text-decoration-color: ${({ theme }) => theme.colors.hairStrong};
  transition: color ${({ theme }) => theme.transitions.fast};
`;

interface QuickAddProps {
  $onList: boolean;
}

const QuickAdd = styled.button<QuickAddProps>`
  width: 26px;
  height: 26px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  align-self: center;
  background: ${({ $onList, theme }) => $onList ? theme.colors.accent : 'transparent'};
  border: 1px ${({ $onList }) => $onList ? 'solid' : 'dashed'} ${({ $onList, theme }) => $onList ? theme.colors.accent : theme.colors.hairStrong};
  border-radius: 999px;
  color: ${({ $onList }) => $onList ? '#fff' : 'inherit'};
  padding: 0;
  opacity: ${({ $onList }) => $onList ? 1 : 0};
  transition: all ${({ theme }) => theme.transitions.fast};
  cursor: pointer;

  svg { width: 12px; height: 12px; }

  ${IngRow}:hover & { opacity: 1; }

  &:hover {
    border-style: solid;
    border-color: ${({ $onList, theme }) => $onList ? theme.colors.danger : theme.colors.accent};
    background: ${({ $onList, theme }) => $onList ? theme.colors.bgElev : theme.colors.accent};
    color: ${({ $onList, theme }) => $onList ? theme.colors.danger : '#fff'};
  }

  @media (hover: none) { opacity: 1; }
`;

const IngHint = styled.p`
  margin: 18px 0 0;
  font-family: ${({ theme }) => theme.fonts.serif};
  font-style: italic;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.muted};
  line-height: 1.5;
  text-wrap: pretty;
`;

const Toast = styled.span<{ $isRemove?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: ${({ theme }) => theme.fonts.serif};
  font-style: italic;
  font-size: 14px;
  color: ${({ $isRemove, theme }) => $isRemove ? theme.colors.inkSoft : theme.colors.accentInk};
  animation: fadeSlide 200ms ease-out;

  svg {
    width: 14px;
    height: 14px;
    padding: 3px;
    background: ${({ $isRemove, theme }) => $isRemove ? theme.colors.inkSoft : theme.colors.accent};
    color: #fff;
    border-radius: 999px;
    box-sizing: content-box;
  }
`;

const HintGlyph = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  border-radius: 999px;
  border: 1.5px dashed ${({ theme }) => theme.colors.accentInk};
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: 10px;
  font-weight: 500;
  line-height: 1;
  color: ${({ theme }) => theme.colors.accentInk};
  font-style: normal;
  vertical-align: -2px;
  margin: 0 1px;
`;

const StepsList = styled.ol`
  list-style: none;
  counter-reset: step;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 28px;
`;

interface StepItemProps {
  $done: boolean;
}

const StepItem = styled.li<StepItemProps>`
  display: grid;
  grid-template-columns: 56px 1fr;
  gap: 24px;
  align-items: start;
  cursor: pointer;
  padding: 4px 0;
  opacity: ${({ $done }) => $done ? 0.4 : 1};
  transition: opacity ${({ theme }) => theme.transitions.fast};
`;

const StepNum = styled.span`
  font-family: ${({ theme }) => theme.fonts.serif};
  font-style: italic;
  font-weight: 300;
  font-size: 36px;
  font-variation-settings: 'opsz' 36;
  color: ${({ theme }) => theme.colors.accentInk};
  line-height: 1;
  letter-spacing: -0.02em;
  padding-top: 4px;
`;

interface StepTextProps {
  $done: boolean;
}

const StepText = styled.span<StepTextProps>`
  font-family: ${({ theme }) => theme.fonts.serif};
  font-weight: 350;
  font-size: 18px;
  line-height: 1.55;
  color: ${({ theme }) => theme.colors.ink};
  text-wrap: pretty;
  font-variation-settings: 'opsz' 14;
  text-decoration: ${({ $done }) => $done ? 'line-through' : 'none'};
  text-decoration-color: ${({ theme }) => theme.colors.hairStrong};
`;

const NotesSection = styled.section`
  margin-top: 56px;
  padding-top: 32px;
  border-top: 1px solid ${({ theme }) => theme.colors.hair};
`;

const NotesSectionLabel = styled.h3`
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: 11px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.muted};
  margin: 0 0 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.hairStrong};
  display: inline-block;
`;

const NotesList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  max-width: 640px;
  display: flex;
  flex-direction: column;
`;

const NoteItem = styled.li`
  font-family: ${({ theme }) => theme.fonts.serif};
  font-style: italic;
  font-weight: 350;
  font-size: 16px;
  line-height: 1.55;
  color: ${({ theme }) => theme.colors.inkSoft};
  padding: 14px 0 14px 28px;
  border-bottom: 1px dotted ${({ theme }) => theme.colors.hairStrong};
  position: relative;
  text-wrap: pretty;

  &:last-child { border-bottom: none; }

  &::before {
    content: "";
    position: absolute;
    left: 4px;
    top: 24px;
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: ${({ theme }) => theme.colors.accent};
    opacity: 0.7;
  }
`;

function parseNotes(notes: string): string[] {
  const items = notes
    .split(/\n+|(?:^|\s)[•\-–]\s+/g)
    .map(s => s.trim())
    .filter(Boolean);
  if (items.length <= 1) {
    return notes
      .split(/(?<=[.!?])\s+(?=[A-Z])/)
      .map(s => s.trim())
      .filter(Boolean);
  }
  return items;
}

interface Props {
  recipe: Recipe;
  shoppingItems: ShoppingItem[];
}

export default function RecipeDetailClient({ recipe, shoppingItems }: Props) {
  const { tweaks } = useTweaks();
  const titleScale = tweaks.titleScale;
  const [confirming, setConfirming] = useState(false);
  const [checkedIngs, setCheckedIngs] = useState<Set<string>>(new Set());
  const [doneSteps, setDoneSteps] = useState<Set<string>>(new Set());
  const [flash, setFlash] = useState<{ kind: 'add' | 'remove' } | null>(null);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [, startTransition] = useTransition();

  useEffect(() => () => { if (flashTimer.current) clearTimeout(flashTimer.current); }, []);

  const onListKeys = new Set(
    shoppingItems.map(it => `${it.recipeId}::${it.ingredientId}`)
  );

  const toggleIngChecked = (id: string) => {
    setCheckedIngs(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleStep = (id: string) => {
    setDoneSteps(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleShopping = (ing: { id: string; name: string; amount: string }) => {
    const onList = onListKeys.has(`${recipe.id}::${ing.id}`);
    startTransition(() => {
      if (onList) {
        removeShoppingByIngredientAction(recipe.id, ing.id);
        setFlash({ kind: 'remove' });
      } else {
        addShoppingItemsAction(recipe.id, recipe.title, [ing]);
        setFlash({ kind: 'add' });
      }
    });
    if (flashTimer.current) clearTimeout(flashTimer.current);
    flashTimer.current = setTimeout(() => setFlash(null), 1800);
  };

  const handleDelete = () => {
    startTransition(() => { deleteRecipeAction(recipe.id); });
  };

  const created = new Date(recipe.createdAt);
  const dateStr = created.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const types = recipe.types ?? [];

  return (
    <Detail>
      <BackRow>
        <BackLink href="/">
          <IconArrowLeft /> All recipes
        </BackLink>
        <Actions>
          {confirming ? (
            <ConfirmBar>
              <ConfirmLabel>Delete this recipe?</ConfirmLabel>
              <Button $variant="ghost" onClick={() => setConfirming(false)}>Cancel</Button>
              <Button $variant="danger" onClick={handleDelete}>Yes, delete</Button>
            </ConfirmBar>
          ) : (
            <>
              <Button $variant="ghost" onClick={() => setConfirming(true)}>
                <IconTrash /> Delete
              </Button>
              <Link href={`/recipes/${recipe.id}/edit`} style={{ textDecoration: 'none' }}>
                <Button as="span"><IconEdit /> Edit</Button>
              </Link>
            </>
          )}
        </Actions>
      </BackRow>

      <Hero>
        <Eyebrow>
          From the kitchen · Saved {dateStr}
          {types.length > 0 && (
            <> · <DetailType>{types.map(t => TYPE_LABEL[t] ?? t).join(' · ')}</DetailType></>
          )}
        </Eyebrow>
        <Title $scale={titleScale}>{recipe.title}</Title>
        <Desc>{recipe.description}</Desc>
      </Hero>

      <Body>
        <IngredientsAside>
          <IngredientsHead>
            <SectionLabel>Ingredients</SectionLabel>
          </IngredientsHead>
          <IngList>
            {recipe.ingredients.map(ing => {
              const checked = checkedIngs.has(ing.id);
              const onList = onListKeys.has(`${recipe.id}::${ing.id}`);
              return (
                <IngRow
                  key={ing.id}
                  $checked={checked}
                  onClick={() => toggleIngChecked(ing.id)}
                >
                  <IngName $checked={checked}>{ing.name}</IngName>
                  <IngAmount $checked={checked}>{ing.amount}</IngAmount>
                  <QuickAdd
                    type="button"
                    $onList={onList}
                    onClick={e => { e.stopPropagation(); toggleShopping(ing); }}
                    aria-label={onList ? 'Remove from shopping list' : 'Add to shopping list'}
                  >
                    {onList ? <IconCheck /> : <IconPlus />}
                  </QuickAdd>
                </IngRow>
              );
            })}
          </IngList>
          <IngHint>
            {flash?.kind === 'add' ? (
              <Toast><IconCheck /> Added to your shopping list</Toast>
            ) : flash?.kind === 'remove' ? (
              <Toast $isRemove><IconX /> Removed from your shopping list</Toast>
            ) : (
              <>Tap a row to check it off · Tap <HintGlyph>+</HintGlyph> to add to your shopping list</>
            )}
          </IngHint>
        </IngredientsAside>

        <div>
          <SectionLabel>Method</SectionLabel>
          <StepsList>
            {[...recipe.steps].sort((a, b) => a.order - b.order).map(step => {
              const done = doneSteps.has(step.id);
              return (
                <StepItem key={step.id} $done={done} onClick={() => toggleStep(step.id)}>
                  <StepNum>{String(step.order).padStart(2, '0')}</StepNum>
                  <StepText $done={done}>{step.description}</StepText>
                </StepItem>
              );
            })}
          </StepsList>

          {recipe.notes?.trim() && (
            <NotesSection>
              <NotesSectionLabel>Notes from the cook</NotesSectionLabel>
              <NotesList>
                {parseNotes(recipe.notes).map((s, i) => (
                  <NoteItem key={i}>{s}</NoteItem>
                ))}
              </NotesList>
            </NotesSection>
          )}
        </div>
      </Body>
    </Detail>
  );
}

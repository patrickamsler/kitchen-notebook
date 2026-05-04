'use client';

import Link from 'next/link';
import { useTransition } from 'react';
import styled from 'styled-components';
import type { ShoppingItem } from '@/lib/types';
import { IconArrowLeft, IconArrowRight, IconTrash } from '@/components/icons/Icon';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import ShoppingItemRow from './ShoppingItemRow';
import { clearCheckedShoppingAction, clearAllShoppingAction } from '@/app/actions/shopping';

const Shopping = styled.div`
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

  &:hover { color: ${({ theme }) => theme.colors.accentInk}; gap: 12px; }
`;

const Actions = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
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

const Title = styled.h1`
  font-family: ${({ theme }) => theme.fonts.serif};
  font-weight: 300;
  font-size: 84px;
  line-height: 0.95;
  letter-spacing: -0.025em;
  font-variation-settings: 'opsz' 144, 'SOFT' 30;
  margin: 0 0 24px;
  text-wrap: balance;

  @media (max-width: 720px) { font-size: 48px; }
`;

const Tally = styled.p`
  display: inline-flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 10px;
  margin: 0;
  padding: 0;
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: 12px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.muted};
`;

const TallyNum = styled.span<{ $soft?: boolean }>`
  font-family: ${({ theme }) => theme.fonts.serif};
  font-style: ${({ $soft }) => $soft ? 'normal' : 'italic'};
  font-weight: 300;
  font-size: 32px;
  font-variation-settings: 'opsz' 36;
  color: ${({ $soft, theme }) => $soft ? theme.colors.inkSoft : theme.colors.accentInk};
  letter-spacing: -0.01em;
  line-height: 1;
`;

const TallyLbl = styled.span`
  color: ${({ theme }) => theme.colors.muted};
  letter-spacing: 0.14em;
`;

const TallySep = styled.span`
  color: ${({ theme }) => theme.colors.hairStrong};
  font-size: 14px;
  padding: 0 4px;
`;

const EmptyDesc = styled.p`
  font-family: ${({ theme }) => theme.fonts.serif};
  font-style: italic;
  font-weight: 300;
  font-size: 21px;
  line-height: 1.4;
  color: ${({ theme }) => theme.colors.inkSoft};
  max-width: 620px;
  margin: 0;
  text-wrap: pretty;
`;

const Body = styled.div`
  display: flex;
  flex-direction: column;
  gap: 56px;
  max-width: 760px;
`;

const Group = styled.section``;

const GroupHead = styled.header`
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 16px;
  align-items: baseline;
  margin-bottom: 14px;
  padding-bottom: 14px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.hair};

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
    gap: 4px;
  }
`;

const GroupMeta = styled.div`
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: 10.5px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.muted};
`;

const GroupTitle = styled(Link)`
  font-family: ${({ theme }) => theme.fonts.serif};
  font-style: italic;
  font-weight: 350;
  font-size: 24px;
  font-variation-settings: 'opsz' 36, 'SOFT' 50;
  color: ${({ theme }) => theme.colors.ink};
  background: none;
  border: none;
  padding: 0;
  text-align: left;
  letter-spacing: -0.005em;
  display: inline-flex;
  align-items: baseline;
  gap: 12px;
  transition: color ${({ theme }) => theme.transitions.fast}, gap ${({ theme }) => theme.transitions.fast};
  text-wrap: balance;
  text-decoration: none;

  &:hover { color: ${({ theme }) => theme.colors.accentInk}; gap: 16px; }
  svg { width: 22px; height: 11px; color: ${({ theme }) => theme.colors.muted}; transition: color ${({ theme }) => theme.transitions.fast}, transform ${({ theme }) => theme.transitions.fast}; align-self: center; }
  &:hover svg { color: ${({ theme }) => theme.colors.accentInk}; transform: translateX(2px); }
`;

const StaleTitle = styled.span`
  font-family: ${({ theme }) => theme.fonts.serif};
  font-style: italic;
  font-weight: 350;
  font-size: 24px;
  color: ${({ theme }) => theme.colors.muted};
`;

const GroupCount = styled.span`
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: 10.5px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.muted};
  white-space: nowrap;

  @media (max-width: 720px) { justify-self: start; }
`;

const List = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
`;

interface Group {
  recipeId: string;
  title: string;
  items: ShoppingItem[];
  hasRecipe: boolean;
}

interface Props {
  items: ShoppingItem[];
}

export default function ShoppingList({ items }: Props) {
  const [, startTransition] = useTransition();
  const total = items.length;
  const checked = items.filter(i => i.checked).length;
  const remaining = total - checked;

  const groups: Group[] = [];
  const seen = new Map<string, ShoppingItem[]>();
  for (const item of items) {
    if (!seen.has(item.recipeId)) seen.set(item.recipeId, []);
    seen.get(item.recipeId)!.push(item);
  }
  for (const [recipeId, groupItems] of seen) {
    groups.push({
      recipeId,
      title: groupItems[0].recipeTitle || 'Removed recipe',
      items: groupItems,
      hasRecipe: true,
    });
  }

  const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  const handleClearChecked = () => {
    startTransition(() => { clearCheckedShoppingAction(); });
  };

  const handleClearAll = () => {
    if (!confirm('Empty your shopping list?')) return;
    startTransition(() => { clearAllShoppingAction(); });
  };

  return (
    <Shopping>
      <BackRow>
        <BackLink href="/"><IconArrowLeft /> All recipes</BackLink>
        {total > 0 && (
          <Actions>
            {checked > 0 && (
              <Button $variant="ghost" onClick={handleClearChecked}>
                Clear {checked} checked
              </Button>
            )}
            <Button $variant="danger" onClick={handleClearAll}>
              <IconTrash /> Empty list
            </Button>
          </Actions>
        )}
      </BackRow>

      <Hero>
        <Eyebrow>The market list · {todayStr}</Eyebrow>
        <Title>Shopping<br />list</Title>
        {total > 0 ? (
          <Tally>
            <TallyNum>{remaining}</TallyNum>
            <TallyLbl>to buy</TallyLbl>
            {checked > 0 && (
              <>
                <TallySep>·</TallySep>
                <TallyNum $soft>{checked}</TallyNum>
                <TallyLbl>in the basket</TallyLbl>
              </>
            )}
            <TallySep>·</TallySep>
            <TallyNum $soft>{groups.length}</TallyNum>
            <TallyLbl>{groups.length === 1 ? 'recipe' : 'recipes'}</TallyLbl>
          </Tally>
        ) : (
          <EmptyDesc>Nothing here yet — open a recipe and tap the ingredients you need to pick up.</EmptyDesc>
        )}
      </Hero>

      {total === 0 ? (
        <EmptyState style={{ marginTop: 24 }}>
          <h3>Your basket is empty.</h3>
          <p>Pick a recipe, select ingredients, and they&apos;ll land here.</p>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <Button $variant="accent" as="span">Browse recipes <IconArrowRight /></Button>
          </Link>
        </EmptyState>
      ) : (
        <Body>
          {groups.map(group => (
            <Group key={group.recipeId}>
              <GroupHead>
                <GroupMeta>From the recipe</GroupMeta>
                <GroupTitle href={`/recipes/${group.recipeId}`}>
                  {group.title} <IconArrowRight />
                </GroupTitle>
                <GroupCount>{group.items.length} {group.items.length === 1 ? 'item' : 'items'}</GroupCount>
              </GroupHead>
              <List>
                {group.items.map(item => (
                  <ShoppingItemRow key={item.id} item={item} />
                ))}
              </List>
            </Group>
          ))}
        </Body>
      )}
    </Shopping>
  );
}

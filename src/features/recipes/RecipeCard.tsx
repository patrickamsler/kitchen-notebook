'use client';

import Link from 'next/link';
import styled from 'styled-components';
import type { Recipe } from '@/lib/types';
import { IconArrowRight } from '@/components/icons/Icon';
import { TYPE_LABEL } from './constants';

const Card = styled(Link)`
  display: block;
  text-decoration: none;
  background: ${({ theme }) => theme.colors.bgElev};
  border: 1px solid ${({ theme }) => theme.colors.hair};
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: 32px 32px 28px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  cursor: pointer;
  transition: background ${({ theme }) => theme.transitions.fast},
              transform ${({ theme }) => theme.transitions.fast},
              box-shadow ${({ theme }) => theme.transitions.fast},
              border-color ${({ theme }) => theme.transitions.fast};
  position: relative;
  min-height: 220px;
  box-shadow: ${({ theme }) => theme.shadows.sm};

  &:hover {
    background: #FFFEFB;
    border-color: ${({ theme }) => theme.colors.hairStrong};
    box-shadow: ${({ theme }) => theme.shadows.md};
    transform: translateY(-2px);
  }
  &:hover h2 { color: ${({ theme }) => theme.colors.accentInk}; }
  &:hover .arrow { transform: translateX(4px); color: ${({ theme }) => theme.colors.accentInk}; }
`;

const CardMeta = styled.div`
  display: flex;
  justify-content: space-between;
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: 10.5px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.muted};
`;

const CardTypes = styled.span`
  display: inline-flex;
  flex-wrap: wrap;
  gap: 4px;
  justify-content: flex-end;
`;

const TypeBadge = styled.span`
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: 10px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.accentInk};
  padding: 3px 9px;
  border: 1px solid ${({ theme }) => theme.colors.accent};
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.accentSoft};
  line-height: 1.4;
`;

const Title = styled.h2`
  font-family: ${({ theme }) => theme.fonts.serif};
  font-weight: 350;
  font-size: 30px;
  line-height: 1.05;
  letter-spacing: -0.015em;
  font-variation-settings: 'opsz' 36, 'SOFT' 30;
  margin: 0;
  color: ${({ theme }) => theme.colors.ink};
  text-wrap: balance;
  transition: color ${({ theme }) => theme.transitions.fast};
`;

const Desc = styled.p`
  font-size: 14px;
  line-height: 1.55;
  color: ${({ theme }) => theme.colors.inkSoft};
  margin: 0;
  text-wrap: pretty;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const Foot = styled.div`
  margin-top: auto;
  padding-top: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: 10.5px;
  letter-spacing: 0.1em;
  color: ${({ theme }) => theme.colors.muted};

  @media (max-width: 720px) {
    flex-wrap: wrap;
  }
`;

const Stats = styled.span`
  flex: 1;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  @media (max-width: 720px) {
    text-align: right;
    order: 3;
    width: 100%;
  }
`;

const Open = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 8px;

  .arrow {
    width: 24px;
    height: 12px;
    transition: transform ${({ theme }) => theme.transitions.fast};
  }
`;

interface Props {
  recipe: Recipe;
  index: number;
}

export default function RecipeCard({ recipe, index }: Props) {
  const created = new Date(recipe.createdAt);
  const month = created.toLocaleString('en-US', { month: 'short' }).toUpperCase();
  const day = created.getDate();
  const year = created.getFullYear();
  const num = String(index + 1).padStart(2, '0');

  return (
    <Card href={`/recipes/${recipe.id}`}>
      <CardMeta>
        <span>№ {num}</span>
        {recipe.types.length > 0 && (
          <CardTypes>
            {recipe.types.map(t => (
              <TypeBadge key={t}>{TYPE_LABEL[t] ?? t}</TypeBadge>
            ))}
          </CardTypes>
        )}
      </CardMeta>
      <Title>{recipe.title}</Title>
      <Desc>{recipe.description}</Desc>
      <Foot>
        <span>{month} {day} · {year}</span>
        <Stats>{recipe.ingredients.length} ingr · {recipe.steps.length} steps</Stats>
        <Open>Open <IconArrowRight /></Open>
      </Foot>
    </Card>
  );
}

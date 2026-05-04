'use client';

import Link from 'next/link';
import styled from 'styled-components';
import ShoppingPill from '@/features/shopping/ShoppingPill';
import SettingsMenu from './SettingsMenu';

const Header = styled.header`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 32px;
  padding-bottom: 28px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.hair};
  margin-bottom: 40px;

  @media (max-width: 720px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
`;

const Left = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Eyebrow = styled.span`
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: 10.5px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.muted};
`;

const Wordmark = styled.h1`
  font-family: ${({ theme }) => theme.fonts.serif};
  font-weight: 300;
  font-size: 56px;
  line-height: 0.95;
  letter-spacing: -0.02em;
  font-variation-settings: 'opsz' 144, 'SOFT' 50;
  color: ${({ theme }) => theme.colors.ink};
  margin: 0;

  em {
    font-style: italic;
    font-weight: 300;
    color: ${({ theme }) => theme.colors.accentInk};
  }

  @media (max-width: 720px) {
    font-size: 40px;
  }
`;

const Meta = styled.div`
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: 11px;
  color: ${({ theme }) => theme.colors.muted};
  text-align: right;
  letter-spacing: 0.05em;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;

  @media (max-width: 720px) {
    text-align: left;
    align-items: flex-start;
    flex-direction: row;
    flex-wrap: wrap;
  }
`;

interface Props {
  pendingCount: number;
  totalCount: number;
  lastDate: string;
}

export default function MastheadShell({ pendingCount, totalCount, lastDate }: Props) {
  return (
    <Header>
      <Left>
        <Eyebrow>Vol. 01 · Personal Edition</Eyebrow>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <Wordmark>
            The <em>Kitchen</em><br />Notebook
          </Wordmark>
        </Link>
      </Left>
      <Meta>
        <ShoppingPill count={pendingCount} />
        <span>
          {totalCount} {totalCount === 1 ? 'recipe' : 'recipes'} · Last edit {lastDate}
        </span>
        <SettingsMenu />
      </Meta>
    </Header>
  );
}

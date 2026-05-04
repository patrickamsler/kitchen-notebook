'use client';

import styled from 'styled-components';

export const EmptyState = styled.div`
  padding: 80px 24px;
  text-align: center;
  background: ${({ theme }) => theme.colors.bgElev};
  border: 1px dashed ${({ theme }) => theme.colors.hairStrong};
  border-radius: ${({ theme }) => theme.radii.lg};

  h3 {
    font-family: ${({ theme }) => theme.fonts.serif};
    font-weight: 350;
    font-size: 28px;
    margin: 0 0 8px;
    letter-spacing: -0.01em;
  }
  p { color: ${({ theme }) => theme.colors.muted}; margin: 0 0 20px; }
`;

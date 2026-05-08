'use client';

import React from 'react';
import styles from './EmptyState.module.scss';

interface Props extends React.HTMLAttributes<HTMLDivElement> {}

export function EmptyState({ className, ...props }: Props) {
  const cx = [styles.emptyState, className].filter(Boolean).join(' ');
  return <div {...props} className={cx} />;
}

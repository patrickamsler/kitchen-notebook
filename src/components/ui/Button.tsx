'use client';

import React from 'react';
import styles from './Button.module.scss';

const cx = (...c: (string | false | undefined | null)[]) => c.filter(Boolean).join(' ');

type Variant = 'default' | 'primary' | 'accent' | 'ghost' | 'danger';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  $variant?: Variant;
  $pending?: boolean;
  as?: string;
}

export function Button({ $variant, $pending: _pending, className, as: _as, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className={cx(
        styles.button,
        $variant === 'primary' && styles.primary,
        $variant === 'accent' && styles.accent,
        $variant === 'ghost' && styles.ghost,
        $variant === 'danger' && styles.danger,
        className,
      )}
    />
  );
}

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
}

export function IconButton({ className, ...props }: IconButtonProps) {
  return (
    <button
      {...props}
      className={cx(styles.iconButton, className)}
    />
  );
}

import type { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost';
  loading?: boolean;
}

export default function Button({
  variant = 'primary',
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button className={`btn btn-${variant}`} disabled={disabled || loading} {...props}>
      {loading ? 'Please wait…' : children}
    </button>
  );
}

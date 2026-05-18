import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger';
  loading?: boolean;
  icon?: React.ReactNode;
}

export function Button({ variant = 'primary', loading = false, icon, children, className = '', ...rest }: ButtonProps) {
  return (
    <button className={`eco-btn eco-btn--${variant} ${className}`} disabled={loading || rest.disabled} {...rest}>
      {loading ? <span className="eco-btn__spinner" /> : icon}
      <span>{children}</span>
    </button>
  );
}

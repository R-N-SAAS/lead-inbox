'use client';

import { forwardRef, ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      icon,
      iconPosition = 'left',
      fullWidth = false,
      children,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles = `
      inline-flex items-center justify-center gap-2
      font-medium rounded-xl
      transition-all duration-200
      focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
      disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
    `;

    const variants = {
      primary: `
        bg-gradient-to-r from-blue-500 to-blue-600 text-white
        shadow-lg shadow-blue-500/25
        hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5
        focus-visible:ring-blue-500
        active:translate-y-0
      `,
      secondary: `
        bg-white/70 backdrop-blur-sm text-slate-700
        border border-slate-200
        hover:bg-slate-50 hover:border-slate-300
        focus-visible:ring-slate-500
      `,
      success: `
        bg-gradient-to-r from-emerald-500 to-emerald-600 text-white
        shadow-lg shadow-emerald-500/25
        hover:shadow-xl hover:shadow-emerald-500/30 hover:-translate-y-0.5
        focus-visible:ring-emerald-500
      `,
      danger: `
        bg-gradient-to-r from-red-500 to-red-600 text-white
        shadow-lg shadow-red-500/25
        hover:shadow-xl hover:shadow-red-500/30 hover:-translate-y-0.5
        focus-visible:ring-red-500
      `,
      ghost: `
        bg-transparent text-slate-600
        hover:bg-slate-100 hover:text-slate-800
        focus-visible:ring-slate-500
      `,
    };

    const sizes = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-5 py-2.5 text-sm',
      lg: 'px-6 py-3 text-base',
    };

    const LoadingSpinner = () => (
      <svg
        className="animate-spin h-4 w-4"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    );

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <LoadingSpinner />
        ) : (
          icon && iconPosition === 'left' && <span className="flex-shrink-0">{icon}</span>
        )}
        {children}
        {!loading && icon && iconPosition === 'right' && (
          <span className="flex-shrink-0">{icon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;

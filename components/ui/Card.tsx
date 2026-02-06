'use client';

import { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

// ============================================
// CARD - LIGHT THEME
// ============================================

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outline' | 'glass';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  children: ReactNode;
}

export default function Card({
  variant = 'default',
  padding = 'md',
  hover = false,
  children,
  className,
  ...props
}: CardProps) {
  const variants = {
    default: 'bg-white border border-slate-200 shadow-sm',
    elevated: 'bg-white border border-slate-200 shadow-md',
    outline: 'bg-white border border-slate-200',
    glass: 'bg-white border border-slate-200 shadow-sm',
  };

  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const hoverStyles = hover
    ? 'transition-all duration-200 hover:shadow-md hover:border-slate-300 cursor-pointer'
    : '';

  return (
    <div
      className={cn(
        'rounded-xl',
        variants[variant],
        paddings[padding],
        hoverStyles,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// ============================================
// CARD HEADER
// ============================================

export interface CardHeaderProps {
  title: string;
  subtitle?: string;
  label?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function CardHeader({ title, subtitle, label, icon, action, className }: CardHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between mb-6', className)}>
      <div className="flex items-start gap-3">
        {icon && (
          <div className="flex-shrink-0 p-2 rounded-lg bg-slate-100 text-slate-600">
            {icon}
          </div>
        )}
        <div>
          {label && (
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">
              {label}
            </span>
          )}
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
          {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}

// ============================================
// STAT CARD - LIGHT WITH COLORED ICONS
// ============================================

export interface StatCardProps {
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: ReactNode;
  iconBg?: string;
  trend?: 'up' | 'down' | 'neutral';
}

export function StatCard({
  label,
  value,
  change,
  changeLabel,
  icon,
  iconBg,
  trend,
}: StatCardProps) {
  const getTrendFromChange = () => {
    if (trend) return trend;
    if (typeof change === 'number') {
      if (change > 0) return 'up';
      if (change < 0) return 'down';
    }
    return 'neutral';
  };

  const currentTrend = getTrendFromChange();

  const trendColors = {
    up: 'text-emerald-600',
    down: 'text-red-500',
    neutral: 'text-slate-500',
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {label}
          </span>
          <p className="text-3xl font-bold text-slate-900 mt-2 tracking-tight">
            {value}
          </p>
          {typeof change === 'number' && (
            <div className={cn('flex items-center gap-1.5 mt-2 text-xs font-medium', trendColors[currentTrend])}>
              {currentTrend === 'up' && (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17V7H7" />
                </svg>
              )}
              {currentTrend === 'down' && (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 7l-9.2 9.2M7 7v10h10" />
                </svg>
              )}
              <span>{change > 0 ? '+' : ''}{change.toFixed(1)}%</span>
              {changeLabel && <span className="text-slate-400">{changeLabel}</span>}
            </div>
          )}
        </div>
        {icon && (
          <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0", iconBg || "bg-blue-50 text-blue-600")}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// EMPTY STATE
// ============================================

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {icon && (
        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mb-4 text-slate-400">
          {icon}
        </div>
      )}
      <h3 className="text-base font-semibold text-slate-900 mb-1">{title}</h3>
      {description && <p className="text-sm text-slate-500 max-w-xs mb-5">{description}</p>}
      {action}
    </div>
  );
}

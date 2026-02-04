'use client';

import { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

// ============================================
// CARD - xAI STYLE
// ============================================

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outline';
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
    default: 'bg-[#0a0a0a] border border-white/[0.1]',
    elevated: 'bg-[#111111] border border-white/[0.1]',
    outline: 'bg-transparent border border-white/[0.15]',
  };

  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const hoverStyles = hover
    ? 'transition-all duration-200 hover:border-white/[0.2] cursor-pointer'
    : '';

  return (
    <div
      className={cn(
        'rounded-lg',
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
// CARD HEADER - xAI STYLE
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
          <div className="flex-shrink-0 p-2 rounded-md bg-white/[0.06] text-white">
            {icon}
          </div>
        )}
        <div>
          {label && (
            <span className="font-mono text-[11px] text-neutral-400 tracking-widest uppercase mb-1 block">
              [ {label} ]
            </span>
          )}
          <h3 className="text-base font-medium text-white">{title}</h3>
          {subtitle && <p className="text-sm text-neutral-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}

// ============================================
// STAT CARD - xAI STYLE (BRIGHT LABELS)
// ============================================

export interface StatCardProps {
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: ReactNode;
  trend?: 'up' | 'down' | 'neutral';
}

export function StatCard({
  label,
  value,
  change,
  changeLabel,
  icon,
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
    up: 'text-emerald-400',
    down: 'text-red-400',
    neutral: 'text-neutral-500',
  };

  return (
    <Card variant="default" hover className="relative">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Label - BRIGHTER for visibility */}
          <span className="font-mono text-[11px] text-neutral-400 tracking-[0.15em] uppercase">
            [ {label} ]
          </span>
          
          {/* Value */}
          <p className="font-mono text-3xl font-semibold text-white mt-3 tracking-tight">
            {value}
          </p>
          
          {/* Change indicator */}
          {typeof change === 'number' && (
            <div className={cn('flex items-center gap-1.5 mt-3 font-mono text-xs', trendColors[currentTrend])}>
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
              <span>
                {change > 0 ? '+' : ''}{change.toFixed(1)}%
              </span>
              {changeLabel && <span className="text-neutral-500">{changeLabel}</span>}
            </div>
          )}
        </div>
        
        {icon && (
          <div className="p-2.5 rounded-md bg-white/[0.06] text-neutral-400">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}

// ============================================
// EMPTY STATE - xAI STYLE
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
        <div className="w-12 h-12 rounded-lg bg-white/[0.03] flex items-center justify-center mb-4 text-neutral-500">
          {icon}
        </div>
      )}
      <h3 className="text-base font-medium text-white mb-1">{title}</h3>
      {description && <p className="text-sm text-neutral-500 max-w-xs mb-5">{description}</p>}
      {action}
    </div>
  );
}

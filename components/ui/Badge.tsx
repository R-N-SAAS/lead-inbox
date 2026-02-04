'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { 
  LeadStatus, 
  LeadSource, 
  LeadPriority, 
  CampaignStatus,
  RecipientStatus 
} from '@/types';
import { 
  STATUS_CONFIG, 
  SOURCE_CONFIG, 
  PRIORITY_CONFIG, 
  CAMPAIGN_STATUS_CONFIG 
} from '@/lib/utils';

// ============================================
// BASE BADGE
// ============================================

type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'purple';

interface BadgeProps {
  variant?: BadgeVariant;
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
  children: ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, { bg: string; text: string; dot: string }> = {
  default: { bg: 'bg-slate-100', text: 'text-slate-700', dot: 'bg-slate-500' },
  primary: { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500' },
  success: { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  warning: { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500' },
  danger: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
  info: { bg: 'bg-cyan-100', text: 'text-cyan-700', dot: 'bg-cyan-500' },
  purple: { bg: 'bg-purple-100', text: 'text-purple-700', dot: 'bg-purple-500' },
};

export default function Badge({
  variant = 'default',
  size = 'md',
  dot = false,
  children,
  className,
}: BadgeProps) {
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  };

  const styles = variantStyles[variant];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-medium rounded-full whitespace-nowrap',
        styles.bg,
        styles.text,
        sizeStyles[size],
        className
      )}
    >
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', styles.dot)} />}
      {children}
    </span>
  );
}

// ============================================
// STATUS BADGE (Lead Status)
// ============================================

interface StatusBadgeProps {
  status: LeadStatus;
  showDot?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function StatusBadge({ status, showDot = true, size = 'md' }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  
  if (!config) {
    return <Badge variant="default" size={size} dot={showDot}>{status}</Badge>;
  }

  const variantMap: Record<string, BadgeVariant> = {
    'bg-blue-100': 'primary',
    'bg-amber-100': 'warning',
    'bg-emerald-100': 'success',
    'bg-purple-100': 'purple',
    'bg-green-100': 'success',
    'bg-red-100': 'danger',
    'bg-slate-100': 'default',
  };

  const variant = variantMap[config.bgClass] || 'default';

  return (
    <Badge variant={variant} size={size} dot={showDot}>
      {config.label}
    </Badge>
  );
}

// ============================================
// SOURCE BADGE (Lead Source)
// ============================================

interface SourceBadgeProps {
  source: LeadSource | string;
  size?: 'sm' | 'md' | 'lg';
}

export function SourceBadge({ source, size = 'sm' }: SourceBadgeProps) {
  const config = SOURCE_CONFIG[source as LeadSource];
  
  if (!config) {
    return <Badge variant="default" size={size}>{source}</Badge>;
  }

  const variantMap: Record<string, BadgeVariant> = {
    'bg-blue-100': 'primary',
    'bg-emerald-100': 'success',
    'bg-cyan-100': 'info',
    'bg-slate-100': 'default',
    'bg-purple-100': 'purple',
    'bg-amber-100': 'warning',
  };

  const variant = variantMap[config.bgClass] || 'default';

  return (
    <Badge variant={variant} size={size}>
      {config.label}
    </Badge>
  );
}

// ============================================
// PRIORITY BADGE
// ============================================

interface PriorityBadgeProps {
  priority: LeadPriority;
  size?: 'sm' | 'md' | 'lg';
}

export function PriorityBadge({ priority, size = 'sm' }: PriorityBadgeProps) {
  const config = PRIORITY_CONFIG[priority];
  
  if (!config) {
    return <Badge variant="default" size={size}>{priority}</Badge>;
  }

  const variantMap: Record<string, BadgeVariant> = {
    'bg-slate-100': 'default',
    'bg-amber-100': 'warning',
    'bg-orange-100': 'warning',
    'bg-red-100': 'danger',
  };

  const variant = variantMap[config.bgClass] || 'default';

  return (
    <Badge variant={variant} size={size}>
      {config.label}
    </Badge>
  );
}

// ============================================
// CAMPAIGN STATUS BADGE
// ============================================

interface CampaignStatusBadgeProps {
  status: CampaignStatus;
  showDot?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function CampaignStatusBadge({ status, showDot = true, size = 'md' }: CampaignStatusBadgeProps) {
  const config = CAMPAIGN_STATUS_CONFIG[status];
  
  if (!config) {
    return <Badge variant="default" size={size} dot={showDot}>{status}</Badge>;
  }

  const variantMap: Record<string, BadgeVariant> = {
    'bg-slate-100': 'default',
    'bg-emerald-100': 'success',
    'bg-amber-100': 'warning',
    'bg-blue-100': 'primary',
    'bg-gray-100': 'default',
  };

  const variant = variantMap[config.bgClass] || 'default';

  return (
    <Badge variant={variant} size={size} dot={showDot}>
      {config.label}
    </Badge>
  );
}

// ============================================
// RECIPIENT STATUS BADGE
// ============================================

interface RecipientStatusBadgeProps {
  status: RecipientStatus;
  size?: 'sm' | 'md' | 'lg';
}

export function RecipientStatusBadge({ status, size = 'sm' }: RecipientStatusBadgeProps) {
  const statusConfig: Record<RecipientStatus, { label: string; variant: BadgeVariant }> = {
    pending: { label: 'Ausstehend', variant: 'default' },
    sent: { label: 'Gesendet', variant: 'primary' },
    opened: { label: 'Geöffnet', variant: 'info' },
    clicked: { label: 'Geklickt', variant: 'purple' },
    replied: { label: 'Geantwortet', variant: 'success' },
    bounced: { label: 'Fehlgeschlagen', variant: 'danger' },
    unsubscribed: { label: 'Abgemeldet', variant: 'warning' },
  };

  const config = statusConfig[status] || { label: status, variant: 'default' as BadgeVariant };

  return (
    <Badge variant={config.variant} size={size}>
      {config.label}
    </Badge>
  );
}

// ============================================
// COUNT BADGE (für Notifications etc.)
// ============================================

interface CountBadgeProps {
  count: number;
  max?: number;
  variant?: BadgeVariant;
}

export function CountBadge({ count, max = 99, variant = 'danger' }: CountBadgeProps) {
  const displayCount = count > max ? `${max}+` : count.toString();
  
  if (count === 0) return null;

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold rounded-full',
        variantStyles[variant].bg,
        variantStyles[variant].text
      )}
    >
      {displayCount}
    </span>
  );
}

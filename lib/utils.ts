import { LeadStatus, LeadSource, LeadPriority, CampaignStatus } from '@/types';

// ============================================
// DATE UTILITIES
// ============================================

export function formatDate(dateString: string, options?: Intl.DateTimeFormatOptions): string {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  };
  
  return new Date(dateString).toLocaleDateString('de-DE', options || defaultOptions);
}

export function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Gerade eben';
  if (diffMins < 60) return `vor ${diffMins} Min.`;
  if (diffHours < 24) return `vor ${diffHours} Std.`;
  if (diffDays < 7) return `vor ${diffDays} Tagen`;
  
  return formatDate(dateString);
}

// ============================================
// STATUS CONFIGURATIONS
// ============================================

export const STATUS_CONFIG: Record<LeadStatus, {
  label: string;
  color: string;
  bgClass: string;
  textClass: string;
}> = {
  new: {
    label: 'Neu',
    color: '#3b82f6',
    bgClass: 'bg-blue-100',
    textClass: 'text-blue-700',
  },
  replied: {
    label: 'Beantwortet',
    color: '#f59e0b',
    bgClass: 'bg-amber-100',
    textClass: 'text-amber-700',
  },
  qualified: {
    label: 'Qualifiziert',
    color: '#10b981',
    bgClass: 'bg-emerald-100',
    textClass: 'text-emerald-700',
  },
  offer_sent: {
    label: 'Angebot gesendet',
    color: '#8b5cf6',
    bgClass: 'bg-purple-100',
    textClass: 'text-purple-700',
  },
  won: {
    label: 'Gewonnen',
    color: '#059669',
    bgClass: 'bg-green-100',
    textClass: 'text-green-700',
  },
  lost: {
    label: 'Verloren',
    color: '#ef4444',
    bgClass: 'bg-red-100',
    textClass: 'text-red-700',
  },
  unsubscribed: {
    label: 'Abgemeldet',
    color: '#64748b',
    bgClass: 'bg-slate-100',
    textClass: 'text-slate-700',
  },
};

export const SOURCE_CONFIG: Record<LeadSource, {
  label: string;
  color: string;
  bgClass: string;
  textClass: string;
}> = {
  web_form: {
    label: 'Website',
    color: '#3b82f6',
    bgClass: 'bg-blue-100',
    textClass: 'text-blue-700',
  },
  widget: {
    label: 'Widget',
    color: '#10b981',
    bgClass: 'bg-emerald-100',
    textClass: 'text-emerald-700',
  },
  scraper: {
    label: 'Scraper',
    color: '#06b6d4',
    bgClass: 'bg-cyan-100',
    textClass: 'text-cyan-700',
  },
  manual: {
    label: 'Manuell',
    color: '#64748b',
    bgClass: 'bg-slate-100',
    textClass: 'text-slate-700',
  },
  api: {
    label: 'API',
    color: '#8b5cf6',
    bgClass: 'bg-purple-100',
    textClass: 'text-purple-700',
  },
  import: {
    label: 'Import',
    color: '#f59e0b',
    bgClass: 'bg-amber-100',
    textClass: 'text-amber-700',
  },
};

export const PRIORITY_CONFIG: Record<LeadPriority, {
  label: string;
  color: string;
  bgClass: string;
  textClass: string;
}> = {
  low: {
    label: 'Niedrig',
    color: '#64748b',
    bgClass: 'bg-slate-100',
    textClass: 'text-slate-700',
  },
  medium: {
    label: 'Mittel',
    color: '#f59e0b',
    bgClass: 'bg-amber-100',
    textClass: 'text-amber-700',
  },
  high: {
    label: 'Hoch',
    color: '#f97316',
    bgClass: 'bg-orange-100',
    textClass: 'text-orange-700',
  },
  urgent: {
    label: 'Dringend',
    color: '#ef4444',
    bgClass: 'bg-red-100',
    textClass: 'text-red-700',
  },
};

export const CAMPAIGN_STATUS_CONFIG: Record<CampaignStatus, {
  label: string;
  color: string;
  bgClass: string;
  textClass: string;
}> = {
  draft: {
    label: 'Entwurf',
    color: '#64748b',
    bgClass: 'bg-slate-100',
    textClass: 'text-slate-700',
  },
  active: {
    label: 'Aktiv',
    color: '#10b981',
    bgClass: 'bg-emerald-100',
    textClass: 'text-emerald-700',
  },
  paused: {
    label: 'Pausiert',
    color: '#f59e0b',
    bgClass: 'bg-amber-100',
    textClass: 'text-amber-700',
  },
  completed: {
    label: 'Abgeschlossen',
    color: '#3b82f6',
    bgClass: 'bg-blue-100',
    textClass: 'text-blue-700',
  },
  archived: {
    label: 'Archiviert',
    color: '#94a3b8',
    bgClass: 'bg-gray-100',
    textClass: 'text-gray-700',
  },
};

// ============================================
// STRING UTILITIES
// ============================================

export function getInitials(name: string | null | undefined, email?: string): string {
  if (name) {
    const parts = name.split(' ').filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }
  if (email) {
    return email.substring(0, 2).toUpperCase();
  }
  return '??';
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return `${str.substring(0, maxLength)}...`;
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[äöüß]/g, (char) => {
      const map: Record<string, string> = { ä: 'ae', ö: 'oe', ü: 'ue', ß: 'ss' };
      return map[char] || char;
    })
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// ============================================
// NUMBER UTILITIES
// ============================================

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('de-DE').format(num);
}

export function formatPercent(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function calculatePercentChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

// ============================================
// PHONE UTILITIES
// ============================================

export function normalizePhone(phone: string): string {
  // Entferne alles außer Zahlen und +
  let normalized = phone.replace(/[^0-9+]/g, '');
  
  // Deutsche Nummer ohne Ländercode -> +49
  if (normalized.startsWith('0') && !normalized.startsWith('00')) {
    normalized = '+49' + normalized.substring(1);
  }
  
  // 00 am Anfang -> +
  if (normalized.startsWith('00')) {
    normalized = '+' + normalized.substring(2);
  }
  
  return normalized;
}

export function formatPhone(phone: string): string {
  const normalized = normalizePhone(phone);
  
  // Deutsche Nummer formatieren
  if (normalized.startsWith('+49')) {
    const local = normalized.substring(3);
    if (local.length >= 10) {
      return `+49 ${local.substring(0, 3)} ${local.substring(3, 6)} ${local.substring(6)}`;
    }
  }
  
  return normalized;
}

// ============================================
// VALIDATION UTILITIES
// ============================================

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidPhone(phone: string): boolean {
  const normalized = normalizePhone(phone);
  return normalized.length >= 10 && normalized.length <= 15;
}

// ============================================
// ARRAY UTILITIES
// ============================================

export function groupBy<T, K extends string | number>(
  array: T[],
  keyFn: (item: T) => K
): Record<K, T[]> {
  return array.reduce((result, item) => {
    const key = keyFn(item);
    if (!result[key]) {
      result[key] = [];
    }
    result[key].push(item);
    return result;
  }, {} as Record<K, T[]>);
}

export function countBy<T, K extends string | number>(
  array: T[],
  keyFn: (item: T) => K
): Record<K, number> {
  return array.reduce((result, item) => {
    const key = keyFn(item);
    result[key] = (result[key] || 0) + 1;
    return result;
  }, {} as Record<K, number>);
}

// ============================================
// CLASSNAME UTILITY
// ============================================

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

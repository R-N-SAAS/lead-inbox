'use client';

import { JobStatus } from '@/types';

const statusConfig: Record<JobStatus, { label: string; className: string; dot: string }> = {
  queued: {
    label: 'Warteschlange',
    className: 'bg-amber-50 text-amber-700 ring-amber-200',
    dot: 'bg-amber-400',
  },
  running: {
    label: 'Läuft …',
    className: 'bg-blue-50 text-blue-700 ring-blue-200',
    dot: 'bg-blue-400 animate-pulse',
  },
  done: {
    label: 'Fertig',
    className: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    dot: 'bg-emerald-400',
  },
  failed: {
    label: 'Fehler',
    className: 'bg-red-50 text-red-700 ring-red-200',
    dot: 'bg-red-400',
  },
};

export function StatusBadge({ status }: { status: JobStatus }) {
  const cfg = statusConfig[status] || statusConfig.queued;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${cfg.className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

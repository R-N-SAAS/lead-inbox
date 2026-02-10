'use client';

import { Job } from '@/types';
import { StatusBadge } from './StatusBadge';
import { ExternalLink, Download, Eye } from 'lucide-react';

interface Props {
  jobs: Job[];
  onViewJob: (id: string) => void;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatNumber(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k` : String(n);
}

export function JobsTable({ jobs, onViewJob }: Props) {
  if (jobs.length === 0) {
    return (
      <div className="text-center py-12 text-surface-400">
        <p className="text-sm">Noch keine Suchaufträge. Starte deine erste Lead-Suche oben.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-surface-100">
            <th className="text-left py-3 px-2 text-xs font-medium text-surface-400 uppercase tracking-wider">Datum</th>
            <th className="text-left py-3 px-2 text-xs font-medium text-surface-400 uppercase tracking-wider">Suchbegriff</th>
            <th className="text-left py-3 px-2 text-xs font-medium text-surface-400 uppercase tracking-wider hidden sm:table-cell">Max.</th>
            <th className="text-left py-3 px-2 text-xs font-medium text-surface-400 uppercase tracking-wider">Status</th>
            <th className="text-left py-3 px-2 text-xs font-medium text-surface-400 uppercase tracking-wider hidden md:table-cell">Leads</th>
            <th className="text-right py-3 px-2 text-xs font-medium text-surface-400 uppercase tracking-wider">Aktionen</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-50">
          {jobs.map((job) => (
            <tr
              key={job.id}
              className="hover:bg-surface-50/50 transition-colors cursor-pointer group"
              onClick={() => onViewJob(job.id)}
            >
              <td className="py-3 px-2 text-surface-500 font-mono text-xs whitespace-nowrap">
                {formatDate(job.created_at)}
              </td>
              <td className="py-3 px-2 font-medium text-surface-900">
                {job.keyword}
              </td>
              <td className="py-3 px-2 text-surface-500 font-mono text-xs hidden sm:table-cell">
                {formatNumber(job.max_results)}
              </td>
              <td className="py-3 px-2">
                <StatusBadge status={job.status} />
              </td>
              <td className="py-3 px-2 text-surface-600 hidden md:table-cell font-mono">
                {job.lead_count?.toLocaleString('de-DE') ?? '—'}
              </td>
              <td className="py-3 px-2">
                <div className="flex items-center justify-end gap-1">
                  {job.sheet_url && (
                    <a
                      href={job.sheet_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium text-brand-700 hover:bg-brand-50 transition-colors"
                      title="Google Sheet öffnen"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      <span className="hidden lg:inline">Sheet</span>
                    </a>
                  )}
                  {job.csv_url && (
                    <a
                      href={job.csv_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium text-surface-600 hover:bg-surface-100 transition-colors"
                      title="CSV herunterladen"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span className="hidden lg:inline">CSV</span>
                    </a>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewJob(job.id);
                    }}
                    className="inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium text-surface-500 hover:bg-surface-100 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

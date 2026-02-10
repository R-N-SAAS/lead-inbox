'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { StatusBadge } from '@/components/StatusBadge';
import { Job } from '@/types';
import {
  ArrowLeft,
  ExternalLink,
  Download,
  RefreshCw,
  Copy,
  Clock,
  Search,
  AlertTriangle,
  RotateCcw,
  Loader2,
  Hash,
} from 'lucide-react';

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function duration(start: string, end: string): string {
  const ms = new Date(end).getTime() - new Date(start).getTime();
  if (ms < 60000) return `${Math.round(ms / 1000)}s`;
  return `${Math.floor(ms / 60000)}m ${Math.round((ms % 60000) / 1000)}s`;
}

export default function JobDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [rerunning, setRerunning] = useState(false);

  const fetchJob = useCallback(async () => {
    try {
      const res = await fetch(`/api/jobs?id=${id}`);
      if (res.status === 401) { router.push('/login'); return; }
      if (!res.ok) return;
      setJob(await res.json());
    } catch {} finally { setLoading(false); }
  }, [id, router]);

  useEffect(() => { fetchJob(); }, [fetchJob]);

  useEffect(() => {
    if (!job || (job.status !== 'queued' && job.status !== 'running')) return;
    const interval = setInterval(fetchJob, 5000);
    return () => clearInterval(interval);
  }, [job, fetchJob]);

  const handleRerun = async () => {
    if (!job) return;
    setRerunning(true);
    try {
      const res = await fetch('/api/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword: job.keyword, max_results: job.max_results }),
      });
      const data = await res.json();
      if (res.ok && data.job) router.push(`/jobs/${data.job.id}`);
    } finally { setRerunning(false); }
  };

  const copyId = () => { navigator.clipboard.writeText(id); };

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-6 w-6 animate-spin text-surface-400" />
        </div>
      </AppShell>
    );
  }

  if (!job) {
    return (
      <AppShell>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
          <p className="text-surface-500">Job nicht gefunden.</p>
          <button onClick={() => router.push('/dashboard')} className="btn-secondary mt-4">
            <ArrowLeft className="h-4 w-4" /> Zurück
          </button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-5 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/dashboard')}
              className="p-1.5 rounded-md hover:bg-surface-100 transition-colors text-surface-400"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-surface-900 tracking-tight flex items-center gap-2">
                <Search className="h-4 w-4 text-surface-400" />
                {job.keyword}
              </h1>
              <p className="text-xs text-surface-400 mt-0.5 flex items-center gap-1.5">
                <Hash className="h-3 w-3" />
                Max. {job.max_results.toLocaleString('de-DE')} Ergebnisse
                <span className="text-surface-300">·</span>
                Deutschland · Firmensuche
              </p>
            </div>
          </div>
          <StatusBadge status={job.status} />
        </div>

        {/* Info Grid */}
        <div className="card divide-y divide-surface-100">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5">
            <div>
              <p className="text-xs text-surface-400 uppercase tracking-wider font-medium mb-1">Erstellt</p>
              <p className="text-sm text-surface-700 font-mono">{formatDateTime(job.created_at)}</p>
            </div>
            <div>
              <p className="text-xs text-surface-400 uppercase tracking-wider font-medium mb-1">Aktualisiert</p>
              <p className="text-sm text-surface-700 font-mono">{formatDateTime(job.updated_at)}</p>
            </div>
            <div>
              <p className="text-xs text-surface-400 uppercase tracking-wider font-medium mb-1">Dauer</p>
              <p className="text-sm text-surface-700 font-mono flex items-center gap-1">
                <Clock className="h-3 w-3 text-surface-400" />
                {duration(job.created_at, job.updated_at)}
              </p>
            </div>
            <div>
              <p className="text-xs text-surface-400 uppercase tracking-wider font-medium mb-1">Leads gefunden</p>
              <p className="text-sm text-surface-900 font-bold font-mono">{job.lead_count?.toLocaleString('de-DE') ?? '—'}</p>
            </div>
          </div>
          <div className="px-5 py-3 flex items-center justify-between">
            <p className="text-xs text-surface-400">
              <span className="uppercase tracking-wider font-medium">Job-ID:</span>{' '}
              <code className="font-mono text-surface-500">{job.id}</code>
            </p>
            <button onClick={copyId} className="text-surface-400 hover:text-surface-600 transition-colors" title="ID kopieren">
              <Copy className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Error */}
        {job.error && (
          <div className="card border-red-200 bg-red-50/50 p-5">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800">Fehler</p>
                <p className="text-sm text-red-700 mt-1">{job.error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {(job.sheet_url || job.csv_url) && (
          <div className="card p-5 space-y-3">
            <h3 className="text-sm font-semibold text-surface-900">Ergebnisse</h3>
            <div className="flex flex-wrap gap-2">
              {job.sheet_url && (
                <a
                  href={job.sheet_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-brand-50 border border-brand-200 px-4 py-2.5 text-sm font-medium text-brand-700 hover:bg-brand-100 transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                  Google Sheet öffnen
                </a>
              )}
              {job.csv_url && (
                <a href={job.csv_url} target="_blank" rel="noopener noreferrer" className="btn-secondary">
                  <Download className="h-4 w-4" />
                  CSV herunterladen
                </a>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button onClick={handleRerun} disabled={rerunning} className="btn-primary">
            {rerunning ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
            {rerunning ? 'Wird gestartet …' : 'Erneut ausführen'}
          </button>
          <button onClick={fetchJob} className="btn-secondary">
            <RefreshCw className="h-4 w-4" />
            Aktualisieren
          </button>
        </div>
      </div>
    </AppShell>
  );
}

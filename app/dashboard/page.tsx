'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { NewSearchForm } from '@/components/NewSearchForm';
import { JobsTable } from '@/components/JobsTable';
import { Job } from '@/types';
import { RefreshCw, Database } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchJobs = useCallback(async () => {
    try {
      const res = await fetch('/api/jobs?customer_id=demo-customer');
      if (res.status === 401) {
        router.push('/login');
        return;
      }
      if (!res.ok) throw new Error('Fehler beim Laden');
      const data = await res.json();
      setJobs(data);
      setError('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // Poll every 5s if any job is queued/running
  useEffect(() => {
    const hasActive = jobs.some((j) => j.status === 'queued' || j.status === 'running');
    if (!hasActive) return;
    const interval = setInterval(fetchJobs, 5000);
    return () => clearInterval(interval);
  }, [jobs, fetchJobs]);

  const handleNewSearch = async (data: { keyword: string; max_results: number }) => {
    const res = await fetch('/api/trigger', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (res.status === 401) {
      router.push('/login');
      return;
    }

    const result = await res.json();
    if (!res.ok) {
      setError(result.error || 'Fehler beim Starten.');
      return;
    }

    setJobs((prev) => [result.job, ...prev]);
  };

  const doneCount = jobs.filter((j) => j.status === 'done').length;
  const totalLeads = jobs.reduce((acc, j) => acc + (j.lead_count || 0), 0);
  const hasActiveJob = jobs.some((j) => j.status === 'queued' || j.status === 'running');
  
  // Leads dieser Woche berechnen
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const leadsThisWeek = jobs
    .filter((j) => new Date(j.created_at) >= weekAgo)
    .reduce((acc, j) => acc + (j.lead_count || 0), 0);

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 tracking-tight">Dashboard</h1>
          <p className="text-sm text-surface-500 mt-1">B2B Leads generieren</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="card px-4 py-3">
            <p className="text-xs text-surface-400 uppercase tracking-wider font-medium">Leads diese Woche</p>
            <p className="text-2xl font-bold text-surface-900 mt-1 font-mono">{leadsThisWeek.toLocaleString('de-DE')}</p>
          </div>
          <div className="card px-4 py-3">
            <p className="text-xs text-surface-400 uppercase tracking-wider font-medium">Abgeschlossen</p>
            <p className="text-2xl font-bold text-brand-600 mt-1 font-mono">{doneCount}</p>
          </div>
          <div className="card px-4 py-3 hidden sm:block">
            <p className="text-xs text-surface-400 uppercase tracking-wider font-medium">Leads gesamt</p>
            <p className="text-2xl font-bold text-surface-900 mt-1 font-mono">{totalLeads.toLocaleString('de-DE')}</p>
          </div>
        </div>

        {/* Search */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Database className="h-4 w-4 text-brand-500" />
            <h2 className="text-sm font-semibold text-surface-900">Neue Lead-Suche</h2>
          </div>
          <NewSearchForm onSubmit={handleNewSearch} hasActiveJob={hasActiveJob} />
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Jobs */}
        <div className="card">
          <div className="flex items-center justify-between px-5 py-4 border-b border-surface-100">
            <h2 className="text-sm font-semibold text-surface-900">Letzte Aufträge</h2>
            <button
              onClick={fetchJobs}
              className="inline-flex items-center gap-1.5 text-xs text-surface-400 hover:text-surface-600 transition-colors"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              Aktualisieren
            </button>
          </div>
          <div className="px-3 pb-2">
            <JobsTable jobs={jobs} onViewJob={(id) => router.push(`/jobs/${id}`)} />
          </div>
        </div>
      </div>
    </AppShell>
  );
}

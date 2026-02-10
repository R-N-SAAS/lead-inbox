'use client';

import { useState } from 'react';
import { Search, Loader2, Zap } from 'lucide-react';

interface Props {
  onSubmit: (data: { keyword: string; max_results: number }) => Promise<void>;
  hasActiveJob?: boolean;
}

const RESULT_OPTIONS = [100, 500, 1000, 2000, 5000];

export function NewSearchForm({ onSubmit, hasActiveJob = false }: Props) {
  const [keyword, setKeyword] = useState('');
  const [maxResults, setMaxResults] = useState(5000);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword.trim()) return;
    setLoading(true);
    try {
      await onSubmit({ keyword: keyword.trim(), max_results: maxResults });
      setKeyword('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="keyword" className="block text-xs font-medium text-surface-500 mb-1.5 uppercase tracking-wider">
          Suchbegriff / Branche
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
          <input
            id="keyword"
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="z. B. Maschinenbau, IT Dienstleister, Logistik …"
            className="w-full rounded-lg border border-surface-200 bg-white py-2.5 pl-10 pr-3 text-sm text-surface-900 placeholder:text-surface-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all"
            required
            disabled={loading}
            autoFocus
          />
        </div>
      </div>

      <div className="flex items-end gap-4">
        <div className="flex-1">
          <label className="block text-xs font-medium text-surface-500 mb-1.5 uppercase tracking-wider">
            Max. Ergebnisse
          </label>
          <div className="flex items-center gap-1.5">
            {RESULT_OPTIONS.map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setMaxResults(val)}
                disabled={loading}
                className={`flex-1 rounded-md px-2 py-2 text-xs font-medium transition-all ${
                  maxResults === val
                    ? 'bg-surface-900 text-white shadow-sm'
                    : 'bg-surface-100 text-surface-500 hover:bg-surface-200'
                }`}
              >
                {val >= 1000 ? `${val / 1000}k` : val}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !keyword.trim() || hasActiveJob}
          className="inline-flex items-center gap-2 rounded-lg bg-surface-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-surface-800 focus:outline-none focus:ring-2 focus:ring-surface-900/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-[0.98] shrink-0"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Zap className="h-4 w-4" />
          )}
          {loading ? 'Wird gestartet …' : hasActiveJob ? 'Auftrag läuft...' : 'Leads generieren'}
        </button>
      </div>
    </form>
  );
}

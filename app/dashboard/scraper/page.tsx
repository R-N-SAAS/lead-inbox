'use client';

import { useState } from 'react';
import { Card, Button } from '@/components/ui';
import { cn } from '@/lib/utils';

// ============================================
// VALID LOCATIONS
// ============================================

const LOCATIONS = [
  "Deutschland",
  "Berlin", "München", "Hamburg", "Köln", "Frankfurt",
  "Stuttgart", "Düsseldorf", "Leipzig", "Dortmund", "Essen",
  "Bremen", "Dresden", "Hannover", "Nürnberg", "Duisburg",
  "Bochum", "Bielefeld", "Bonn", "Münster", "Karlsruhe",
  "Mannheim", "Augsburg", "Wiesbaden", "Braunschweig", "Kiel",
  "Chemnitz", "Aachen", "Freiburg", "Lübeck", "Rostock",
  "Kassel", "Ulm", "Regensburg", "Würzburg", "Heilbronn", "Konstanz",
];

const CONTACT_MODES = [
  { value: 'both', label: 'Telefon & E-Mail' },
  { value: 'phone', label: 'Nur Telefon' },
  { value: 'email', label: 'Nur E-Mail' },
];

// ── Zeitabschätzung ──
function estimateDuration(targetLeads: number): string {
  const seconds = 60 + targetLeads * 12;
  if (seconds < 60)  return '< 1 Minute';
  if (seconds < 3600) return `ca. ${Math.round(seconds / 60)} Minuten`;
  return `ca. ${(seconds / 3600).toFixed(1)} Stunden`;
}

// ── CSV Export Funktion ──
function exportToCSV(leads: any[], filename: string = 'leads-export.csv') {
  if (!leads || leads.length === 0) return;
  
  // CSV Header
  const headers = ['Name', 'E-Mail', 'Telefon', 'Website', 'Adresse', 'Status', 'Quelle', 'Erstellt'];
  
  // CSV Rows
  const rows = leads.map(lead => [
    lead.name || '',
    lead.email || '',
    lead.phone || '',
    lead.website || '',
    lead.address || '',
    lead.status || 'new',
    lead.source || 'scraper',
    lead.created_at ? new Date(lead.created_at).toLocaleDateString('de-DE') : '',
  ]);
  
  // Combine
  const csvContent = [
    headers.join(';'),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(';'))
  ].join('\n');
  
  // BOM für Excel UTF-8
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  
  // Download
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

// ============================================
// ICONS
// ============================================

const SpinnerIcon = ({ className }: { className?: string }) => (
  <svg className={cn("animate-spin", className)} fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
  </svg>
);

const CheckIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

const AlertIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
  </svg>
);

const RocketIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
  </svg>
);

const DownloadIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
  </svg>
);

// ============================================
// SCRAPER PAGE
// ============================================

export default function ScraperPage() {
  // Form state
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('München');
  const [contactMode, setContactMode] = useState('both');
  const [targetLeads, setTargetLeads] = useState(10);
  const [employees, setEmployees] = useState(false);
  const [websiteRequired, setWebsiteRequired] = useState(false);

  // Status state
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ 
    success: boolean; 
    count?: number; 
    error?: string; 
    errors?: string[];
    leads?: any[];
  } | null>(null);

  // ── Submit: sendet unsere 6 Parameter an /api/scraper ──
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/scraper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          location,
          employees,
          contactMode,
          websiteRequired,
          targetLeads,
          plan: 'free',
        }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error: any) {
      setResult({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  }

  // ── CSV Export Handler ──
  function handleExportCSV() {
    if (result?.leads && result.leads.length > 0) {
      const timestamp = new Date().toISOString().split('T')[0];
      exportToCSV(result.leads, `leads-${query}-${location}-${timestamp}.csv`);
    }
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Lead Scraper</h1>
        <p className="text-neutral-400 mt-1">
          Finde neue Leads automatisch aus öffentlichen Quellen
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2">
          <Card variant="glass">
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Query */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Suchbegriff *
                </label>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="z.B. Dachdecker, Maler, Elektriker..."
                  required
                  minLength={2}
                  className="w-full px-4 py-3 bg-neutral-900/50 border border-white/10 rounded-xl text-white placeholder:text-neutral-600 focus:outline-none focus:border-white/30 transition-colors"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Standort *
                </label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-4 py-3 bg-neutral-900/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/30 transition-colors appearance-none cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23ffffff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: 'right 12px center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '20px',
                  }}
                >
                  {LOCATIONS.map((loc) => (
                    <option key={loc} value={loc} className="bg-neutral-800">{loc}</option>
                  ))}
                </select>
              </div>

              {/* Contact Mode */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Kontaktdaten *
                </label>
                <div className="flex gap-2">
                  {CONTACT_MODES.map((mode) => {
                    const isSelected = contactMode === mode.value;
                    return (
                      <div
                        key={mode.value}
                        role="button"
                        tabIndex={0}
                        onClick={() => setContactMode(mode.value)}
                        onKeyDown={(e) => e.key === 'Enter' && setContactMode(mode.value)}
                        className="flex-1 px-3 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer text-center select-none"
                        style={{
                          backgroundColor: isSelected ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.03)',
                          border: isSelected ? '2px solid rgba(255,255,255,0.5)' : '2px solid rgba(255,255,255,0.1)',
                          color: isSelected ? '#ffffff' : '#a3a3a3',
                        }}
                      >
                        {isSelected && (
                          <span className="mr-2">✓</span>
                        )}
                        {mode.label}
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-neutral-500 mt-2">
                  Ausgewählt: <span className="text-white font-medium">
                    {CONTACT_MODES.find(m => m.value === contactMode)?.label}
                  </span>
                </p>
              </div>

              {/* Target Leads + Zeitabschätzung */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Anzahl Leads: <span className="text-white font-bold">{targetLeads}</span>
                </label>
                <input
                  type="range"
                  min={1}
                  max={50}
                  value={targetLeads}
                  onChange={(e) => setTargetLeads(parseInt(e.target.value))}
                  className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-white"
                />
                <div className="flex justify-between text-xs text-neutral-500 mt-1">
                  <span>1</span>
                  <span>50 (Free Plan Max)</span>
                </div>
                <p className="text-xs text-neutral-500 mt-2">
                  ⏱️ Geschätzte Dauer: {estimateDuration(targetLeads)}
                  {targetLeads > 20 && (
                    <span className="text-amber-400 ml-2">
                      (länger bei viel Leads)
                    </span>
                  )}
                </p>
              </div>

              {/* Options */}
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={employees}
                    onChange={(e) => setEmployees(e.target.checked)}
                    className="w-5 h-5 rounded bg-neutral-800 border-neutral-600 text-white focus:ring-white/20"
                  />
                  <span className="text-neutral-300">Mitarbeiterzahl erfassen</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={websiteRequired}
                    onChange={(e) => setWebsiteRequired(e.target.checked)}
                    className="w-5 h-5 rounded bg-neutral-800 border-neutral-600 text-white focus:ring-white/20"
                  />
                  <span className="text-neutral-300">Nur mit Website</span>
                </label>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={loading || query.length < 2}
                className="w-full"
                icon={loading ? <SpinnerIcon className="w-5 h-5" /> : <RocketIcon className="w-5 h-5" />}
              >
                {loading ? 'Scraper läuft...' : 'Scraper starten'}
              </Button>
            </form>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">

          {/* Success Result with CSV Export */}
          {result?.success && (
            <Card variant="glass" className="border-emerald-500/30">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <CheckIcon className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-white">Erfolgreich!</p>
                  <p className="text-sm text-neutral-400 mt-1">
                    {result.count} neue Leads wurden gefunden und gespeichert.
                  </p>
                  
                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2 mt-4">
                    <a
                      href="/dashboard/leads?source=scraper"
                      className="text-sm text-white bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-center transition-colors"
                    >
                      Leads ansehen →
                    </a>
                    
                    {result.leads && result.leads.length > 0 && (
                      <div
                        role="button"
                        onClick={handleExportCSV}
                        className="text-sm text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 px-4 py-2 rounded-lg text-center transition-colors cursor-pointer flex items-center justify-center gap-2"
                      >
                        <DownloadIcon className="w-4 h-4" />
                        Als CSV exportieren
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Error Result */}
          {result && !result.success && (
            <Card variant="glass" className="border-red-500/30">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                  <AlertIcon className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <p className="font-semibold text-white">Fehler</p>
                  {result.errors ? (
                    <ul className="text-sm text-red-400 mt-1 list-disc list-inside">
                      {result.errors.map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-red-400 mt-1">{result.error}</p>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Loading */}
          {loading && (
            <Card variant="glass" className="border-blue-500/30">
              <div className="flex items-center gap-3">
                <SpinnerIcon className="w-6 h-6 text-blue-400" />
                <div>
                  <p className="font-semibold text-white">Scraper läuft</p>
                  <p className="text-sm text-neutral-400 mt-1">
                    Geschätzt noch: {estimateDuration(targetLeads)}
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Info */}
          <Card variant="glass">
            <h3 className="font-semibold text-white mb-3">Hinweise</h3>
            <ul className="space-y-2 text-sm text-neutral-400">
              <li className="flex items-start gap-2">
                <span className="text-white">•</span>
                Der Scraper durchsucht öffentliche Verzeichnisse
              </li>
              <li className="flex items-start gap-2">
                <span className="text-white">•</span>
                Nur Leads mit gültigen Kontaktdaten werden gespeichert
              </li>
              <li className="flex items-start gap-2">
                <span className="text-white">•</span>
                Free Plan: max. 50 Leads pro Suche
              </li>
              <li className="flex items-start gap-2">
                <span className="text-white">•</span>
                Nach dem Scrapen: CSV Export verfügbar
              </li>
            </ul>
          </Card>

          {/* Plan Info */}
          <Card variant="glass">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-white">Dein Plan</h3>
              <span className="px-2 py-1 bg-white/10 rounded-full text-xs text-white uppercase tracking-wide">
                Free
              </span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-400">Leads pro Suche</span>
                <span className="text-white">50</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Suchen pro Tag</span>
                <span className="text-white">5</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-white/10">
              <a href="/dashboard/settings" className="text-sm text-neutral-400 hover:text-white transition-colors">
                Upgrade für mehr Leads →
              </a>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

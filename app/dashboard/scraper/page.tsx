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

const RADIUS_OPTIONS = [
  { value: 0, label: 'Nur Stadt' },
  { value: 10, label: '10 km' },
  { value: 25, label: '25 km' },
  { value: 50, label: '50 km' },
  { value: 75, label: '75 km' },
  { value: 100, label: '100 km' },
];

// ── Zeitabschätzung ──
function estimateDuration(targetLeads: number): string {
  const seconds = 60 + targetLeads * 12;
  if (seconds < 60)  return '< 1 Minute';
  if (seconds < 3600) return `ca. ${Math.round(seconds / 60)} Minuten`;
  return `ca. ${(seconds / 3600).toFixed(1)} Stunden`;
}

// ── CSV Export ──
function exportToCSV(leads: any[], filename: string = 'leads-export.csv') {
  if (!leads || leads.length === 0) return;
  
  const headers = ['Name', 'E-Mail', 'Telefon', 'Website', 'Adresse', 'Status', 'Quelle', 'Erstellt'];
  
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
  
  const csvContent = [
    headers.join(';'),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(';'))
  ].join('\n');
  
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  
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

const MapPinIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
  </svg>
);

// ============================================
// SCRAPER PAGE
// ============================================

export default function ScraperPage() {
  // Form state
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('München');
  const [radius, setRadius] = useState(25);
  const [contactMode, setContactMode] = useState('both');
  const [targetLeads, setTargetLeads] = useState(10);
  const [employees, setEmployees] = useState(false);
  const [websiteRequired, setWebsiteRequired] = useState(false);

  // Status state
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ 
    success: boolean; 
    count?: number; 
    leads?: any[];
    error?: string; 
    errors?: string[];
  } | null>(null);

  // ── Submit Handler ──
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/scraper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: query.trim(),
          location,
          radius,
          contactMode,
          targetLeads,
          employees,
          websiteRequired,
        }),
      });

      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setResult({ success: false, error: err.message });
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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Lead Scraper</h1>
        <p className="text-slate-500 mt-1">Finde neue Leads automatisch über Google Maps</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Form */}
        <div>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Branche / Suchbegriff */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Branche / Suchbegriff
                </label>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="z.B. Dachdecker, Maler, Elektriker..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                  required
                  minLength={2}
                />
              </div>

              {/* Stadt + Umkreis - nebeneinander */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <span className="flex items-center gap-1.5">
                    <MapPinIcon className="w-4 h-4 text-slate-500" />
                    Standort & Umkreis
                  </span>
                </label>
                <div className="flex gap-3">
                  {/* Stadt Dropdown */}
                  <div className="flex-1">
                    <select
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all appearance-none cursor-pointer"
                    >
                      {LOCATIONS.map((loc) => (
                        <option key={loc} value={loc}>{loc}</option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Umkreis Dropdown */}
                  <div className="w-[140px]">
                    <select
                      value={radius}
                      onChange={(e) => setRadius(Number(e.target.value))}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all appearance-none cursor-pointer"
                    >
                      {RADIUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                {/* Radius Info Text */}
                {radius > 0 && (
                  <p className="text-xs text-slate-500 mt-1.5">
                    Suche in {location} + {radius} km Umkreis
                  </p>
                )}
              </div>

              {/* Kontaktmodus */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Kontaktmodus
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {CONTACT_MODES.map((mode) => (
                    <button
                      key={mode.value}
                      type="button"
                      onClick={() => setContactMode(mode.value)}
                      className={cn(
                        "px-3 py-2.5 rounded-xl text-sm font-medium transition-all border",
                        contactMode === mode.value
                          ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                          : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                      )}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Anzahl Leads */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Anzahl Leads: <span className="text-slate-900 font-bold">{targetLeads}</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={targetLeads}
                  onChange={(e) => setTargetLeads(parseInt(e.target.value))}
                  className="w-full accent-blue-600"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>1</span>
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {estimateDuration(targetLeads)}
                  </span>
                  <span>50</span>
                </div>
                {targetLeads > 20 && (
                  <p className="text-xs text-amber-600 mt-1">
                    ⚠️ Bei mehr als 20 Leads kann der Scraper mehrere Minuten brauchen
                  </p>
                )}
              </div>

              {/* Optionen */}
              <div className="flex flex-col gap-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={employees}
                    onChange={(e) => setEmployees(e.target.checked)}
                    className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500/20"
                  />
                  <span className="text-slate-700">Mitarbeiterzahl erfassen</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={websiteRequired}
                    onChange={(e) => setWebsiteRequired(e.target.checked)}
                    className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500/20"
                  />
                  <span className="text-slate-700">Nur mit Website</span>
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
          </div>
        </div>

        {/* Right Column: Status + Info */}
        <div className="space-y-6">

          {/* Loading Status */}
          {loading && (
            <div className="bg-white rounded-xl border border-blue-200 shadow-sm p-5">
              <div className="flex items-center gap-3">
                <SpinnerIcon className="w-6 h-6 text-blue-600" />
                <div>
                  <p className="font-semibold text-slate-900">Scraper läuft...</p>
                  <p className="text-sm text-slate-500 mt-0.5">
                    Geschätzte Dauer: {estimateDuration(targetLeads)}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Suche: {query} in {location}{radius > 0 ? ` + ${radius} km` : ''}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Success Result */}
          {result && result.success && (
            <div className="bg-white rounded-xl border border-emerald-200 shadow-sm p-5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <CheckIcon className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-900">Erfolgreich!</p>
                  <p className="text-sm text-slate-500 mt-1">
                    {result.count} neue Leads wurden gefunden und gespeichert.
                  </p>
                  
                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2 mt-4">
                    <a
                      href="/dashboard/leads?source=scraper"
                      className="text-sm text-blue-600 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg text-center transition-colors font-medium"
                    >
                      Leads ansehen →
                    </a>
                    
                    {result.leads && result.leads.length > 0 && (
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={handleExportCSV}
                        onKeyDown={(e) => e.key === 'Enter' && handleExportCSV()}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 rounded-lg text-sm text-emerald-700 transition-colors cursor-pointer font-medium"
                      >
                        <DownloadIcon className="w-4 h-4" />
                        Als CSV exportieren
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error Result */}
          {result && !result.success && (
            <div className="bg-white rounded-xl border border-red-200 shadow-sm p-5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <AlertIcon className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Fehler</p>
                  {result.errors ? (
                    <ul className="text-sm text-slate-600 mt-1 space-y-1">
                      {result.errors.map((err, i) => (
                        <li key={i}>• {err}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-slate-600 mt-1">{result.error}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Info Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <span className="text-amber-500">💡</span> Tipps
            </h3>
            <div className="space-y-2 text-sm text-slate-600">
              <p>• <strong className="text-slate-700">Branche</strong> so spezifisch wie möglich eingeben</p>
              <p>• <strong className="text-slate-700">Umkreis</strong> erweitert die Suche auf umliegende Orte</p>
              <p>• <strong className="text-slate-700">Nur Stadt</strong> sucht exakt in der gewählten Stadt</p>
              <p>• Je mehr Leads, desto länger dauert die Suche</p>
              <p>• Duplikate werden automatisch erkannt</p>
            </div>
          </div>

          {/* Plan Info */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <span className="text-blue-500">📊</span> Dein Plan
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Plan</span>
                <span className="text-slate-900 font-medium">Free</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Max. Leads pro Suche</span>
                <span className="text-slate-900 font-medium">50</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Umkreis</span>
                <span className="text-slate-900 font-medium">bis 100 km</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

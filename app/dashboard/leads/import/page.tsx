'use client';

import { useState, useCallback, useRef } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

// ============================================
// LEAD IMPORT PAGE
// CSV/XLSX Upload → Column Mapping → Preview → Import
// ============================================

type ImportStep = 'upload' | 'mapping' | 'preview' | 'importing' | 'done';

interface ParsedData {
  headers: string[];
  rows: Record<string, string>[];
}

interface ColumnMapping {
  name: string | null;
  email: string | null;
  phone: string | null;
  company: string | null;
  website: string | null;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  message: string | null;
  notes: string | null;
}

interface ImportResult {
  total: number;
  imported: number;
  duplicates: number;
  errors: number;
  errorDetails: string[];
}

const LEAD_FIELDS = [
  { key: 'name', label: 'Name', required: false },
  { key: 'email', label: 'E-Mail', required: false },
  { key: 'phone', label: 'Telefon', required: false },
  { key: 'company', label: 'Firma', required: false },
  { key: 'website', label: 'Website', required: false },
  { key: 'address', label: 'Adresse', required: false },
  { key: 'city', label: 'Stadt', required: false },
  { key: 'postal_code', label: 'PLZ', required: false },
  { key: 'message', label: 'Nachricht', required: false },
  { key: 'notes', label: 'Notizen', required: false },
];

// Auto-detect column mapping based on header names
function autoDetectMapping(headers: string[]): ColumnMapping {
  const mapping: ColumnMapping = {
    name: null,
    email: null,
    phone: null,
    company: null,
    website: null,
    address: null,
    city: null,
    postal_code: null,
    message: null,
    notes: null,
  };

  const patterns: Record<string, RegExp> = {
    name: /^(name|full.?name|vor.?name|nachname|kontakt|contact|ansprechpartner|firmenname|company.?name)$/i,
    email: /^(e?.?mail|email.?address|e-mail)$/i,
    phone: /^(phone|telefon|tel|telephone|mobil|mobile|handy|fon|rufnummer)$/i,
    company: /^(company|firma|unternehmen|betrieb|organization|organisation)$/i,
    website: /^(website|web|url|homepage|webseite|internetseite)$/i,
    address: /^(address|adresse|straße|strasse|street|anschrift)$/i,
    city: /^(city|stadt|ort|place|gemeinde)$/i,
    postal_code: /^(postal.?code|plz|zip|postleitzahl)$/i,
    message: /^(message|nachricht|text|bemerkung|kommentar|comment)$/i,
    notes: /^(notes|notizen|anmerkung|info|details|beschreibung|description)$/i,
  };

  headers.forEach((header) => {
    const trimmed = header.trim();
    for (const [field, pattern] of Object.entries(patterns)) {
      if (pattern.test(trimmed) && mapping[field as keyof ColumnMapping] === null) {
        mapping[field as keyof ColumnMapping] = header;
        break;
      }
    }
  });

  return mapping;
}

export default function ImportPage() {
  const supabase = createClientComponentClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<ImportStep>('upload');
  const [fileName, setFileName] = useState('');
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [mapping, setMapping] = useState<ColumnMapping>({
    name: null, email: null, phone: null, company: null,
    website: null, address: null, city: null, postal_code: null,
    message: null, notes: null,
  });
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [importProgress, setImportProgress] = useState(0);

  // ============================================
  // FILE PARSING
  // ============================================

  const parseFile = useCallback((file: File) => {
    setError('');
    setFileName(file.name);
    const extension = file.name.split('.').pop()?.toLowerCase();

    if (extension === 'csv' || extension === 'tsv') {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        encoding: 'UTF-8',
        complete: (results) => {
          if (results.errors.length > 0 && results.data.length === 0) {
            setError('Fehler beim Lesen der CSV-Datei. Bitte prüfe das Format.');
            return;
          }
          const headers = results.meta.fields || [];
          const rows = results.data as Record<string, string>[];

          if (rows.length === 0) {
            setError('Die Datei enthält keine Daten.');
            return;
          }

          setParsedData({ headers, rows });
          setMapping(autoDetectMapping(headers));
          setStep('mapping');
        },
        error: () => {
          setError('Fehler beim Lesen der Datei.');
        },
      });
    } else if (extension === 'xlsx' || extension === 'xls') {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, { defval: '' });

          if (jsonData.length === 0) {
            setError('Die Datei enthält keine Daten.');
            return;
          }

          const headers = Object.keys(jsonData[0]);
          setParsedData({ headers, rows: jsonData });
          setMapping(autoDetectMapping(headers));
          setStep('mapping');
        } catch {
          setError('Fehler beim Lesen der Excel-Datei.');
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      setError('Nicht unterstütztes Format. Bitte CSV oder XLSX hochladen.');
    }
  }, []);

  // ============================================
  // DRAG & DROP
  // ============================================

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) parseFile(file);
  }, [parseFile]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) parseFile(file);
  }, [parseFile]);

  // ============================================
  // MAPPING
  // ============================================

  const updateMapping = (field: keyof ColumnMapping, value: string | null) => {
    setMapping((prev) => ({ ...prev, [field]: value === '' ? null : value }));
  };

  const isMappingValid = () => {
    // At least one field must be mapped
    return Object.values(mapping).some((v) => v !== null);
  };

  // ============================================
  // GET MAPPED LEADS
  // ============================================

  const getMappedLeads = () => {
    if (!parsedData) return [];

    return parsedData.rows.map((row) => {
      const lead: Record<string, string> = {};

      Object.entries(mapping).forEach(([field, sourceColumn]) => {
        if (sourceColumn && row[sourceColumn] !== undefined) {
          lead[field] = String(row[sourceColumn]).trim();
        }
      });

      return lead;
    }).filter((lead) => {
      // Keep row if it has at least some data
      const hasAnyData = Object.values(lead).some((v) => v && v.length > 0);
      return hasAnyData;
    });
  };

  // ============================================
  // IMPORT
  // ============================================

  const handleImport = async () => {
    setStep('importing');
    setImportProgress(0);

    const leads = getMappedLeads();
    const result: ImportResult = {
      total: leads.length,
      imported: 0,
      duplicates: 0,
      errors: 0,
      errorDetails: [],
    };

    // Get current user (optional, for org_id if available)
    const { data: { user } } = await supabase.auth.getUser();

    let orgId: string | null = null;
    if (user) {
      const { data: userData } = await supabase
        .from('users')
        .select('org_id')
        .eq('id', user.id)
        .single();
      orgId = userData?.org_id || null;
    }

    // Get existing emails for duplicate check
    const { data: existingLeads } = await supabase
      .from('leads')
      .select('email');

    const existingEmails = new Set(
      (existingLeads || [])
        .filter((l: { email: string | null }) => l.email)
        .map((l: { email: string }) => l.email.toLowerCase())
    );

    // Import in batches of 50
    const batchSize = 50;
    const batches = [];
    for (let i = 0; i < leads.length; i += batchSize) {
      batches.push(leads.slice(i, i + batchSize));
    }

    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      const toInsert = [];

      for (const lead of batch) {
        const email = lead.email?.toLowerCase();

        // Duplicate check only if email exists
        if (email && existingEmails.has(email)) {
          result.duplicates++;
          continue;
        }

        // Combine company/notes into custom_fields or notes
        const customFields: Record<string, string> = {};
        if (lead.company) customFields.company = lead.company;

        const newLead: Record<string, any> = {
          name: lead.name || null,
          email: email || null,
          phone: lead.phone || null,
          message: lead.message || lead.notes || null,
          status: 'new' as const,
          priority: 'medium' as const,
          source: 'import' as const,
          website: lead.website || null,
          address: lead.address || null,
          city: lead.city || null,
          postal_code: lead.postal_code || null,
          custom_fields: Object.keys(customFields).length > 0 ? customFields : null,
          is_duplicate: false,
        };

        // Only add org_id if available
        if (orgId) newLead.org_id = orgId;

        toInsert.push(newLead);
      }

      if (toInsert.length > 0) {
        const { error: insertError } = await supabase
          .from('leads')
          .insert(toInsert);

        if (insertError) {
          result.errors += toInsert.length;
          result.errorDetails.push(`Batch ${batchIndex + 1}: ${insertError.message}`);
        } else {
          result.imported += toInsert.length;
        }
      }

      setImportProgress(Math.round(((batchIndex + 1) / batches.length) * 100));
    }

    setImportResult(result);
    setStep('done');
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Leads importieren</h1>
          <p className="text-neutral-400 mt-1">
            CSV oder Excel-Datei hochladen und Leads importieren
          </p>
        </div>
        <Link
          href="/dashboard/leads"
          className="px-4 py-2 text-sm text-neutral-400 hover:text-white border border-white/10 rounded-lg hover:border-white/20 transition-colors"
        >
          ← Zurück
        </Link>
      </div>

      {/* Steps Indicator */}
      <div className="flex items-center gap-2">
        {['Upload', 'Zuordnung', 'Vorschau', 'Import'].map((label, i) => {
          const stepIndex = ['upload', 'mapping', 'preview', 'importing'].indexOf(step);
          const doneStep = step === 'done' ? 4 : stepIndex;
          const isActive = i === doneStep;
          const isDone = i < doneStep || step === 'done';

          return (
            <div key={label} className="flex items-center gap-2">
              {i > 0 && (
                <div className={`w-8 h-px ${isDone ? 'bg-emerald-500' : 'bg-white/10'}`} />
              )}
              <div className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono ${
                    isDone
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : isActive
                      ? 'bg-white/10 text-white border border-white/20'
                      : 'bg-white/[0.03] text-neutral-600 border border-white/[0.06]'
                  }`}
                >
                  {isDone ? '✓' : i + 1}
                </div>
                <span
                  className={`text-xs font-medium ${
                    isActive ? 'text-white' : isDone ? 'text-emerald-400' : 'text-neutral-600'
                  }`}
                >
                  {label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
          <button
            onClick={() => setError('')}
            className="text-red-400/60 text-xs mt-1 hover:text-red-400"
          >
            Schließen
          </button>
        </div>
      )}

      {/* ========== STEP 1: UPLOAD ========== */}
      {step === 'upload' && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-16 text-center cursor-pointer transition-all ${
            dragOver
              ? 'border-emerald-500/50 bg-emerald-500/5'
              : 'border-white/10 hover:border-white/20 bg-white/[0.02]'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.tsv,.xlsx,.xls"
            onChange={handleFileSelect}
            className="hidden"
          />

          <div className="w-16 h-16 mx-auto mb-6 rounded-xl bg-white/[0.04] flex items-center justify-center">
            <svg className="w-8 h-8 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
          </div>

          <p className="text-white font-medium mb-2">
            Datei hierher ziehen oder klicken
          </p>
          <p className="text-neutral-500 text-sm">
            CSV, TSV oder Excel (.xlsx) — max. 10.000 Zeilen
          </p>

          <div className="mt-8 flex items-center justify-center gap-6 text-xs text-neutral-600">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500/40" />
              HubSpot Export
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500/40" />
              Pipedrive Export
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500/40" />
              Google Sheets
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500/40" />
              Excel
            </span>
          </div>
        </div>
      )}

      {/* ========== STEP 2: MAPPING ========== */}
      {step === 'mapping' && parsedData && (
        <div className="space-y-6">
          <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-white">Spalten zuordnen</h2>
                <p className="text-neutral-500 text-sm mt-1">
                  {fileName} — {parsedData.rows.length} Zeilen, {parsedData.headers.length} Spalten
                </p>
              </div>
              <button
                onClick={() => { setStep('upload'); setParsedData(null); setFileName(''); }}
                className="text-xs text-neutral-500 hover:text-white transition-colors"
              >
                Andere Datei
              </button>
            </div>

            <div className="space-y-3">
              {LEAD_FIELDS.map((field) => (
                <div key={field.key} className="flex items-center gap-4">
                  <div className="w-40 flex-shrink-0">
                    <span className="text-sm text-neutral-300">
                      {field.label}
                    </span>
                  </div>
                  <div className="flex-1">
                    <select
                      value={mapping[field.key as keyof ColumnMapping] || ''}
                      onChange={(e) => updateMapping(field.key as keyof ColumnMapping, e.target.value)}
                      className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-white/20 appearance-none"
                    >
                      <option value="">— Nicht zuordnen —</option>
                      {parsedData.headers.map((header) => (
                        <option key={header} value={header}>
                          {header}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="w-48 flex-shrink-0 text-xs text-neutral-600 truncate">
                    {mapping[field.key as keyof ColumnMapping] && parsedData.rows[0]
                      ? `z.B. "${parsedData.rows[0][mapping[field.key as keyof ColumnMapping]!] || '—'}"`
                      : ''}
                  </div>
                </div>
              ))}
            </div>

            {!isMappingValid() && (
              <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                <p className="text-amber-400 text-sm">Mindestens eine Spalte muss zugeordnet werden.</p>
              </div>
            )}
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => { setStep('upload'); setParsedData(null); }}
              className="px-4 py-2.5 text-sm text-neutral-400 hover:text-white border border-white/10 rounded-lg hover:border-white/20 transition-colors"
            >
              ← Zurück
            </button>
            <button
              onClick={() => setStep('preview')}
              disabled={!isMappingValid()}
              className="px-6 py-2.5 text-sm font-medium bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Vorschau →
            </button>
          </div>
        </div>
      )}

      {/* ========== STEP 3: PREVIEW ========== */}
      {step === 'preview' && parsedData && (
        <div className="space-y-6">
          <div className="bg-[#0a0a0a] border border-white/10 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-white/[0.06]">
              <h2 className="text-lg font-semibold text-white">Vorschau</h2>
              <p className="text-neutral-500 text-sm mt-1">
                {getMappedLeads().length} gültige Leads von {parsedData.rows.length} Zeilen
                {parsedData.rows.length - getMappedLeads().length > 0 && (
                  <span className="text-amber-400">
                    {' '}— {parsedData.rows.length - getMappedLeads().length} leere Zeilen übersprungen
                  </span>
                )}
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className="text-left px-4 py-3 text-neutral-500 font-mono text-xs tracking-wider">#</th>
                    {LEAD_FIELDS.filter((f) => mapping[f.key as keyof ColumnMapping]).map((field) => (
                      <th key={field.key} className="text-left px-4 py-3 text-neutral-500 font-mono text-xs tracking-wider uppercase">
                        {field.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {getMappedLeads().slice(0, 10).map((lead, i) => (
                    <tr key={i} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                      <td className="px-4 py-3 text-neutral-600 font-mono text-xs">{i + 1}</td>
                      {LEAD_FIELDS.filter((f) => mapping[f.key as keyof ColumnMapping]).map((field) => (
                        <td key={field.key} className="px-4 py-3 text-neutral-300 truncate max-w-[200px]">
                          {lead[field.key] || '—'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {getMappedLeads().length > 10 && (
              <div className="px-4 py-3 text-center text-neutral-600 text-xs border-t border-white/[0.06]">
                ... und {getMappedLeads().length - 10} weitere Leads
              </div>
            )}
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => setStep('mapping')}
              className="px-4 py-2.5 text-sm text-neutral-400 hover:text-white border border-white/10 rounded-lg hover:border-white/20 transition-colors"
            >
              ← Zuordnung ändern
            </button>
            <button
              onClick={handleImport}
              className="px-6 py-2.5 text-sm font-medium bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors"
            >
              {getMappedLeads().length} Leads importieren →
            </button>
          </div>
        </div>
      )}

      {/* ========== STEP 4: IMPORTING ========== */}
      {step === 'importing' && (
        <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-emerald-500/10 flex items-center justify-center">
            <svg className="w-8 h-8 text-emerald-400 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
          <p className="text-white font-medium text-lg mb-2">Leads werden importiert...</p>
          <p className="text-neutral-500 text-sm mb-6">Bitte Fenster nicht schließen</p>

          <div className="max-w-xs mx-auto">
            <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${importProgress}%` }}
              />
            </div>
            <p className="text-neutral-500 text-xs mt-2 font-mono">{importProgress}%</p>
          </div>
        </div>
      )}

      {/* ========== STEP 5: DONE ========== */}
      {step === 'done' && importResult && (
        <div className="space-y-6">
          <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-white font-medium text-lg mb-2">Import abgeschlossen!</p>

            <div className="flex items-center justify-center gap-8 mt-6">
              <div className="text-center">
                <p className="text-2xl font-mono font-bold text-emerald-400">{importResult.imported}</p>
                <p className="text-xs text-neutral-500 mt-1">Importiert</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-mono font-bold text-amber-400">{importResult.duplicates}</p>
                <p className="text-xs text-neutral-500 mt-1">Duplikate</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-mono font-bold text-red-400">{importResult.errors}</p>
                <p className="text-xs text-neutral-500 mt-1">Fehler</p>
              </div>
            </div>

            {importResult.errorDetails.length > 0 && (
              <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-left max-w-md mx-auto">
                <p className="text-red-400 text-sm font-medium mb-2">Fehlerdetails:</p>
                {importResult.errorDetails.map((err, i) => (
                  <p key={i} className="text-red-400/70 text-xs">{err}</p>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-center gap-4">
            <button
              onClick={() => {
                setStep('upload');
                setParsedData(null);
                setFileName('');
                setImportResult(null);
              }}
              className="px-4 py-2.5 text-sm text-neutral-400 hover:text-white border border-white/10 rounded-lg hover:border-white/20 transition-colors"
            >
              Weitere Leads importieren
            </button>
            <Link
              href="/dashboard/leads"
              className="px-6 py-2.5 text-sm font-medium bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors"
            >
              Zu den Leads →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

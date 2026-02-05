'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';
import { 
  Card, 
  Button, 
  SearchInput,
  Dropdown,
  StatusBadge, 
  SourceBadge,
  EmptyState,
  Skeleton,
  Modal,
  ConfirmDialog
} from '@/components/ui';
import { 
  PlusIcon, 
  SearchIcon, 
  TrashIcon,
  ChevronRightIcon,
  RefreshIcon
} from '@/components/common/Icons';
import { Lead, LeadStatus, LeadSource } from '@/types';
import { formatRelativeTime, getInitials, cn } from '@/lib/utils';

// ============================================
// FILTER OPTIONS
// ============================================

const STATUS_OPTIONS = [
  { value: 'all', label: 'Alle Status' },
  { value: 'new', label: 'Neu', color: '#3b82f6' },
  { value: 'replied', label: 'Beantwortet', color: '#f59e0b' },
  { value: 'qualified', label: 'Qualifiziert', color: '#10b981' },
  { value: 'offer_sent', label: 'Angebot gesendet', color: '#8b5cf6' },
  { value: 'won', label: 'Gewonnen', color: '#059669' },
  { value: 'lost', label: 'Verloren', color: '#ef4444' },
];

const SOURCE_OPTIONS = [
  { value: 'all', label: 'Alle Quellen' },
  { value: 'web_form', label: 'Website' },
  { value: 'widget', label: 'Widget' },
  { value: 'scraper', label: 'Scraper' },
  { value: 'manual', label: 'Manuell' },
  { value: 'api', label: 'API' },
  { value: 'import', label: 'Import' },
];

// ============================================
// ADD LEAD DROPDOWN BUTTON
// ============================================

function AddLeadDropdown({ onNewLead }: { onNewLead: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <div className="flex">
        {/* Main button */}
        <button
          onClick={onNewLead}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-l-lg transition-colors"
        >
          <PlusIcon className="w-4 h-4" />
          Neuer Lead
        </button>
        {/* Dropdown toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center px-2 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white border-l border-emerald-500 rounded-r-lg transition-colors"
        >
          <svg className={cn('w-4 h-4 transition-transform', open && 'rotate-180')} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Dropdown menu */}
      {open && (
        <div className="absolute right-0 mt-2 w-52 bg-[#0a0a0a] border border-white/10 rounded-lg overflow-hidden shadow-xl z-50 animate-fade-in">
          <button
            onClick={() => {
              onNewLead();
              setOpen(false);
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-neutral-300 hover:text-white hover:bg-white/[0.04] transition-colors"
          >
            <svg className="w-4 h-4 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Manuell erstellen
          </button>
          <Link
            href="/dashboard/leads/import"
            onClick={() => setOpen(false)}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-neutral-300 hover:text-white hover:bg-white/[0.04] transition-colors border-t border-white/[0.06]"
          >
            <svg className="w-4 h-4 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            CSV / Excel importieren
          </Link>
        </div>
      )}
    </div>
  );
}

// ============================================
// LEADS PAGE COMPONENT
// ============================================

export default function LeadsPage() {
  const supabase = createClientComponentClient();
  
  // State
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  
  // Selection
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  
  // Modals
  const [showNewLeadModal, setShowNewLeadModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  // ============================================
  // DATA LOADING
  // ============================================

  useEffect(() => {
    loadLeads();
  }, []);

  async function loadLeads() {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLeads(data || []);
    } catch (error) {
      console.error('Error loading leads:', error);
    } finally {
      setLoading(false);
    }
  }

  async function refreshLeads() {
    setRefreshing(true);
    await loadLeads();
    setRefreshing(false);
  }

  // ============================================
  // FILTERING
  // ============================================

  const filteredLeads = useMemo(() => {
    let result = [...leads];

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(
        (lead) =>
          lead.name?.toLowerCase().includes(searchLower) ||
          lead.email?.toLowerCase().includes(searchLower) ||
          lead.phone?.includes(search) ||
          lead.message?.toLowerCase().includes(searchLower)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter((lead) => lead.status === statusFilter);
    }

    // Source filter
    if (sourceFilter !== 'all') {
      result = result.filter((lead) => lead.source === sourceFilter);
    }

    return result;
  }, [leads, search, statusFilter, sourceFilter]);

  // ============================================
  // SELECTION HANDLERS
  // ============================================

  const allSelected = filteredLeads.length > 0 && selectedLeads.length === filteredLeads.length;
  const someSelected = selectedLeads.length > 0 && selectedLeads.length < filteredLeads.length;

  function toggleSelectAll() {
    if (allSelected) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(filteredLeads.map((l) => l.id));
    }
  }

  function toggleSelectLead(id: string) {
    if (selectedLeads.includes(id)) {
      setSelectedLeads(selectedLeads.filter((i) => i !== id));
    } else {
      setSelectedLeads([...selectedLeads, id]);
    }
  }

  // ============================================
  // BULK ACTIONS
  // ============================================

  async function handleBulkStatusUpdate(newStatus: LeadStatus) {
    if (selectedLeads.length === 0) return;

    setBulkActionLoading(true);
    try {
      const { error } = await supabase
        .from('leads')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .in('id', selectedLeads);

      if (error) throw error;

      setLeads((prev) =>
        prev.map((lead) =>
          selectedLeads.includes(lead.id) ? { ...lead, status: newStatus } : lead
        )
      );
      setSelectedLeads([]);
    } catch (error) {
      console.error('Error updating leads:', error);
    } finally {
      setBulkActionLoading(false);
    }
  }

  async function handleBulkDelete() {
    if (selectedLeads.length === 0) return;

    setBulkActionLoading(true);
    try {
      const { error } = await supabase
        .from('leads')
        .delete()
        .in('id', selectedLeads);

      if (error) throw error;

      setLeads((prev) => prev.filter((lead) => !selectedLeads.includes(lead.id)));
      setSelectedLeads([]);
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Error deleting leads:', error);
    } finally {
      setBulkActionLoading(false);
    }
  }

  // ============================================
  // RENDER
  // ============================================

  if (loading) {
    return <LeadsPageSkeleton />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Leads</h1>
          <p className="text-slate-500 mt-1">
            {leads.length} {leads.length === 1 ? 'Lead' : 'Leads'} insgesamt
            {filteredLeads.length !== leads.length && (
              <span> · {filteredLeads.length} gefiltert</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={refreshLeads}
            loading={refreshing}
            icon={<RefreshIcon className="w-4 h-4" />}
          >
            <span className="hidden sm:inline">Aktualisieren</span>
          </Button>
          <AddLeadDropdown onNewLead={() => setShowNewLeadModal(true)} />
        </div>
      </div>

      {/* Filters */}
      <Card variant="glass" padding="md">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <SearchInput
              placeholder="Suchen nach Name, E-Mail, Telefon..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClear={() => setSearch('')}
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex items-center gap-3">
            <div className="w-44">
              <Dropdown
                options={STATUS_OPTIONS}
                value={statusFilter}
                onChange={setStatusFilter}
                placeholder="Status"
              />
            </div>
            <div className="w-44">
              <Dropdown
                options={SOURCE_OPTIONS}
                value={sourceFilter}
                onChange={setSourceFilter}
                placeholder="Quelle"
              />
            </div>
          </div>
        </div>

        {/* Active Filters */}
        {(statusFilter !== 'all' || sourceFilter !== 'all' || search) && (
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100">
            <span className="text-sm text-slate-500">Filter:</span>
            {search && (
              <FilterTag onRemove={() => setSearch('')}>
                Suche: "{search}"
              </FilterTag>
            )}
            {statusFilter !== 'all' && (
              <FilterTag onRemove={() => setStatusFilter('all')}>
                {STATUS_OPTIONS.find((o) => o.value === statusFilter)?.label}
              </FilterTag>
            )}
            {sourceFilter !== 'all' && (
              <FilterTag onRemove={() => setSourceFilter('all')}>
                {SOURCE_OPTIONS.find((o) => o.value === sourceFilter)?.label}
              </FilterTag>
            )}
            <button
              onClick={() => {
                setSearch('');
                setStatusFilter('all');
                setSourceFilter('all');
              }}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium ml-2"
            >
              Alle zurücksetzen
            </button>
          </div>
        )}
      </Card>

      {/* Bulk Actions Bar */}
      {selectedLeads.length > 0 && (
        <div className="bg-slate-800 text-white p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-slide-in-up">
          <span className="font-medium">
            {selectedLeads.length} {selectedLeads.length === 1 ? 'Lead' : 'Leads'} ausgewählt
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="success"
              size="sm"
              onClick={() => handleBulkStatusUpdate('qualified')}
              loading={bulkActionLoading}
            >
              Qualifizieren
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleBulkStatusUpdate('replied')}
              loading={bulkActionLoading}
              className="!bg-white/10 !border-white/20 !text-white hover:!bg-white/20"
            >
              Als beantwortet
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
              loading={bulkActionLoading}
              icon={<TrashIcon className="w-4 h-4" />}
            >
              Löschen
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedLeads([])}
              className="!text-white hover:!bg-white/10"
            >
              Abbrechen
            </Button>
          </div>
        </div>
      )}

      {/* Leads Table */}
      <Card variant="glass" padding="none">
        {filteredLeads.length === 0 ? (
          <EmptyState
            icon={
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            }
            title="Keine Leads gefunden"
            description={
              search || statusFilter !== 'all' || sourceFilter !== 'all'
                ? 'Versuchen Sie andere Filterkriterien'
                : 'Erstellen Sie Ihren ersten Lead oder importieren Sie bestehende Kontakte'
            }
            action={
              !search && statusFilter === 'all' && sourceFilter === 'all' && (
                <div className="flex gap-3">
                  <Button variant="secondary" onClick={() => setShowNewLeadModal(true)}>
                    Lead erstellen
                  </Button>
                  <Link href="/dashboard/leads/import">
                    <Button>Leads importieren</Button>
                  </Link>
                </div>
              )
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="w-12 px-4 py-3">
                    <Checkbox
                      checked={allSelected}
                      indeterminate={someSelected}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Kontakt
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">
                    Nachricht
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">
                    Quelle
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">
                    Erstellt
                  </th>
                  <th className="w-12 px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLeads.map((lead) => (
                  <LeadRow
                    key={lead.id}
                    lead={lead}
                    selected={selectedLeads.includes(lead.id)}
                    onSelect={() => toggleSelectLead(lead.id)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* New Lead Modal */}
      <NewLeadModal
        isOpen={showNewLeadModal}
        onClose={() => setShowNewLeadModal(false)}
        onSuccess={(newLead) => {
          setLeads((prev) => [newLead, ...prev]);
          setShowNewLeadModal(false);
        }}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleBulkDelete}
        title={`${selectedLeads.length} Lead${selectedLeads.length > 1 ? 's' : ''} löschen?`}
        message="Diese Aktion kann nicht rückgängig gemacht werden. Alle ausgewählten Leads werden unwiderruflich gelöscht."
        confirmText="Löschen"
        variant="danger"
        loading={bulkActionLoading}
      />
    </div>
  );
}

// ============================================
// LEAD ROW COMPONENT
// ============================================

interface LeadRowProps {
  lead: Lead;
  selected: boolean;
  onSelect: () => void;
}

function LeadRow({ lead, selected, onSelect }: LeadRowProps) {
  return (
    <tr className={cn('transition-colors group', selected ? 'bg-blue-50' : 'hover:bg-slate-50/50')}>
      <td className="px-4 py-4">
        <Checkbox checked={selected} onChange={onSelect} />
      </td>
      <td className="px-4 py-4">
        <Link href={`/dashboard/leads/${lead.id}`} className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-600 font-medium flex-shrink-0 group-hover:from-blue-100 group-hover:to-blue-200 group-hover:text-blue-600 transition-colors">
            {getInitials(lead.name, lead.email)}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-slate-900 truncate group-hover:text-blue-600 transition-colors">
              {lead.name || 'Unbekannt'}
            </p>
            <p className="text-sm text-slate-500 truncate">{lead.email}</p>
          </div>
        </Link>
      </td>
      <td className="px-4 py-4 hidden md:table-cell">
        <p className="text-sm text-slate-600 truncate max-w-[200px]">
          {lead.message || '-'}
        </p>
      </td>
      <td className="px-4 py-4">
        <StatusBadge status={lead.status} />
      </td>
      <td className="px-4 py-4 hidden sm:table-cell">
        <SourceBadge source={lead.source} />
      </td>
      <td className="px-4 py-4 hidden lg:table-cell">
        <span className="text-sm text-slate-500">{formatRelativeTime(lead.created_at)}</span>
      </td>
      <td className="px-4 py-4">
        <Link
          href={`/dashboard/leads/${lead.id}`}
          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors inline-flex"
        >
          <ChevronRightIcon className="w-5 h-5" />
        </Link>
      </td>
    </tr>
  );
}

// ============================================
// NEW LEAD MODAL
// ============================================

interface NewLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (lead: Lead) => void;
}

function NewLeadModal({ isOpen, onClose, onSuccess }: NewLeadModalProps) {
  const supabase = createClientComponentClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const newLead = {
        ...formData,
        status: 'new' as LeadStatus,
        priority: 'medium',
        source: 'manual' as LeadSource,
        created_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('leads')
        .insert(newLead)
        .select()
        .single();

      if (error) throw error;

      onSuccess(data);
      setFormData({ name: '', email: '', phone: '', message: '' });
    } catch (err: any) {
      setError(err.message || 'Ein Fehler ist aufgetreten');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Neuer Lead"
      description="Erfassen Sie einen neuen Kontakt manuell"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>
            Abbrechen
          </Button>
          <Button onClick={handleSubmit} loading={loading}>
            Lead erstellen
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Name</label>
          <input
            name="name"
            type="text"
            placeholder="Max Mustermann"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">E-Mail</label>
          <input
            name="email"
            type="email"
            placeholder="max@beispiel.de"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Telefon</label>
          <input
            name="phone"
            type="tel"
            placeholder="+49 123 456789"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Nachricht / Notizen
          </label>
          <textarea
            name="message"
            rows={3}
            placeholder="Anfrage oder interne Notizen..."
            value={formData.message}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 resize-none"
          />
        </div>
      </form>
    </Modal>
  );
}

// ============================================
// HELPER COMPONENTS
// ============================================

function Checkbox({
  checked,
  indeterminate,
  onChange,
}: {
  checked: boolean;
  indeterminate?: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onChange();
      }}
      className={cn(
        'w-5 h-5 rounded border-2 flex items-center justify-center transition-all',
        checked || indeterminate
          ? 'bg-blue-500 border-blue-500 text-white'
          : 'border-slate-300 hover:border-slate-400'
      )}
    >
      {checked && (
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      )}
      {indeterminate && !checked && (
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
        </svg>
      )}
    </button>
  );
}

function FilterTag({ children, onRemove }: { children: React.ReactNode; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm">
      {children}
      <button onClick={onRemove} className="p-0.5 hover:bg-blue-200 rounded transition-colors">
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </span>
  );
}

function LeadsPageSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-4 w-40" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
      <Skeleton className="h-14 w-full rounded-xl" />
      <div className="rounded-2xl border border-slate-200 overflow-hidden">
        <div className="bg-slate-50 px-4 py-3">
          <Skeleton className="h-4 w-full" />
        </div>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-4 border-t border-slate-100">
            <Skeleton className="w-5 h-5 rounded" />
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

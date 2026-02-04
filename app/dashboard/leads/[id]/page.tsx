'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import {
  Card,
  Button,
  StatusBadge,
  SourceBadge,
  PriorityBadge,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Modal,
  ConfirmDialog,
  Skeleton,
} from '@/components/ui';
import { StatusDropdown, PriorityDropdown } from '@/components/ui/Dropdown';
import {
  ChevronRightIcon,
  MailIcon,
  PhoneIcon,
  GlobeIcon,
  LocationIcon,
  CalendarIcon,
  ClockIcon,
  TrashIcon,
  EditIcon,
  PlusIcon,
} from '@/components/common/Icons';
import { Lead, Conversation, LeadStatus, LeadPriority } from '@/types';
import { formatDateTime, formatRelativeTime, getInitials, cn } from '@/lib/utils';

export default function LeadDetailPage() {
  const router = useRouter();
  const params = useParams();
  const leadId = params.id as string;
  const supabase = createClientComponentClient();

  // State
  const [lead, setLead] = useState<Lead | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notes, setNotes] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // ============================================
  // DATA LOADING
  // ============================================

  useEffect(() => {
    loadLead();
    loadConversations();
  }, [leadId]);

  async function loadLead() {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('id', leadId)
        .single();

      if (error) throw error;
      setLead(data);
      setNotes(data.custom_fields?.notes || '');
    } catch (error) {
      console.error('Error loading lead:', error);
      router.push('/dashboard/leads');
    } finally {
      setLoading(false);
    }
  }

  async function loadConversations() {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setConversations(data || []);
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  }

  // ============================================
  // UPDATE HANDLERS
  // ============================================

  async function handleStatusChange(newStatus: LeadStatus) {
    if (!lead) return;
    setSaving(true);

    try {
      const { error } = await supabase
        .from('leads')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', leadId);

      if (error) throw error;
      setLead({ ...lead, status: newStatus });
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setSaving(false);
    }
  }

  async function handlePriorityChange(newPriority: LeadPriority) {
    if (!lead) return;
    setSaving(true);

    try {
      const { error } = await supabase
        .from('leads')
        .update({ priority: newPriority, updated_at: new Date().toISOString() })
        .eq('id', leadId);

      if (error) throw error;
      setLead({ ...lead, priority: newPriority });
    } catch (error) {
      console.error('Error updating priority:', error);
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveNotes() {
    if (!lead) return;
    setSaving(true);

    try {
      const customFields = { ...(lead.custom_fields || {}), notes };

      const { error } = await supabase
        .from('leads')
        .update({ custom_fields: customFields, updated_at: new Date().toISOString() })
        .eq('id', leadId);

      if (error) throw error;
      setLead({ ...lead, custom_fields: customFields });
    } catch (error) {
      console.error('Error saving notes:', error);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    try {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', leadId);

      if (error) throw error;
      router.push('/dashboard/leads');
    } catch (error) {
      console.error('Error deleting lead:', error);
    }
  }

  // ============================================
  // RENDER
  // ============================================

  if (loading) {
    return <LeadDetailSkeleton />;
  }

  if (!lead) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Lead nicht gefunden</p>
        <Link href="/dashboard/leads">
          <Button variant="secondary" className="mt-4">
            Zurück zur Liste
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link href="/dashboard/leads" className="text-slate-500 hover:text-slate-700">
          Leads
        </Link>
        <ChevronRightIcon className="w-4 h-4 text-slate-400" />
        <span className="text-slate-900 font-medium">{lead.name || lead.email}</span>
      </div>

      {/* Header Card */}
      <Card variant="glass" padding="lg">
        <div className="flex flex-col lg:flex-row lg:items-start gap-6">
          {/* Avatar & Basic Info */}
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-blue-500/25 flex-shrink-0">
              {getInitials(lead.name, lead.email)}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                {lead.name || 'Unbekannt'}
              </h1>
              <p className="text-slate-500 mt-1">{lead.email}</p>
              <div className="flex items-center gap-3 mt-3">
                <SourceBadge source={lead.source} />
                <span className="text-sm text-slate-400">
                  {formatRelativeTime(lead.created_at)}
                </span>
              </div>
            </div>
          </div>

          {/* Status & Priority */}
          <div className="flex-1 lg:flex lg:justify-end">
            <div className="grid grid-cols-2 gap-4 sm:flex sm:items-start sm:gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
                  Status
                </label>
                <StatusDropdown
                  value={lead.status}
                  onChange={handleStatusChange}
                  disabled={saving}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
                  Priorität
                </label>
                <PriorityDropdown
                  value={lead.priority}
                  onChange={handlePriorityChange}
                  disabled={saving}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-3 mt-6 pt-6 border-t border-slate-100">
          <Button
            variant="secondary"
            size="sm"
            icon={<MailIcon className="w-4 h-4" />}
            onClick={() => window.open(`mailto:${lead.email}`)}
          >
            E-Mail senden
          </Button>
          {lead.phone && (
            <Button
              variant="secondary"
              size="sm"
              icon={<PhoneIcon className="w-4 h-4" />}
              onClick={() => window.open(`tel:${lead.phone}`)}
            >
              Anrufen
            </Button>
          )}
          {lead.website && (
            <Button
              variant="secondary"
              size="sm"
              icon={<GlobeIcon className="w-4 h-4" />}
              onClick={() => window.open(lead.website, '_blank')}
            >
              Website
            </Button>
          )}
          <div className="flex-1" />
          <Button
            variant="danger"
            size="sm"
            icon={<TrashIcon className="w-4 h-4" />}
            onClick={() => setShowDeleteConfirm(true)}
          >
            Löschen
          </Button>
        </div>
      </Card>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="details">
            <TabsList>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="activity">
                Aktivität
                {conversations.length > 0 && (
                  <span className="ml-2 bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-xs">
                    {conversations.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="notes">Notizen</TabsTrigger>
            </TabsList>

            {/* Details Tab */}
            <TabsContent value="details" className="mt-6">
              <Card variant="solid">
                {/* Message */}
                {lead.message && (
                  <div className="mb-6 pb-6 border-b border-slate-100">
                    <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-3">
                      Nachricht
                    </h3>
                    <p className="text-slate-700 whitespace-pre-wrap">{lead.message}</p>
                  </div>
                )}

                {/* Contact Info Grid */}
                <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-4">
                  Kontaktdaten
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InfoField
                    icon={<MailIcon className="w-4 h-4" />}
                    label="E-Mail"
                    value={lead.email}
                    href={`mailto:${lead.email}`}
                  />
                  {lead.phone && (
                    <InfoField
                      icon={<PhoneIcon className="w-4 h-4" />}
                      label="Telefon"
                      value={lead.phone}
                      href={`tel:${lead.phone}`}
                    />
                  )}
                  {lead.website && (
                    <InfoField
                      icon={<GlobeIcon className="w-4 h-4" />}
                      label="Website"
                      value={lead.website}
                      href={lead.website}
                      external
                    />
                  )}
                  {(lead.address || lead.city) && (
                    <InfoField
                      icon={<LocationIcon className="w-4 h-4" />}
                      label="Adresse"
                      value={[lead.address, lead.postal_code, lead.city].filter(Boolean).join(', ')}
                    />
                  )}
                  <InfoField
                    icon={<CalendarIcon className="w-4 h-4" />}
                    label="Erstellt am"
                    value={formatDateTime(lead.created_at)}
                  />
                  {lead.updated_at && (
                    <InfoField
                      icon={<ClockIcon className="w-4 h-4" />}
                      label="Aktualisiert"
                      value={formatDateTime(lead.updated_at)}
                    />
                  )}
                </div>

                {/* Scraped From */}
                {lead.scraped_from && (
                  <div className="mt-6 pt-6 border-t border-slate-100">
                    <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-3">
                      Quelle
                    </h3>
                    <p className="text-slate-700 text-sm">
                      Gefunden auf: {lead.scraped_from}
                    </p>
                  </div>
                )}
              </Card>
            </TabsContent>

            {/* Activity Tab */}
            <TabsContent value="activity" className="mt-6">
              <Card variant="solid">
                {conversations.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                      <MailIcon className="w-6 h-6 text-slate-400" />
                    </div>
                    <p className="text-slate-500">Noch keine Aktivitäten</p>
                    <p className="text-sm text-slate-400 mt-1">
                      Senden Sie eine E-Mail um die Konversation zu starten
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {conversations.map((conv) => (
                      <ConversationItem key={conv.id} conversation={conv} />
                    ))}
                  </div>
                )}
              </Card>
            </TabsContent>

            {/* Notes Tab */}
            <TabsContent value="notes" className="mt-6">
              <Card variant="solid">
                <textarea
                  rows={8}
                  placeholder="Interne Notizen zu diesem Lead..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 resize-none"
                />
                <div className="flex justify-end mt-4">
                  <Button onClick={handleSaveNotes} loading={saving} size="sm">
                    Notizen speichern
                  </Button>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Timeline Card */}
          <Card variant="glass">
            <h3 className="font-semibold text-slate-900 mb-4">Timeline</h3>
            <div className="space-y-4">
              <TimelineItem
                icon="created"
                title="Lead erstellt"
                time={lead.created_at}
              />
              {lead.first_reply_sent_at && (
                <TimelineItem
                  icon="email"
                  title="Erste Antwort"
                  time={lead.first_reply_sent_at}
                />
              )}
              {lead.status === 'qualified' && (
                <TimelineItem
                  icon="qualified"
                  title="Qualifiziert"
                  time={lead.updated_at || lead.created_at}
                />
              )}
              {lead.status === 'won' && (
                <TimelineItem
                  icon="won"
                  title="Gewonnen"
                  time={lead.updated_at || lead.created_at}
                />
              )}
            </div>
          </Card>

          {/* Add to Campaign Card */}
          <Card variant="glass">
            <h3 className="font-semibold text-slate-900 mb-4">Kampagnen</h3>
            <p className="text-sm text-slate-500 mb-4">
              Fügen Sie diesen Lead zu einer E-Mail-Kampagne hinzu
            </p>
            <Link href="/dashboard/campaigns">
              <Button variant="secondary" fullWidth icon={<PlusIcon className="w-4 h-4" />}>
                Zu Kampagne hinzufügen
              </Button>
            </Link>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Lead löschen?"
        message="Diese Aktion kann nicht rückgängig gemacht werden. Der Lead und alle zugehörigen Daten werden unwiderruflich gelöscht."
        confirmText="Löschen"
        variant="danger"
      />
    </div>
  );
}

// ============================================
// HELPER COMPONENTS
// ============================================

interface InfoFieldProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  href?: string;
  external?: boolean;
}

function InfoField({ icon, label, value, href, external }: InfoFieldProps) {
  const content = (
    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
      <div className="text-slate-400 mt-0.5">{icon}</div>
      <div>
        <p className="text-xs text-slate-500 uppercase tracking-wider">{label}</p>
        <p className={cn('text-slate-900 mt-0.5', href && 'text-blue-600')}>{value}</p>
      </div>
    </div>
  );

  if (href) {
    return (
      <a
        href={href}
        target={external ? '_blank' : undefined}
        rel={external ? 'noopener noreferrer' : undefined}
      >
        {content}
      </a>
    );
  }

  return content;
}

interface ConversationItemProps {
  conversation: Conversation;
}

function ConversationItem({ conversation }: ConversationItemProps) {
  const isOutbound = conversation.direction === 'outbound';

  return (
    <div className={cn('flex gap-3', isOutbound ? 'flex-row-reverse' : '')}>
      <div
        className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
          isOutbound ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-600'
        )}
      >
        <MailIcon className="w-4 h-4" />
      </div>
      <div
        className={cn(
          'flex-1 p-4 rounded-xl max-w-[80%]',
          isOutbound ? 'bg-blue-50 border border-blue-100' : 'bg-slate-50 border border-slate-100'
        )}
      >
        {conversation.subject && (
          <p className="font-medium text-slate-900 mb-1">{conversation.subject}</p>
        )}
        <p className="text-slate-700 text-sm whitespace-pre-wrap">{conversation.content}</p>
        <p className="text-xs text-slate-400 mt-2">
          {formatDateTime(conversation.created_at)}
        </p>
      </div>
    </div>
  );
}

interface TimelineItemProps {
  icon: 'created' | 'email' | 'qualified' | 'won';
  title: string;
  time: string;
}

function TimelineItem({ icon, title, time }: TimelineItemProps) {
  const iconConfig = {
    created: { bg: 'bg-slate-100', color: 'text-slate-500', icon: <CalendarIcon className="w-4 h-4" /> },
    email: { bg: 'bg-blue-100', color: 'text-blue-600', icon: <MailIcon className="w-4 h-4" /> },
    qualified: { bg: 'bg-amber-100', color: 'text-amber-600', icon: <span>✓</span> },
    won: { bg: 'bg-emerald-100', color: 'text-emerald-600', icon: <span>★</span> },
  };

  const config = iconConfig[icon];

  return (
    <div className="flex items-center gap-3">
      <div className={cn('w-8 h-8 rounded-full flex items-center justify-center', config.bg, config.color)}>
        {config.icon}
      </div>
      <div>
        <p className="text-sm font-medium text-slate-900">{title}</p>
        <p className="text-xs text-slate-500">{formatRelativeTime(time)}</p>
      </div>
    </div>
  );
}

function LeadDetailSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <Skeleton className="h-4 w-48" />
      <div className="rounded-2xl border border-slate-200 bg-white/70 p-6">
        <div className="flex items-start gap-4">
          <Skeleton className="w-16 h-16 rounded-2xl" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Skeleton className="h-96 rounded-2xl" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

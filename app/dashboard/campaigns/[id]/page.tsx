'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import {
  Card,
  Button,
  CampaignStatusBadge,
  RecipientStatusBadge,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Skeleton,
  ConfirmDialog,
  EmptyState,
} from '@/components/ui';
import {
  ChevronRightIcon,
  MailIcon,
  CheckCircleIcon,
  TrashIcon,
  RefreshIcon,
  ExternalLinkIcon,
} from '@/components/common/Icons';
import { Campaign, CampaignRecipient, Lead, CampaignStatus } from '@/types';
import { formatDateTime, formatRelativeTime, cn } from '@/lib/utils';

export default function CampaignDetailPage() {
  const router = useRouter();
  const params = useParams();
  const campaignId = params.id as string;
  const supabase = createClientComponentClient();

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [recipients, setRecipients] = useState<(CampaignRecipient & { lead: Lead })[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    loadCampaign();
    loadRecipients();
  }, [campaignId]);

  async function loadCampaign() {
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', campaignId)
        .single();

      if (error) throw error;
      setCampaign(data);
    } catch (error) {
      console.error('Error loading campaign:', error);
      router.push('/dashboard/campaigns');
    } finally {
      setLoading(false);
    }
  }

  async function loadRecipients() {
    try {
      const { data, error } = await supabase
        .from('campaign_recipients')
        .select(`
          *,
          lead:leads(id, name, email, status)
        `)
        .eq('campaign_id', campaignId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRecipients(data || []);
    } catch (error) {
      console.error('Error loading recipients:', error);
    }
  }

  async function handleStatusChange(newStatus: CampaignStatus) {
    if (!campaign) return;

    try {
      const updates: any = { status: newStatus, updated_at: new Date().toISOString() };
      
      if (newStatus === 'active' && !campaign.started_at) {
        updates.started_at = new Date().toISOString();
      }
      if (newStatus === 'completed') {
        updates.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('campaigns')
        .update(updates)
        .eq('id', campaignId);

      if (error) throw error;
      setCampaign({ ...campaign, ...updates });
    } catch (error) {
      console.error('Error updating campaign:', error);
    }
  }

  async function handleDelete() {
    try {
      // Delete recipients first
      await supabase
        .from('campaign_recipients')
        .delete()
        .eq('campaign_id', campaignId);

      // Delete campaign
      const { error } = await supabase
        .from('campaigns')
        .delete()
        .eq('id', campaignId);

      if (error) throw error;
      router.push('/dashboard/campaigns');
    } catch (error) {
      console.error('Error deleting campaign:', error);
    }
  }

  if (loading) {
    return <CampaignDetailSkeleton />;
  }

  if (!campaign) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Kampagne nicht gefunden</p>
        <Link href="/dashboard/campaigns">
          <Button variant="secondary" className="mt-4">Zurück zur Liste</Button>
        </Link>
      </div>
    );
  }

  const stats = campaign.stats || {
    total_recipients: recipients.length,
    sent: 0,
    opened: 0,
    clicked: 0,
    replied: 0,
    bounced: 0,
    unsubscribed: 0,
  };

  const openRate = stats.sent > 0 ? ((stats.opened / stats.sent) * 100).toFixed(1) : '0';
  const clickRate = stats.opened > 0 ? ((stats.clicked / stats.opened) * 100).toFixed(1) : '0';
  const replyRate = stats.sent > 0 ? ((stats.replied / stats.sent) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link href="/dashboard/campaigns" className="text-slate-500 hover:text-slate-700">
          Kampagnen
        </Link>
        <ChevronRightIcon className="w-4 h-4 text-slate-400" />
        <span className="text-slate-900 font-medium">{campaign.name}</span>
      </div>

      {/* Header */}
      <Card variant="default" padding="lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-slate-900 flex-shrink-0">
              <MailIcon className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-slate-900">{campaign.name}</h1>
                <CampaignStatusBadge status={campaign.status} />
              </div>
              <p className="text-slate-500 mt-1">{campaign.subject}</p>
              <p className="text-sm text-slate-400 mt-2">
                Von: {campaign.from_name} &lt;{campaign.from_email}&gt;
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {campaign.status === 'draft' && (
              <Button onClick={() => handleStatusChange('active')}>
                Kampagne starten
              </Button>
            )}
            {campaign.status === 'active' && (
              <Button
                variant="secondary"
                onClick={() => handleStatusChange('paused')}
              >
                Pausieren
              </Button>
            )}
            {campaign.status === 'paused' && (
              <>
                <Button onClick={() => handleStatusChange('active')}>
                  Fortsetzen
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => handleStatusChange('completed')}
                >
                  Abschließen
                </Button>
              </>
            )}
            <Button
              variant="danger"
              onClick={() => setShowDeleteConfirm(true)}
              icon={<TrashIcon className="w-4 h-4" />}
            >
              Löschen
            </Button>
          </div>
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard label="Empfänger" value={stats.total_recipients} />
        <StatCard label="Gesendet" value={stats.sent} />
        <StatCard label="Geöffnet" value={`${openRate}%`} subValue={stats.opened} />
        <StatCard label="Geklickt" value={`${clickRate}%`} subValue={stats.clicked} />
        <StatCard label="Geantwortet" value={`${replyRate}%`} subValue={stats.replied} highlight />
      </div>

      {/* Progress Bar for Active Campaigns */}
      {campaign.status === 'active' && stats.total_recipients > 0 && (
        <Card variant="default" padding="md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700">Versand-Fortschritt</span>
            <span className="text-sm text-slate-500">
              {stats.sent} / {stats.total_recipients} ({((stats.sent / stats.total_recipients) * 100).toFixed(0)}%)
            </span>
          </div>
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
              style={{ width: `${(stats.sent / stats.total_recipients) * 100}%` }}
            />
          </div>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="recipients">
        <TabsList>
          <TabsTrigger value="recipients">
            Empfänger
            <span className="ml-2 bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-xs">
              {recipients.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="content">E-Mail-Inhalt</TabsTrigger>
          <TabsTrigger value="settings">Einstellungen</TabsTrigger>
        </TabsList>

        {/* Recipients Tab */}
        <TabsContent value="recipients" className="mt-6">
          <Card variant="default" padding="none">
            {recipients.length === 0 ? (
              <EmptyState
                title="Keine Empfänger"
                description="Diese Kampagne hat noch keine Empfänger"
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">
                        Empfänger
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">
                        Status
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase hidden sm:table-cell">
                        Gesendet
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase hidden md:table-cell">
                        Geöffnet
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase hidden lg:table-cell">
                        Geklickt
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recipients.map((recipient) => (
                      <tr key={recipient.id} className="hover:bg-slate-50/50">
                        <td className="px-4 py-4">
                          <Link
                            href={`/dashboard/leads/${recipient.lead_id}`}
                            className="flex items-center gap-3 group"
                          >
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 text-sm font-medium">
                              {recipient.lead?.name?.[0] || recipient.lead?.email?.[0] || '?'}
                            </div>
                            <div>
                              <p className="font-medium text-slate-900 group-hover:text-blue-600">
                                {recipient.lead?.name || 'Unbekannt'}
                              </p>
                              <p className="text-sm text-slate-500">
                                {recipient.lead?.email}
                              </p>
                            </div>
                          </Link>
                        </td>
                        <td className="px-4 py-4">
                          <RecipientStatusBadge status={recipient.status} />
                        </td>
                        <td className="px-4 py-4 hidden sm:table-cell">
                          <span className="text-sm text-slate-500">
                            {recipient.sent_at ? formatDateTime(recipient.sent_at) : '-'}
                          </span>
                        </td>
                        <td className="px-4 py-4 hidden md:table-cell">
                          <span className="text-sm text-slate-500">
                            {recipient.opened_at ? formatDateTime(recipient.opened_at) : '-'}
                          </span>
                        </td>
                        <td className="px-4 py-4 hidden lg:table-cell">
                          <span className="text-sm text-slate-500">
                            {recipient.clicked_at ? formatDateTime(recipient.clicked_at) : '-'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </TabsContent>

        {/* Content Tab */}
        <TabsContent value="content" className="mt-6">
          <Card variant="default">
            <h3 className="font-semibold text-slate-900 mb-4">E-Mail-Inhalt</h3>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-slate-100 px-4 py-3 border-b border-slate-200 text-sm">
                <div className="flex gap-4">
                  <span className="text-slate-500">Betreff:</span>
                  <span className="text-slate-900">{campaign.subject}</span>
                </div>
              </div>
              <div className="p-6 bg-white">
                <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                  {campaign.body_text || campaign.body_html || '(Kein Inhalt)'}
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="mt-6">
          <Card variant="default">
            <h3 className="font-semibold text-slate-900 mb-4">Kampagnen-Einstellungen</h3>
            <dl className="grid sm:grid-cols-2 gap-6">
              <div>
                <dt className="text-sm text-slate-500">Absender</dt>
                <dd className="font-medium text-slate-900 mt-1">
                  {campaign.from_name} &lt;{campaign.from_email}&gt;
                </dd>
              </div>
              <div>
                <dt className="text-sm text-slate-500">Antwort an</dt>
                <dd className="font-medium text-slate-900 mt-1">
                  {campaign.reply_to || campaign.from_email}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-slate-500">Erstellt am</dt>
                <dd className="font-medium text-slate-900 mt-1">
                  {formatDateTime(campaign.created_at)}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-slate-500">Gestartet am</dt>
                <dd className="font-medium text-slate-900 mt-1">
                  {campaign.started_at ? formatDateTime(campaign.started_at) : '-'}
                </dd>
              </div>
              {campaign.completed_at && (
                <div>
                  <dt className="text-sm text-slate-500">Abgeschlossen am</dt>
                  <dd className="font-medium text-slate-900 mt-1">
                    {formatDateTime(campaign.completed_at)}
                  </dd>
                </div>
              )}
            </dl>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Kampagne löschen?"
        message="Diese Aktion kann nicht rückgängig gemacht werden. Die Kampagne und alle zugehörigen Daten werden gelöscht."
        confirmText="Löschen"
        variant="danger"
      />
    </div>
  );
}

// ============================================
// HELPER COMPONENTS
// ============================================

function StatCard({
  label,
  value,
  subValue,
  highlight,
}: {
  label: string;
  value: string | number;
  subValue?: number;
  highlight?: boolean;
}) {
  return (
    <Card variant="default" padding="md">
      <p className="text-xs text-slate-500 uppercase tracking-wider">{label}</p>
      <p className={cn(
        'text-2xl font-bold mt-1',
        highlight ? 'text-emerald-600' : 'text-slate-900'
      )}>
        {value}
      </p>
      {subValue !== undefined && (
        <p className="text-sm text-slate-400 mt-0.5">{subValue} absolut</p>
      )}
    </Card>
  );
}

function CampaignDetailSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <Skeleton className="h-4 w-48" />
      <Skeleton className="h-32 rounded-2xl" />
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-64 rounded-2xl" />
    </div>
  );
}

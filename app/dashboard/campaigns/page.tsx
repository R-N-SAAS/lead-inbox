'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';
import {
  Card,
  Button,
  CampaignStatusBadge,
  EmptyState,
  Skeleton,
  ConfirmDialog,
} from '@/components/ui';
import {
  PlusIcon,
  CampaignsIcon,
  ChevronRightIcon,
  TrashIcon,
  EditIcon,
  MailIcon,
} from '@/components/common/Icons';
import { Campaign, CampaignStatus } from '@/types';
import { formatRelativeTime, cn } from '@/lib/utils';

export default function CampaignsPage() {
  const supabase = createClientComponentClient();
  
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadCampaigns();
  }, []);

  async function loadCampaigns() {
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCampaigns(data || []);
    } catch (error) {
      console.error('Error loading campaigns:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);

    try {
      const { error } = await supabase
        .from('campaigns')
        .delete()
        .eq('id', deleteId);

      if (error) throw error;
      setCampaigns((prev) => prev.filter((c) => c.id !== deleteId));
      setDeleteId(null);
    } catch (error) {
      console.error('Error deleting campaign:', error);
    } finally {
      setDeleting(false);
    }
  }

  async function handleStatusToggle(campaign: Campaign) {
    const newStatus: CampaignStatus = campaign.status === 'active' ? 'paused' : 'active';
    
    try {
      const { error } = await supabase
        .from('campaigns')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', campaign.id);

      if (error) throw error;
      setCampaigns((prev) =>
        prev.map((c) => (c.id === campaign.id ? { ...c, status: newStatus } : c))
      );
    } catch (error) {
      console.error('Error updating campaign status:', error);
    }
  }

  // Stats
  const totalCampaigns = campaigns.length;
  const activeCampaigns = campaigns.filter((c) => c.status === 'active').length;
  const totalSent = campaigns.reduce((sum, c) => sum + (c.stats?.sent || 0), 0);
  const totalOpened = campaigns.reduce((sum, c) => sum + (c.stats?.opened || 0), 0);
  const avgOpenRate = totalSent > 0 ? ((totalOpened / totalSent) * 100).toFixed(1) : '0';

  if (loading) {
    return <CampaignsPageSkeleton />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Kampagnen</h1>
          <p className="text-slate-500 mt-1">
            E-Mail-Sequenzen erstellen und verwalten
          </p>
        </div>
        <Link href="/dashboard/campaigns/new">
          <Button icon={<PlusIcon className="w-4 h-4" />}>
            Neue Kampagne
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatMini label="Gesamt" value={totalCampaigns} />
        <StatMini label="Aktiv" value={activeCampaigns} color="emerald" />
        <StatMini label="E-Mails gesendet" value={totalSent.toLocaleString('de-DE')} />
        <StatMini label="Öffnungsrate" value={`${avgOpenRate}%`} color="blue" />
      </div>

      {/* Campaigns List */}
      {campaigns.length === 0 ? (
        <Card variant="default">
          <EmptyState
            icon={<CampaignsIcon className="w-8 h-8" />}
            title="Noch keine Kampagnen"
            description="Erstellen Sie Ihre erste E-Mail-Kampagne um Leads automatisch zu kontaktieren"
            action={
              <Link href="/dashboard/campaigns/new">
                <Button icon={<PlusIcon className="w-4 h-4" />}>
                  Kampagne erstellen
                </Button>
              </Link>
            }
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {campaigns.map((campaign) => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              onStatusToggle={() => handleStatusToggle(campaign)}
              onDelete={() => setDeleteId(campaign.id)}
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Kampagne löschen?"
        message="Diese Aktion kann nicht rückgängig gemacht werden. Die Kampagne und alle zugehörigen Statistiken werden gelöscht."
        confirmText="Löschen"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
}

// ============================================
// CAMPAIGN CARD
// ============================================

interface CampaignCardProps {
  campaign: Campaign;
  onStatusToggle: () => void;
  onDelete: () => void;
}

function CampaignCard({ campaign, onStatusToggle, onDelete }: CampaignCardProps) {
  const stats = campaign.stats || {
    total_recipients: 0,
    sent: 0,
    opened: 0,
    clicked: 0,
    replied: 0,
  };

  const openRate = stats.sent > 0 ? ((stats.opened / stats.sent) * 100).toFixed(1) : '0';
  const replyRate = stats.sent > 0 ? ((stats.replied / stats.sent) * 100).toFixed(1) : '0';

  return (
    <Card variant="default" padding="none" hover>
      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-slate-900 flex-shrink-0">
            <MailIcon className="w-6 h-6" />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                <Link
                  href={`/dashboard/campaigns/${campaign.id}`}
                  className="text-lg font-semibold text-slate-900 hover:text-blue-600 transition-colors"
                >
                  {campaign.name}
                </Link>
                <p className="text-sm text-slate-500 mt-0.5 truncate">
                  {campaign.subject}
                </p>
              </div>
              <CampaignStatusBadge status={campaign.status} />
            </div>

            {/* Stats Row */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-4">
              <StatItem label="Empfänger" value={stats.total_recipients} />
              <StatItem label="Gesendet" value={stats.sent} />
              <StatItem label="Geöffnet" value={`${openRate}%`} />
              <StatItem label="Geantwortet" value={`${replyRate}%`} highlight />
            </div>
          </div>
        </div>
      </div>

      {/* Actions Footer */}
      <div className="px-5 py-3 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
        <span className="text-xs text-slate-400">
          Erstellt {formatRelativeTime(campaign.created_at)}
        </span>
        <div className="flex items-center gap-2">
          {campaign.status === 'draft' && (
            <Link href={`/dashboard/campaigns/${campaign.id}/edit`}>
              <Button variant="ghost" size="sm" icon={<EditIcon className="w-4 h-4" />}>
                Bearbeiten
              </Button>
            </Link>
          )}
          {(campaign.status === 'active' || campaign.status === 'paused') && (
            <Button variant="ghost" size="sm" onClick={onStatusToggle}>
              {campaign.status === 'active' ? 'Pausieren' : 'Fortsetzen'}
            </Button>
          )}
          <Link href={`/dashboard/campaigns/${campaign.id}`}>
            <Button variant="secondary" size="sm">
              Details
              <ChevronRightIcon className="w-4 h-4 ml-1" />
            </Button>
          </Link>
          {campaign.status === 'draft' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="!text-red-600 hover:!bg-red-50"
            >
              <TrashIcon className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

// ============================================
// HELPER COMPONENTS
// ============================================

function StatMini({ label, value, color }: { label: string; value: string | number; color?: string }) {
  const colorClasses: Record<string, string> = {
    emerald: 'bg-emerald-50 text-emerald-700',
    blue: 'bg-blue-50 text-blue-700',
    default: 'bg-slate-50 text-slate-700',
  };

  return (
    <div className={cn('p-4 rounded-xl', colorClasses[color || 'default'])}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm opacity-70">{label}</p>
    </div>
  );
}

function StatItem({ label, value, highlight }: { label: string; value: string | number; highlight?: boolean }) {
  return (
    <div>
      <span className={cn('text-sm font-semibold', highlight ? 'text-emerald-600' : 'text-slate-900')}>
        {value}
      </span>
      <span className="text-sm text-slate-500 ml-1">{label}</span>
    </div>
  );
}

function CampaignsPageSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-10 w-36" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-40 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

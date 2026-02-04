'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';
import { Card, StatCard, Button, StatusBadge, SourceBadge, EmptyState, DashboardSkeleton } from '@/components/ui';
import { PlusIcon, LeadsIcon, CampaignsIcon, AnalyticsIcon, WidgetIcon, TrendUpIcon, TrendDownIcon } from '@/components/common/Icons';
import { Lead, DashboardStats } from '@/types';
import { formatRelativeTime, getInitials } from '@/lib/utils';

export default function DashboardPage() {
  const supabase = createClientComponentClient();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    try {
      // Alle Leads laden
      const { data: leads, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const allLeads = leads || [];

      // Stats berechnen
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const leadsThisWeek = allLeads.filter(l => new Date(l.created_at) > weekAgo);
      const leadsLastWeek = allLeads.filter(l => {
        const date = new Date(l.created_at);
        const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
        return date > twoWeeksAgo && date <= weekAgo;
      });

      const newLeads = allLeads.filter(l => l.status === 'new').length;
      const qualifiedLeads = allLeads.filter(l => l.status === 'qualified').length;
      const wonLeads = allLeads.filter(l => l.status === 'won').length;
      const lostLeads = allLeads.filter(l => l.status === 'lost').length;

      // Conversion Rate berechnen
      const closedLeads = wonLeads + lostLeads;
      const conversionRate = closedLeads > 0 ? (wonLeads / closedLeads) * 100 : 0;

      // Nach Status gruppieren
      const leadsByStatus = allLeads.reduce((acc, lead) => {
        acc[lead.status] = (acc[lead.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Nach Quelle gruppieren
      const leadsBySource = allLeads.reduce((acc, lead) => {
        const source = lead.source || 'unknown';
        acc[source] = (acc[source] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Prozentuale Änderung
      const weeklyChange = leadsLastWeek.length > 0
        ? ((leadsThisWeek.length - leadsLastWeek.length) / leadsLastWeek.length) * 100
        : leadsThisWeek.length > 0 ? 100 : 0;

      setStats({
        totalLeads: allLeads.length,
        newLeads,
        qualifiedLeads,
        wonLeads,
        lostLeads,
        conversionRate,
        averageResponseTime: 0, // TODO: Berechnen wenn conversations implementiert
        leadsByStatus,
        leadsBySource,
        leadsOverTime: [], // TODO: Chart-Daten
        recentLeads: allLeads.slice(0, 5),
      });
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (!stats) {
    return (
      <EmptyState
        icon={<LeadsIcon className="w-8 h-8" />}
        title="Fehler beim Laden"
        description="Die Dashboard-Daten konnten nicht geladen werden."
        action={
          <Button onClick={() => loadDashboardData()}>Erneut versuchen</Button>
        }
      />
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-1">
            Willkommen zurück! Hier ist Ihre aktuelle Übersicht.
          </p>
        </div>
        <Link href="/dashboard/leads">
          <Button icon={<PlusIcon className="w-4 h-4" />}>
            Neuer Lead
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <StatCard
          label="Gesamt Leads"
          value={stats.totalLeads}
          icon={<LeadsIcon className="w-6 h-6" />}
          iconBg="bg-blue-50 text-blue-600"
        />
        <StatCard
          label="Neue Leads"
          value={stats.newLeads}
          icon={<PlusIcon className="w-6 h-6" />}
          iconBg="bg-cyan-50 text-cyan-600"
        />
        <StatCard
          label="Qualifiziert"
          value={stats.qualifiedLeads}
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          iconBg="bg-amber-50 text-amber-600"
        />
        <StatCard
          label="Gewonnen"
          value={stats.wonLeads}
          change={stats.conversionRate}
          changeLabel="Conversion"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          }
          iconBg="bg-emerald-50 text-emerald-600"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Leads */}
        <Card variant="glass" padding="none" className="lg:col-span-2">
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Neueste Leads</h2>
              <Link
                href="/dashboard/leads"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
              >
                Alle anzeigen
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>

          {stats.recentLeads.length === 0 ? (
            <EmptyState
              icon={<LeadsIcon className="w-8 h-8" />}
              title="Noch keine Leads"
              description="Richten Sie das Widget ein oder erstellen Sie Ihren ersten Lead manuell."
              action={
                <Link href="/dashboard/widget">
                  <Button variant="secondary" size="sm">
                    Widget einrichten
                  </Button>
                </Link>
              }
            />
          ) : (
            <div className="divide-y divide-slate-100">
              {stats.recentLeads.map((lead) => (
                <LeadListItem key={lead.id} lead={lead} />
              ))}
            </div>
          )}
        </Card>

        {/* Status Distribution */}
        <Card variant="glass">
          <h2 className="text-lg font-semibold text-slate-900 mb-6">Status Verteilung</h2>

          {Object.keys(stats.leadsByStatus).length === 0 ? (
            <p className="text-slate-500 text-center py-8">Keine Daten</p>
          ) : (
            <div className="space-y-4">
              {Object.entries(stats.leadsByStatus).map(([status, count]) => {
                const percentage = stats.totalLeads > 0
                  ? Math.round((count / stats.totalLeads) * 100)
                  : 0;

                const colors: Record<string, string> = {
                  new: 'bg-blue-500',
                  replied: 'bg-amber-500',
                  qualified: 'bg-emerald-500',
                  offer_sent: 'bg-purple-500',
                  won: 'bg-green-600',
                  lost: 'bg-red-500',
                  unsubscribed: 'bg-slate-400',
                };

                const labels: Record<string, string> = {
                  new: 'Neu',
                  replied: 'Beantwortet',
                  qualified: 'Qualifiziert',
                  offer_sent: 'Angebot',
                  won: 'Gewonnen',
                  lost: 'Verloren',
                  unsubscribed: 'Abgemeldet',
                };

                return (
                  <div key={status}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-700">
                        {labels[status] || status}
                      </span>
                      <span className="text-sm text-slate-500">
                        {count} ({percentage}%)
                      </span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${colors[status] || 'bg-slate-400'}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* Quick Actions */}
      <Card variant="glass">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Schnellzugriff</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickActionCard
            href="/dashboard/campaigns/new"
            icon={<CampaignsIcon className="w-5 h-5" />}
            iconBg="bg-blue-100 text-blue-600"
            title="Kampagne erstellen"
            description="E-Mail-Sequenz starten"
          />
          <QuickActionCard
            href="/dashboard/widget"
            icon={<WidgetIcon className="w-5 h-5" />}
            iconBg="bg-emerald-100 text-emerald-600"
            title="Widget einbinden"
            description="Kontaktformular erstellen"
          />
          <QuickActionCard
            href="/dashboard/analytics"
            icon={<AnalyticsIcon className="w-5 h-5" />}
            iconBg="bg-purple-100 text-purple-600"
            title="Analytics"
            description="Performance analysieren"
          />
          <QuickActionCard
            href="/dashboard/leads"
            icon={<LeadsIcon className="w-5 h-5" />}
            iconBg="bg-amber-100 text-amber-600"
            title="Leads verwalten"
            description="Alle Kontakte anzeigen"
          />
        </div>
      </Card>
    </div>
  );
}

// ============================================
// LEAD LIST ITEM
// ============================================

function LeadListItem({ lead }: { lead: Lead }) {
  return (
    <Link
      href={`/dashboard/leads/${lead.id}`}
      className="flex items-center justify-between p-4 hover:bg-slate-50/50 transition-colors group"
    >
      <div className="flex items-center gap-4 min-w-0">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-600 font-medium flex-shrink-0">
          {getInitials(lead.name, lead.email)}
        </div>
        <div className="min-w-0">
          <p className="font-medium text-slate-900 truncate group-hover:text-blue-600 transition-colors">
            {lead.name || 'Unbekannt'}
          </p>
          <p className="text-sm text-slate-500 truncate">{lead.email}</p>
        </div>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        <span className="text-xs text-slate-400 hidden sm:block">
          {formatRelativeTime(lead.created_at)}
        </span>
        <SourceBadge source={lead.source} />
        <StatusBadge status={lead.status} />
      </div>
    </Link>
  );
}

// ============================================
// QUICK ACTION CARD
// ============================================

interface QuickActionCardProps {
  href: string;
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  description: string;
}

function QuickActionCard({ href, icon, iconBg, title, description }: QuickActionCardProps) {
  return (
    <Link href={href} className="group">
      <div className="p-4 rounded-xl border border-slate-200 hover:border-blue-200 hover:bg-blue-50/30 transition-all">
        <div className={`w-10 h-10 rounded-lg ${iconBg} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
        <h3 className="font-medium text-slate-900 group-hover:text-blue-600 transition-colors">
          {title}
        </h3>
        <p className="text-sm text-slate-500 mt-1">{description}</p>
      </div>
    </Link>
  );
}

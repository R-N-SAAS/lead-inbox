'use client';

import { useEffect, useState, useMemo } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import {
  Card,
  StatCard,
  Button,
  Dropdown,
  Skeleton,
  EmptyState,
} from '@/components/ui';
import {
  AnalyticsIcon,
  LeadsIcon,
  CampaignsIcon,
  TrendUpIcon,
  TrendDownIcon,
  RefreshIcon,
  DownloadIcon,
  CalendarIcon,
} from '@/components/common/Icons';
import { Lead, Campaign } from '@/types';
import { formatNumber, formatPercent, cn } from '@/lib/utils';

// ============================================
// CHART COMPONENTS (Simple SVG-based)
// ============================================

interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

// Simple Bar Chart
function BarChart({ data, height = 200 }: { data: ChartDataPoint[]; height?: number }) {
  const maxValue = Math.max(...data.map((d) => d.value), 1);
  
  return (
    <div className="flex items-end justify-between gap-2" style={{ height }}>
      {data.map((item, index) => {
        const barHeight = (item.value / maxValue) * 100;
        return (
          <div key={index} className="flex-1 flex flex-col items-center gap-2">
            <div className="w-full flex flex-col items-center justify-end" style={{ height: height - 40 }}>
              <span className="text-xs font-semibold text-slate-700 mb-1">
                {item.value}
              </span>
              <div
                className="w-full max-w-[40px] rounded-t-lg transition-all duration-500"
                style={{
                  height: `${barHeight}%`,
                  backgroundColor: item.color || '#3b82f6',
                  minHeight: item.value > 0 ? '4px' : '0',
                }}
              />
            </div>
            <span className="text-xs text-slate-500 truncate max-w-full">{item.label}</span>
          </div>
        );
      })}
    </div>
  );
}

// Donut Chart
function DonutChart({ data, size = 160 }: { data: ChartDataPoint[]; size?: number }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const radius = size / 2 - 10;
  const circumference = 2 * Math.PI * radius;
  
  let currentOffset = 0;
  
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#f1f5f9"
          strokeWidth="20"
        />
        {/* Data segments */}
        {data.map((item, index) => {
          const percentage = total > 0 ? item.value / total : 0;
          const strokeLength = circumference * percentage;
          const offset = currentOffset;
          currentOffset += strokeLength;
          
          return (
            <circle
              key={index}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={item.color || '#3b82f6'}
              strokeWidth="20"
              strokeDasharray={`${strokeLength} ${circumference - strokeLength}`}
              strokeDashoffset={-offset}
              className="transition-all duration-500"
            />
          );
        })}
      </svg>
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-slate-900">{total}</span>
        <span className="text-xs text-slate-500">Gesamt</span>
      </div>
    </div>
  );
}

// Line/Area Chart (simplified)
function AreaChart({ data, height = 200 }: { data: { label: string; value: number }[]; height?: number }) {
  if (data.length === 0) return null;
  
  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const minValue = 0;
  const range = maxValue - minValue;
  
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1 || 1)) * 100;
    const y = 100 - ((d.value - minValue) / range) * 100;
    return `${x},${y}`;
  });
  
  const areaPoints = `0,100 ${points.join(' ')} 100,100`;
  const linePoints = points.join(' ');
  
  return (
    <div style={{ height }}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map((y) => (
          <line
            key={y}
            x1="0"
            y1={y}
            x2="100"
            y2={y}
            stroke="#f1f5f9"
            strokeWidth="0.5"
          />
        ))}
        {/* Area fill */}
        <polygon
          points={areaPoints}
          fill="url(#areaGradient)"
          className="transition-all duration-500"
        />
        {/* Line */}
        <polyline
          points={linePoints}
          fill="none"
          stroke="#3b82f6"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          className="transition-all duration-500"
        />
        {/* Gradient definition */}
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.05" />
          </linearGradient>
        </defs>
      </svg>
      {/* X-axis labels */}
      <div className="flex justify-between mt-2">
        {data.filter((_, i) => i === 0 || i === data.length - 1 || i === Math.floor(data.length / 2)).map((d, i) => (
          <span key={i} className="text-xs text-slate-400">{d.label}</span>
        ))}
      </div>
    </div>
  );
}

// Funnel Chart
function FunnelChart({ data }: { data: ChartDataPoint[] }) {
  const maxValue = data[0]?.value || 1;
  
  return (
    <div className="space-y-2">
      {data.map((item, index) => {
        const width = (item.value / maxValue) * 100;
        const conversionRate = index > 0 && data[index - 1].value > 0
          ? ((item.value / data[index - 1].value) * 100).toFixed(0)
          : null;
        
        return (
          <div key={index} className="flex items-center gap-4">
            <div className="w-24 text-sm text-slate-600 text-right">{item.label}</div>
            <div className="flex-1 relative">
              <div className="h-10 bg-slate-100 rounded-lg overflow-hidden">
                <div
                  className="h-full rounded-lg transition-all duration-500 flex items-center justify-end pr-3"
                  style={{
                    width: `${Math.max(width, 10)}%`,
                    backgroundColor: item.color || '#3b82f6',
                  }}
                >
                  <span className="text-sm font-semibold text-white">
                    {item.value}
                  </span>
                </div>
              </div>
              {conversionRate && (
                <span className="absolute -right-12 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                  {conversionRate}%
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ============================================
// TIME RANGE OPTIONS
// ============================================

const TIME_RANGES = [
  { value: '7d', label: 'Letzte 7 Tage' },
  { value: '30d', label: 'Letzte 30 Tage' },
  { value: '90d', label: 'Letzte 90 Tage' },
  { value: 'all', label: 'Gesamter Zeitraum' },
];

// ============================================
// ANALYTICS PAGE
// ============================================

export default function AnalyticsPage() {
  const supabase = createClientComponentClient();
  
  const [leads, setLeads] = useState<Lead[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [leadsRes, campaignsRes] = await Promise.all([
        supabase.from('leads').select('*').order('created_at', { ascending: true }),
        supabase.from('campaigns').select('*').order('created_at', { ascending: false }),
      ]);

      if (leadsRes.error) throw leadsRes.error;
      if (campaignsRes.error) throw campaignsRes.error;

      setLeads(leadsRes.data || []);
      setCampaigns(campaignsRes.data || []);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  }

  // Filter leads by time range
  const filteredLeads = useMemo(() => {
    if (timeRange === 'all') return leads;
    
    const days = parseInt(timeRange);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    
    return leads.filter((lead) => new Date(lead.created_at) >= cutoff);
  }, [leads, timeRange]);

  // Calculate KPIs
  const kpis = useMemo(() => {
    const total = filteredLeads.length;
    const newLeads = filteredLeads.filter((l) => l.status === 'new').length;
    const qualified = filteredLeads.filter((l) => l.status === 'qualified').length;
    const won = filteredLeads.filter((l) => l.status === 'won').length;
    const lost = filteredLeads.filter((l) => l.status === 'lost').length;
    
    const conversionRate = total > 0 ? (won / total) * 100 : 0;
    const qualificationRate = total > 0 ? (qualified / total) * 100 : 0;
    
    // Calculate previous period for comparison
    const days = timeRange === 'all' ? 9999 : parseInt(timeRange);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days * 2);
    const midpoint = new Date();
    midpoint.setDate(midpoint.getDate() - days);
    
    const previousLeads = leads.filter((lead) => {
      const date = new Date(lead.created_at);
      return date >= cutoff && date < midpoint;
    });
    
    const change = previousLeads.length > 0
      ? ((filteredLeads.length - previousLeads.length) / previousLeads.length) * 100
      : filteredLeads.length > 0 ? 100 : 0;

    return {
      total,
      newLeads,
      qualified,
      won,
      lost,
      conversionRate,
      qualificationRate,
      change,
    };
  }, [filteredLeads, leads, timeRange]);

  // Leads over time
  const leadsOverTime = useMemo(() => {
    const grouped: Record<string, number> = {};
    const days = timeRange === 'all' ? 30 : parseInt(timeRange);
    
    // Initialize all days
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const key = date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
      grouped[key] = 0;
    }
    
    // Count leads per day
    filteredLeads.forEach((lead) => {
      const date = new Date(lead.created_at);
      const key = date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
      if (grouped[key] !== undefined) {
        grouped[key]++;
      }
    });
    
    return Object.entries(grouped).map(([label, value]) => ({ label, value }));
  }, [filteredLeads, timeRange]);

  // Status distribution
  const statusDistribution = useMemo(() => {
    const counts: Record<string, number> = {
      new: 0,
      replied: 0,
      qualified: 0,
      offer_sent: 0,
      won: 0,
      lost: 0,
    };
    
    filteredLeads.forEach((lead) => {
      if (counts[lead.status] !== undefined) {
        counts[lead.status]++;
      }
    });
    
    const colors: Record<string, string> = {
      new: '#3b82f6',
      replied: '#f59e0b',
      qualified: '#10b981',
      offer_sent: '#8b5cf6',
      won: '#059669',
      lost: '#ef4444',
    };
    
    const labels: Record<string, string> = {
      new: 'Neu',
      replied: 'Beantwortet',
      qualified: 'Qualifiziert',
      offer_sent: 'Angebot',
      won: 'Gewonnen',
      lost: 'Verloren',
    };
    
    return Object.entries(counts)
      .filter(([_, value]) => value > 0)
      .map(([status, value]) => ({
        label: labels[status],
        value,
        color: colors[status],
      }));
  }, [filteredLeads]);

  // Source distribution
  const sourceDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    
    filteredLeads.forEach((lead) => {
      const source = lead.source || 'unknown';
      counts[source] = (counts[source] || 0) + 1;
    });
    
    const colors: Record<string, string> = {
      web_form: '#3b82f6',
      widget: '#10b981',
      scraper: '#8b5cf6',
      manual: '#f59e0b',
      api: '#06b6d4',
      import: '#64748b',
      unknown: '#94a3b8',
    };
    
    const labels: Record<string, string> = {
      web_form: 'Website',
      widget: 'Widget',
      scraper: 'Scraper',
      manual: 'Manuell',
      api: 'API',
      import: 'Import',
      unknown: 'Unbekannt',
    };
    
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([source, value]) => ({
        label: labels[source] || source,
        value,
        color: colors[source] || '#94a3b8',
      }));
  }, [filteredLeads]);

  // Conversion funnel
  const funnelData = useMemo(() => {
    return [
      { label: 'Alle Leads', value: kpis.total, color: '#3b82f6' },
      { label: 'Kontaktiert', value: kpis.total - kpis.newLeads, color: '#f59e0b' },
      { label: 'Qualifiziert', value: kpis.qualified + kpis.won, color: '#10b981' },
      { label: 'Gewonnen', value: kpis.won, color: '#059669' },
    ];
  }, [kpis]);

  // Campaign stats
  const campaignStats = useMemo(() => {
    const totalSent = campaigns.reduce((sum, c) => sum + (c.stats?.sent || 0), 0);
    const totalOpened = campaigns.reduce((sum, c) => sum + (c.stats?.opened || 0), 0);
    const totalClicked = campaigns.reduce((sum, c) => sum + (c.stats?.clicked || 0), 0);
    const totalReplied = campaigns.reduce((sum, c) => sum + (c.stats?.replied || 0), 0);
    
    return {
      totalCampaigns: campaigns.length,
      activeCampaigns: campaigns.filter((c) => c.status === 'active').length,
      totalSent,
      totalOpened,
      totalClicked,
      totalReplied,
      openRate: totalSent > 0 ? (totalOpened / totalSent) * 100 : 0,
      clickRate: totalOpened > 0 ? (totalClicked / totalOpened) * 100 : 0,
      replyRate: totalSent > 0 ? (totalReplied / totalSent) * 100 : 0,
    };
  }, [campaigns]);

  if (loading) {
    return <AnalyticsSkeleton />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
          <p className="text-slate-500 mt-1">
            Performance-Übersicht und Auswertungen
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Dropdown
            options={TIME_RANGES}
            value={timeRange}
            onChange={setTimeRange}
            placeholder="Zeitraum"
          />
          <Button
            variant="secondary"
            size="sm"
            onClick={loadData}
            icon={<RefreshIcon className="w-4 h-4" />}
          >
            <span className="hidden sm:inline">Aktualisieren</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Leads gesamt"
          value={kpis.total}
          change={kpis.change}
          icon={<LeadsIcon className="w-6 h-6" />}
          iconBg="bg-blue-100 text-blue-600"
        />
        <StatCard
          label="Qualifizierungsrate"
          value={`${kpis.qualificationRate.toFixed(1)}%`}
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          iconBg="bg-amber-100 text-amber-600"
        />
        <StatCard
          label="Conversion Rate"
          value={`${kpis.conversionRate.toFixed(1)}%`}
          icon={<TrendUpIcon className="w-6 h-6" />}
          iconBg="bg-emerald-100 text-emerald-600"
        />
        <StatCard
          label="Gewonnen"
          value={kpis.won}
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          }
          iconBg="bg-purple-100 text-purple-600"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leads Over Time */}
        <Card variant="glass">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-slate-900">Lead-Entwicklung</h3>
            <span className="text-sm text-slate-500">
              {TIME_RANGES.find((r) => r.value === timeRange)?.label}
            </span>
          </div>
          {leadsOverTime.length > 0 ? (
            <AreaChart data={leadsOverTime} height={200} />
          ) : (
            <div className="h-[200px] flex items-center justify-center text-slate-400">
              Keine Daten verfügbar
            </div>
          )}
        </Card>

        {/* Conversion Funnel */}
        <Card variant="glass">
          <h3 className="font-semibold text-slate-900 mb-6">Conversion Funnel</h3>
          {kpis.total > 0 ? (
            <FunnelChart data={funnelData} />
          ) : (
            <div className="h-[200px] flex items-center justify-center text-slate-400">
              Keine Daten verfügbar
            </div>
          )}
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Distribution */}
        <Card variant="glass">
          <h3 className="font-semibold text-slate-900 mb-6">Status-Verteilung</h3>
          <div className="flex items-center justify-center">
            {statusDistribution.length > 0 ? (
              <div className="flex flex-col items-center gap-4">
                <DonutChart data={statusDistribution} size={160} />
                <div className="flex flex-wrap justify-center gap-3">
                  {statusDistribution.map((item) => (
                    <div key={item.label} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-xs text-slate-600">
                        {item.label} ({item.value})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-slate-400">
                Keine Daten
              </div>
            )}
          </div>
        </Card>

        {/* Source Distribution */}
        <Card variant="glass">
          <h3 className="font-semibold text-slate-900 mb-6">Lead-Quellen</h3>
          {sourceDistribution.length > 0 ? (
            <BarChart data={sourceDistribution} height={200} />
          ) : (
            <div className="h-[200px] flex items-center justify-center text-slate-400">
              Keine Daten
            </div>
          )}
        </Card>

        {/* Campaign Performance */}
        <Card variant="glass">
          <h3 className="font-semibold text-slate-900 mb-6">Kampagnen-Performance</h3>
          <div className="space-y-4">
            <MetricRow
              label="E-Mails gesendet"
              value={campaignStats.totalSent.toLocaleString('de-DE')}
            />
            <MetricRow
              label="Öffnungsrate"
              value={`${campaignStats.openRate.toFixed(1)}%`}
              highlight={campaignStats.openRate > 20}
            />
            <MetricRow
              label="Klickrate"
              value={`${campaignStats.clickRate.toFixed(1)}%`}
              highlight={campaignStats.clickRate > 5}
            />
            <MetricRow
              label="Antwortrate"
              value={`${campaignStats.replyRate.toFixed(1)}%`}
              highlight={campaignStats.replyRate > 2}
            />
            <div className="pt-4 border-t border-slate-100">
              <MetricRow
                label="Aktive Kampagnen"
                value={`${campaignStats.activeCampaigns} / ${campaignStats.totalCampaigns}`}
              />
            </div>
          </div>
        </Card>
      </div>

      {/* Top Leads Table */}
      <Card variant="glass">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-slate-900">Neueste Leads</h3>
          <Button variant="ghost" size="sm" href="/dashboard/leads">
            Alle anzeigen
          </Button>
        </div>
        {filteredLeads.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left">
                  <th className="pb-3 text-xs font-semibold text-slate-500 uppercase">Name</th>
                  <th className="pb-3 text-xs font-semibold text-slate-500 uppercase">E-Mail</th>
                  <th className="pb-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
                  <th className="pb-3 text-xs font-semibold text-slate-500 uppercase">Quelle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLeads.slice(-5).reverse().map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50/50">
                    <td className="py-3 font-medium text-slate-900">
                      {lead.name || 'Unbekannt'}
                    </td>
                    <td className="py-3 text-slate-500">{lead.email}</td>
                    <td className="py-3">
                      <StatusDot status={lead.status} />
                    </td>
                    <td className="py-3 text-slate-500 text-sm">{lead.source || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={<LeadsIcon className="w-8 h-8" />}
            title="Keine Leads"
            description="Im ausgewählten Zeitraum wurden keine Leads erfasst"
          />
        )}
      </Card>
    </div>
  );
}

// ============================================
// HELPER COMPONENTS
// ============================================

function MetricRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-slate-600">{label}</span>
      <span className={cn(
        'font-semibold',
        highlight ? 'text-emerald-600' : 'text-slate-900'
      )}>
        {value}
      </span>
    </div>
  );
}

function StatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    new: 'bg-blue-500',
    replied: 'bg-amber-500',
    qualified: 'bg-emerald-500',
    offer_sent: 'bg-purple-500',
    won: 'bg-green-600',
    lost: 'bg-red-500',
  };

  const labels: Record<string, string> = {
    new: 'Neu',
    replied: 'Beantwortet',
    qualified: 'Qualifiziert',
    offer_sent: 'Angebot',
    won: 'Gewonnen',
    lost: 'Verloren',
  };

  return (
    <div className="flex items-center gap-2">
      <div className={cn('w-2 h-2 rounded-full', colors[status] || 'bg-slate-400')} />
      <span className="text-sm text-slate-600">{labels[status] || status}</span>
    </div>
  );
}

function AnalyticsSkeleton() {
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
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-72 rounded-2xl" />
        <Skeleton className="h-72 rounded-2xl" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Skeleton className="h-64 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    </div>
  );
}

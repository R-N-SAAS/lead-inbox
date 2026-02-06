'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import {
  Card,
  Button,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui';
import {
  ChevronRightIcon,
  MailIcon,
  LeadsIcon,
  CheckIcon,
} from '@/components/common/Icons';
import { cn } from '@/lib/utils';

// ============================================
// STEPS
// ============================================

const STEPS = [
  { id: 'basics', label: 'Grundlagen', icon: '1' },
  { id: 'content', label: 'Inhalt', icon: '2' },
  { id: 'recipients', label: 'Empfänger', icon: '3' },
  { id: 'review', label: 'Überprüfen', icon: '4' },
];

// ============================================
// NEW CAMPAIGN PAGE
// ============================================

export default function NewCampaignPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    from_name: '',
    from_email: '',
    reply_to: '',
    body_text: '',
    body_html: '',
    recipients: [] as string[],
    selectedLeads: [] as string[],
    schedule: 'now' as 'now' | 'later',
    scheduled_at: '',
  });

  const updateForm = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  // Navigation
  const canGoNext = () => {
    switch (currentStep) {
      case 0:
        return formData.name && formData.subject && formData.from_name && formData.from_email;
      case 1:
        return formData.body_text || formData.body_html;
      case 2:
        return formData.selectedLeads.length > 0;
      default:
        return true;
    }
  };

  const goNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Save Campaign
  async function handleSave(asDraft = true) {
    setError('');
    setSaving(true);

    try {
      const campaign = {
        name: formData.name,
        subject: formData.subject,
        from_name: formData.from_name,
        from_email: formData.from_email,
        reply_to: formData.reply_to || formData.from_email,
        body_text: formData.body_text,
        body_html: formData.body_html || `<p>${formData.body_text.replace(/\n/g, '</p><p>')}</p>`,
        status: asDraft ? 'draft' : 'active',
        scheduled_at: formData.schedule === 'later' ? formData.scheduled_at : null,
        stats: {
          total_recipients: formData.selectedLeads.length,
          sent: 0,
          opened: 0,
          clicked: 0,
          replied: 0,
          bounced: 0,
          unsubscribed: 0,
        },
        created_at: new Date().toISOString(),
      };

      const { data, error: insertError } = await supabase
        .from('campaigns')
        .insert(campaign)
        .select()
        .single();

      if (insertError) throw insertError;

      // Add recipients
      if (formData.selectedLeads.length > 0 && data) {
        const recipients = formData.selectedLeads.map((leadId) => ({
          campaign_id: data.id,
          lead_id: leadId,
          status: 'pending',
          created_at: new Date().toISOString(),
        }));

        const { error: recipientError } = await supabase
          .from('campaign_recipients')
          .insert(recipients);

        if (recipientError) {
          console.error('Error adding recipients:', recipientError);
        }
      }

      router.push(`/dashboard/campaigns/${data.id}`);
    } catch (err: any) {
      console.error('Error creating campaign:', err);
      setError(err.message || 'Fehler beim Erstellen der Kampagne');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-2 text-sm">
        <Link href="/dashboard/campaigns" className="text-slate-500 hover:text-slate-700">
          Kampagnen
        </Link>
        <ChevronRightIcon className="w-4 h-4 text-slate-400" />
        <span className="text-slate-900 font-medium">Neue Kampagne</span>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-2 py-4">
        {STEPS.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <button
              onClick={() => index < currentStep && setCurrentStep(index)}
              disabled={index > currentStep}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all',
                index === currentStep
                  ? 'bg-blue-500 text-slate-900'
                  : index < currentStep
                  ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  : 'bg-slate-100 text-slate-400'
              )}
            >
              {index < currentStep ? (
                <CheckIcon className="w-4 h-4" />
              ) : (
                <span className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-xs">
                  {step.icon}
                </span>
              )}
              <span className="hidden sm:inline">{step.label}</span>
            </button>
            {index < STEPS.length - 1 && (
              <div className={cn(
                'w-8 h-0.5 mx-2',
                index < currentStep ? 'bg-blue-300' : 'bg-slate-200'
              )} />
            )}
          </div>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Step Content */}
      <Card variant="default" padding="lg">
        {/* Step 1: Basics */}
        {currentStep === 0 && (
          <BasicsStep formData={formData} updateForm={updateForm} />
        )}

        {/* Step 2: Content */}
        {currentStep === 1 && (
          <ContentStep formData={formData} updateForm={updateForm} />
        )}

        {/* Step 3: Recipients */}
        {currentStep === 2 && (
          <RecipientsStep formData={formData} updateForm={updateForm} />
        )}

        {/* Step 4: Review */}
        {currentStep === 3 && (
          <ReviewStep formData={formData} />
        )}
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="secondary"
          onClick={goBack}
          disabled={currentStep === 0}
        >
          Zurück
        </Button>
        
        <div className="flex items-center gap-3">
          {currentStep === STEPS.length - 1 ? (
            <>
              <Button
                variant="secondary"
                onClick={() => handleSave(true)}
                loading={saving}
              >
                Als Entwurf speichern
              </Button>
              <Button
                onClick={() => handleSave(false)}
                loading={saving}
              >
                Kampagne starten
              </Button>
            </>
          ) : (
            <Button onClick={goNext} disabled={!canGoNext()}>
              Weiter
              <ChevronRightIcon className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================
// STEP 1: BASICS
// ============================================

interface StepProps {
  formData: any;
  updateForm: (key: string, value: any) => void;
}

function BasicsStep({ formData, updateForm }: StepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900 mb-2">Grundlagen</h2>
        <p className="text-slate-500">Geben Sie die grundlegenden Informationen für Ihre Kampagne ein.</p>
      </div>

      <div className="grid gap-6">
        {/* Campaign Name */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Kampagnenname *
          </label>
          <input
            type="text"
            placeholder="z.B. Newsletter Januar 2024"
            value={formData.name}
            onChange={(e) => updateForm('name', e.target.value)}
            className="w-full px-4 py-3 bg-white/70 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
          <p className="text-xs text-slate-400 mt-1">Nur für interne Verwendung</p>
        </div>

        {/* Subject */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Betreffzeile *
          </label>
          <input
            type="text"
            placeholder="z.B. Ihr Angebot von [Firma]"
            value={formData.subject}
            onChange={(e) => updateForm('subject', e.target.value)}
            className="w-full px-4 py-3 bg-white/70 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
          <p className="text-xs text-slate-400 mt-1">
            Verfügbare Variablen: {'{{name}}'}, {'{{email}}'}, {'{{firma}}'}
          </p>
        </div>

        {/* From Name & Email */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Absendername *
            </label>
            <input
              type="text"
              placeholder="Max Mustermann"
              value={formData.from_name}
              onChange={(e) => updateForm('from_name', e.target.value)}
              className="w-full px-4 py-3 bg-white/70 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Absender-E-Mail *
            </label>
            <input
              type="email"
              placeholder="max@firma.de"
              value={formData.from_email}
              onChange={(e) => updateForm('from_email', e.target.value)}
              className="w-full px-4 py-3 bg-white/70 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        {/* Reply To */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Antwort-Adresse (optional)
          </label>
          <input
            type="email"
            placeholder="Gleich wie Absender-E-Mail"
            value={formData.reply_to}
            onChange={(e) => updateForm('reply_to', e.target.value)}
            className="w-full px-4 py-3 bg-white/70 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>
    </div>
  );
}

// ============================================
// STEP 2: CONTENT
// ============================================

function ContentStep({ formData, updateForm }: StepProps) {
  const [previewMode, setPreviewMode] = useState<'edit' | 'preview'>('edit');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">E-Mail-Inhalt</h2>
          <p className="text-slate-500">Verfassen Sie den Inhalt Ihrer E-Mail.</p>
        </div>
        <div className="flex bg-slate-100 rounded-lg p-1">
          <button
            onClick={() => setPreviewMode('edit')}
            className={cn(
              'px-4 py-2 rounded-md text-sm font-medium transition-all',
              previewMode === 'edit' ? 'bg-white shadow text-slate-900' : 'text-slate-500'
            )}
          >
            Bearbeiten
          </button>
          <button
            onClick={() => setPreviewMode('preview')}
            className={cn(
              'px-4 py-2 rounded-md text-sm font-medium transition-all',
              previewMode === 'preview' ? 'bg-white shadow text-slate-900' : 'text-slate-500'
            )}
          >
            Vorschau
          </button>
        </div>
      </div>

      {previewMode === 'edit' ? (
        <div className="space-y-4">
          {/* Template Variables */}
          <div className="flex flex-wrap gap-2 p-3 bg-blue-50 rounded-xl">
            <span className="text-sm text-blue-700 font-medium">Variablen:</span>
            {['{{name}}', '{{email}}', '{{firma}}', '{{telefon}}'].map((v) => (
              <button
                key={v}
                onClick={() => updateForm('body_text', formData.body_text + ' ' + v)}
                className="px-2 py-1 bg-white rounded text-xs font-mono text-blue-600 hover:bg-blue-100 transition-colors"
              >
                {v}
              </button>
            ))}
          </div>

          {/* Text Editor */}
          <textarea
            value={formData.body_text}
            onChange={(e) => updateForm('body_text', e.target.value)}
            rows={15}
            placeholder="Guten Tag {{name}},&#10;&#10;vielen Dank für Ihr Interesse an unseren Leistungen...&#10;&#10;Mit freundlichen Grüßen"
            className="w-full px-4 py-3 bg-white/70 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 resize-none font-mono text-sm"
          />
        </div>
      ) : (
        /* Preview */
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <div className="bg-slate-100 px-4 py-3 border-b border-slate-200">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium text-slate-700">Von:</span>
              <span className="text-slate-500">
                {formData.from_name} &lt;{formData.from_email}&gt;
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm mt-1">
              <span className="font-medium text-slate-700">Betreff:</span>
              <span className="text-slate-500">{formData.subject || '(Kein Betreff)'}</span>
            </div>
          </div>
          <div className="p-6 bg-white min-h-[300px]">
            <div className="prose prose-sm max-w-none whitespace-pre-wrap">
              {formData.body_text || 'Kein Inhalt'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// STEP 3: RECIPIENTS
// ============================================

function RecipientsStep({ formData, updateForm }: StepProps) {
  const supabase = createClientComponentClient();
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useState(() => {
    loadLeads();
  });

  async function loadLeads() {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('id, name, email, status, source')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLeads(data || []);
    } catch (error) {
      console.error('Error loading leads:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredLeads = leads.filter((lead) => {
    if (filter === 'all') return true;
    return lead.status === filter;
  });

  const toggleLead = (leadId: string) => {
    const selected = formData.selectedLeads.includes(leadId)
      ? formData.selectedLeads.filter((id: string) => id !== leadId)
      : [...formData.selectedLeads, leadId];
    updateForm('selectedLeads', selected);
  };

  const selectAll = () => {
    updateForm('selectedLeads', filteredLeads.map((l) => l.id));
  };

  const deselectAll = () => {
    updateForm('selectedLeads', []);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900 mb-2">Empfänger auswählen</h2>
        <p className="text-slate-500">Wählen Sie die Leads aus, die diese Kampagne erhalten sollen.</p>
      </div>

      {/* Selection Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-400"
          >
            <option value="all">Alle Status</option>
            <option value="new">Neu</option>
            <option value="replied">Beantwortet</option>
            <option value="qualified">Qualifiziert</option>
          </select>
          <span className="text-sm text-slate-500">
            {formData.selectedLeads.length} von {filteredLeads.length} ausgewählt
          </span>
        </div>
        <div className="flex gap-2">
          <button onClick={selectAll} className="text-sm text-blue-600 hover:text-blue-700">
            Alle auswählen
          </button>
          <span className="text-slate-300">|</span>
          <button onClick={deselectAll} className="text-sm text-slate-500 hover:text-slate-700">
            Auswahl aufheben
          </button>
        </div>
      </div>

      {/* Leads List */}
      <div className="border border-slate-200 rounded-xl overflow-hidden max-h-[400px] overflow-y-auto">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Lade Leads...</div>
        ) : filteredLeads.length === 0 ? (
          <div className="p-8 text-center text-slate-500">Keine Leads gefunden</div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-50 sticky top-0">
              <tr>
                <th className="w-12 px-4 py-3"></th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Name</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">E-Mail</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLeads.map((lead) => (
                <tr
                  key={lead.id}
                  onClick={() => toggleLead(lead.id)}
                  className={cn(
                    'cursor-pointer transition-colors',
                    formData.selectedLeads.includes(lead.id)
                      ? 'bg-blue-50'
                      : 'hover:bg-slate-50'
                  )}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={formData.selectedLeads.includes(lead.id)}
                      onChange={() => toggleLead(lead.id)}
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {lead.name || 'Unbekannt'}
                  </td>
                  <td className="px-4 py-3 text-slate-500">{lead.email}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-1 bg-slate-100 rounded-full text-slate-600">
                      {lead.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ============================================
// STEP 4: REVIEW
// ============================================

function ReviewStep({ formData }: { formData: any }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900 mb-2">Überprüfen & Starten</h2>
        <p className="text-slate-500">Überprüfen Sie Ihre Kampagne vor dem Start.</p>
      </div>

      <div className="grid gap-4">
        {/* Summary Cards */}
        <div className="grid sm:grid-cols-3 gap-4">
          <SummaryCard
            icon={<MailIcon className="w-5 h-5" />}
            label="Kampagne"
            value={formData.name || '(Kein Name)'}
          />
          <SummaryCard
            icon={<LeadsIcon className="w-5 h-5" />}
            label="Empfänger"
            value={`${formData.selectedLeads.length} Leads`}
          />
          <SummaryCard
            icon={<CheckIcon className="w-5 h-5" />}
            label="Status"
            value="Bereit zum Start"
            highlight
          />
        </div>

        {/* Details */}
        <Card variant="bordered" padding="md">
          <h3 className="font-semibold text-slate-900 mb-4">Kampagnen-Details</h3>
          <dl className="grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-slate-500">Betreff</dt>
              <dd className="font-medium text-slate-900 mt-1">{formData.subject}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Absender</dt>
              <dd className="font-medium text-slate-900 mt-1">
                {formData.from_name} &lt;{formData.from_email}&gt;
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-slate-500">Antwort an</dt>
              <dd className="font-medium text-slate-900 mt-1">
                {formData.reply_to || formData.from_email}
              </dd>
            </div>
          </dl>
        </Card>

        {/* Preview */}
        <Card variant="bordered" padding="md">
          <h3 className="font-semibold text-slate-900 mb-4">E-Mail-Vorschau</h3>
          <div className="p-4 bg-slate-50 rounded-lg whitespace-pre-wrap text-sm text-slate-700 max-h-[200px] overflow-y-auto">
            {formData.body_text || '(Kein Inhalt)'}
          </div>
        </Card>
      </div>
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className={cn(
      'p-4 rounded-xl border',
      highlight ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'
    )}>
      <div className={cn(
        'w-10 h-10 rounded-lg flex items-center justify-center mb-3',
        highlight ? 'bg-emerald-100 text-emerald-600' : 'bg-white text-slate-500'
      )}>
        {icon}
      </div>
      <p className="text-xs text-slate-500 uppercase tracking-wider">{label}</p>
      <p className={cn(
        'font-semibold mt-1',
        highlight ? 'text-emerald-700' : 'text-slate-900'
      )}>
        {value}
      </p>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button, Card } from '@/components/ui';
import {
  InboxIcon,
  LeadsIcon,
  CampaignsIcon,
  WidgetIcon,
  CheckIcon,
  ChevronRightIcon,
} from '@/components/common/Icons';
import { cn } from '@/lib/utils';

// ============================================
// ONBOARDING STEPS
// ============================================

const STEPS = [
  {
    id: 'welcome',
    title: 'Willkommen bei Lead Inbox',
    subtitle: 'In wenigen Schritten sind Sie startklar',
  },
  {
    id: 'profile',
    title: 'Ihr Profil',
    subtitle: 'Erzählen Sie uns etwas über sich',
  },
  {
    id: 'company',
    title: 'Ihr Unternehmen',
    subtitle: 'Informationen zu Ihrer Firma',
  },
  {
    id: 'goals',
    title: 'Ihre Ziele',
    subtitle: 'Was möchten Sie erreichen?',
  },
  {
    id: 'complete',
    title: 'Alles bereit!',
    subtitle: 'Sie können jetzt loslegen',
  },
];

// ============================================
// ONBOARDING PAGE
// ============================================

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    company_name: '',
    company_website: '',
    company_size: '',
    industry: '',
    goals: [] as string[],
    lead_source: '',
  });

  const updateForm = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const toggleGoal = (goal: string) => {
    const goals = formData.goals.includes(goal)
      ? formData.goals.filter((g) => g !== goal)
      : [...formData.goals, goal];
    updateForm('goals', goals);
  };

  const canGoNext = () => {
    switch (currentStep) {
      case 0: // Welcome
        return true;
      case 1: // Profile
        return formData.name.trim().length > 0;
      case 2: // Company
        return formData.company_name.trim().length > 0;
      case 3: // Goals
        return formData.goals.length > 0;
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

  async function completeOnboarding() {
    setLoading(true);
    
    try {
      // Update user metadata
      await supabase.auth.updateUser({
        data: {
          name: formData.name,
          phone: formData.phone,
          company_name: formData.company_name,
          onboarding_completed: true,
        },
      });

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error) {
      console.error('Error completing onboarding:', error);
    } finally {
      setLoading(false);
    }
  }

  const step = STEPS[currentStep];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {STEPS.map((s, index) => (
              <div key={s.id} className="flex items-center">
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all',
                    index < currentStep
                      ? 'bg-blue-500 text-white'
                      : index === currentStep
                      ? 'bg-blue-500 text-white ring-4 ring-blue-100'
                      : 'bg-slate-200 text-slate-400'
                  )}
                >
                  {index < currentStep ? (
                    <CheckIcon className="w-4 h-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={cn(
                      'w-full h-1 mx-2',
                      index < currentStep ? 'bg-blue-500' : 'bg-slate-200'
                    )}
                    style={{ width: '60px' }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Card */}
        <Card variant="solid" padding="none" className="shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-8 text-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <InboxIcon className="w-6 h-6" />
              </div>
              <span className="font-bold text-xl">Lead Inbox</span>
            </div>
            <h1 className="text-2xl font-bold">{step.title}</h1>
            <p className="text-blue-100 mt-1">{step.subtitle}</p>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Step 0: Welcome */}
            {currentStep === 0 && (
              <div className="text-center py-8">
                <div className="grid grid-cols-3 gap-6 mb-8">
                  <FeatureCard
                    icon={<LeadsIcon className="w-6 h-6" />}
                    title="Leads erfassen"
                    description="Automatisch von Ihrer Website"
                  />
                  <FeatureCard
                    icon={<CampaignsIcon className="w-6 h-6" />}
                    title="E-Mails senden"
                    description="Automatisierte Follow-ups"
                  />
                  <FeatureCard
                    icon={<WidgetIcon className="w-6 h-6" />}
                    title="Widget einbinden"
                    description="Auf jeder Website nutzbar"
                  />
                </div>
                <p className="text-slate-500">
                  Lassen Sie uns Ihr Konto einrichten, damit Sie sofort loslegen können.
                </p>
              </div>
            )}

            {/* Step 1: Profile */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Wie ist Ihr Name? *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => updateForm('name', e.target.value)}
                    placeholder="Max Mustermann"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Telefonnummer (optional)
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => updateForm('phone', e.target.value)}
                    placeholder="+49 123 456789"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Company */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Firmenname *
                  </label>
                  <input
                    type="text"
                    value={formData.company_name}
                    onChange={(e) => updateForm('company_name', e.target.value)}
                    placeholder="Muster GmbH"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Website (optional)
                  </label>
                  <input
                    type="url"
                    value={formData.company_website}
                    onChange={(e) => updateForm('company_website', e.target.value)}
                    placeholder="https://www.beispiel.de"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Teamgröße
                  </label>
                  <div className="grid grid-cols-4 gap-3">
                    {['1-5', '6-20', '21-50', '50+'].map((size) => (
                      <button
                        key={size}
                        onClick={() => updateForm('company_size', size)}
                        className={cn(
                          'py-3 rounded-xl border-2 font-medium transition-all',
                          formData.company_size === size
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-slate-200 hover:border-slate-300'
                        )}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Goals */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <p className="text-slate-600">
                  Wählen Sie Ihre wichtigsten Ziele (mehrere möglich):
                </p>

                <div className="grid grid-cols-2 gap-4">
                  {[
                    { id: 'more_leads', label: 'Mehr Leads generieren', icon: '📈' },
                    { id: 'automate', label: 'Prozesse automatisieren', icon: '⚙️' },
                    { id: 'follow_up', label: 'Follow-ups verbessern', icon: '📧' },
                    { id: 'organize', label: 'Leads besser organisieren', icon: '📁' },
                    { id: 'convert', label: 'Conversion steigern', icon: '🎯' },
                    { id: 'time', label: 'Zeit sparen', icon: '⏱️' },
                  ].map((goal) => (
                    <button
                      key={goal.id}
                      onClick={() => toggleGoal(goal.id)}
                      className={cn(
                        'p-4 rounded-xl border-2 text-left transition-all',
                        formData.goals.includes(goal.id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-slate-200 hover:border-slate-300'
                      )}
                    >
                      <span className="text-2xl mb-2 block">{goal.icon}</span>
                      <span className={cn(
                        'font-medium',
                        formData.goals.includes(goal.id) ? 'text-blue-700' : 'text-slate-700'
                      )}>
                        {goal.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4: Complete */}
            {currentStep === 4 && (
              <div className="text-center py-8">
                <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
                  <CheckIcon className="w-10 h-10 text-emerald-600" />
                </div>
                
                <h2 className="text-xl font-bold text-slate-900 mb-2">
                  Perfekt, {formData.name.split(' ')[0]}!
                </h2>
                <p className="text-slate-500 mb-8">
                  Ihr Konto ist eingerichtet. Hier sind Ihre nächsten Schritte:
                </p>

                <div className="space-y-3 text-left max-w-md mx-auto">
                  <NextStepItem
                    number={1}
                    title="Widget einrichten"
                    description="Binden Sie das Kontaktformular auf Ihrer Website ein"
                  />
                  <NextStepItem
                    number={2}
                    title="Erste Kampagne erstellen"
                    description="Richten Sie eine E-Mail-Sequenz für neue Leads ein"
                  />
                  <NextStepItem
                    number={3}
                    title="Team einladen"
                    description="Fügen Sie Kollegen zu Ihrem Workspace hinzu"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-8 pb-8 flex items-center justify-between">
            {currentStep > 0 && currentStep < 4 ? (
              <Button variant="ghost" onClick={goBack}>
                Zurück
              </Button>
            ) : (
              <div />
            )}
            
            {currentStep < 4 ? (
              <Button onClick={goNext} disabled={!canGoNext()}>
                Weiter
                <ChevronRightIcon className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button onClick={completeOnboarding} loading={loading}>
                Zum Dashboard
                <ChevronRightIcon className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>
        </Card>

        {/* Skip Link */}
        {currentStep < 4 && (
          <p className="text-center mt-6">
            <button
              onClick={() => router.push('/dashboard')}
              className="text-sm text-slate-400 hover:text-slate-600"
            >
              Überspringen und später einrichten
            </button>
          </p>
        )}
      </div>
    </div>
  );
}

// ============================================
// HELPER COMPONENTS
// ============================================

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center">
      <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-3">
        {icon}
      </div>
      <h3 className="font-medium text-slate-900">{title}</h3>
      <p className="text-sm text-slate-500">{description}</p>
    </div>
  );
}

function NextStepItem({
  number,
  title,
  description,
}: {
  number: number;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl">
      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm flex-shrink-0">
        {number}
      </div>
      <div>
        <p className="font-medium text-slate-900">{title}</p>
        <p className="text-sm text-slate-500">{description}</p>
      </div>
    </div>
  );
}

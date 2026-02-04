'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import {
  Card,
  Button,
} from '@/components/ui';
import {
  CopyIcon,
  CheckIcon,
  ExternalLinkIcon,
  WidgetIcon,
} from '@/components/common/Icons';
import { cn } from '@/lib/utils';

// ============================================
// WIDGET CONFIG TYPE
// ============================================

interface WidgetConfig {
  primaryColor: string;
  position: 'left' | 'right';
  greeting: string;
  buttonText: string;
  successMessage: string;
  fields: {
    name: { enabled: boolean; required: boolean; label: string };
    email: { enabled: boolean; required: boolean; label: string };
    phone: { enabled: boolean; required: boolean; label: string };
    message: { enabled: boolean; required: boolean; label: string };
  };
}

const DEFAULT_CONFIG: WidgetConfig = {
  primaryColor: '#ffffff',
  position: 'right',
  greeting: 'Haben Sie Fragen? Wir helfen gerne!',
  buttonText: 'Nachricht senden',
  successMessage: 'Vielen Dank! Wir melden uns schnellstmöglich.',
  fields: {
    name: { enabled: true, required: true, label: 'Name' },
    email: { enabled: true, required: true, label: 'E-Mail' },
    phone: { enabled: true, required: false, label: 'Telefon' },
    message: { enabled: true, required: true, label: 'Nachricht' },
  },
};

// COLOR PALETTE
const COLOR_PRESETS = [
  { value: '#ffffff', label: 'Weiß' },
  { value: '#a3a3a3', label: 'Grau' },
  { value: '#171717', label: 'Schwarz' },
  { value: '#3b82f6', label: 'Blau' },
  { value: '#06b6d4', label: 'Cyan' },
  { value: '#22c55e', label: 'Grün' },
  { value: '#eab308', label: 'Gelb' },
  { value: '#f97316', label: 'Orange' },
  { value: '#ef4444', label: 'Rot' },
  { value: '#ec4899', label: 'Pink' },
  { value: '#a855f7', label: 'Violett' },
  { value: '#6366f1', label: 'Indigo' },
];

// ============================================
// COLOR BUTTON COMPONENT
// ============================================

function ColorButton({ 
  color, 
  isSelected, 
  onClick, 
  label 
}: { 
  color: string; 
  isSelected: boolean; 
  onClick: () => void; 
  label: string;
}) {
  const needsBorder = color === '#ffffff' || color === '#171717' || color === '#000000';
  
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      title={label}
      className={cn(
        'w-10 h-10 rounded-full cursor-pointer transition-all duration-200',
        isSelected && 'ring-2 ring-white ring-offset-2 ring-offset-black scale-110'
      )}
      style={{
        backgroundColor: color,
        border: needsBorder ? '2px solid rgba(255,255,255,0.3)' : 'none',
        boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
      }}
    />
  );
}

// ============================================
// WIDGET PAGE
// ============================================

export default function WidgetPage() {
  const supabase = createClientComponentClient();
  
  const [config, setConfig] = useState<WidgetConfig>(DEFAULT_CONFIG);
  const [orgSlug, setOrgSlug] = useState('');
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  async function loadConfig() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const slug = user.id.substring(0, 8);
        setOrgSlug(slug);
      }
    } catch (error) {
      console.error('Error loading config:', error);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error('Error saving config:', error);
    } finally {
      setSaving(false);
    }
  }

  function handleCopyCode() {
    const code = generateEmbedCode();
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function generateEmbedCode() {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    return `<!-- Lead Inbox Widget -->
<script>
  (function(w,d,s,o,f,js,fjs){
    w['LeadInboxWidget']=o;w[o]=w[o]||function(){(w[o].q=w[o].q||[]).push(arguments)};
    js=d.createElement(s);fjs=d.getElementsByTagName(s)[0];
    js.id=o;js.src=f;js.async=1;fjs.parentNode.insertBefore(js,fjs);
  }(window,document,'script','liw','${baseUrl}/widget/widget.js'));
  liw('init', {
    orgSlug: '${orgSlug}',
    primaryColor: '${config.primaryColor}',
    position: '${config.position}'
  });
</script>`;
  }

  function updateField(
    field: keyof WidgetConfig['fields'],
    key: 'enabled' | 'required' | 'label',
    value: boolean | string
  ) {
    setConfig({
      ...config,
      fields: {
        ...config.fields,
        [field]: {
          ...config.fields[field],
          [key]: value,
        },
      },
    });
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Widget Konfigurator</h1>
          <p className="text-neutral-400 mt-1">
            Passen Sie das Kontaktformular für Ihre Website an
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            onClick={() => setShowPreview(true)}
            icon={<ExternalLinkIcon className="w-4 h-4" />}
          >
            Vorschau
          </Button>
          <Button onClick={handleSave} loading={saving}>
            Speichern
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration Panel */}
        <div className="space-y-6">
          {/* Appearance */}
          <Card variant="glass">
            <h2 className="text-lg font-semibold text-white mb-4">Erscheinungsbild</h2>
            
            {/* Primary Color */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-neutral-300 mb-3">
                Primärfarbe
              </label>
              
              {/* Color Grid using div elements instead of buttons */}
              <div className="flex flex-wrap gap-3 mb-4">
                {COLOR_PRESETS.map((color) => (
                  <ColorButton
                    key={color.value}
                    color={color.value}
                    isSelected={config.primaryColor === color.value}
                    onClick={() => setConfig({ ...config, primaryColor: color.value })}
                    label={color.label}
                  />
                ))}
                
                {/* Custom Color Picker */}
                <div className="relative">
                  <input
                    type="color"
                    value={config.primaryColor}
                    onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
                    className="absolute inset-0 opacity-0 cursor-pointer w-10 h-10"
                  />
                  <div
                    className="w-10 h-10 rounded-full border-2 border-dashed border-neutral-500 flex items-center justify-center text-neutral-400 hover:border-white hover:text-white transition-colors cursor-pointer"
                    title="Eigene Farbe wählen"
                  >
                    <span className="text-lg font-bold">+</span>
                  </div>
                </div>
              </div>

              {/* Selected Color Display */}
              <div className="flex items-center gap-3 p-3 bg-neutral-900/50 rounded-xl border border-white/10">
                <div 
                  className="w-10 h-10 rounded-full"
                  style={{ 
                    backgroundColor: config.primaryColor,
                    border: config.primaryColor === '#171717' || config.primaryColor === '#ffffff' || config.primaryColor === '#000000'
                      ? '2px solid rgba(255,255,255,0.3)' 
                      : 'none',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                  }}
                />
                <div>
                  <p className="text-sm font-medium text-white">
                    {COLOR_PRESETS.find(c => c.value === config.primaryColor)?.label || 'Eigene Farbe'}
                  </p>
                  <p className="text-xs text-neutral-500 font-mono uppercase">{config.primaryColor}</p>
                </div>
              </div>
            </div>

            {/* Position */}
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-3">
                Position
              </label>
              <div className="flex gap-3">
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setConfig({ ...config, position: 'left' })}
                  onKeyDown={(e) => e.key === 'Enter' && setConfig({ ...config, position: 'left' })}
                  className={cn(
                    'flex-1 p-4 rounded-xl border transition-all text-center cursor-pointer',
                    config.position === 'left'
                      ? 'border-white/30 bg-white/10 text-white'
                      : 'border-white/10 bg-white/5 text-neutral-400 hover:bg-white/10 hover:text-white'
                  )}
                >
                  <span className="block text-sm font-medium uppercase tracking-wide">Links unten</span>
                </div>
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setConfig({ ...config, position: 'right' })}
                  onKeyDown={(e) => e.key === 'Enter' && setConfig({ ...config, position: 'right' })}
                  className={cn(
                    'flex-1 p-4 rounded-xl border transition-all text-center cursor-pointer',
                    config.position === 'right'
                      ? 'border-white/30 bg-white/10 text-white'
                      : 'border-white/10 bg-white/5 text-neutral-400 hover:bg-white/10 hover:text-white'
                  )}
                >
                  <span className="block text-sm font-medium uppercase tracking-wide">Rechts unten</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Texts */}
          <Card variant="glass">
            <h2 className="text-lg font-semibold text-white mb-4">Texte</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Begrüßungstext
                </label>
                <input
                  type="text"
                  value={config.greeting}
                  onChange={(e) => setConfig({ ...config, greeting: e.target.value })}
                  className="w-full px-4 py-3 bg-neutral-900/50 border border-white/10 rounded-xl text-white placeholder:text-neutral-600 focus:outline-none focus:border-white/30 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Button-Text
                </label>
                <input
                  type="text"
                  value={config.buttonText}
                  onChange={(e) => setConfig({ ...config, buttonText: e.target.value })}
                  className="w-full px-4 py-3 bg-neutral-900/50 border border-white/10 rounded-xl text-white placeholder:text-neutral-600 focus:outline-none focus:border-white/30 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Erfolgsmeldung
                </label>
                <input
                  type="text"
                  value={config.successMessage}
                  onChange={(e) => setConfig({ ...config, successMessage: e.target.value })}
                  className="w-full px-4 py-3 bg-neutral-900/50 border border-white/10 rounded-xl text-white placeholder:text-neutral-600 focus:outline-none focus:border-white/30 transition-colors"
                />
              </div>
            </div>
          </Card>

          {/* Fields */}
          <Card variant="glass">
            <h2 className="text-lg font-semibold text-white mb-4">Formularfelder</h2>
            
            <div className="space-y-3">
              {(Object.keys(config.fields) as Array<keyof WidgetConfig['fields']>).map((field) => (
                <div
                  key={field}
                  className="flex items-center justify-between p-4 bg-neutral-900/50 rounded-xl border border-white/5"
                >
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.fields[field].enabled}
                      onChange={(e) => updateField(field, 'enabled', e.target.checked)}
                      className="w-4 h-4 rounded bg-neutral-800 border-neutral-600 text-white focus:ring-white/20"
                    />
                    <span className="font-medium text-white">
                      {config.fields[field].label}
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.fields[field].required}
                      onChange={(e) => updateField(field, 'required', e.target.checked)}
                      disabled={!config.fields[field].enabled}
                      className="w-4 h-4 rounded bg-neutral-800 border-neutral-600 text-white focus:ring-white/20 disabled:opacity-30"
                    />
                    <span className="text-sm text-neutral-400">Pflichtfeld</span>
                  </label>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Preview & Code Panel */}
        <div className="space-y-6">
          {/* Live Preview */}
          <Card variant="glass" padding="none" className="overflow-hidden">
            <div className="px-6 py-4 border-b border-white/10">
              <h2 className="font-semibold text-white">Live-Vorschau</h2>
            </div>
            <div className="p-6 bg-neutral-900/50 min-h-[400px] relative">
              <div
                className={cn(
                  'absolute bottom-4',
                  config.position === 'left' ? 'left-4' : 'right-4'
                )}
              >
                <WidgetPreview config={config} />
              </div>
            </div>
          </Card>

          {/* Embed Code */}
          <Card variant="glass">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Einbettungscode</h2>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleCopyCode}
                icon={copied ? <CheckIcon className="w-4 h-4 text-emerald-400" /> : <CopyIcon className="w-4 h-4" />}
              >
                {copied ? 'Kopiert!' : 'Kopieren'}
              </Button>
            </div>
            
            <div className="bg-black rounded-xl p-4 overflow-x-auto border border-white/10">
              <pre className="text-sm text-neutral-300 whitespace-pre-wrap font-mono">
                {generateEmbedCode()}
              </pre>
            </div>

            <p className="text-sm text-neutral-500 mt-4">
              Fügen Sie diesen Code vor dem schließenden <code className="bg-neutral-800 px-1.5 py-0.5 rounded text-neutral-300">&lt;/body&gt;</code> Tag Ihrer Website ein.
            </p>
          </Card>

          {/* Instructions */}
          <Card variant="glass">
            <h3 className="font-semibold text-white mb-4">Anleitung</h3>
            <ol className="space-y-3">
              {[
                'Konfigurieren Sie das Widget nach Ihren Wünschen',
                'Kopieren Sie den Einbettungscode',
                'Fügen Sie den Code in Ihre Website ein',
                'Leads erscheinen automatisch in Ihrem Dashboard',
              ].map((step, index) => (
                <li key={index} className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-white/10 text-white flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </span>
                  <span className="text-neutral-300">{step}</span>
                </li>
              ))}
            </ol>
          </Card>
        </div>
      </div>

      {showPreview && (
        <PreviewModal config={config} onClose={() => setShowPreview(false)} />
      )}
    </div>
  );
}

// ============================================
// WIDGET PREVIEW COMPONENT
// ============================================

interface WidgetPreviewProps {
  config: WidgetConfig;
  expanded?: boolean;
}

function WidgetPreview({ config, expanded = true }: WidgetPreviewProps) {
  const [isOpen, setIsOpen] = useState(expanded);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  function needsDarkText(color: string): boolean {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128;
  }

  const textColor = needsDarkText(config.primaryColor) ? '#000000' : '#ffffff';
  const textColorMuted = needsDarkText(config.primaryColor) ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.8)';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', phone: '', message: '' });
    }, 3000);
  };

  return (
    <div className="flex flex-col items-end gap-3">
      {isOpen && (
        <div className="w-80 bg-neutral-900 rounded-2xl shadow-2xl overflow-hidden animate-scale-in border border-white/10">
          <div
            className="p-4"
            style={{ backgroundColor: config.primaryColor }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: needsDarkText(config.primaryColor) ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.2)' }}
                >
                  <WidgetIcon className="w-5 h-5" style={{ color: textColor }} />
                </div>
                <div>
                  <p className="font-medium text-sm" style={{ color: textColor }}>Kontakt</p>
                  <p className="text-xs" style={{ color: textColorMuted }}>Wir sind für Sie da</p>
                </div>
              </div>
              <div
                role="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg transition-colors cursor-pointer"
                style={{ 
                  color: textColor,
                  backgroundColor: needsDarkText(config.primaryColor) ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)'
                }}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
          </div>

          <div className="p-4">
            {submitted ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-3">
                  <CheckIcon className="w-6 h-6 text-emerald-400" />
                </div>
                <p className="text-white font-medium">{config.successMessage}</p>
              </div>
            ) : (
              <>
                <p className="text-neutral-400 text-sm mb-4">{config.greeting}</p>
                
                <form onSubmit={handleSubmit} className="space-y-3">
                  {config.fields.name.enabled && (
                    <input
                      type="text"
                      placeholder={`${config.fields.name.label}${config.fields.name.required ? ' *' : ''}`}
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required={config.fields.name.required}
                      className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded-lg text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-white/30"
                    />
                  )}
                  
                  {config.fields.email.enabled && (
                    <input
                      type="email"
                      placeholder={`${config.fields.email.label}${config.fields.email.required ? ' *' : ''}`}
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required={config.fields.email.required}
                      className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded-lg text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-white/30"
                    />
                  )}
                  
                  {config.fields.phone.enabled && (
                    <input
                      type="tel"
                      placeholder={`${config.fields.phone.label}${config.fields.phone.required ? ' *' : ''}`}
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required={config.fields.phone.required}
                      className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded-lg text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-white/30"
                    />
                  )}
                  
                  {config.fields.message.enabled && (
                    <textarea
                      placeholder={`${config.fields.message.label}${config.fields.message.required ? ' *' : ''}`}
                      rows={3}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required={config.fields.message.required}
                      className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded-lg text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-white/30 resize-none"
                    />
                  )}
                  
                  <div
                    role="button"
                    onClick={handleSubmit}
                    className="w-full py-2.5 font-medium rounded-lg transition-opacity hover:opacity-90 uppercase tracking-wide text-sm text-center cursor-pointer"
                    style={{ 
                      backgroundColor: config.primaryColor,
                      color: textColor
                    }}
                  >
                    {config.buttonText}
                  </div>
                </form>
              </>
            )}
          </div>

          <div className="px-4 py-2 bg-black/30 text-center border-t border-white/5">
            <span className="text-xs text-neutral-500">
              Powered by Lead Inbox
            </span>
          </div>
        </div>
      )}

      <div
        role="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-110 cursor-pointer"
        style={{ 
          backgroundColor: config.primaryColor,
          color: needsDarkText(config.primaryColor) ? '#000000' : '#ffffff',
          border: config.primaryColor === '#ffffff' || config.primaryColor === '#171717' 
            ? '2px solid rgba(255,255,255,0.3)' 
            : 'none'
        }}
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )}
      </div>
    </div>
  );
}

// ============================================
// PREVIEW MODAL
// ============================================

interface PreviewModalProps {
  config: WidgetConfig;
  onClose: () => void;
}

function PreviewModal({ config, onClose }: PreviewModalProps) {
  return (
    <div className="fixed inset-0 z-50 bg-neutral-900">
      <div className="fixed top-0 left-0 right-0 bg-black border-b border-white/10 px-4 py-3 flex items-center justify-between z-10">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-white">Widget Vorschau</span>
          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Live
          </div>
        </div>
        <Button variant="secondary" onClick={onClose}>
          Schließen
        </Button>
      </div>

      <div className="pt-16 h-full overflow-auto">
        <div className="max-w-4xl mx-auto p-8">
          <div className="h-20 bg-neutral-800 rounded-lg mb-8" />
          <div className="space-y-4 mb-8">
            <div className="h-8 bg-neutral-800 rounded w-3/4" />
            <div className="h-4 bg-neutral-800 rounded w-full" />
            <div className="h-4 bg-neutral-800 rounded w-full" />
            <div className="h-4 bg-neutral-800 rounded w-2/3" />
          </div>
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="h-40 bg-neutral-800 rounded-lg" />
            <div className="h-40 bg-neutral-800 rounded-lg" />
            <div className="h-40 bg-neutral-800 rounded-lg" />
          </div>
        </div>

        <div
          className={cn(
            'fixed bottom-6',
            config.position === 'left' ? 'left-6' : 'right-6'
          )}
        >
          <WidgetPreview config={config} expanded={true} />
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { Save, Loader2, CheckCircle2, AlertCircle, Webhook, Building2 } from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const [webhookUrl, setWebhookUrl] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/settings');
        if (res.status === 401) {
          router.push('/login');
          return;
        }
        const data = await res.json();
        setWebhookUrl(data.make_webhook_url || '');
        setCompanyName(data.company_name || '');
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ make_webhook_url: webhookUrl, company_name: companyName }),
      });

      if (!res.ok) {
        const data = await res.json();
        setMessage({ type: 'error', text: data.error || 'Fehler beim Speichern.' });
        return;
      }

      setMessage({ type: 'success', text: 'Einstellungen gespeichert.' });
      setTimeout(() => setMessage(null), 3000);
    } catch {
      setMessage({ type: 'error', text: 'Verbindungsfehler.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 tracking-tight">Einstellungen</h1>
          <p className="text-sm text-surface-500 mt-1">Konfiguriere deine Make.com-Verbindung.</p>
        </div>

        <div className="card p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-surface-400" />
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-5">
              <div>
                <label className="block text-xs font-medium text-surface-500 mb-1.5 uppercase tracking-wider">
                  <span className="flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5" />
                    Firmenname
                  </span>
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Meine Firma GmbH"
                  className="input-base"
                  disabled={saving}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-surface-500 mb-1.5 uppercase tracking-wider">
                  <span className="flex items-center gap-1.5">
                    <Webhook className="h-3.5 w-3.5" />
                    Make.com Webhook URL
                  </span>
                </label>
                <input
                  type="url"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="https://hook.eu2.make.com/abc123..."
                  className="input-base font-mono text-xs"
                  required
                  disabled={saving}
                />
                <p className="text-xs text-surface-400 mt-1.5">
                  Die Custom-Webhook-URL aus deinem Make.com Szenario. Diese wird beim Start einer Lead-Suche aufgerufen.
                </p>
              </div>

              {/* Message */}
              {message && (
                <div
                  className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm ${
                    message.type === 'success'
                      ? 'bg-emerald-50 border border-emerald-100 text-emerald-700'
                      : 'bg-red-50 border border-red-100 text-red-700'
                  }`}
                >
                  {message.type === 'success' ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                  ) : (
                    <AlertCircle className="h-4 w-4 shrink-0" />
                  )}
                  {message.text}
                </div>
              )}

              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {saving ? 'Speichern …' : 'Speichern'}
              </button>
            </form>
          )}
        </div>
      </div>
    </AppShell>
  );
}

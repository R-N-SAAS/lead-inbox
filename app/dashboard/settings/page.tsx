'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import {
  Card,
  Button,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Modal,
  ConfirmDialog,
} from '@/components/ui';
import {
  SettingsIcon,
  CheckIcon,
  CopyIcon,
  RefreshIcon,
  TrashIcon,
  ExternalLinkIcon,
} from '@/components/common/Icons';
import { cn } from '@/lib/utils';

// ============================================
// SETTINGS PAGE
// ============================================

export default function SettingsPage() {
  const supabase = createClientComponentClient();
  
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Profile State
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
  });

  // Organization State
  const [organization, setOrganization] = useState({
    name: '',
    website: '',
    address: '',
    city: '',
    postal_code: '',
  });

  // API Key
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  async function loadUserData() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        setProfile({
          name: user.user_metadata?.name || '',
          email: user.email || '',
          phone: user.user_metadata?.phone || '',
        });
        
        // Generate a simple API key for demo
        setApiKey(`li_${user.id.substring(0, 8)}_${Date.now().toString(36)}`);
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveProfile() {
    setSaving(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          name: profile.name,
          phone: profile.phone,
        },
      });

      if (error) throw error;
      setMessage({ type: 'success', text: 'Profil erfolgreich aktualisiert' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Fehler beim Speichern' });
    } finally {
      setSaving(false);
    }
  }

  async function handleChangePassword() {
    setMessage(null);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(profile.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
      setMessage({ type: 'success', text: 'E-Mail zum Zurücksetzen des Passworts wurde gesendet' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Fehler beim Senden' });
    }
  }

  function copyApiKey() {
    navigator.clipboard.writeText(apiKey);
    setMessage({ type: 'success', text: 'API-Schlüssel kopiert' });
    setTimeout(() => setMessage(null), 2000);
  }

  if (loading) {
    return <SettingsSkeleton />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Einstellungen</h1>
        <p className="text-slate-500 mt-1">
          Verwalten Sie Ihr Profil und Ihre Kontoeinstellungen
        </p>
      </div>

      {/* Message */}
      {message && (
        <div
          className={cn(
            'p-4 rounded-xl text-sm flex items-center gap-3 animate-fade-in',
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          )}
        >
          {message.type === 'success' ? (
            <CheckIcon className="w-5 h-5 flex-shrink-0" />
          ) : (
            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          )}
          {message.text}
        </div>
      )}

      {/* Settings Tabs */}
      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profil</TabsTrigger>
          <TabsTrigger value="organization">Organisation</TabsTrigger>
          <TabsTrigger value="integrations">Integrationen</TabsTrigger>
          <TabsTrigger value="notifications">Benachrichtigungen</TabsTrigger>
          <TabsTrigger value="security">Sicherheit</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="mt-6">
          <Card variant="glass">
            <h2 className="text-lg font-semibold text-slate-900 mb-6">Persönliche Daten</h2>
            
            <div className="grid gap-6 max-w-xl">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Vollständiger Name
                </label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full px-4 py-3 bg-white/70 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  E-Mail-Adresse
                </label>
                <input
                  type="email"
                  value={profile.email}
                  disabled
                  className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed"
                />
                <p className="text-xs text-slate-400 mt-1">
                  E-Mail-Adresse kann nicht geändert werden
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Telefon
                </label>
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  placeholder="+49 123 456789"
                  className="w-full px-4 py-3 bg-white/70 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="pt-4">
                <Button onClick={handleSaveProfile} loading={saving}>
                  Änderungen speichern
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Organization Tab */}
        <TabsContent value="organization" className="mt-6">
          <Card variant="glass">
            <h2 className="text-lg font-semibold text-slate-900 mb-6">Unternehmensdaten</h2>
            
            <div className="grid gap-6 max-w-xl">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Firmenname
                </label>
                <input
                  type="text"
                  value={organization.name}
                  onChange={(e) => setOrganization({ ...organization, name: e.target.value })}
                  placeholder="Muster GmbH"
                  className="w-full px-4 py-3 bg-white/70 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Website
                </label>
                <input
                  type="url"
                  value={organization.website}
                  onChange={(e) => setOrganization({ ...organization, website: e.target.value })}
                  placeholder="https://www.beispiel.de"
                  className="w-full px-4 py-3 bg-white/70 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Adresse
                </label>
                <input
                  type="text"
                  value={organization.address}
                  onChange={(e) => setOrganization({ ...organization, address: e.target.value })}
                  placeholder="Musterstraße 1"
                  className="w-full px-4 py-3 bg-white/70 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    PLZ
                  </label>
                  <input
                    type="text"
                    value={organization.postal_code}
                    onChange={(e) => setOrganization({ ...organization, postal_code: e.target.value })}
                    placeholder="12345"
                    className="w-full px-4 py-3 bg-white/70 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Stadt
                  </label>
                  <input
                    type="text"
                    value={organization.city}
                    onChange={(e) => setOrganization({ ...organization, city: e.target.value })}
                    placeholder="Berlin"
                    className="w-full px-4 py-3 bg-white/70 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div className="pt-4">
                <Button onClick={() => setMessage({ type: 'success', text: 'Organisation gespeichert' })}>
                  Änderungen speichern
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Integrations Tab */}
        <TabsContent value="integrations" className="mt-6 space-y-6">
          {/* API Key */}
          <Card variant="glass">
            <h2 className="text-lg font-semibold text-slate-900 mb-2">API-Schlüssel</h2>
            <p className="text-sm text-slate-500 mb-6">
              Verwenden Sie diesen Schlüssel für die API-Integration
            </p>

            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={apiKey}
                  readOnly
                  className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl font-mono text-sm pr-24"
                />
                <button
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showApiKey ? 'Verbergen' : 'Anzeigen'}
                </button>
              </div>
              <Button variant="secondary" onClick={copyApiKey} icon={<CopyIcon className="w-4 h-4" />}>
                Kopieren
              </Button>
            </div>
          </Card>

          {/* Webhooks */}
          <Card variant="glass">
            <h2 className="text-lg font-semibold text-slate-900 mb-2">Webhooks</h2>
            <p className="text-sm text-slate-500 mb-6">
              Erhalten Sie Benachrichtigungen bei neuen Leads
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Webhook URL
                </label>
                <input
                  type="url"
                  placeholder="https://ihre-domain.de/webhook"
                  className="w-full px-4 py-3 bg-white/70 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <div className="flex items-center gap-4">
                <Button variant="secondary">Testen</Button>
                <Button>Speichern</Button>
              </div>
            </div>
          </Card>

          {/* Third-Party Integrations */}
          <Card variant="glass">
            <h2 className="text-lg font-semibold text-slate-900 mb-6">Verbundene Dienste</h2>
            
            <div className="space-y-4">
              <IntegrationItem
                name="Make.com"
                description="Automatisierung mit Make.com Szenarien"
                connected={false}
                icon="🔗"
              />
              <IntegrationItem
                name="Resend"
                description="E-Mail-Versand für Kampagnen"
                connected={true}
                icon="📧"
              />
              <IntegrationItem
                name="Slack"
                description="Lead-Benachrichtigungen in Slack"
                connected={false}
                icon="💬"
              />
            </div>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="mt-6">
          <Card variant="glass">
            <h2 className="text-lg font-semibold text-slate-900 mb-6">E-Mail-Benachrichtigungen</h2>
            
            <div className="space-y-4 max-w-xl">
              <NotificationToggle
                label="Neue Leads"
                description="Benachrichtigung bei jedem neuen Lead"
                defaultChecked={true}
              />
              <NotificationToggle
                label="Lead-Antworten"
                description="Wenn ein Lead auf eine Kampagne antwortet"
                defaultChecked={true}
              />
              <NotificationToggle
                label="Kampagnen-Status"
                description="Wenn eine Kampagne abgeschlossen wird"
                defaultChecked={false}
              />
              <NotificationToggle
                label="Wöchentliche Zusammenfassung"
                description="Wöchentlicher Bericht per E-Mail"
                defaultChecked={true}
              />
            </div>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="mt-6 space-y-6">
          <Card variant="glass">
            <h2 className="text-lg font-semibold text-slate-900 mb-6">Passwort ändern</h2>
            
            <p className="text-sm text-slate-500 mb-4">
              Wir senden Ihnen einen Link zum Zurücksetzen des Passworts an Ihre E-Mail-Adresse.
            </p>
            
            <Button variant="secondary" onClick={handleChangePassword}>
              Passwort-Reset anfordern
            </Button>
          </Card>

          <Card variant="glass">
            <h2 className="text-lg font-semibold text-slate-900 mb-2">Aktive Sitzungen</h2>
            <p className="text-sm text-slate-500 mb-6">
              Geräte, auf denen Sie angemeldet sind
            </p>
            
            <div className="space-y-3">
              <SessionItem
                device="Chrome auf macOS"
                location="München, DE"
                current={true}
              />
              <SessionItem
                device="Safari auf iPhone"
                location="München, DE"
                current={false}
              />
            </div>

            <div className="pt-6 border-t border-slate-100 mt-6">
              <Button variant="danger" size="sm">
                Alle anderen Sitzungen beenden
              </Button>
            </div>
          </Card>

          <Card variant="bordered" className="border-red-200 bg-red-50/50">
            <h2 className="text-lg font-semibold text-red-700 mb-2">Gefahrenzone</h2>
            <p className="text-sm text-red-600 mb-4">
              Diese Aktionen können nicht rückgängig gemacht werden
            </p>
            
            <Button variant="danger">
              Konto löschen
            </Button>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ============================================
// HELPER COMPONENTS
// ============================================

function IntegrationItem({
  name,
  description,
  connected,
  icon,
}: {
  name: string;
  description: string;
  connected: boolean;
  icon: string;
}) {
  return (
    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-xl shadow-sm">
          {icon}
        </div>
        <div>
          <p className="font-medium text-slate-900">{name}</p>
          <p className="text-sm text-slate-500">{description}</p>
        </div>
      </div>
      <Button variant={connected ? 'secondary' : 'primary'} size="sm">
        {connected ? 'Verbunden' : 'Verbinden'}
      </Button>
    </div>
  );
}

function NotificationToggle({
  label,
  description,
  defaultChecked,
}: {
  label: string;
  description: string;
  defaultChecked: boolean;
}) {
  const [checked, setChecked] = useState(defaultChecked);

  return (
    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
      <div>
        <p className="font-medium text-slate-900">{label}</p>
        <p className="text-sm text-slate-500">{description}</p>
      </div>
      <button
        onClick={() => setChecked(!checked)}
        className={cn(
          'w-12 h-7 rounded-full transition-colors relative',
          checked ? 'bg-blue-500' : 'bg-slate-300'
        )}
      >
        <span
          className={cn(
            'absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform',
            checked ? 'left-6' : 'left-1'
          )}
        />
      </button>
    </div>
  );
}

function SessionItem({
  device,
  location,
  current,
}: {
  device: string;
  location: string;
  current: boolean;
}) {
  return (
    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
          <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-medium text-slate-900">
            {device}
            {current && (
              <span className="ml-2 text-xs text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                Aktuelle Sitzung
              </span>
            )}
          </p>
          <p className="text-xs text-slate-500">{location}</p>
        </div>
      </div>
      {!current && (
        <button className="text-sm text-red-600 hover:text-red-700">
          Beenden
        </button>
      )}
    </div>
  );
}

function SettingsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-8 w-32 bg-slate-200 rounded" />
        <div className="h-4 w-64 bg-slate-200 rounded" />
      </div>
      <div className="h-12 w-full bg-slate-200 rounded-xl" />
      <div className="h-96 bg-slate-200 rounded-2xl" />
    </div>
  );
}

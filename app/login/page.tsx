'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Zap, Loader2, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Anmeldung fehlgeschlagen.');
        return;
      }

      router.push('/dashboard');
    } catch {
      setError('Verbindungsfehler. Bitte versuche es erneut.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-50 bg-grid flex items-center justify-center p-4">
      <div className="w-full max-w-sm animate-fade-in">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <div className="h-10 w-10 rounded-xl bg-surface-900 flex items-center justify-center shadow-lg">
            <Zap className="h-5 w-5 text-brand-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-surface-900 tracking-tight">LeadIn Pro</h1>
          </div>
        </div>

        {/* Card */}
        <div className="card p-6">
          <h2 className="text-base font-semibold text-surface-900 mb-1">Willkommen zurück</h2>
          <p className="text-sm text-surface-500 mb-6">Melde dich an, um Leads zu generieren.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-surface-500 mb-1.5 uppercase tracking-wider">
                E-Mail
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@leadgen.local"
                className="input-base"
                required
                autoFocus
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-xs font-medium text-surface-500 mb-1.5 uppercase tracking-wider">
                Passwort
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-base"
                required
                disabled={loading}
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-100 px-3 py-2.5 text-sm text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {loading ? 'Wird angemeldet …' : 'Anmelden'}
            </button>
          </form>
        </div>

        {/* Demo hint */}
        <p className="text-center text-xs text-surface-400 mt-4">
          Demo: admin@leadgen.local / demo1234
        </p>
      </div>
    </div>
  );
}

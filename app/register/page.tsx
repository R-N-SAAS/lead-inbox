'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button, Input } from '@/components/ui';
import { InboxIcon } from '@/components/common/Icons';

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validierung
    if (formData.password !== formData.confirmPassword) {
      setError('Die Passwörter stimmen nicht überein');
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError('Das Passwort muss mindestens 8 Zeichen lang sein');
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
          },
        },
      });

      if (error) {
        if (error.message.includes('already registered')) {
          setError('Diese E-Mail-Adresse ist bereits registriert');
        } else {
          setError(error.message);
        }
        return;
      }

      setSuccess(true);
    } catch (err) {
      setError('Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.');
    } finally {
      setLoading(false);
    }
  }

  // Success State
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-emerald-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Registrierung erfolgreich!</h1>
          <p className="text-slate-500 mb-6">
            Wir haben Ihnen eine E-Mail zur Bestätigung gesendet. Bitte überprüfen Sie Ihren Posteingang.
          </p>
          <Link href="/login">
            <Button>Zur Anmeldung</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <InboxIcon className="w-6 h-6 text-slate-900" />
          </div>
          <div>
            <span className="font-bold text-slate-900 text-xl">Lead Inbox</span>
            <span className="block text-xs text-slate-400 font-medium">PROFESSIONAL</span>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white/70 backdrop-blur-xl border border-white/30 rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-slate-900">Konto erstellen</h1>
            <p className="text-slate-500 mt-2">
              Starten Sie mit Lead Inbox durch
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-start gap-3 animate-fade-in">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleRegister} className="space-y-5">
            <Input
              label="Vollständiger Name"
              name="name"
              type="text"
              placeholder="Max Mustermann"
              value={formData.name}
              onChange={handleChange}
              required
            />

            <Input
              label="E-Mail-Adresse"
              name="email"
              type="email"
              placeholder="name@firma.de"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <Input
              label="Passwort"
              name="password"
              type="password"
              placeholder="Mindestens 8 Zeichen"
              value={formData.password}
              onChange={handleChange}
              required
              helperText="Mindestens 8 Zeichen"
            />

            <Input
              label="Passwort bestätigen"
              name="confirmPassword"
              type="password"
              placeholder="Passwort wiederholen"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />

            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="terms"
                required
                className="w-4 h-4 mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="terms" className="text-sm text-slate-600">
                Ich akzeptiere die{' '}
                <Link href="/terms" className="text-blue-600 hover:underline">
                  Nutzungsbedingungen
                </Link>{' '}
                und{' '}
                <Link href="/privacy" className="text-blue-600 hover:underline">
                  Datenschutzrichtlinie
                </Link>
              </label>
            </div>

            <Button type="submit" loading={loading} fullWidth size="lg">
              Registrieren
            </Button>
          </form>

          {/* Login Link */}
          <p className="mt-6 text-center text-sm text-slate-500">
            Bereits ein Konto?{' '}
            <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
              Anmelden
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

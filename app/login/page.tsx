'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Anmeldung fehlgeschlagen');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f0f4f8] relative overflow-hidden flex items-center justify-center">

      {/* ── Keyframes ── */}
      <style jsx global>{`
        @keyframes morph {
          0%, 100% { transform: translate(0, 0) scale(1) rotate(0deg); }
          25% { transform: translate(40px, -30px) scale(1.08) rotate(3deg); }
          50% { transform: translate(-20px, 20px) scale(0.95) rotate(-2deg); }
          75% { transform: translate(30px, 10px) scale(1.05) rotate(1deg); }
        }
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(20px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes auroraSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes float1 {
          0%, 100% { transform: translateY(0) translateX(0); }
          50% { transform: translateY(-20px) translateX(10px); }
        }
        @keyframes float2 {
          0%, 100% { transform: translateY(0) translateX(0); }
          50% { transform: translateY(15px) translateX(-12px); }
        }
        @keyframes shimmer {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>

      {/* ── Animated gradient blobs ── */}
      <div className="fixed inset-0 z-0">
        <div
          className="absolute rounded-full"
          style={{
            width: 600, height: 600,
            top: '-15%', left: '-10%',
            background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
            filter: 'blur(80px)',
            opacity: 0.5,
            animation: 'morph 20s ease-in-out infinite',
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: 500, height: 500,
            bottom: '-20%', right: '-10%',
            background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
            filter: 'blur(80px)',
            opacity: 0.35,
            animation: 'morph 20s ease-in-out infinite',
            animationDelay: '-7s',
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: 350, height: 350,
            top: '50%', left: '40%',
            transform: 'translate(-50%, -50%)',
            background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
            filter: 'blur(80px)',
            opacity: 0.2,
            animation: 'morph 20s ease-in-out infinite',
            animationDelay: '-14s',
          }}
        />
      </div>

      {/* ── Grid overlay ── */}
      <div
        className="fixed inset-0 z-[1] pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(148,163,184,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.08) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          maskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%, black 20%, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%, black 20%, transparent 70%)',
        }}
      />

      {/* ── Main card ── */}
      <div
        className="relative z-10 w-[1100px] max-w-[95vw] min-h-[640px] overflow-hidden rounded-[28px]"
        style={{
          background: 'rgba(255,255,255,0.6)',
          backdropFilter: 'blur(40px)',
          WebkitBackdropFilter: 'blur(40px)',
          border: '1px solid rgba(255,255,255,0.7)',
          boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.3), 0 25px 60px rgba(15,23,42,0.12), 0 8px 20px rgba(15,23,42,0.06)',
          animation: 'cardIn 0.6s ease-out',
        }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] min-h-[640px]">

          {/* ══════════ LEFT: Visual Panel ══════════ */}
          <div
            className="hidden lg:flex flex-col justify-center relative overflow-hidden"
            style={{
              padding: 52,
              background: 'linear-gradient(145deg, #1e3a8a 0%, #2563eb 40%, #3b82f6 70%, #60a5fa 100%)',
            }}
          >
            {/* Aurora spin */}
            <div className="absolute inset-0 overflow-hidden">
              <div
                className="absolute"
                style={{
                  width: '200%', height: '200%', top: '-50%', left: '-50%',
                  background: 'conic-gradient(from 180deg at 50% 50%, transparent 0deg, rgba(96,165,250,0.15) 60deg, transparent 120deg, rgba(139,92,246,0.1) 180deg, transparent 240deg, rgba(6,182,212,0.1) 300deg, transparent 360deg)',
                  animation: 'auroraSpin 30s linear infinite',
                }}
              />
            </div>

            {/* Floating orbs */}
            <div className="absolute rounded-full" style={{ width: 140, height: 140, top: '8%', right: '12%', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(4px)', animation: 'float1 12s ease-in-out infinite' }} />
            <div className="absolute rounded-full" style={{ width: 80, height: 80, bottom: '15%', left: '8%', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(4px)', animation: 'float2 15s ease-in-out infinite' }} />
            <div className="absolute rounded-full" style={{ width: 50, height: 50, top: '55%', right: '25%', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(4px)', animation: 'float1 18s ease-in-out infinite reverse' }} />

            {/* Content */}
            <div className="relative z-10">
              {/* Logo */}
              <div className="flex items-center gap-3 mb-14">
                <div className="w-[42px] h-[42px] rounded-[11px] flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.25)' }}>
                  <svg className="w-[22px] h-[22px] text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <span className="text-[19px] font-bold text-white tracking-tight">Lead Inbox</span>
              </div>

              {/* Title */}
              <h1 className="text-[38px] font-extrabold text-white leading-[1.15] tracking-tight mb-3.5">
                Deine Leads.<br />Automatisiert.
              </h1>
              <p className="text-[16px] leading-relaxed max-w-[380px] mb-11" style={{ color: 'rgba(255,255,255,0.6)' }}>
                KI-gestütztes Scraping, automatisierte Kampagnen und intelligentes Lead-Management.
              </p>

              {/* Feature cards */}
              <div className="flex flex-col gap-2.5">
                {[
                  {
                    icon: <><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></>,
                    label: 'Google Maps Scraper',
                    desc: 'Automatisch Kontaktdaten sammeln',
                  },
                  {
                    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />,
                    label: 'E-Mail Kampagnen',
                    desc: 'Follow-ups auf Autopilot',
                  },
                  {
                    icon: <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />,
                    label: 'Analytics Dashboard',
                    desc: 'Conversion-Tracking in Echtzeit',
                  },
                ].map((f, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3.5 rounded-[13px] transition-all duration-200 cursor-default hover:translate-x-1"
                    style={{
                      padding: '13px 16px',
                      background: 'rgba(255,255,255,0.08)',
                      border: '1px solid rgba(255,255,255,0.1)',
                    }}
                  >
                    <div className="w-9 h-9 rounded-[9px] flex items-center justify-center shrink-0" style={{ background: 'rgba(255,255,255,0.12)' }}>
                      <svg className="w-[18px] h-[18px] text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        {f.icon}
                      </svg>
                    </div>
                    <div>
                      <div className="text-[14px] font-semibold" style={{ color: 'rgba(255,255,255,0.9)' }}>{f.label}</div>
                      <div className="text-[12px] mt-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>{f.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ══════════ RIGHT: Login Form ══════════ */}
          <div className="flex items-center justify-center px-8 py-12 lg:px-12" style={{ background: 'rgba(255,255,255,0.4)' }}>
            <div className="w-full max-w-[360px]">

              {/* Mobile logo */}
              <div className="lg:hidden flex items-center gap-3 mb-10">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <span className="text-[19px] font-bold text-slate-900">Lead Inbox</span>
              </div>

              <h2 className="text-[24px] font-bold text-[#0f172a] tracking-tight mb-1.5">Willkommen zurück</h2>
              <p className="text-[14px] text-slate-500 mb-8">Melde dich an, um fortzufahren</p>

              {/* Error */}
              {error && (
                <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-600 text-[13px]">
                  {error}
                </div>
              )}

              <form onSubmit={handleLogin}>
                {/* Email */}
                <div className="mb-[18px]">
                  <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">E-Mail</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@unternehmen.de"
                    required
                    className="w-full px-3.5 py-[11px] bg-white rounded-[11px] text-[14px] text-slate-900 placeholder-slate-400 outline-none transition-all"
                    style={{ border: '1.5px solid #e2e8f0' }}
                    onFocus={(e) => { e.target.style.borderColor = '#3b82f6'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)'; }}
                    onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>

                {/* Password */}
                <div className="mb-[18px]">
                  <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Passwort</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full px-3.5 py-[11px] bg-white rounded-[11px] text-[14px] text-slate-900 placeholder-slate-400 outline-none transition-all"
                    style={{ border: '1.5px solid #e2e8f0' }}
                    onFocus={(e) => { e.target.style.borderColor = '#3b82f6'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)'; }}
                    onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>

                {/* Options row */}
                <div className="flex items-center justify-between mb-6">
                  <label className="flex items-center gap-2 text-[13px] text-slate-600 cursor-pointer select-none">
                    <input type="checkbox" className="w-[15px] h-[15px] accent-blue-500 cursor-pointer" />
                    Angemeldet bleiben
                  </label>
                  <a href="#" className="text-[13px] text-blue-500 font-medium hover:text-blue-700 transition-colors">
                    Passwort vergessen?
                  </a>
                </div>

                {/* Submit button with shimmer border */}
                <div
                  className="rounded-[12px] p-[2px] mb-5"
                  style={{
                    background: 'linear-gradient(135deg, #2563eb, #7c3aed, #06b6d4, #2563eb)',
                    backgroundSize: '300% 300%',
                    animation: 'shimmer 4s ease infinite',
                  }}
                >
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-[#2563eb] text-white text-[15px] font-semibold rounded-[10px] hover:bg-[#1d4ed8] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    style={{ boxShadow: '0 4px 12px rgba(37,99,235,0.2)' }}
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Anmelden...
                      </>
                    ) : (
                      <>
                        Anmelden
                        <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Divider */}
              <div className="flex items-center gap-3.5 mb-5">
                <span className="flex-1 h-px bg-slate-200" />
                <span className="text-[12px] text-slate-400">oder</span>
                <span className="flex-1 h-px bg-slate-200" />
              </div>

              {/* Register */}
              <p className="text-center text-[13px] text-slate-500">
                Noch kein Konto?{' '}
                <Link href="/register" className="text-blue-600 font-semibold hover:text-blue-800 transition-colors">
                  Jetzt registrieren
                </Link>
              </p>

              {/* Trust row */}
              <div className="flex items-center justify-center gap-5 mt-8 pt-5 border-t border-slate-200">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                  <svg className="w-[13px] h-[13px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                  SSL verschlüsselt
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                  <svg className="w-[13px] h-[13px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375" />
                  </svg>
                  DSGVO konform
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

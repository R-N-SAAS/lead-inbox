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
    <div className="min-h-screen bg-[#000000] relative overflow-hidden">
      
      {/* Background - DARKER with beam from TOP - MORE CENTERED */}
      <div className="absolute inset-0 overflow-hidden">
        
        {/* Main light beam - shifted more to center (40% from left) */}
        <div 
          className="absolute top-0 w-[2500px] h-[2500px] -translate-y-[35%]"
          style={{
            left: '40%',
            transform: 'translateX(-50%) translateY(-35%)',
            background: `
              conic-gradient(
                from 270deg at 50% 50%,
                transparent 0deg,
                transparent 155deg,
                rgba(60, 75, 100, 0.04) 163deg,
                rgba(90, 110, 140, 0.1) 168deg,
                rgba(130, 150, 180, 0.2) 172deg,
                rgba(170, 185, 210, 0.38) 175deg,
                rgba(200, 215, 235, 0.6) 177deg,
                rgba(230, 238, 250, 0.85) 179deg,
                rgba(255, 255, 255, 1) 180deg,
                rgba(230, 238, 250, 0.85) 181deg,
                rgba(200, 215, 235, 0.6) 183deg,
                rgba(170, 185, 210, 0.38) 185deg,
                rgba(130, 150, 180, 0.2) 188deg,
                rgba(90, 110, 140, 0.1) 192deg,
                rgba(60, 75, 100, 0.04) 197deg,
                transparent 205deg,
                transparent 360deg
              )
            `,
          }}
        />

        {/* Wider glow layer */}
        <div 
          className="absolute top-0 w-[2000px] h-[2000px]"
          style={{
            left: '40%',
            transform: 'translateX(-50%) translateY(-25%)',
            background: `
              conic-gradient(
                from 270deg at 50% 50%,
                transparent 0deg,
                transparent 145deg,
                rgba(120, 145, 180, 0.12) 160deg,
                rgba(150, 170, 200, 0.25) 172deg,
                rgba(180, 200, 225, 0.38) 178deg,
                rgba(200, 215, 235, 0.42) 180deg,
                rgba(180, 200, 225, 0.38) 182deg,
                rgba(150, 170, 200, 0.25) 188deg,
                rgba(120, 145, 180, 0.12) 200deg,
                transparent 215deg,
                transparent 360deg
              )
            `,
            filter: 'blur(40px)',
          }}
        />

        {/* Atmospheric spread downward */}
        <div 
          className="absolute top-0 left-0 w-full h-full"
          style={{
            background: `
              radial-gradient(ellipse at 40% 0%, 
                rgba(160, 180, 210, 0.18) 0%,
                rgba(120, 145, 180, 0.1) 20%,
                rgba(80, 100, 130, 0.05) 40%,
                rgba(40, 55, 75, 0.02) 60%,
                transparent 80%
              )
            `,
          }}
        />

        {/* Hot core glow at top */}
        <div 
          className="absolute -top-[50px] w-[300px] h-[300px]"
          style={{
            left: '40%',
            transform: 'translateX(-50%)',
            background: `
              radial-gradient(circle at center, 
                rgba(255, 255, 255, 0.35) 0%,
                rgba(220, 230, 250, 0.15) 40%,
                transparent 70%
              )
            `,
            filter: 'blur(20px)',
          }}
        />

        {/* Heavy vignette for darker feel */}
        <div 
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse at 50% 50%, 
                transparent 0%,
                transparent 20%,
                rgba(0, 0, 0, 0.3) 50%,
                rgba(0, 0, 0, 0.7) 100%
              )
            `,
          }}
        />

        {/* Noise */}
        <div 
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex">
        {/* Left side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-sm">
              <svg className="w-5 h-5 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <span className="text-white/70 font-medium tracking-wide">Lead In</span>
          </div>

          {/* Big headline */}
          <div className="max-w-lg">
            <p className="text-white/30 text-sm tracking-[0.2em] uppercase mb-6">[ OUR MISSION ]</p>
            <h1 className="text-5xl lg:text-6xl font-light text-white/90 leading-[1.1] tracking-tight">
              The Next Frontier
              <br />
              <span className="text-white/40">of Lead Generation</span>
            </h1>
          </div>

          {/* Bottom info */}
          <div className="flex items-center gap-8">
            <a href="#" className="text-white/30 text-sm hover:text-white/50 transition-colors tracking-wide">
              DOCUMENTATION ↗
            </a>
          </div>
        </div>

        {/* Right side - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-md">
            {/* Mobile logo */}
            <div className="lg:hidden flex items-center gap-3 mb-12">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <span className="text-white/70 font-medium tracking-wide">Lead In</span>
            </div>

            {/* Login Card */}
            <div className="relative">
              <div className="relative bg-black/70 backdrop-blur-2xl border border-white/[0.06] rounded-2xl p-8 lg:p-10 shadow-2xl">
                <h2 className="text-2xl font-light text-white mb-2">Welcome back</h2>
                <p className="text-white/40 text-sm mb-8">Sign in to your account</p>

                {error && (
                  <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
                  <div>
                    <label className="block text-sm text-white/50 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      required
                      className="w-full px-4 py-4 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder-white/20 focus:outline-none focus:border-white/20 focus:bg-white/[0.05] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-white/50 mb-2">
                      Password
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      required
                      className="w-full px-4 py-4 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder-white/20 focus:outline-none focus:border-white/20 focus:bg-white/[0.05] transition-all"
                    />
                  </div>

                  <div className="flex items-center justify-end">
                    <a href="#" className="text-sm text-white/40 hover:text-white/60 transition-colors">
                      Forgot password?
                    </a>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-white text-black font-medium rounded-xl hover:bg-white/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Signing in...
                      </>
                    ) : (
                      <>
                        Sign in
                        <span className="text-black/40">↗</span>
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-8 pt-8 border-t border-white/[0.06] text-center">
                  <p className="text-white/30 text-sm">
                    Don't have an account?{' '}
                    <Link href="/register" className="text-white/60 hover:text-white transition-colors">
                      Create account
                    </Link>
                  </p>
                </div>
              </div>
            </div>

            {/* Feature badge */}
            <div className="mt-8 flex justify-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/[0.03] border border-white/[0.06] rounded-full backdrop-blur">
                <span className="w-2 h-2 rounded-full bg-white/60 animate-pulse" />
                <span className="text-white/40 text-sm">AI-Powered Lead Scoring: Now Available</span>
                <span className="text-white/30">↗</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

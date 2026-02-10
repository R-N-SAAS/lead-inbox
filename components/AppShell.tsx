'use client';

import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Settings, LogOut, Zap } from 'lucide-react';

const nav = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/settings', label: 'Einstellungen', icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'logout' }),
    });
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-surface-50 flex">
      {/* Sidebar */}
      <aside className="w-56 bg-surface-950 text-white flex flex-col shrink-0 hidden md:flex">
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-brand-500 flex items-center justify-center">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-tight">LeadIn</p>
              <p className="text-[10px] text-surface-400 uppercase tracking-widest">Pro</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-0.5">
          {nav.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <a
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                  active
                    ? 'bg-white/10 text-white font-medium'
                    : 'text-surface-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </a>
            );
          })}
        </nav>
        <div className="p-3 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-surface-400 hover:text-white hover:bg-white/5 transition-colors w-full"
          >
            <LogOut className="h-4 w-4" />
            Abmelden
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-surface-950 z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-md bg-brand-500 flex items-center justify-center">
            <Zap className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="text-sm font-semibold text-white">LeadGen Pro</span>
        </div>
        <div className="flex items-center gap-1">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`p-2 rounded-md transition-colors ${
                pathname.startsWith(item.href) ? 'text-white bg-white/10' : 'text-surface-400'
              }`}
            >
              <item.icon className="h-4 w-4" />
            </a>
          ))}
          <button onClick={handleLogout} className="p-2 rounded-md text-surface-400 hover:text-white">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 min-w-0 md:p-0 pt-14 md:pt-0">{children}</main>
    </div>
  );
}

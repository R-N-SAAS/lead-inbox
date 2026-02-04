'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { BellIcon, SearchIcon, SettingsIcon } from './Icons';

// ============================================
// HEADER - MONOCHROME STYLE
// ============================================

interface HeaderProps {
  user?: { email: string; name?: string };
  onMenuClick?: () => void;
  onLogout?: () => void;
}

export default function Header({ user, onMenuClick, onLogout }: HeaderProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setShowUserMenu(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifications(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      const parts = name.split(' ');
      return parts.length > 1 ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase() : name.substring(0, 2).toUpperCase();
    }
    return email?.substring(0, 2).toUpperCase() || '??';
  };

  return (
    <header className="h-14 bg-black/90 backdrop-blur-sm border-b border-white/[0.06] sticky top-0 z-30">
      <div className="h-full px-6 flex items-center justify-between">
        {/* Left */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 text-neutral-500 hover:text-white hover:bg-white/[0.03] rounded-md transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Search */}
          <div className="hidden md:block relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-600 w-4 h-4" />
            <input
              type="text"
              placeholder="Suchen..."
              className="w-64 lg:w-72 pl-9 pr-4 py-2 bg-white/[0.03] border border-white/[0.06] rounded-md text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-white/20 transition-colors"
            />
            <kbd className="hidden lg:inline-flex absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] text-neutral-600 font-mono">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-1">
          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-neutral-500 hover:text-white hover:bg-white/[0.03] rounded-md transition-colors"
            >
              <BellIcon className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-white rounded-full" />
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-[#0a0a0a] rounded-lg border border-white/[0.08] overflow-hidden animate-fade-in">
                <div className="px-4 py-3 border-b border-white/[0.06]">
                  <span className="font-mono text-[10px] text-neutral-500 tracking-widest uppercase">[ Notifications ]</span>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  <NotificationItem title="Neuer Lead" message="Max Mustermann — Kontaktformular" time="5m" unread />
                  <NotificationItem title="Kampagne gestartet" message="Newsletter Q1 aktiv" time="1h" />
                  <NotificationItem title="Lead qualifiziert" message="Firma ABC markiert" time="2h" />
                </div>
                <div className="px-4 py-2 border-t border-white/[0.06]">
                  <Link href="/dashboard/notifications" className="text-xs text-white hover:text-neutral-300 font-medium uppercase tracking-wider">
                    View All →
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Settings */}
          <Link
            href="/dashboard/settings"
            className="hidden sm:flex p-2 text-neutral-500 hover:text-white hover:bg-white/[0.03] rounded-md transition-colors"
          >
            <SettingsIcon className="w-5 h-5" />
          </Link>

          <div className="hidden sm:block w-px h-6 bg-white/[0.08] mx-2" />

          {/* User */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2.5 p-1.5 pr-3 rounded-md hover:bg-white/[0.03] transition-colors"
            >
              <div className="w-8 h-8 rounded-md bg-white flex items-center justify-center text-black font-semibold text-xs">
                {getInitials(user?.name, user?.email)}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-white truncate max-w-[100px]">
                  {user?.name || user?.email?.split('@')[0] || 'User'}
                </p>
              </div>
              <svg className={cn('w-4 h-4 text-neutral-600 transition-transform hidden md:block', showUserMenu && 'rotate-180')} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-52 bg-[#0a0a0a] rounded-lg border border-white/[0.08] overflow-hidden animate-fade-in">
                <div className="px-4 py-3 border-b border-white/[0.06]">
                  <p className="text-sm font-medium text-white truncate">{user?.name || 'User'}</p>
                  <p className="text-xs text-neutral-500 truncate font-mono">{user?.email}</p>
                </div>
                <div className="py-1">
                  <MenuItem href="/dashboard/settings">Profil</MenuItem>
                  <MenuItem href="/dashboard/settings">Einstellungen</MenuItem>
                  <MenuItem href="/dashboard/settings/billing">Abrechnung</MenuItem>
                </div>
                <div className="border-t border-white/[0.06] py-1">
                  <button onClick={onLogout} className="w-full flex items-center px-4 py-2 text-sm text-red-400 hover:bg-red-500/5 transition-colors">
                    Abmelden
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

function NotificationItem({ title, message, time, unread }: { title: string; message: string; time: string; unread?: boolean }) {
  return (
    <div className={cn('px-4 py-3 hover:bg-white/[0.02] transition-colors cursor-pointer', unread && 'bg-white/[0.03]')}>
      <div className="flex items-start gap-2.5">
        {unread && <span className="w-1.5 h-1.5 mt-2 bg-white rounded-full flex-shrink-0" />}
        <div className={cn('flex-1', !unread && 'ml-4')}>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-white">{title}</p>
            <span className="text-[10px] text-neutral-600 font-mono">{time}</span>
          </div>
          <p className="text-xs text-neutral-500 mt-0.5">{message}</p>
        </div>
      </div>
    </div>
  );
}

function MenuItem({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="block px-4 py-2 text-sm text-neutral-400 hover:text-white hover:bg-white/[0.03] transition-colors">
      {children}
    </Link>
  );
}

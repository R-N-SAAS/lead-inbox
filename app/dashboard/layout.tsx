'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Sidebar, { MobileSidebar } from '@/components/common/Sidebar';
import Header from '@/components/common/Header';
import { PageLoading } from '@/components/ui/Loading';

// ============================================
// DASHBOARD LAYOUT - DARK THEME
// ============================================

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const supabase = createClientComponentClient();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ email: string; name?: string } | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    checkUser();

    // Auth State Listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT') {
          router.push('/login');
        } else if (session?.user) {
          setUser({
            email: session.user.email || '',
            name: session.user.user_metadata?.name,
          });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase, router]);

  async function checkUser() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/login');
        return;
      }
      
      setUser({
        email: session.user.email || '',
        name: session.user.user_metadata?.name,
      });
    } catch (error) {
      console.error('Auth error:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/login');
  }

  if (loading) {
    return <PageLoading />;
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar onLogout={handleLogout} />
      </div>

      {/* Mobile Sidebar */}
      <MobileSidebar
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <div className="lg:ml-64 min-h-screen flex flex-col">
        {/* Header */}
        <Header
          user={user || undefined}
          onMenuClick={() => setMobileMenuOpen(true)}
          onLogout={handleLogout}
        />

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>

        {/* Footer */}
        <footer className="px-6 lg:px-8 py-4 border-t border-white/10 bg-black/40">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-neutral-500">
            <p>© 2024 Lead Inbox. Alle Rechte vorbehalten.</p>
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-neutral-300 transition-colors">Hilfe</a>
              <a href="#" className="hover:text-neutral-300 transition-colors">Datenschutz</a>
              <a href="#" className="hover:text-neutral-300 transition-colors">Impressum</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

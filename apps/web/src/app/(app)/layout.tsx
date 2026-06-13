'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/modules/auth/useAuth';
import { authService } from '@/modules/auth/authService';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-lightBg flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-primary-700 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-brand-fume text-sm">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-brand-lightBg">
      {/* Header */}
      <header className="bg-white border-b border-brand-border sticky top-0 z-50">
        <div className="container-rny flex items-center justify-between h-14">
          <Link href="/dashboard" className="font-heading font-extrabold text-xl text-primary-700 no-underline">
            ritminiyakala
          </Link>

          <nav className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm font-heading font-semibold text-brand-fume hover:text-primary-700 no-underline">
              Panelim
            </Link>
            <Link href="/activities" className="text-sm font-heading font-semibold text-brand-fume hover:text-primary-700 no-underline">
              Keşfet
            </Link>
            <Link href="/profile" className="text-sm font-heading font-semibold text-brand-fume hover:text-primary-700 no-underline">
              Profilim
            </Link>
            <button
              onClick={() => authService.logout().then(() => router.push('/login'))}
              className="btn-outline btn-sm"
            >
              Çıkış
            </button>
          </nav>
        </div>
      </header>

      <main className="container-rny py-8">
        {children}
      </main>
    </div>
  );
}

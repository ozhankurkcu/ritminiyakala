'use client';

import Link from 'next/link';
import { useAuth } from '@/modules/auth/useAuth';

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="max-w-4xl mx-auto">
      {/* Karşılama */}
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-extrabold text-primary-700 mb-1">
          Merhaba, {user?.displayName?.split(' ')[0] ?? 'Sporcu'} 👋
        </h1>
        <p className="text-brand-fume">Bugün hangi aktiviteye katılıyorsun?</p>
      </div>

      {/* Hızlı Aksiyonlar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <Link href="/activities/create" className="card hover:border-primary-300 no-underline group">
          <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-primary-200 transition-colors">
            <span className="text-xl">➕</span>
          </div>
          <h3 className="font-heading font-semibold text-black mb-1">Aktivite Oluştur</h3>
          <p className="text-sm text-brand-fume">Yeni bir spor aktivitesi oluştur</p>
        </Link>

        <Link href="/activities" className="card hover:border-accent-dark no-underline group">
          <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center mb-3 group-hover:bg-accent/40 transition-colors">
            <span className="text-xl">🔍</span>
          </div>
          <h3 className="font-heading font-semibold text-black mb-1">Aktivite Keşfet</h3>
          <p className="text-sm text-brand-fume">Yakınındaki aktiviteleri bul</p>
        </Link>

        <Link href="/profile" className="card hover:border-secondary no-underline group">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-orange-200 transition-colors">
            <span className="text-xl">👤</span>
          </div>
          <h3 className="font-heading font-semibold text-black mb-1">Profilim</h3>
          <p className="text-sm text-brand-fume">Profilini düzenle</p>
        </Link>
      </div>

      {/* Yaklaşan Aktiviteler — Sprint 2'de doldurulacak */}
      <div className="mb-8">
        <h2 className="font-heading text-xl font-bold text-black mb-4">Yaklaşan Aktivitelerim</h2>
        <div className="card text-center py-12">
          <p className="text-4xl mb-3">🏃</p>
          <p className="font-heading font-semibold text-black mb-1">Henüz aktiviten yok</p>
          <p className="text-sm text-brand-fume mb-4">Bir aktivite oluştur veya yakınındakilere katıl</p>
          <Link href="/activities" className="btn-primary btn-md inline-block no-underline">
            Aktivite Keşfet
          </Link>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/modules/auth/useAuth';
import { activityService } from '@/modules/activity/activityService';
import { ACTIVITY_LABELS } from '@/lib/constants';
import { ActivityIcon } from '@/components/shared/ActivityIcon';
import type { Activity } from '@/types';

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit',
  }).format(date);
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    if (!user) return;
    activityService.listMyActivities(user.uid)
      .then((acts) => {
        const upcoming = acts
          .filter((a) => a.startTime > new Date() && a.status === 'scheduled')
          .slice(0, 3);
        setActivities(upcoming);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

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

        <Link href="/activities/my" className="card hover:border-secondary no-underline group">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-orange-200 transition-colors">
            <span className="text-xl">📋</span>
          </div>
          <h3 className="font-heading font-semibold text-black mb-1">Aktivitelerim</h3>
          <p className="text-sm text-brand-fume">Oluşturduğun ve katıldığın aktiviteler</p>
        </Link>
      </div>

      {/* Yaklaşan Aktivitelerim */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-xl font-bold text-black">Yaklaşan Aktivitelerim</h2>
          <Link href="/activities/my" className="text-sm text-brand-intLink hover:underline no-underline font-semibold">
            Tümünü Gör →
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-7 h-7 border-4 border-primary-700 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : activities.length === 0 ? (
          <div className="card text-center py-10">
            <p className="text-3xl mb-3">🏃</p>
            <p className="font-heading font-semibold text-black mb-1">Henüz aktiviten yok</p>
            <p className="text-sm text-brand-fume mb-4">Bir aktivite oluştur veya yakınındakilere katıl</p>
            <Link href="/activities" className="btn-primary btn-md inline-flex items-center justify-center no-underline text-white">
              Aktivite Keşfet
            </Link>
          </div>
        ) : (
          <div className="grid gap-3">
            {activities.map((activity) => (
              <Link
                key={activity.id}
                href={`/activities/${activity.id}`}
                className="card hover:border-primary-300 no-underline group flex items-center gap-4 py-3"
              >
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-primary-200 transition-colors">
                  <ActivityIcon type={activity.activityType} size={24} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-heading font-semibold text-black truncate group-hover:text-primary-700 transition-colors">
                    {activity.title}
                  </p>
                  <p className="text-sm text-brand-fume">
                    {ACTIVITY_LABELS[activity.activityType as keyof typeof ACTIVITY_LABELS] ?? activity.customTypeName ?? activity.activityType} · {formatDate(activity.startTime)}
                  </p>
                </div>
                <span className="text-xs text-brand-fume shrink-0">
                  {activity.currentParticipants}/{activity.maxParticipants} kişi
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

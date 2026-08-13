'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/modules/auth/useAuth';
import { activityService } from '@/modules/activity/activityService';
import { ACTIVITY_LABELS } from '@/lib/constants';
import { ActivityIcon } from '@/components/shared/ActivityIcon';
import type { Activity } from '@/types';

type Tab = 'created' | 'joined';

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit',
  }).format(date);
}

function ActionMenu({
  activity,
  onArchive,
  onDelete,
}: {
  activity: Activity;
  onArchive: (id: string) => void;
  onDelete:  (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={(e) => { e.preventDefault(); setOpen((v) => !v); }}
        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-brand-fume font-bold text-lg"
        title="Seçenekler"
      >
        ⋯
      </button>
      {open && (
        <div className="absolute right-0 top-9 z-20 bg-white border border-brand-border rounded-xl shadow-lg py-1 w-44">
          <Link
            href={`/activities/${activity.id}/edit`}
            className="flex items-center gap-2 px-4 py-2 text-sm text-black hover:bg-gray-50 no-underline"
            onClick={() => setOpen(false)}
          >
            ✏️ Düzenle
          </Link>
          <button
            onClick={() => { setOpen(false); onArchive(activity.id); }}
            className="flex items-center gap-2 px-4 py-2 text-sm text-black hover:bg-gray-50 w-full text-left"
          >
            📦 Arşivle
          </button>
          <div className="border-t border-brand-border my-1" />
          <button
            onClick={() => { setOpen(false); onDelete(activity.id); }}
            className="flex items-center gap-2 px-4 py-2 text-sm text-status-error hover:bg-red-50 w-full text-left"
          >
            🗑️ Sil
          </button>
        </div>
      )}
    </div>
  );
}

function ActivityCard({
  activity,
  isOwner,
  onArchive,
  onDelete,
  onLeave,
}: {
  activity:  Activity;
  isOwner:   boolean;
  onArchive?: (id: string) => void;
  onDelete?:  (id: string) => void;
  onLeave?:   (id: string) => void;
}) {
  const isFull = activity.currentParticipants >= activity.maxParticipants;

  return (
    <div className="card flex items-start gap-4 transition-colors hover:border-primary-300">
      <Link href={`/activities/${activity.id}`} className="flex items-start gap-4 flex-1 no-underline min-w-0">
        <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center shrink-0">
          <ActivityIcon type={activity.activityType} size={28} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="font-heading font-semibold text-black truncate hover:text-primary-700 transition-colors">
              {activity.title}
            </p>
            <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-semibold ${
              isFull ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'
            }`}>
              {activity.currentParticipants}/{activity.maxParticipants}
            </span>
          </div>
          <p className="text-sm text-brand-fume mt-0.5">
            {ACTIVITY_LABELS[activity.activityType as keyof typeof ACTIVITY_LABELS] ?? activity.customTypeName ?? activity.activityType} · {formatDate(activity.startTime)}
          </p>
          <p className="text-sm text-brand-fume truncate mt-0.5">📍 {activity.location.address}</p>
        </div>
      </Link>

      {/* Aksiyonlar */}
      <div className="shrink-0">
        {isOwner && onArchive && onDelete ? (
          <ActionMenu activity={activity} onArchive={onArchive} onDelete={onDelete} />
        ) : onLeave ? (
          <button
            onClick={() => onLeave(activity.id)}
            className="text-xs px-3 py-1.5 rounded-lg border-2 border-brand-border text-brand-fume hover:border-status-error hover:text-status-error transition-colors whitespace-nowrap"
          >
            Çık
          </button>
        ) : null}
      </div>
    </div>
  );
}

export default function MyActivitiesPage() {
  const { user }   = useAuth();
  const [tab, setTab]           = useState<Tab>('created');
  const [created, setCreated]   = useState<Activity[]>([]);
  const [joined,  setJoined]    = useState<Activity[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);

    // İkisini bağımsız çalıştır — biri hata verse diğeri etkilenmesin
    activityService.listMyActivities(user.uid)
      .then(setCreated)
      .catch(console.error)
      .finally(() => setLoading(false));

    activityService.getJoinedActivities(user.uid)
      .then((joined) => setJoined(joined.filter((a) => a.organizerId !== user.uid)))
      .catch(console.error);
  }, [user]);

  const upcoming = created.filter((a) => a.startTime > new Date() && a.status === 'scheduled');
  const past     = created.filter((a) => a.startTime <= new Date() || a.status !== 'scheduled');
  const joinedUpcoming = joined.filter((a) => a.startTime > new Date() && a.status === 'scheduled');
  const joinedPast     = joined.filter((a) => a.startTime <= new Date() || a.status !== 'scheduled');

  const handleArchive = async (id: string) => {
    if (!confirm('Bu aktiviteyi arşivlemek istiyor musun?')) return;
    await activityService.archiveActivity(id);
    setCreated((prev) => prev.map((a) => a.id === id ? { ...a, status: 'archived' as const } : a));
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu aktiviteyi kalıcı olarak silmek istiyor musun? Bu işlem geri alınamaz.')) return;
    await activityService.deleteActivity(id);
    setCreated((prev) => prev.filter((a) => a.id !== id));
  };

  const handleLeave = async (id: string) => {
    if (!user) return;
    if (!confirm('Bu aktiviteden ayrılmak istiyor musun?')) return;
    await activityService.leaveActivity(id, user.uid);
    setJoined((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold text-primary-700">Aktivitelerim</h1>
        <Link href="/activities/create" className="btn-secondary btn-md inline-flex items-center justify-center no-underline text-white">
          + Yeni Aktivite
        </Link>
      </div>

      {/* Tab */}
      <div className="flex rounded-lg border-2 border-brand-border overflow-hidden mb-6">
        {([['created', 'Oluşturduklarım'], ['joined', 'Katıldıklarım']] as [Tab, string][]).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 py-2.5 text-sm font-heading font-semibold transition-colors ${
              tab === key ? 'bg-primary-700 text-white' : 'text-brand-fume hover:bg-gray-50'
            }`}
          >
            {label}
            {key === 'created' && created.length > 0 && (
              <span className="ml-1.5 text-xs opacity-70">({created.length})</span>
            )}
            {key === 'joined' && joined.length > 0 && (
              <span className="ml-1.5 text-xs opacity-70">({joined.length})</span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-primary-700 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : tab === 'created' ? (
        <div className="space-y-6">
          <div>
            <h2 className="font-heading font-semibold text-black mb-3">
              Yaklaşan <span className="text-brand-fume font-normal text-sm">({upcoming.length})</span>
            </h2>
            {upcoming.length === 0 ? (
              <div className="card text-center py-8">
                <p className="text-brand-fume text-sm mb-3">Yaklaşan aktiviteniz yok</p>
                <Link href="/activities/create" className="btn-primary btn-md inline-flex items-center justify-center no-underline text-white">
                  Aktivite Oluştur
                </Link>
              </div>
            ) : (
              <div className="grid gap-3">
                {upcoming.map((a) => (
                  <ActivityCard key={a.id} activity={a} isOwner onArchive={handleArchive} onDelete={handleDelete} />
                ))}
              </div>
            )}
          </div>

          {past.length > 0 && (
            <div>
              <h2 className="font-heading font-semibold text-black mb-3">
                Geçmiş / Arşiv <span className="text-brand-fume font-normal text-sm">({past.length})</span>
              </h2>
              <div className="grid gap-3 opacity-60">
                {past.map((a) => (
                  <ActivityCard key={a.id} activity={a} isOwner onArchive={handleArchive} onDelete={handleDelete} />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div>
            <h2 className="font-heading font-semibold text-black mb-3">
              Yaklaşan <span className="text-brand-fume font-normal text-sm">({joinedUpcoming.length})</span>
            </h2>
            {joinedUpcoming.length === 0 ? (
              <div className="card text-center py-8">
                <p className="text-3xl mb-3">🤝</p>
                <p className="font-heading font-semibold text-black mb-1">Henüz bir aktiviteye katılmadın</p>
                <p className="text-sm text-brand-fume mb-4">Keşfet sayfasından aktivite bul ve katıl</p>
                <Link href="/activities" className="btn-primary btn-md inline-flex items-center justify-center no-underline text-white">
                  Aktivite Keşfet
                </Link>
              </div>
            ) : (
              <div className="grid gap-3">
                {joinedUpcoming.map((a) => (
                  <ActivityCard key={a.id} activity={a} isOwner={false} onLeave={handleLeave} />
                ))}
              </div>
            )}
          </div>

          {joinedPast.length > 0 && (
            <div>
              <h2 className="font-heading font-semibold text-black mb-3">
                Geçmiş <span className="text-brand-fume font-normal text-sm">({joinedPast.length})</span>
              </h2>
              <div className="grid gap-3 opacity-60">
                {joinedPast.map((a) => (
                  <ActivityCard key={a.id} activity={a} isOwner={false} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/modules/auth/useAuth';
import { activityService } from '@/modules/activity/activityService';
import { ACTIVITY_LABELS, SKILL_LEVEL_LABELS, type SkillLevel } from '@/lib/constants';
import { ActivityIcon } from '@/components/shared/ActivityIcon';
import type { Activity, Participant } from '@/types';

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('tr-TR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  }).format(date);
}

function formatTime(date: Date) {
  return new Intl.DateTimeFormat('tr-TR', {
    hour: '2-digit', minute: '2-digit',
  }).format(date);
}

export default function ActivityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router  = useRouter();
  const { user } = useAuth();

  const [activity,     setActivity]     = useState<Activity | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isJoined,     setIsJoined]     = useState(false);
  const [loading,      setLoading]      = useState(true);
  const [joining,      setJoining]      = useState(false);
  const [error,        setError]        = useState('');

  useEffect(() => {
    if (!id || !user) return;
    Promise.all([
      activityService.getActivity(id),
      activityService.getParticipants(id),
      activityService.isParticipant(id, user.uid),
    ]).then(([act, parts, joined]) => {
      setActivity(act);
      setParticipants(parts);
      setIsJoined(joined);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, [id, user]);

  const handleJoin = async () => {
    if (!user || !activity) return;
    setJoining(true);
    setError('');
    try {
      await activityService.joinActivity(activity.id, user.uid, user.displayName ?? 'Sporcu');
      setIsJoined(true);
      setActivity((prev) => prev ? { ...prev, currentParticipants: prev.currentParticipants + 1 } : prev);
      setParticipants((prev) => [...prev, {
        userId: user.uid,
        displayName: user.displayName ?? 'Sporcu',
        status: 'confirmed',
        joinedAt: new Date(),
      }]);
    } catch {
      setError('Aktiviteye katılırken hata oluştu.');
    } finally {
      setJoining(false);
    }
  };

  const handleLeave = async () => {
    if (!user || !activity) return;
    setJoining(true);
    setError('');
    try {
      await activityService.leaveActivity(activity.id, user.uid);
      setIsJoined(false);
      setActivity((prev) => prev ? { ...prev, currentParticipants: prev.currentParticipants - 1 } : prev);
      setParticipants((prev) => prev.filter((p) => p.userId !== user.uid));
    } catch {
      setError('Aktiviteden ayrılırken hata oluştu.');
    } finally {
      setJoining(false);
    }
  };

  const handleCancel = async () => {
    if (!activity) return;
    if (!confirm('Aktiviteyi iptal etmek istediğine emin misin?')) return;
    try {
      await activityService.cancelActivity(activity.id);
      router.push('/activities');
    } catch {
      setError('Aktivite iptal edilemedi.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-primary-700 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="text-center py-20">
        <p className="text-brand-fume">Aktivite bulunamadı.</p>
        <Link href="/activities" className="btn-primary btn-md inline-flex items-center justify-center no-underline text-white mt-4">
          Geri Dön
        </Link>
      </div>
    );
  }

  const isOrganizer = user?.uid === activity.organizerId;
  const isFull      = activity.currentParticipants >= activity.maxParticipants;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Geri */}
      <Link href="/activities" className="inline-flex items-center gap-1 text-sm text-brand-fume hover:text-primary-700 mb-4 no-underline">
        ← Tüm Aktiviteler
      </Link>

      {/* Başlık kartı */}
      <div className="card mb-4">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center shrink-0">
            <ActivityIcon type={activity.activityType} size={36} />
          </div>
          <div className="flex-1">
            <h1 className="font-heading text-2xl font-bold text-black mb-1">{activity.title}</h1>
            <div className="flex flex-wrap gap-2">
              <span className="badge-primary">{ACTIVITY_LABELS[activity.activityType as keyof typeof ACTIVITY_LABELS] ?? activity.customTypeName ?? activity.activityType}</span>
              <span className="badge-primary">
                {activity.skillLevel === 'all' ? 'Herkese Açık' : SKILL_LEVEL_LABELS[activity.skillLevel as SkillLevel]}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Detaylar */}
      <div className="card mb-4 space-y-3">
        <div className="flex items-start gap-3">
          <span className="text-xl">📅</span>
          <div>
            <p className="font-heading font-semibold text-black">{formatDate(activity.startTime)}</p>
            <p className="text-sm text-brand-fume">{formatTime(activity.startTime)} – {formatTime(activity.endTime)}</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <span className="text-xl">📍</span>
          <p className="text-black">{activity.location.address}</p>
        </div>
        <div className="flex items-start gap-3">
          <span className="text-xl">👥</span>
          <p className="text-black">
            <span className={`font-bold ${isFull ? 'text-status-error' : 'text-status-success'}`}>
              {activity.currentParticipants}
            </span>
            <span className="text-brand-fume"> / {activity.maxParticipants} katılımcı</span>
          </p>
        </div>
        <div className="flex items-start gap-3">
          <span className="text-xl">🙋</span>
          <p className="text-black">Organizatör: <span className="font-semibold">{activity.organizerName}</span></p>
        </div>
        {activity.description && (
          <div className="pt-2 border-t border-brand-border">
            <p className="text-brand-fume text-sm">{activity.description}</p>
          </div>
        )}
      </div>

      {/* Hata */}
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200">
          <p className="text-sm text-status-error">{error}</p>
        </div>
      )}

      {/* Aksiyon butonları */}
      {activity.status === 'scheduled' && (
        <div className="flex gap-3 mb-6">
          {isOrganizer ? (
            <button onClick={handleCancel} className="btn-outline btn-lg flex-1 text-status-error border-status-error hover:bg-red-50">
              Aktiviteyi İptal Et
            </button>
          ) : isJoined ? (
            <button onClick={handleLeave} disabled={joining} className="btn-outline btn-lg flex-1">
              {joining ? 'İşleniyor...' : 'Ayrıl'}
            </button>
          ) : (
            <button
              onClick={handleJoin}
              disabled={joining || isFull}
              className="btn-secondary btn-lg flex-1"
            >
              {joining ? 'Katılıyor...' : isFull ? 'Aktivite Dolu' : 'Katıl'}
            </button>
          )}
        </div>
      )}

      {/* Katılımcılar */}
      <div className="card">
        <h2 className="font-heading font-semibold text-black mb-3">
          Katılımcılar ({participants.length})
        </h2>
        {participants.length === 0 ? (
          <p className="text-sm text-brand-fume">Henüz katılımcı yok.</p>
        ) : (
          <div className="space-y-2">
            {participants.map((p) => (
              <div key={p.userId} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-sm font-heading font-bold text-primary-700">
                  {p.displayName?.[0]?.toUpperCase() ?? '?'}
                </div>
                <span className="text-sm text-black">{p.displayName}</span>
                {p.userId === activity.organizerId && (
                  <span className="text-xs text-brand-fume">(organizatör)</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

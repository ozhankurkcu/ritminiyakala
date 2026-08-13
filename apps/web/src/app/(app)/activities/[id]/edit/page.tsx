'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/modules/auth/useAuth';
import { activityService } from '@/modules/activity/activityService';
import { VISIBILITY_LABELS, ACTIVITY_VISIBILITY, type ActivityVisibility } from '@/lib/constants';
import type { Activity } from '@/types';

function toDateString(date: Date) {
  return date.toISOString().split('T')[0];
}
function toTimeString(date: Date) {
  return date.toTimeString().slice(0, 5);
}

export default function EditActivityPage() {
  const { id }   = useParams<{ id: string }>();
  const router   = useRouter();
  const { user } = useAuth();

  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState('');

  const [form, setForm] = useState({
    title:           '',
    description:     '',
    address:         '',
    date:            '',
    startHour:       '10:00',
    endHour:         '12:00',
    maxParticipants: 10,
    visibility:      'public' as ActivityVisibility,
  });

  const set = <K extends keyof typeof form>(field: K, value: typeof form[K]) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  useEffect(() => {
    if (!id) return;
    activityService.getActivity(id).then((act) => {
      if (!act) { router.push('/activities/my'); return; }
      setActivity(act);
      setForm({
        title:           act.title,
        description:     act.description ?? '',
        address:         act.location.address,
        date:            toDateString(act.startTime),
        startHour:       toTimeString(act.startTime),
        endHour:         toTimeString(act.endTime),
        maxParticipants: act.maxParticipants,
        visibility:      (act as unknown as { visibility?: ActivityVisibility }).visibility ?? 'public',
      });
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, [id, router]);

  // Sadece organizatör erişebilir
  useEffect(() => {
    if (!loading && activity && user && activity.organizerId !== user.uid) {
      router.push(`/activities/${id}`);
    }
  }, [loading, activity, user, id, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    if (!form.title.trim()) { setError('Başlık zorunlu.'); return; }
    if (!form.address.trim()) { setError('Konum zorunlu.'); return; }

    const startTime = new Date(`${form.date}T${form.startHour}`);
    const endTime   = new Date(`${form.date}T${form.endHour}`);
    if (endTime <= startTime) { setError('Bitiş saati başlangıçtan sonra olmalı.'); return; }

    setError('');
    setSaving(true);
    try {
      await activityService.updateActivity(id, {
        title:           form.title.trim(),
        description:     form.description.trim(),
        address:         form.address.trim(),
        startTime,
        endTime,
        maxParticipants: form.maxParticipants,
        visibility:      form.visibility,
      });
      router.push(`/activities/${id}`);
    } catch {
      setError('Güncelleme başarısız. Tekrar deneyin.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-primary-700 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!activity) return null;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="font-heading text-2xl font-bold text-primary-700 mb-6">Aktiviteyi Düzenle</h1>

      <form onSubmit={handleSubmit} method="post" noValidate className="space-y-6">

        {/* Temel Bilgiler */}
        <div className="card space-y-4">
          <h2 className="font-heading font-semibold text-black">Temel Bilgiler</h2>
          <div>
            <label className="block text-sm font-heading font-semibold text-black mb-1">
              Başlık <span className="text-status-error">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              className="input-base"
              maxLength={80}
            />
          </div>
          <div>
            <label className="block text-sm font-heading font-semibold text-black mb-1">Açıklama</label>
            <textarea
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              rows={3}
              className="input-base resize-none"
              maxLength={500}
            />
          </div>
        </div>

        {/* Tarih & Saat */}
        <div className="card space-y-4">
          <h2 className="font-heading font-semibold text-black">Tarih & Saat</h2>
          <div>
            <label className="block text-sm font-heading font-semibold text-black mb-1">Tarih</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => set('date', e.target.value)}
              className="input-base"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-heading font-semibold text-black mb-1">Başlangıç</label>
              <input type="time" value={form.startHour} onChange={(e) => set('startHour', e.target.value)} className="input-base" />
            </div>
            <div>
              <label className="block text-sm font-heading font-semibold text-black mb-1">Bitiş</label>
              <input type="time" value={form.endHour} onChange={(e) => set('endHour', e.target.value)} className="input-base" />
            </div>
          </div>
        </div>

        {/* Konum */}
        <div className="card space-y-4">
          <h2 className="font-heading font-semibold text-black">Konum</h2>
          <input
            type="text"
            value={form.address}
            onChange={(e) => set('address', e.target.value)}
            placeholder="Adres"
            className="input-base"
          />
        </div>

        {/* Kapasite & Görünürlük */}
        <div className="card space-y-4">
          <h2 className="font-heading font-semibold text-black">Kapasite & Görünürlük</h2>

          <div>
            <label className="block text-sm font-heading font-semibold text-black mb-2">
              Kabul Edilebilir Katılımcı Sayısı
            </label>
            <div className="flex items-center gap-4">
              <button type="button" onClick={() => set('maxParticipants', Math.max(activity.currentParticipants, form.maxParticipants - 1))}
                className="w-10 h-10 rounded-lg border-2 border-brand-border font-bold text-lg hover:border-primary-300 transition-colors">−</button>
              <span className="font-heading font-bold text-2xl text-primary-700 w-10 text-center">{form.maxParticipants}</span>
              <button type="button" onClick={() => set('maxParticipants', Math.min(100, form.maxParticipants + 1))}
                className="w-10 h-10 rounded-lg border-2 border-brand-border font-bold text-lg hover:border-primary-300 transition-colors">+</button>
              <span className="text-sm text-brand-fume">kişi (şu an {activity.currentParticipants} katılımcı)</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-heading font-semibold text-black mb-2">Aktivite Durumu</label>
            <div className="space-y-2">
              {ACTIVITY_VISIBILITY.map((vis) => (
                <label key={vis} className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                  form.visibility === vis ? 'border-primary-700 bg-primary-50' : 'border-brand-border hover:border-primary-300'
                }`}>
                  <input type="radio" name="visibility" value={vis} checked={form.visibility === vis}
                    onChange={() => set('visibility', vis)} className="accent-primary-700" />
                  <span className="font-body text-sm text-black">{VISIBILITY_LABELS[vis]}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200">
            <p className="text-sm text-status-error">{error}</p>
          </div>
        )}

        <div className="flex gap-3 pb-8">
          <button type="button" onClick={() => router.back()} className="btn-outline btn-lg flex-1">İptal</button>
          <button type="submit" disabled={saving} className="btn-secondary btn-lg flex-1">
            {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
          </button>
        </div>
      </form>
    </div>
  );
}

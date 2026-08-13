'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/modules/auth/useAuth';
import { activityService } from '@/modules/activity/activityService';
import { AddressSearch } from '@/components/map/AddressSearch';
import type { GeocodingResult } from '@/lib/geocoding';
import { ActivityIcon } from '@/components/shared/ActivityIcon';
import {
  ACTIVITY_TYPES, ACTIVITY_LABELS,
  ACTIVITY_CATEGORIES, CATEGORY_LABELS, CATEGORY_ICONS,
  ACTIVITY_TYPE_CATEGORY,
  EXPERIENCE_LEVELS, EXPERIENCE_LABELS, type ExperienceLevel,
  ACTIVITY_VISIBILITY, VISIBILITY_LABELS, VISIBILITY_DESCRIPTIONS, type ActivityVisibility,
  RECURRENCE_FREQUENCIES, FREQUENCY_LABELS, type RecurrenceFrequency,
  type ActivityType, type ActivityCategory,
} from '@/lib/constants';

type ScheduleType = 'once' | 'recurring';

interface FormState {
  // Aktivite
  activityType:   ActivityType | 'custom';
  category:       ActivityCategory;
  customTypeName: string;
  // Tecrübe
  experience:   ExperienceLevel;
  experienceYears: number;
  // Görünürlük
  visibility:   ActivityVisibility;
  // Temel
  title:        string;
  description:  string;
  // Zamanlama
  scheduleType: ScheduleType;
  date:         string;
  startHour:    string;
  endHour:      string;
  // Tekrarlama
  frequency:       RecurrenceFrequency;
  frequencyEvery:  number;
  durationValue:   number;
  durationUnit:    'week' | 'month';
  // Konum
  address:   string;
  latitude:  number;
  longitude: number;
  // Katılımcı
  maxParticipants: number;
}

const DURATION_UNIT_LABELS = { week: 'hafta', month: 'ay' };

export default function CreateActivityPage() {
  const router    = useRouter();
  const { user }  = useAuth();
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState('');

  const [form, setForm] = useState<FormState>({
    activityType:   'yuruyus',
    category:       ACTIVITY_TYPE_CATEGORY['yuruyus'],
    customTypeName: '',
    experience:      'beginner',
    experienceYears: 1,
    visibility:      'public',
    title:           '',
    description:     '',
    scheduleType:    'once',
    date:            '',
    startHour:       '10:00',
    endHour:         '12:00',
    frequency:       'weekly',
    frequencyEvery:  1,
    durationValue:   4,
    durationUnit:    'week',
    address:         '',
    latitude:        0,
    longitude:       0,
    maxParticipants: 10,
  });

  const set = <K extends keyof FormState>(field: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!form.date)          { setError('Lütfen başlangıç tarihi seçin.'); return; }
    if (form.title.trim().length < 3) { setError('Başlık en az 3 karakter olmalı.'); return; }
    if (!form.address.trim()) { setError('Lütfen konum girin.'); return; }
    if (form.activityType === 'custom' && !form.customTypeName.trim()) {
      setError('Lütfen özel aktivite türü adını girin.'); return;
    }

    const startTime = new Date(`${form.date}T${form.startHour}`);
    const endTime   = new Date(`${form.date}T${form.endHour}`);
    if (endTime <= startTime) { setError('Bitiş saati başlangıçtan sonra olmalı.'); return; }

    setError('');
    setSaving(true);
    try {
      const id = await activityService.createActivity(
        user.uid,
        user.displayName ?? 'Sporcu',
        {
          title:           form.title.trim(),
          description:     form.description.trim(),
          activityType:    form.activityType,
          category:        form.category,
          customTypeName:  form.activityType === 'custom' ? form.customTypeName.trim() : undefined,
          skillLevel:      form.experience,
          address:         form.address.trim(),
          latitude:        form.latitude,
          longitude:       form.longitude,
          startTime,
          endTime,
          maxParticipants: form.maxParticipants,
          visibility:      form.visibility,
          scheduleType:    form.scheduleType,
          ...(form.scheduleType === 'recurring' && {
            recurrence: {
              frequency:     form.frequency,
              every:         form.frequencyEvery,
              durationValue: form.durationValue,
              durationUnit:  form.durationUnit,
            },
          }),
          experience:      form.experience,
          experienceYears: form.experience !== 'beginner' ? form.experienceYears : undefined,
        },
      );
      router.push(`/activities/${id}`);
    } catch (err) {
      setError('Aktivite oluşturulamadı. Tekrar deneyin.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="font-heading text-2xl font-bold text-primary-700 mb-6">Aktivite Oluştur</h1>

      <form onSubmit={handleSubmit} method="post" noValidate className="space-y-6">

        {/* ── Temel Bilgiler ── */}
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
              placeholder="örn. Cumartesi sabahı parkta yürüyüş"
              className="input-base"
              maxLength={80}
            />
          </div>
          <div>
            <label className="block text-sm font-heading font-semibold text-black mb-1">
              Açıklama
            </label>
            <textarea
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="Aktivite hakkında kısa bir açıklama..."
              rows={3}
              className="input-base resize-none"
              maxLength={500}
            />
          </div>
        </div>

        {/* ── Aktivite Türü ── */}
        <div className="card space-y-4">
          <h2 className="font-heading font-semibold text-black">Aktivite Türü</h2>
          <div className="flex flex-wrap gap-2">
            {ACTIVITY_TYPES.map((sport) => (
              <button
                key={sport}
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, activityType: sport, category: ACTIVITY_TYPE_CATEGORY[sport] ?? 'diger' }))}
                className={`px-3 py-1.5 rounded-full text-sm font-body border-2 transition-colors ${
                  form.activityType === sport
                    ? 'bg-primary-700 text-white border-primary-700'
                    : 'border-brand-border text-brand-fume hover:border-primary-300'
                }`}
              >
                <ActivityIcon type={sport} size={20} className="inline-block mr-1 align-middle" /> {ACTIVITY_LABELS[sport]}
              </button>
            ))}
            {/* Özel tür butonu */}
            <button
              type="button"
              onClick={() => setForm((prev) => ({ ...prev, activityType: 'custom', category: 'diger' }))}
              className={`px-3 py-1.5 rounded-full text-sm font-body border-2 transition-colors ${
                form.activityType === 'custom'
                  ? 'bg-secondary text-white border-secondary'
                  : 'border-brand-border text-brand-fume hover:border-secondary'
              }`}
            >
              ✏️ Özel Tür
            </button>
          </div>

          {/* Özel tür adı + kategori */}
          {form.activityType === 'custom' && (
            <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-xl space-y-3">
              <p className="text-xs text-orange-700 font-semibold">
                Aktivite türünü yaz — onaylandıktan sonra platforma eklenecek.
              </p>
              <input
                type="text"
                value={form.customTypeName}
                onChange={(e) => set('customTypeName', e.target.value)}
                placeholder="Örn: Satranç, Bisiklet Turu, Yoga..."
                maxLength={50}
                className="input-base"
              />
              <div>
                <p className="text-xs text-orange-700 font-semibold mb-2">Kategori seç:</p>
                <div className="flex flex-wrap gap-2">
                  {ACTIVITY_CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => set('category', cat)}
                      className={`px-2.5 py-1 rounded-full text-xs font-body border-2 transition-colors ${
                        form.category === cat
                          ? 'bg-secondary text-white border-secondary'
                          : 'border-orange-200 text-orange-700 hover:border-secondary bg-white'
                      }`}
                    >
                      {CATEGORY_ICONS[cat]} {CATEGORY_LABELS[cat]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Tecrübe ── */}
        <div className="card space-y-4">
          <h2 className="font-heading font-semibold text-black">Tecrübe</h2>
          <div className="space-y-2">
            {EXPERIENCE_LEVELS.map((level) => (
              <label
                key={level}
                className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                  form.experience === level
                    ? 'border-primary-700 bg-primary-50'
                    : 'border-brand-border hover:border-primary-300'
                }`}
              >
                <input
                  type="radio"
                  name="experience"
                  value={level}
                  checked={form.experience === level}
                  onChange={() => set('experience', level)}
                  className="accent-primary-700"
                />
                <span className="font-body text-sm text-black flex-1">
                  {EXPERIENCE_LABELS[level]}
                </span>
                {level !== 'beginner' && form.experience === level && (
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={form.experienceYears}
                      onChange={(e) => set('experienceYears', Number(e.target.value))}
                      className="w-16 h-8 text-center rounded border-2 border-primary-300 text-sm font-semibold focus:outline-none focus:border-primary-700"
                    />
                    <span className="text-sm text-brand-fume">yıl</span>
                  </div>
                )}
              </label>
            ))}
          </div>
        </div>

        {/* ── Aktivite Durumu ── */}
        <div className="card space-y-4">
          <h2 className="font-heading font-semibold text-black">Aktivite Durumu</h2>
          <div className="space-y-2">
            {ACTIVITY_VISIBILITY.map((vis) => (
              <label
                key={vis}
                className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                  form.visibility === vis
                    ? 'border-primary-700 bg-primary-50'
                    : 'border-brand-border hover:border-primary-300'
                }`}
              >
                <input
                  type="radio"
                  name="visibility"
                  value={vis}
                  checked={form.visibility === vis}
                  onChange={() => set('visibility', vis)}
                  className="accent-primary-700 mt-0.5"
                />
                <div>
                  <p className="font-heading font-semibold text-sm text-black">{VISIBILITY_LABELS[vis]}</p>
                  <p className="text-xs text-brand-fume">{VISIBILITY_DESCRIPTIONS[vis]}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* ── Tarih & Saat ── */}
        <div className="card space-y-4">
          <h2 className="font-heading font-semibold text-black">Tarih & Saat</h2>

          {/* Tek seferlik / Düzenli toggle */}
          <div className="flex rounded-lg border-2 border-brand-border overflow-hidden">
            {(['once', 'recurring'] as ScheduleType[]).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => set('scheduleType', type)}
                className={`flex-1 py-2 text-sm font-heading font-semibold transition-colors ${
                  form.scheduleType === type
                    ? 'bg-primary-700 text-white'
                    : 'text-brand-fume hover:bg-gray-50'
                }`}
              >
                {type === 'once' ? 'Tek Seferlik' : 'Düzenli / Tekrarlayan'}
              </button>
            ))}
          </div>

          {/* Başlangıç tarihi */}
          <div>
            <label className="block text-sm font-heading font-semibold text-black mb-1">
              {form.scheduleType === 'once' ? 'Tarih' : 'Başlangıç Tarihi'} <span className="text-status-error">*</span>
            </label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => set('date', e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="input-base"
            />
          </div>

          {/* Saat */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-heading font-semibold text-black mb-1">Başlangıç Saati</label>
              <input type="time" value={form.startHour} onChange={(e) => set('startHour', e.target.value)} className="input-base" />
            </div>
            <div>
              <label className="block text-sm font-heading font-semibold text-black mb-1">Bitiş Saati</label>
              <input type="time" value={form.endHour} onChange={(e) => set('endHour', e.target.value)} className="input-base" />
            </div>
          </div>

          {/* Tekrarlama ayarları */}
          {form.scheduleType === 'recurring' && (
            <div className="space-y-4 pt-2 border-t border-brand-border">
              <p className="text-sm font-heading font-semibold text-black">Tekrarlama Düzeni</p>

              {/* Sıklık */}
              <div>
                <label className="block text-xs font-heading font-semibold text-brand-fume mb-1 uppercase tracking-wide">Sıklık</label>
                <div className="flex gap-2">
                  {RECURRENCE_FREQUENCIES.map((freq) => (
                    <button
                      key={freq}
                      type="button"
                      onClick={() => set('frequency', freq)}
                      className={`flex-1 py-2 rounded-lg text-sm font-heading font-semibold border-2 transition-colors ${
                        form.frequency === freq
                          ? 'bg-primary-700 text-white border-primary-700'
                          : 'border-brand-border text-brand-fume hover:border-primary-300'
                      }`}
                    >
                      {FREQUENCY_LABELS[freq]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Her kaçta bir */}
              <div className="flex items-center gap-3">
                <span className="text-sm text-black whitespace-nowrap">Her</span>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={form.frequencyEvery}
                  onChange={(e) => set('frequencyEvery', Number(e.target.value))}
                  className="w-16 h-10 text-center rounded-lg border-2 border-brand-border text-sm font-semibold focus:outline-none focus:border-primary-700"
                />
                <span className="text-sm text-black">
                  {form.frequency === 'daily' ? 'günde bir' : form.frequency === 'weekly' ? 'haftada bir' : 'ayda bir'}
                </span>
              </div>

              {/* Süre */}
              <div>
                <label className="block text-xs font-heading font-semibold text-brand-fume mb-1 uppercase tracking-wide">
                  Toplam Süre
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={1}
                    max={52}
                    value={form.durationValue}
                    onChange={(e) => set('durationValue', Number(e.target.value))}
                    className="w-16 h-10 text-center rounded-lg border-2 border-brand-border text-sm font-semibold focus:outline-none focus:border-primary-700"
                  />
                  <div className="flex gap-2">
                    {(['week', 'month'] as const).map((unit) => (
                      <button
                        key={unit}
                        type="button"
                        onClick={() => set('durationUnit', unit)}
                        className={`px-3 py-2 rounded-lg text-sm font-heading font-semibold border-2 transition-colors ${
                          form.durationUnit === unit
                            ? 'bg-primary-700 text-white border-primary-700'
                            : 'border-brand-border text-brand-fume hover:border-primary-300'
                        }`}
                      >
                        {DURATION_UNIT_LABELS[unit]}
                      </button>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-brand-fume mt-1">
                  Aktivite {form.durationValue} {DURATION_UNIT_LABELS[form.durationUnit]} boyunca devam edecek
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ── Konum ── */}
        <div className="card space-y-4">
          <h2 className="font-heading font-semibold text-black">Konum</h2>
          <div>
            <label className="block text-sm font-heading font-semibold text-black mb-1">
              Adres <span className="text-status-error">*</span>
            </label>
            <AddressSearch
              value={form.address}
              placeholder="örn. Kadıköy Spor Salonu, İstanbul"
              onChange={(result: GeocodingResult) => setForm((prev) => ({
                ...prev,
                address:   result.address,
                latitude:  result.latitude,
                longitude: result.longitude,
              }))}
            />
            {form.latitude !== 0 && (
              <p className="text-xs text-accent-dark mt-1">✓ Konum haritaya eklendi</p>
            )}
          </div>
        </div>

        {/* ── Kabul Edilebilir Katılımcı Sayısı ── */}
        <div className="card space-y-4">
          <h2 className="font-heading font-semibold text-black">Kabul Edilebilir Katılımcı Sayısı</h2>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => set('maxParticipants', Math.max(2, form.maxParticipants - 1))}
              className="w-10 h-10 rounded-lg border-2 border-brand-border font-bold text-lg hover:border-primary-300 transition-colors"
            >
              −
            </button>
            <span className="font-heading font-bold text-2xl text-primary-700 w-10 text-center">
              {form.maxParticipants}
            </span>
            <button
              type="button"
              onClick={() => set('maxParticipants', Math.min(100, form.maxParticipants + 1))}
              className="w-10 h-10 rounded-lg border-2 border-brand-border font-bold text-lg hover:border-primary-300 transition-colors"
            >
              +
            </button>
            <span className="text-sm text-brand-fume">kişi</span>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200">
            <p className="text-sm text-status-error">{error}</p>
          </div>
        )}

        <div className="flex gap-3 pb-8">
          <button type="button" onClick={() => router.back()} className="btn-outline btn-lg flex-1">
            İptal
          </button>
          <button type="submit" disabled={saving} className="btn-secondary btn-lg flex-1">
            {saving ? 'Oluşturuluyor...' : 'Aktivite Oluştur'}
          </button>
        </div>
      </form>
    </div>
  );
}

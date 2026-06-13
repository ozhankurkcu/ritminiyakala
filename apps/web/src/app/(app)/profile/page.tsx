'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/modules/auth/useAuth';
import { profileService } from '@/modules/profile/profileService';
import { SPORT_TYPES, SKILL_LEVELS, SKILL_LEVEL_LABELS, type SkillLevel, type SportType } from '@/lib/constants';
import type { UserProfile } from '@/types';

const SPORT_LABELS: Record<SportType, string> = {
  futbol: 'Futbol', basketbol: 'Basketbol', voleybol: 'Voleybol',
  tenis: 'Tenis', padel: 'Padel', kosu: 'Koşu', yuruyus: 'Yürüyüş',
  bisiklet: 'Bisiklet', yuzme: 'Yüzme', fitness: 'Fitness',
  yoga: 'Yoga', dans: 'Dans', 'doga-sporlari': 'Doğa Sporları', diger: 'Diğer',
};

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile]   = useState<UserProfile | null>(null);
  const [editing, setEditing]   = useState(false);
  const [saving, setSaving]     = useState(false);
  const [success, setSuccess]   = useState(false);
  const [error, setError]       = useState('');

  const [form, setForm] = useState({
    displayName:      '',
    bio:              '',
    skillLevel:       'beginner' as SkillLevel,
    sportPreferences: [] as SportType[],
  });

  useEffect(() => {
    if (!user) return;
    profileService.getProfile(user.uid).then((p) => {
      if (p) {
        setProfile(p);
        setForm({
          displayName:      p.displayName,
          bio:              p.bio ?? '',
          skillLevel:       p.skillLevel,
          sportPreferences: p.sportPreferences,
        });
      }
    });
  }, [user]);

  const toggleSport = (sport: SportType) => {
    setForm((prev) => ({
      ...prev,
      sportPreferences: prev.sportPreferences.includes(sport)
        ? prev.sportPreferences.filter((s) => s !== sport)
        : [...prev.sportPreferences, sport],
    }));
  };

  const handleSave = async () => {
    if (!user) return;
    setError('');
    setSaving(true);
    try {
      await profileService.updateProfile(user.uid, form);
      setProfile((prev) => prev ? { ...prev, ...form } : prev);
      setEditing(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError('Profil kaydedilemedi. Tekrar deneyin.');
    } finally {
      setSaving(false);
    }
  };

  if (!profile) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-primary-700 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold text-primary-700">Profilim</h1>
        {!editing ? (
          <button onClick={() => setEditing(true)} className="btn-outline btn-md">
            Düzenle
          </button>
        ) : (
          <div className="flex gap-2">
            <button onClick={() => setEditing(false)} className="btn-ghost btn-md">İptal</button>
            <button onClick={handleSave} disabled={saving} className="btn-secondary btn-md">
              {saving ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        )}
      </div>

      {success && (
        <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200">
          <p className="text-sm text-status-success font-semibold">✅ Profil güncellendi.</p>
        </div>
      )}
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200">
          <p className="text-sm text-status-error">{error}</p>
        </div>
      )}

      <div className="card space-y-6">
        {/* Avatar */}
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center text-3xl font-heading font-bold text-primary-700 overflow-hidden">
            {profile.photoURL
              ? <img src={profile.photoURL} alt="avatar" className="w-full h-full object-cover" />
              : profile.displayName?.[0]?.toUpperCase() ?? '?'
            }
          </div>
          <div>
            <p className="font-heading font-bold text-lg text-black">{profile.displayName}</p>
            <p className="text-sm text-brand-fume">{profile.email}</p>
          </div>
        </div>

        {/* Ad Soyad */}
        <div>
          <label className="block text-sm font-heading font-semibold text-black mb-1">Ad Soyad</label>
          {editing ? (
            <input
              value={form.displayName}
              onChange={(e) => setForm((p) => ({ ...p, displayName: e.target.value }))}
              className="input-base"
            />
          ) : (
            <p className="text-brand-fume">{profile.displayName}</p>
          )}
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-heading font-semibold text-black mb-1">Hakkımda</label>
          {editing ? (
            <textarea
              value={form.bio}
              onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
              rows={3}
              placeholder="Kendinden bahset..."
              className="input-base resize-none"
            />
          ) : (
            <p className="text-brand-fume">{profile.bio || '—'}</p>
          )}
        </div>

        {/* Seviye */}
        <div>
          <label className="block text-sm font-heading font-semibold text-black mb-2">Seviyem</label>
          {editing ? (
            <div className="flex gap-2 flex-wrap">
              {SKILL_LEVELS.map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, skillLevel: level }))}
                  className={`px-3 py-1.5 rounded-lg text-sm font-heading font-semibold border-2 transition-colors ${
                    form.skillLevel === level
                      ? 'bg-primary-700 text-white border-primary-700'
                      : 'border-brand-border text-brand-fume hover:border-primary-300'
                  }`}
                >
                  {SKILL_LEVEL_LABELS[level]}
                </button>
              ))}
            </div>
          ) : (
            <span className="badge-primary">{SKILL_LEVEL_LABELS[profile.skillLevel]}</span>
          )}
        </div>

        {/* Spor Tercihleri */}
        <div>
          <label className="block text-sm font-heading font-semibold text-black mb-2">Spor Tercihlerim</label>
          {editing ? (
            <div className="flex flex-wrap gap-2">
              {SPORT_TYPES.map((sport) => (
                <button
                  key={sport}
                  type="button"
                  onClick={() => toggleSport(sport)}
                  className={`px-3 py-1.5 rounded-full text-sm font-body border-2 transition-colors ${
                    form.sportPreferences.includes(sport)
                      ? 'bg-accent text-black border-accent-dark'
                      : 'border-brand-border text-brand-fume hover:border-accent-dark'
                  }`}
                >
                  {SPORT_LABELS[sport]}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {profile.sportPreferences.length > 0
                ? profile.sportPreferences.map((s) => (
                    <span key={s} className="badge-primary">{SPORT_LABELS[s]}</span>
                  ))
                : <p className="text-brand-fume text-sm">Henüz spor tercihi eklenmemiş</p>
              }
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

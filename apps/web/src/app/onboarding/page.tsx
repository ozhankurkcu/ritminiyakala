'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/modules/auth/useAuth';
import { profileService } from '@/modules/profile/profileService';
import { ACTIVITY_TYPES, ACTIVITY_LABELS, EXPERIENCE_LEVELS, EXPERIENCE_LABELS } from '@/lib/constants';
import { ActivityIcon } from '@/components/shared/ActivityIcon';
import type { ActivityType, ExperienceLevel } from '@/lib/constants';

type Step = 1 | 2 | 3;

export default function OnboardingPage() {
  const { user } = useAuth();
  const router   = useRouter();

  const [step, setStep]       = useState<Step>(1);
  const [saving, setSaving]   = useState(false);

  const [sports,     setSports]     = useState<ActivityType[]>([]);
  const [experience, setExperience] = useState<ExperienceLevel | ''>('');
  const [city,       setCity]       = useState('');

  const toggleSport = (s: ActivityType) =>
    setSports((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);

  const handleFinish = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await profileService.updateProfile(user.uid, {
        activityTypes:  sports,
        experience:  experience as ExperienceLevel,
        city:        city.trim(),
        onboarded:   true,
      });
      router.push('/dashboard');
    } catch {
      setSaving(false);
    }
  };

  const canNext1 = sports.length > 0;
  const canNext2 = experience !== '';
  const canNext3 = city.trim().length > 0;

  return (
    <div className="min-h-screen bg-brand-lightBg flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">

        {/* Logo */}
        <div className="text-center mb-8">
          <p className="font-heading font-extrabold text-2xl text-primary-700 mb-1">ritminiyakala</p>
          <p className="text-sm text-brand-fume">Seni tanıyalım — sadece {3 - step + 1} adım kaldı</p>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {([1, 2, 3] as Step[]).map((s) => (
            <div
              key={s}
              className={`flex-1 h-1.5 rounded-full transition-colors ${
                s <= step ? 'bg-primary-700' : 'bg-brand-border'
              }`}
            />
          ))}
        </div>

        {/* Adım 1: Spor Türleri */}
        {step === 1 && (
          <div className="card">
            <h2 className="font-heading text-xl font-bold text-black mb-1">Hangi sporları yapıyorsun?</h2>
            <p className="text-sm text-brand-fume mb-6">Birden fazla seçebilirsin.</p>
            <div className="grid grid-cols-3 gap-3 mb-8">
              {ACTIVITY_TYPES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleSport(s)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-sm font-heading font-semibold ${
                    sports.includes(s)
                      ? 'border-primary-700 bg-primary-50 text-primary-700'
                      : 'border-brand-border text-black hover:border-primary-300'
                  }`}
                >
                  <ActivityIcon type={s} size={28} />
                  <span className="text-xs text-center leading-tight">{ACTIVITY_LABELS[s]}</span>
                </button>
              ))}
            </div>
            <button
              onClick={() => setStep(2)}
              disabled={!canNext1}
              className="btn-primary btn-lg w-full"
            >
              Devam Et →
            </button>
          </div>
        )}

        {/* Adım 2: Tecrübe */}
        {step === 2 && (
          <div className="card">
            <h2 className="font-heading text-xl font-bold text-black mb-1">Ne kadar süredir spor yapıyorsun?</h2>
            <p className="text-sm text-brand-fume mb-6">Sana en uygun arkadaşları bulalım.</p>
            <div className="space-y-3 mb-8">
              {EXPERIENCE_LEVELS.map((lvl) => (
                <label
                  key={lvl}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                    experience === lvl
                      ? 'border-primary-700 bg-primary-50'
                      : 'border-brand-border hover:border-primary-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="experience"
                    value={lvl}
                    checked={experience === lvl}
                    onChange={() => setExperience(lvl)}
                    className="accent-primary-700"
                  />
                  <span className="font-body text-sm text-black">{EXPERIENCE_LABELS[lvl]}</span>
                </label>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="btn-outline btn-lg flex-1">← Geri</button>
              <button
                onClick={() => setStep(3)}
                disabled={!canNext2}
                className="btn-primary btn-lg flex-1"
              >
                Devam Et →
              </button>
            </div>
          </div>
        )}

        {/* Adım 3: Konum */}
        {step === 3 && (
          <div className="card">
            <h2 className="font-heading text-xl font-bold text-black mb-1">Hangi şehirdesin?</h2>
            <p className="text-sm text-brand-fume mb-6">Yakınındaki aktiviteleri gösterelim.</p>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Örn: İstanbul, Ankara, İzmir..."
              className="input-base mb-8"
              autoFocus
            />
            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="btn-outline btn-lg flex-1">← Geri</button>
              <button
                onClick={handleFinish}
                disabled={!canNext3 || saving}
                className="btn-secondary btn-lg flex-1 text-white"
              >
                {saving ? 'Kaydediliyor...' : 'Başla 🎉'}
              </button>
            </div>
          </div>
        )}

        <p className="text-center text-xs text-brand-fume mt-6">
          Bunları daha sonra profilinden değiştirebilirsin.
        </p>
      </div>
    </div>
  );
}

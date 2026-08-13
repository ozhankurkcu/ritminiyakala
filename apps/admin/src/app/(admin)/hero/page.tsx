'use client';

import { useState, useEffect } from 'react';
import { apiPath } from '@/lib/apiPath';

type Slide = {
  id: string;
  heading: string;
  highlight: string;
  sub: string;
  active: boolean;
  order: number;
};

type HeroConfig = {
  bgType: 'gradient' | 'color' | 'image';
  bgGradient: string;
  bgColor: string;
  bgImage: string;
  textColor: string;
  highlightColor: string;
  subTextColor: string;
  bottomText: string;
  intervalSeconds: number;
  slides: Slide[];
};

const EMPTY_SLIDE = (): Slide => ({
  id: Date.now().toString(),
  heading: '',
  highlight: '',
  sub: '',
  active: true,
  order: 0,
});

export default function HeroAdminPage() {
  const [config, setConfig] = useState<HeroConfig | null>(null);
  const [saving, setSaving]   = useState(false);
  const [saved,  setSaved]    = useState(false);
  const [editSlide, setEditSlide] = useState<Slide | null>(null);
  const [isNew, setIsNew] = useState(false);

  useEffect(() => {
    fetch(apiPath('/api/hero')).then((r) => r.json()).then(setConfig);
  }, []);

  const set = <K extends keyof HeroConfig>(key: K, val: HeroConfig[K]) =>
    setConfig((c) => c ? { ...c, [key]: val } : c);

  const save = async () => {
    if (!config) return;
    setSaving(true);
    await fetch(apiPath('/api/hero'), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const openNewSlide = () => {
    const slide = EMPTY_SLIDE();
    slide.order = (config?.slides.length ?? 0);
    setEditSlide(slide);
    setIsNew(true);
  };

  const openEditSlide = (slide: Slide) => {
    setEditSlide({ ...slide });
    setIsNew(false);
  };

  const saveSlide = () => {
    if (!editSlide || !config) return;
    const slides = isNew
      ? [...config.slides, editSlide]
      : config.slides.map((s) => s.id === editSlide.id ? editSlide : s);
    setConfig({ ...config, slides: slides.sort((a, b) => a.order - b.order) });
    setEditSlide(null);
  };

  const deleteSlide = (id: string) => {
    if (!config || !confirm('Bu slaytı silmek istediğinize emin misiniz?')) return;
    setConfig({ ...config, slides: config.slides.filter((s) => s.id !== id) });
  };

  const moveSlide = (id: string, dir: -1 | 1) => {
    if (!config) return;
    const slides = [...config.slides].sort((a, b) => a.order - b.order);
    const idx = slides.findIndex((s) => s.id === id);
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= slides.length) return;
    [slides[idx].order, slides[newIdx].order] = [slides[newIdx].order, slides[idx].order];
    setConfig({ ...config, slides });
  };

  if (!config) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const sortedSlides = [...config.slides].sort((a, b) => a.order - b.order);

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-white font-bold text-2xl mb-1">Hero Slider Yönetimi</h1>
          <p className="text-gray-500 text-sm">Ana sayfadaki hero bölümünü düzenle</p>
        </div>
        <button onClick={save} disabled={saving}
          className="px-5 py-2 rounded-lg bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 disabled:opacity-50 transition-colors">
          {saving ? 'Kaydediliyor…' : saved ? '✓ Kaydedildi' : 'Kaydet'}
        </button>
      </div>

      {/* ── Arka Plan ── */}
      <Section title="Arka Plan">
        <div className="flex gap-3 mb-4">
          {(['gradient', 'color', 'image'] as const).map((t) => (
            <button key={t} onClick={() => set('bgType', t)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${config.bgType === t ? 'bg-violet-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
              {t === 'gradient' ? 'Gradient' : t === 'color' ? 'Düz Renk' : 'Resim'}
            </button>
          ))}
        </div>

        {config.bgType === 'gradient' && (
          <div>
            <Label>CSS Gradient sınıfları (Tailwind)</Label>
            <input value={config.bgGradient} onChange={(e) => set('bgGradient', e.target.value)}
              className="admin-input font-mono text-xs" placeholder="from-[#631C99] via-[#581C87] to-[#3d0f5e]" />
            <p className="text-gray-600 text-xs mt-1">Örn: from-[#631C99] via-[#581C87] to-[#3d0f5e]</p>
          </div>
        )}
        {config.bgType === 'color' && (
          <div className="flex items-center gap-3">
            <input type="color" value={config.bgColor} onChange={(e) => set('bgColor', e.target.value)}
              className="w-10 h-10 rounded cursor-pointer border-0 bg-transparent" />
            <input value={config.bgColor} onChange={(e) => set('bgColor', e.target.value)}
              className="admin-input w-36 font-mono" />
          </div>
        )}
        {config.bgType === 'image' && (
          <div>
            <Label>Resim URL</Label>
            <input value={config.bgImage} onChange={(e) => set('bgImage', e.target.value)}
              className="admin-input" placeholder="https://..." />
          </div>
        )}
      </Section>

      {/* ── Renkler ── */}
      <Section title="Metin Renkleri">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <ColorField label="Başlık rengi" value={config.textColor} onChange={(v) => set('textColor', v)} />
          <ColorField label="Vurgu rengi" value={config.highlightColor} onChange={(v) => set('highlightColor', v)} />
          <div>
            <Label>Alt metin rengi (rgba)</Label>
            <input value={config.subTextColor} onChange={(e) => set('subTextColor', e.target.value)}
              className="admin-input font-mono text-xs" placeholder="rgba(255,255,255,0.8)" />
          </div>
        </div>
      </Section>

      {/* ── Alt Metin & Interval ── */}
      <Section title="Genel Ayarlar">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label>Alt küçük metin</Label>
            <input value={config.bottomText} onChange={(e) => set('bottomText', e.target.value)}
              className="admin-input" />
          </div>
          <div>
            <Label>Slide süresi (saniye)</Label>
            <input type="number" min={3} max={30} value={config.intervalSeconds}
              onChange={(e) => set('intervalSeconds', Number(e.target.value))}
              className="admin-input w-24" />
          </div>
        </div>
      </Section>

      {/* ── Slaytlar ── */}
      <Section title="Slaytlar">
        <div className="space-y-3 mb-4">
          {sortedSlides.map((slide, idx) => (
            <div key={slide.id}
              className={`flex items-start gap-3 bg-gray-800 rounded-xl p-4 border ${slide.active ? 'border-gray-700' : 'border-red-900/40 opacity-60'}`}>
              {/* Sıra */}
              <div className="flex flex-col gap-1 shrink-0 mt-1">
                <button onClick={() => moveSlide(slide.id, -1)} disabled={idx === 0}
                  className="text-gray-500 hover:text-white disabled:opacity-20 text-xs leading-none">▲</button>
                <span className="text-gray-600 text-xs text-center">{idx + 1}</span>
                <button onClick={() => moveSlide(slide.id, 1)} disabled={idx === sortedSlides.length - 1}
                  className="text-gray-500 hover:text-white disabled:opacity-20 text-xs leading-none">▼</button>
              </div>

              {/* İçerik */}
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm truncate">
                  {slide.heading} <span className="text-violet-400">{slide.highlight}</span>
                </p>
                <p className="text-gray-500 text-xs mt-0.5 line-clamp-1">{slide.sub}</p>
              </div>

              {/* Aksiyonlar */}
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => setConfig({ ...config, slides: config.slides.map((s) => s.id === slide.id ? { ...s, active: !s.active } : s) })}
                  className={`px-2 py-0.5 rounded text-xs font-medium ${slide.active ? 'bg-green-500/10 text-green-400' : 'bg-gray-700 text-gray-500'}`}>
                  {slide.active ? 'Aktif' : 'Pasif'}
                </button>
                <button onClick={() => openEditSlide(slide)}
                  className="px-2 py-1 rounded bg-gray-700 text-gray-300 hover:bg-gray-600 text-xs">Düzenle</button>
                <button onClick={() => deleteSlide(slide.id)}
                  className="px-2 py-1 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs">Sil</button>
              </div>
            </div>
          ))}
        </div>
        <button onClick={openNewSlide}
          className="px-4 py-2 rounded-lg border-2 border-dashed border-gray-700 text-gray-400 hover:border-violet-500 hover:text-violet-400 text-sm transition-colors w-full">
          + Yeni Slayt Ekle
        </button>
      </Section>

      {/* ── Slide Edit Modal ── */}
      {editSlide && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-lg">
            <h2 className="text-white font-semibold text-lg mb-5">{isNew ? 'Yeni Slayt' : 'Slaytı Düzenle'}</h2>

            <div className="space-y-4">
              <div>
                <Label>Başlık</Label>
                <input value={editSlide.heading} onChange={(e) => setEditSlide({ ...editSlide, heading: e.target.value })}
                  className="admin-input" placeholder="Sporun Ritmini" />
              </div>
              <div>
                <Label>Vurgulanan metin (accent rengi)</Label>
                <input value={editSlide.highlight} onChange={(e) => setEditSlide({ ...editSlide, highlight: e.target.value })}
                  className="admin-input" placeholder="Birlikte Yakala" />
              </div>
              <div>
                <Label>Alt açıklama</Label>
                <textarea value={editSlide.sub} onChange={(e) => setEditSlide({ ...editSlide, sub: e.target.value })}
                  rows={3} className="admin-input resize-none" placeholder="Açıklama metni..." />
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="active" checked={editSlide.active}
                  onChange={(e) => setEditSlide({ ...editSlide, active: e.target.checked })}
                  className="w-4 h-4 accent-violet-500" />
                <label htmlFor="active" className="text-gray-400 text-sm">Aktif</label>
              </div>
            </div>

            <div className="flex gap-2 justify-end mt-6">
              <button onClick={() => setEditSlide(null)}
                className="px-4 py-2 rounded-lg bg-gray-700 text-gray-300 text-sm hover:bg-gray-600">İptal</button>
              <button onClick={saveSlide}
                className="px-4 py-2 rounded-lg bg-violet-600 text-white text-sm hover:bg-violet-700">Kaydet</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-4">
      <h2 className="text-white font-semibold mb-4">{title}</h2>
      {children}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <p className="text-gray-400 text-xs mb-1.5">{children}</p>;
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="flex items-center gap-2">
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)}
          className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent shrink-0" />
        <input value={value} onChange={(e) => onChange(e.target.value)}
          className="admin-input font-mono text-xs flex-1" />
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const DEFAULT_PROMPT = `A minimalist flat-style icon representing {subject}.
Clean vector look, bold simple shapes, vibrant single background color that fits the Ritminiyakala brand palette (deep purple #631C99 or energetic orange #E07000).
No text, no shadows, no gradients. White or light foreground icon.
Style: modern app icon, 512x512, square format.`;

export default function AISettingsPage() {
  const [promptTemplate, setPromptTemplate] = useState('');
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [saved,    setSaved]    = useState(false);

  useEffect(() => {
    fetch('/api/ai-config')
      .then((r) => r.json())
      .then((data) => {
        setPromptTemplate(data.promptTemplate ?? DEFAULT_PROMPT);
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    await fetch('/api/ai-config', {
      method:  'PUT',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ promptTemplate }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-white font-bold text-2xl mb-1">AI İkon Prompt Şablonu</h1>
        <p className="text-gray-500 text-sm">
          İkon üretiminde kullanılan marka prompt şablonu.{' '}
          <Link href="/ai-providers" className="text-violet-400 hover:text-violet-300">
            Provider&apos;ları yönetmek için AI Entegrasyonları →
          </Link>
        </p>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 mb-4">
        <h2 className="text-white font-semibold mb-1">Marka Prompt Şablonu</h2>
        <p className="text-gray-500 text-xs mb-3">
          <code className="bg-gray-800 px-1.5 py-0.5 rounded text-violet-300">{'{subject}'}</code> placeholder&apos;ı
          ikon üretirken girilen konu ile otomatik değiştirilir.
        </p>
        <textarea
          value={promptTemplate}
          onChange={(e) => setPromptTemplate(e.target.value)}
          rows={10}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500 resize-none font-mono"
        />
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full py-3 rounded-xl bg-violet-600 text-white font-semibold hover:bg-violet-700 disabled:opacity-50 transition-colors"
      >
        {saving ? 'Kaydediliyor...' : saved ? '✓ Kaydedildi' : 'Kaydet'}
      </button>
    </div>
  );
}

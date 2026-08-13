'use client';

import { useState, useEffect, useCallback } from 'react';

type Format = 'openai-images' | 'stability-v2' | 'replicate' | 'fal';
type Capability = 'image-generation' | 'text-generation';

interface Provider {
  id:           string;
  name:         string;
  format:       Format;
  baseUrl:      string;
  hasKey:       boolean;
  model:        string;
  capabilities: Capability[];
  params:       Record<string, string>;
  active:       boolean;
  createdAt:    string;
}

const FORMATS: { value: Format; label: string; baseUrl: string; modelHint: string }[] = [
  {
    value:     'openai-images',
    label:     'OpenAI Images API',
    baseUrl:   'https://api.openai.com/v1',
    modelHint: 'dall-e-3 veya gpt-image-1',
  },
  {
    value:     'stability-v2',
    label:     'Stability AI v2beta',
    baseUrl:   'https://api.stability.ai',
    modelHint: '(Stability modeli endpoint içinde)',
  },
  {
    value:     'replicate',
    label:     'Replicate Predictions',
    baseUrl:   'https://api.replicate.com/v1',
    modelHint: 'black-forest-labs/flux-schnell',
  },
  {
    value:     'fal',
    label:     'FAL.ai',
    baseUrl:   'https://fal.run',
    modelHint: 'fal-ai/flux/schnell',
  },
];

const FORMAT_LABELS: Record<Format, string> = {
  'openai-images': 'OpenAI Images',
  'stability-v2':  'Stability AI',
  'replicate':     'Replicate',
  'fal':           'FAL.ai',
};

const CAP_LABELS: Record<Capability, string> = {
  'image-generation': '🎨 Resim Üretimi',
  'text-generation':  '✍️ Metin Üretimi',
};


const empty = (): Omit<Provider, 'id' | 'hasKey' | 'createdAt'> & { apiKey: string } => ({
  name:         '',
  format:       'openai-images',
  baseUrl:      'https://api.openai.com/v1',
  apiKey:       '',
  model:        '',
  capabilities: ['image-generation'],
  params:       {},
  active:       true,
});

const DEFAULT_PROMPT = `A minimalist flat-style icon representing {subject}.
Clean vector look, bold simple shapes, vibrant single background color that fits the Ritminiyakala brand palette (deep purple #631C99 or energetic orange #E07000).
No text, no shadows, no gradients. White or light foreground icon.
Style: modern app icon, 512x512, square format.`;

export default function AIProvidersPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [modal,     setModal]     = useState<'add' | 'edit' | null>(null);
  const [editTarget, setEditTarget] = useState<Provider | null>(null);
  const [form, setForm] = useState(empty());
  const [saving,   setSaving]   = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Prompt template state
  const [promptTemplate,  setPromptTemplate]  = useState('');
  const [promptLoading,   setPromptLoading]   = useState(true);
  const [promptSaving,    setPromptSaving]    = useState(false);
  const [promptSaved,     setPromptSaved]     = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/ai-providers');
    setProviders(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    fetch('/api/ai-config')
      .then((r) => r.json())
      .then((data) => {
        setPromptTemplate(data.promptTemplate ?? DEFAULT_PROMPT);
        setPromptLoading(false);
      });
  }, [load]);

  const savePrompt = async () => {
    setPromptSaving(true);
    await fetch('/api/ai-config', {
      method:  'PUT',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ promptTemplate }),
    });
    setPromptSaving(false);
    setPromptSaved(true);
    setTimeout(() => setPromptSaved(false), 3000);
  };

  function openAdd() {
    setForm(empty());
    setEditTarget(null);
    setModal('add');
  }

  function openEdit(p: Provider) {
    setForm({
      name:         p.name,
      format:       p.format,
      baseUrl:      p.baseUrl,
      apiKey:       '',
      model:        p.model,
      capabilities: [...p.capabilities],
      params:       { ...p.params },
      active:       p.active,
    });
    setEditTarget(p);
    setModal('edit');
  }

  function setFormatAndUrl(fmt: Format) {
    const meta = FORMATS.find((f) => f.value === fmt)!;
    setForm((f) => ({ ...f, format: fmt, baseUrl: meta.baseUrl, model: '' }));
  }

  function toggleCap(cap: Capability) {
    setForm((f) => ({
      ...f,
      capabilities: f.capabilities.includes(cap)
        ? f.capabilities.filter((c) => c !== cap)
        : [...f.capabilities, cap],
    }));
  }

  async function handleSave() {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      if (modal === 'add') {
        await fetch('/api/ai-providers', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify(form),
        });
      } else if (editTarget) {
        await fetch(`/api/ai-providers/${editTarget.id}`, {
          method:  'PUT',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify(form),
        });
      }
      setModal(null);
      await load();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Bu provider silinsin mi?')) return;
    setDeleting(id);
    await fetch(`/api/ai-providers/${id}`, { method: 'DELETE' });
    setDeleting(null);
    await load();
  }

  async function toggleActive(p: Provider) {
    await fetch(`/api/ai-providers/${p.id}`, {
      method:  'PUT',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ active: !p.active }),
    });
    await load();
  }

  const inputCls = 'w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500';
  const labelCls = 'block text-gray-400 text-xs font-medium mb-1 uppercase tracking-wide';

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-white font-bold text-2xl mb-1">AI Entegrasyonları</h1>
          <p className="text-gray-500 text-sm">Platformda kullanılacak AI provider&apos;larını buradan yönet</p>
        </div>
        <button
          onClick={openAdd}
          className="px-4 py-2 bg-violet-600 text-white text-sm font-medium rounded-lg hover:bg-violet-700 transition-colors"
        >
          + Yeni Provider Ekle
        </button>
      </div>

      {/* Provider list */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : providers.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 border-dashed rounded-xl p-16 text-center">
          <p className="text-gray-500 text-sm">Henüz provider eklenmedi.</p>
          <button onClick={openAdd} className="mt-3 text-violet-400 text-sm hover:text-violet-300">
            İlk provider&apos;ı ekle →
          </button>
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left text-gray-500 font-medium px-4 py-3">Provider</th>
                <th className="text-left text-gray-500 font-medium px-4 py-3">Format</th>
                <th className="text-left text-gray-500 font-medium px-4 py-3">Model</th>
                <th className="text-left text-gray-500 font-medium px-4 py-3">Yetenekler</th>
                <th className="text-left text-gray-500 font-medium px-4 py-3">API Key</th>
                <th className="text-left text-gray-500 font-medium px-4 py-3">Durum</th>
                <th className="text-right text-gray-500 font-medium px-4 py-3">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {providers.map((p) => (
                <tr key={p.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                  <td className="px-4 py-3 text-white font-medium">{p.name}</td>
                  <td className="px-4 py-3 text-gray-400">{FORMAT_LABELS[p.format]}</td>
                  <td className="px-4 py-3 text-gray-400 font-mono text-xs">{p.model || '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {p.capabilities.map((c) => (
                        <span key={c} className="px-1.5 py-0.5 bg-violet-500/10 text-violet-400 rounded text-xs">
                          {CAP_LABELS[c]}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {p.hasKey
                      ? <span className="text-green-400 text-xs">✓ Tanımlı</span>
                      : <span className="text-red-400 text-xs">✗ Girilmedi</span>}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleActive(p)}
                      className={`px-2 py-0.5 rounded text-xs font-medium ${
                        p.active
                          ? 'bg-green-500/10 text-green-400'
                          : 'bg-gray-700 text-gray-400'
                      }`}
                    >
                      {p.active ? 'Aktif' : 'Pasif'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button
                      onClick={() => openEdit(p)}
                      className="px-2.5 py-1 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded text-gray-300 text-xs"
                    >
                      Düzenle
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      disabled={deleting === p.id}
                      className="px-2.5 py-1 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded text-red-400 text-xs disabled:opacity-50"
                    >
                      {deleting === p.id ? '...' : 'Sil'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Prompt template */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl mt-8">
        <div className="px-5 py-4 border-b border-gray-800">
          <h2 className="text-white font-semibold">İkon Üretim Prompt Şablonu</h2>
          <p className="text-gray-500 text-xs mt-0.5">
            <code className="bg-gray-800 px-1.5 py-0.5 rounded text-violet-300">{'{subject}'}</code> alanı,
            ikon üretirken girilen konuyla otomatik değiştirilir.
          </p>
        </div>
        <div className="p-5">
          {promptLoading ? (
            <div className="h-36 bg-gray-800 rounded-lg animate-pulse" />
          ) : (
            <>
              <textarea
                value={promptTemplate}
                onChange={(e) => setPromptTemplate(e.target.value)}
                rows={8}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-violet-500 resize-none font-mono leading-relaxed"
              />
              <div className="flex justify-end mt-3">
                <button
                  onClick={savePrompt}
                  disabled={promptSaving}
                  className="px-5 py-2 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 disabled:opacity-50 transition-colors"
                >
                  {promptSaving ? 'Kaydediliyor...' : promptSaved ? '✓ Kaydedildi' : 'Kaydet'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-800">
              <h2 className="text-white font-semibold">
                {modal === 'add' ? 'Yeni Provider Ekle' : 'Provider Düzenle'}
              </h2>
              <button onClick={() => setModal(null)} className="text-gray-400 hover:text-white text-xl leading-none">×</button>
            </div>

            <div className="p-5 space-y-4">
              {/* Name */}
              <div>
                <label className={labelCls}>Provider İsmi *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Örn: OpenRouter - FLUX Schnell"
                  className={inputCls}
                />
              </div>

              {/* Format */}
              <div>
                <label className={labelCls}>API Formatı / Protokolü</label>
                <select value={form.format} onChange={(e) => setFormatAndUrl(e.target.value as Format)} className={inputCls}>
                  {FORMATS.map((f) => (
                    <option key={f.value} value={f.value}>{f.label}</option>
                  ))}
                </select>
                <p className="text-gray-600 text-xs mt-1">
                  OpenRouter, ChatGPT ve uyumlu servisler için: <span className="text-violet-400">OpenAI Images API</span>
                </p>
              </div>

              {/* Base URL */}
              <div>
                <label className={labelCls}>Base URL</label>
                <input
                  type="text"
                  value={form.baseUrl}
                  onChange={(e) => setForm((f) => ({ ...f, baseUrl: e.target.value }))}
                  placeholder="https://api.openai.com/v1"
                  className={inputCls}
                />
              </div>

              {/* Model */}
              <div>
                <label className={labelCls}>Model</label>
                <input
                  type="text"
                  value={form.model}
                  onChange={(e) => setForm((f) => ({ ...f, model: e.target.value }))}
                  placeholder={FORMATS.find((f) => f.value === form.format)?.modelHint ?? ''}
                  className={inputCls}
                />
              </div>

              {/* API Key */}
              <div>
                <label className={labelCls}>
                  API Key
                  {modal === 'edit' && editTarget?.hasKey && ' (değiştirmek için girin)'}
                </label>
                <input
                  type="password"
                  value={form.apiKey}
                  onChange={(e) => setForm((f) => ({ ...f, apiKey: e.target.value }))}
                  placeholder={modal === 'edit' && editTarget?.hasKey ? '••••••••••••' : 'API anahtarınız'}
                  className={inputCls}
                />
              </div>

              {/* Capabilities */}
              <div>
                <label className={labelCls}>Yetenekler</label>
                <div className="flex gap-3">
                  {(['image-generation', 'text-generation'] as Capability[]).map((cap) => (
                    <label key={cap} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.capabilities.includes(cap)}
                        onChange={() => toggleCap(cap)}
                        className="accent-violet-500"
                      />
                      <span className="text-gray-300 text-sm">{CAP_LABELS[cap]}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Active toggle */}
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.active}
                    onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
                    className="accent-violet-500"
                  />
                  <span className="text-gray-300 text-sm">Aktif</span>
                </label>
              </div>

              {/* Endpoint path — openai-images format only */}
              {form.format === 'openai-images' && (
                <div>
                  <label className={labelCls}>Endpoint Path <span className="text-gray-600 normal-case">(opsiyonel)</span></label>
                  <input
                    type="text"
                    value={form.params?.endpointPath ?? ''}
                    onChange={(e) => setForm((f) => ({ ...f, params: { ...f.params, endpointPath: e.target.value } }))}
                    placeholder="/images/generations"
                    className={inputCls}
                  />
                  <p className="text-gray-600 text-xs mt-1">
                    Boş bırakılırsa <code className="text-violet-400">/images/generations</code> kullanılır.
                    OpenRouter için <code className="text-violet-400">/images/generations</code> dene.
                  </p>
                </div>
              )}

              {/* Extra params hint */}
              <div className="bg-gray-800 rounded-lg p-3 text-xs text-gray-500">
                <p className="font-medium text-gray-400 mb-1">İpucu — format notları:</p>
                <p>OpenAI / OpenRouter: size (1024x1024), style (vivid/natural)</p>
                <p>Stability v2: aspect_ratio (1:1), style_preset (digital-art)</p>
                <p>Replicate & FAL: model yeterli</p>
              </div>
            </div>

            <div className="flex gap-3 p-5 border-t border-gray-800">
              <button
                onClick={() => setModal(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-700 text-gray-300 hover:text-white text-sm transition-colors"
              >
                İptal
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.name.trim()}
                className="flex-1 py-2.5 rounded-xl bg-violet-600 text-white font-semibold hover:bg-violet-700 disabled:opacity-50 text-sm transition-colors"
              >
                {saving ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect, useRef } from 'react';
import { apiPath } from '@/lib/apiPath';

// ── AI ikon üretim mini bileşeni ─────────────────────────────────────────────

type AIProvider = { id: string; name: string; active: boolean; capabilities: string[] };

type SystemIconRef = { slug: string; label: string; iconUrl: string };

function AIGenerateSection({
  targetId,
  targetType,
  defaultSubject,
  onGenerated,
}: {
  targetId:       string;
  targetType:     'system' | 'proposal';
  defaultSubject: string;
  onGenerated:    (iconUrl: string) => void;
}) {
  const [open,          setOpen]          = useState(false);
  const [subject,       setSubject]       = useState(defaultSubject);
  const [providerId,    setProviderId]    = useState('');
  const [providers,     setProviders]     = useState<AIProvider[]>([]);
  const [refSlug,       setRefSlug]       = useState('');
  const [systemIcons,   setSystemIcons]   = useState<SystemIconRef[]>([]);
  const [loading,       setLoading]       = useState(false);
  const [preview,       setPreview]       = useState<string | null>(null);
  const [error,         setError]         = useState('');

  // Load providers + system icons when accordion opens
  useEffect(() => {
    if (!open) return;
    if (providers.length === 0) {
      fetch(apiPath('/api/ai-providers'))
        .then((r) => r.json())
        .then((list: AIProvider[]) => {
          const img = list.filter((p) => p.active && p.capabilities.includes('image-generation'));
          setProviders(img);
          if (img.length > 0 && !providerId) setProviderId(img[0].id);
        });
    }
    if (systemIcons.length === 0) {
      fetch(apiPath('/api/activity-types'))
        .then((r) => r.json())
        .then((list: SystemIconRef[]) => setSystemIcons(list));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const generate = async () => {
    if (!subject.trim() || !providerId) return;
    setLoading(true);
    setError('');
    setPreview(null);
    try {
      const res = await fetch(apiPath('/api/activity-types/generate-icon'), {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          subject: subject.trim(),
          providerId,
          targetId,
          targetType,
          ...(refSlug ? { referenceSlug: refSlug } : {}),
        }),
      });
      const data = await res.json() as { ok?: boolean; iconUrl?: string; error?: string };
      if (!res.ok || !data.iconUrl) throw new Error(data.error ?? 'Üretim başarısız.');
      setPreview(`${data.iconUrl}?t=${Date.now()}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border border-violet-800/50 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-violet-900/20 hover:bg-violet-900/30 transition-colors"
      >
        <span className="text-violet-300 text-sm font-medium">✨ AI ile ikon oluştur</span>
        <span className="text-gray-500 text-xs">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="px-4 pb-4 pt-3 space-y-3 bg-violet-900/10">
          {/* Provider dropdown */}
          {providers.length === 0 ? (
            <p className="text-yellow-500/80 text-xs">
              Henüz aktif resim üretimi provider tanımlı değil.{' '}
              <a href={apiPath('/ai-providers')} target="_blank" className="underline text-violet-400">AI Entegrasyonları</a>{' '}
              sayfasından ekleyin.
            </p>
          ) : (
            <div>
              <label className="block text-gray-400 text-xs mb-1">Provider</label>
              <select
                value={providerId}
                onChange={(e) => setProviderId(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500"
              >
                {providers.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Stil referansı — mevcut sistem ikonlarından seç */}
          {systemIcons.length > 0 && (
            <div>
              <label className="block text-gray-400 text-xs mb-1.5">
                Stil referansı <span className="text-gray-600">(arka plan ve stil eşleşmesi için)</span>
              </label>
              <div className="flex gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => setRefSlug('')}
                  className={`px-2 py-1 rounded-md text-xs border transition-colors ${
                    refSlug === ''
                      ? 'border-violet-500 bg-violet-500/20 text-violet-200'
                      : 'border-gray-700 text-gray-500 hover:border-gray-500'
                  }`}
                >
                  Yok
                </button>
                {systemIcons.map((ic) => (
                  <button
                    key={ic.slug}
                    type="button"
                    onClick={() => setRefSlug(refSlug === ic.slug ? '' : ic.slug)}
                    title={ic.label}
                    className={`rounded-lg border-2 transition-colors p-0.5 ${
                      refSlug === ic.slug
                        ? 'border-violet-500'
                        : 'border-transparent hover:border-gray-600'
                    }`}
                  >
                    <img
                      src={`${ic.iconUrl}?t=ref`}
                      alt={ic.label}
                      width={32}
                      height={32}
                      className="rounded object-contain"
                    />
                  </button>
                ))}
              </div>
              {refSlug && (
                <p className="text-violet-400 text-xs mt-1">
                  ✓ &quot;{systemIcons.find((i) => i.slug === refSlug)?.label}&quot; ikonu stil referansı olarak kullanılacak
                </p>
              )}
            </div>
          )}

          {/* Konu */}
          <div>
            <label className="block text-gray-400 text-xs mb-1">Konu <span className="text-gray-600">(İngilizce önerilir)</span></label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && generate()}
              placeholder="ör: chess piece and board, archery bow and arrow"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500"
            />
          </div>

          {/* Üret + önizleme */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={generate}
              disabled={loading || !subject.trim() || !providerId}
              className="px-4 py-2 rounded-lg bg-violet-600 text-white text-xs font-medium hover:bg-violet-700 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              {loading ? (
                <><span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> Üretiliyor...</>
              ) : '🎨 Oluştur'}
            </button>
            {preview && (
              <>
                <img src={preview} alt="önizleme" width={48} height={48}
                  className="rounded-lg bg-gray-800 p-1 object-contain border border-gray-700" />
                <button
                  type="button"
                  onClick={() => onGenerated(preview)}
                  className="px-3 py-1.5 rounded-lg bg-green-500/20 text-green-300 border border-green-700 hover:bg-green-500/30 text-xs font-medium"
                >
                  ✓ Bu ikonu kullan
                </button>
              </>
            )}
          </div>
          {error && <p className="text-red-400 text-xs">{error}</p>}
        </div>
      )}
    </div>
  );
}

// ── Tipler ────────────────────────────────────────────────────────────────────

type SystemType = {
  slug:             string;
  label:            string;
  customLabel:      string | null;
  description:      string | null;
  category:         string;
  categoryOverride: string | null;
  iconUrl:          string;
  order:            number;
  active:           boolean;
};

type CustomTypeEntry = {
  id:               string;
  title:            string;
  customTypeName:   string;
  customTypeStatus: 'pending' | 'approved' | 'rejected';
  organizerName:    string;
  createdAt:        string;
  description:      string | null;
  iconUrl:          string | null;
  active:           boolean;
  category:         string | null;
};

// ── Sabitler ──────────────────────────────────────────────────────────────────

const CATEGORY_OPTIONS = [
  { value: 'takim-sporlari',   label: 'Takım Sporları'    },
  { value: 'bireysel-sporlar', label: 'Bireysel Sporlar'  },
  { value: 'doga-acik-hava',   label: 'Doğa & Açık Hava' },
  { value: 'fitness-saglik',   label: 'Fitness & Sağlık'  },
  { value: 'dans-sanat',       label: 'Dans & Sanat'      },
  { value: 'su-sporlari',      label: 'Su Sporları'       },
  { value: 'zihin-oyunlari',   label: 'Zihin Oyunları'    },
  { value: 'e-spor',           label: 'E-Spor'            },
  { value: 'diger',            label: 'Diğer'             },
];

const CATEGORY_MAP = Object.fromEntries(CATEGORY_OPTIONS.map((c) => [c.value, c.label]));

const PROPOSAL_STATUS_LABELS: Record<string, string> = {
  pending:  'Bekliyor',
  approved: 'Onaylandı',
  rejected: 'Reddedildi',
};
const PROPOSAL_STATUS_COLORS: Record<string, string> = {
  pending:  'bg-yellow-500/10 text-yellow-400',
  approved: 'bg-green-500/10 text-green-400',
  rejected: 'bg-red-500/10 text-red-400',
};

type Tab            = 'system' | 'proposals';
type ProposalFilter = 'pending' | 'approved' | 'rejected' | 'all';

// ── Bileşen ───────────────────────────────────────────────────────────────────

export default function ActivityTypesPage() {
  const [tab, setTab] = useState<Tab>('system');

  // System types
  const [systemTypes,   setSystemTypes]   = useState<SystemType[]>([]);
  const [systemLoading, setSystemLoading] = useState(true);

  // Edit modal
  const [editTarget,    setEditTarget]    = useState<SystemType | null>(null);
  const [editLabel,     setEditLabel]     = useState('');
  const [editDesc,      setEditDesc]      = useState('');
  const [editCategory,  setEditCategory]  = useState('');
  const [editActive,    setEditActive]    = useState(true);
  const [iconPreview,   setIconPreview]   = useState<string | null>(null);
  const [iconFile,      setIconFile]      = useState<File | null>(null);
  const [saving,        setSaving]        = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Proposals
  const [proposals,       setProposals]       = useState<CustomTypeEntry[]>([]);
  const [proposalLoading, setProposalLoading] = useState(false);
  const [proposalFilter,  setProposalFilter]  = useState<ProposalFilter>('pending');
  const [propEditTarget,  setPropEditTarget]  = useState<CustomTypeEntry | null>(null);
  const [propEditName,    setPropEditName]    = useState('');
  const [propEditDesc,    setPropEditDesc]    = useState('');
  const [propEditCategory, setPropEditCategory] = useState('diger');
  const [propEditStatus,  setPropEditStatus]  = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [propIconPreview, setPropIconPreview] = useState<string | null>(null);
  const [propIconFile,    setPropIconFile]    = useState<File | null>(null);
  const [propSaving,      setPropSaving]      = useState(false);
  const [propSaveError,   setPropSaveError]   = useState('');
  const propFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch(apiPath('/api/activity-types'))
      .then((r) => r.json())
      .then(setSystemTypes)
      .finally(() => setSystemLoading(false));
  }, []);

  useEffect(() => {
    if (tab !== 'proposals' || proposals.length > 0) return;
    setProposalLoading(true);
    fetch(apiPath('/api/custom-types'))
      .then((r) => r.json())
      .then(setProposals)
      .finally(() => setProposalLoading(false));
  }, [tab, proposals.length]);

  // ── Edit modal aç ─────────────────────────────────────────────────────────

  const openEdit = (t: SystemType) => {
    setEditTarget(t);
    setEditLabel(t.customLabel ?? t.label);
    setEditDesc(t.description ?? '');
    setEditCategory(t.categoryOverride ?? t.category);
    setEditActive(t.active);
    setIconPreview(null);
    setIconFile(null);
  };

  const closeEdit = () => {
    setEditTarget(null);
    setIconPreview(null);
    setIconFile(null);
  };

  const handleIconSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setIconFile(f);
    setIconPreview(URL.createObjectURL(f));
  };

  // ── Kaydet ────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    if (!editTarget) return;
    setSaving(true);
    try {
      // 1. Dosya yükleme varsa önce yükle
      if (iconFile) {
        const fd = new FormData();
        fd.append('slug', editTarget.slug);
        fd.append('icon', iconFile);
        await fetch(apiPath('/api/activity-types/icon'), { method: 'POST', body: fd });
      }

      // 2. Metadata güncelle — AI ile üretilen ikon URL'si de dahil
      const cleanIconUrl = iconPreview ? iconPreview.split('?')[0] : null;
      await fetch(apiPath('/api/activity-types'), {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          bulk:        true,
          slug:        editTarget.slug,
          label:       editLabel.trim(),
          description: editDesc.trim(),
          category:    editCategory,
          active:      editActive,
          ...(cleanIconUrl ? { iconUrl: cleanIconUrl } : {}),
        }),
      });

      // 3. Local state güncelle
      const newIconUrl = iconPreview ?? editTarget.iconUrl;

      setSystemTypes((prev) => prev.map((t) =>
        t.slug === editTarget.slug
          ? {
              ...t,
              customLabel:      editLabel.trim() !== editTarget.label ? editLabel.trim() : null,
              description:      editDesc.trim() || null,
              categoryOverride: editCategory !== editTarget.category ? editCategory : null,
              active:           editActive,
              iconUrl:          newIconUrl,
            }
          : t,
      ));
      closeEdit();
    } finally {
      setSaving(false);
    }
  };

  // ── Sil ───────────────────────────────────────────────────────────────────

  const handleDelete = async () => {
    if (!editTarget) return;
    if (!confirm(`"${editLabel}" aktivite türünü silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`)) return;
    await fetch(apiPath('/api/activity-types'), {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ field: 'delete', slug: editTarget.slug }),
    });
    setSystemTypes((prev) => prev.filter((t) => t.slug !== editTarget.slug));
    closeEdit();
  };

  // ── Sıralama ──────────────────────────────────────────────────────────────

  const moveType = async (slug: string, dir: -1 | 1) => {
    const sorted = [...systemTypes].sort((a, b) => a.order - b.order);
    const idx = sorted.findIndex((t) => t.slug === slug);
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;

    const newOrder: Record<string, number> = {};
    sorted.forEach((t, i) => { newOrder[t.slug] = i; });
    newOrder[sorted[idx].slug]     = swapIdx;
    newOrder[sorted[swapIdx].slug] = idx;

    const updated = systemTypes
      .map((t) => ({ ...t, order: newOrder[t.slug] ?? t.order }))
      .sort((a, b) => a.order - b.order);
    setSystemTypes(updated);

    await fetch(apiPath('/api/activity-types'), {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ field: 'order', value: newOrder }),
    });
  };

  // ── Kullanıcı önerileri ───────────────────────────────────────────────────

  const patchProposal = (id: string, body: Record<string, unknown>) =>
    fetch(apiPath(`/api/custom-types/${id}`), {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(body),
    });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleApprove = async (item: CustomTypeEntry) => {
    await patchProposal(item.id, { action: 'approve', customTypeName: item.customTypeName });
    setProposals((prev) => prev.map((i) => i.id === item.id ? { ...i, customTypeStatus: 'approved' } : i));
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleReject = async (id: string) => {
    if (!confirm('Bu öneriyi reddetmek istediğinize emin misiniz?')) return;
    await patchProposal(id, { action: 'reject' });
    setProposals((prev) => prev.map((i) => i.id === id ? { ...i, customTypeStatus: 'rejected' } : i));
  };

  const openPropEdit = (item: CustomTypeEntry) => {
    setPropEditTarget(item);
    setPropEditName(item.customTypeName);
    setPropEditDesc(item.description ?? '');
    setPropEditCategory(item.category ?? 'diger');
    setPropEditStatus(item.customTypeStatus);
    setPropIconPreview(null);
    setPropIconFile(null);
  };

  const closePropEdit = () => {
    setPropEditTarget(null);
    setPropIconPreview(null);
    setPropIconFile(null);
    setPropSaveError('');
  };

  const handlePropIconSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setPropIconFile(f);
    setPropIconPreview(URL.createObjectURL(f));
  };

  const handlePropDelete = async () => {
    if (!propEditTarget) return;
    if (!confirm(`"${propEditName}" önerisini silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`)) return;
    await patchProposal(propEditTarget.id, { action: 'delete' });
    setProposals((prev) => prev.filter((i) => i.id !== propEditTarget.id));
    closePropEdit();
  };

  const savePropEdit = async () => {
    if (!propEditTarget) return;
    setPropSaving(true);
    setPropSaveError('');
    try {
      let uploadedIconUrl: string | undefined;
      if (propIconFile) {
        const fd = new FormData();
        fd.append('id', propEditTarget.id);
        fd.append('icon', propIconFile);
        const res = await fetch(apiPath('/api/custom-types/icon'), { method: 'POST', body: fd });
        const data = await res.json() as { iconUrl?: string };
        uploadedIconUrl = data.iconUrl;
      }

      // AI ile üretilen ikon varsa URL'yi temizle (cache-buster olmadan)
      const aiIconUrl = propIconPreview ? propIconPreview.split('?')[0] : undefined;
      const finalIconUrl = uploadedIconUrl ?? aiIconUrl;

      const res = await patchProposal(propEditTarget.id, {
        action:         'save',
        customTypeName: propEditName.trim(),
        status:         propEditStatus,
        description:    propEditDesc.trim(),
        category:       propEditCategory,
        ...(finalIconUrl ? { iconUrl: finalIconUrl } : {}),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(err.error ?? `Sunucu hatası: ${res.status}`);
      }

      const ts = Date.now();
      setProposals((prev) => prev.map((i) =>
        i.id === propEditTarget.id
          ? {
              ...i,
              customTypeName:   propEditName.trim(),
              customTypeStatus: propEditStatus,
              description:      propEditDesc.trim() || null,
              category:         propEditCategory,
              iconUrl:          finalIconUrl ? `${finalIconUrl}?t=${ts}` : i.iconUrl,
            }
          : i,
      ));
      closePropEdit();
    } catch (err) {
      setPropSaveError(err instanceof Error ? err.message : 'Kaydetme başarısız.');
    } finally {
      setPropSaving(false);
    }
  };

  const pendingCount      = proposals.filter((i) => i.customTypeStatus === 'pending').length;
  const filteredProposals = proposalFilter === 'all'
    ? proposals
    : proposals.filter((i) => i.customTypeStatus === proposalFilter);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="p-8">
      {/* Başlık */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-white font-bold text-2xl mb-1 flex items-center gap-2">
            Aktivite Türleri
            {pendingCount > 0 && (
              <span className="bg-yellow-500 text-black text-xs font-bold px-2 py-0.5 rounded-full">
                {pendingCount} öneri bekliyor
              </span>
            )}
          </h1>
          <p className="text-gray-500 text-sm">Sistem türlerini yönet, kullanıcı önerilerini onayla</p>
        </div>
      </div>

      {/* Sekmeler */}
      <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-xl p-1 mb-6 w-fit">
        <button
          onClick={() => setTab('system')}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'system' ? 'bg-violet-600 text-white' : 'text-gray-400 hover:text-white'}`}
        >
          🏷️ Sistem Türleri
          <span className="ml-1.5 text-xs opacity-60">({systemTypes.length})</span>
        </button>
        <button
          onClick={() => setTab('proposals')}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'proposals' ? 'bg-violet-600 text-white' : 'text-gray-400 hover:text-white'}`}
        >
          ✏️ Kullanıcı Önerileri
          {pendingCount > 0 && (
            <span className="ml-1.5 bg-yellow-500 text-black text-xs font-bold px-1.5 py-0.5 rounded-full">{pendingCount}</span>
          )}
        </button>
      </div>

      {/* ── SİSTEM TÜRLERİ ── */}
      {tab === 'system' && (
        <>
          <p className="text-gray-500 text-xs mb-4">
            İkonu olmayan aktivite türleri bu listede görünmez. İkon yüklemek için Düzenle butonunu kullanın.
          </p>
          {systemLoading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left px-4 py-3 text-gray-500 font-medium w-10">Sıra</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium">Tür</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium">Kategori</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium">Durum</th>
                    <th className="text-right px-4 py-3 text-gray-500 font-medium">İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  {systemTypes.map((t, idx) => (
                    <tr key={t.slug} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-0.5">
                          <button onClick={() => moveType(t.slug, -1)} disabled={idx === 0}
                            className="text-gray-600 hover:text-gray-300 disabled:opacity-20 leading-none text-xs">▲</button>
                          <button onClick={() => moveType(t.slug, 1)} disabled={idx === systemTypes.length - 1}
                            className="text-gray-600 hover:text-gray-300 disabled:opacity-20 leading-none text-xs">▼</button>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img src={t.iconUrl} alt={t.label} width={40} height={40}
                            className="object-contain rounded-lg bg-gray-800 p-1 shrink-0" />
                          <div>
                            <p className={`font-medium ${t.active ? 'text-white' : 'text-gray-500 line-through'}`}>
                              {t.customLabel ?? t.label}
                            </p>
                            {t.customLabel && (
                              <p className="text-xs text-gray-600">Orijinal: {t.label}</p>
                            )}
                            {t.description && (
                              <p className="text-xs text-gray-500 mt-0.5 max-w-xs truncate">{t.description}</p>
                            )}
                            <p className="text-xs text-gray-700 font-mono">{t.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-gray-400 bg-gray-800 px-2 py-0.5 rounded-full">
                          {CATEGORY_MAP[t.categoryOverride ?? t.category] ?? t.category}
                        </span>
                        {t.categoryOverride && (
                          <p className="text-xs text-gray-700 mt-0.5">
                            Varsayılan: {CATEGORY_MAP[t.category]}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${t.active ? 'bg-green-500/10 text-green-400' : 'bg-gray-700 text-gray-500'}`}>
                          {t.active ? 'Aktif' : 'Pasif'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => openEdit(t)}
                          className="px-3 py-1.5 rounded-lg bg-violet-600/20 text-violet-300 hover:bg-violet-600/30 text-xs font-medium transition-colors">
                          Düzenle
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* ── KULLANICI ÖNERİLERİ ── */}
      {tab === 'proposals' && (
        <>
          <div className="flex gap-2 mb-6">
            {(['pending', 'approved', 'rejected', 'all'] as ProposalFilter[]).map((f) => (
              <button key={f} onClick={() => setProposalFilter(f)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${proposalFilter === f ? 'bg-violet-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
                {f === 'all' ? 'Tümü' : PROPOSAL_STATUS_LABELS[f]}
                <span className="ml-1 opacity-60">
                  ({f === 'all' ? proposals.length : proposals.filter((i) => i.customTypeStatus === f).length})
                </span>
              </button>
            ))}
          </div>

          {proposalLoading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left px-4 py-3 text-gray-500 font-medium">Önerilen Tür</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium">Tarih</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium">Durum</th>
                    <th className="text-right px-4 py-3 text-gray-500 font-medium">İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProposals.map((item) => (
                    <tr key={item.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {item.iconUrl ? (
                            <img src={item.iconUrl} alt="" width={36} height={36}
                              className="rounded-lg bg-gray-800 p-1 object-contain shrink-0" />
                          ) : (
                            <div className="w-9 h-9 rounded-lg bg-gray-800 border border-dashed border-gray-700 flex items-center justify-center text-gray-600 text-sm shrink-0">?</div>
                          )}
                          <div>
                            <p className="text-white font-semibold">{item.customTypeName}</p>
                            {item.description && (
                              <p className="text-xs text-gray-500 truncate max-w-xs">{item.description}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {item.createdAt ? new Date(item.createdAt).toLocaleDateString('tr-TR') : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${PROPOSAL_STATUS_COLORS[item.customTypeStatus]}`}>
                          {PROPOSAL_STATUS_LABELS[item.customTypeStatus]}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => openPropEdit(item)}
                            className="px-3 py-1.5 rounded-lg bg-violet-600/20 text-violet-300 hover:bg-violet-600/30 text-xs font-medium transition-colors">
                            Düzenle
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredProposals.length === 0 && (
                <p className="text-center text-gray-600 py-12">
                  {proposalFilter === 'pending' ? 'Bekleyen öneri yok.' : 'Kayıt bulunamadı.'}
                </p>
              )}
            </div>
          )}
        </>
      )}

      {/* ── TAM DÜZENLEME MODALI ── */}
      {editTarget && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Modal başlık */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-800">
              <h2 className="text-white font-semibold text-lg">Aktivite Türünü Düzenle</h2>
              <button onClick={closeEdit} className="text-gray-500 hover:text-white text-xl leading-none">✕</button>
            </div>

            <div className="px-6 py-5 space-y-5">
              {/* İkon */}
              <div>
                <label className="block text-gray-400 text-xs font-medium mb-2 uppercase tracking-wide">İkon</label>
                <div className="flex items-center gap-4">
                  <img
                    src={iconPreview ?? editTarget.iconUrl}
                    alt=""
                    width={64}
                    height={64}
                    className="rounded-xl bg-gray-800 p-1.5 object-contain border border-gray-700"
                  />
                  <div>
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      className="px-3 py-1.5 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 text-xs font-medium"
                    >
                      Yeni ikon yükle
                    </button>
                    {iconFile && (
                      <p className="text-xs text-green-400 mt-1">✓ {iconFile.name}</p>
                    )}
                    <p className="text-xs text-gray-600 mt-1">PNG, JPG veya WEBP</p>
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleIconSelect}
                    />
                  </div>
                </div>
                {/* AI üretim */}
                <AIGenerateSection
                  targetId={editTarget.slug}
                  targetType="system"
                  defaultSubject={editTarget.customLabel ?? editTarget.label}
                  onGenerated={(url) => setIconPreview(url)}
                />
              </div>

              {/* İsim */}
              <div>
                <label className="block text-gray-400 text-xs font-medium mb-1.5 uppercase tracking-wide">
                  İsim
                </label>
                <input
                  type="text"
                  value={editLabel}
                  onChange={(e) => setEditLabel(e.target.value)}
                  maxLength={50}
                  placeholder={editTarget.label}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500"
                />
                <p className="text-xs text-gray-600 mt-1">Orijinal: <span className="font-mono">{editTarget.label}</span></p>
              </div>

              {/* Açıklama */}
              <div>
                <label className="block text-gray-400 text-xs font-medium mb-1.5 uppercase tracking-wide">
                  Açıklama
                </label>
                <textarea
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  maxLength={200}
                  rows={3}
                  placeholder="Bu aktivite türü hakkında kısa bir açıklama..."
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500 resize-none"
                />
              </div>

              {/* Kategori */}
              <div>
                <label className="block text-gray-400 text-xs font-medium mb-1.5 uppercase tracking-wide">
                  Kategori
                </label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500"
                >
                  {CATEGORY_OPTIONS.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
                {editCategory !== editTarget.category && (
                  <p className="text-xs text-yellow-500 mt-1">
                    ⚠ Varsayılan: {CATEGORY_MAP[editTarget.category]}
                  </p>
                )}
              </div>

              {/* Aktif / Pasif */}
              <div className="flex items-center justify-between py-3 px-4 bg-gray-800/50 rounded-xl">
                <div>
                  <p className="text-white text-sm font-medium">Aktif</p>
                  <p className="text-gray-500 text-xs">Pasif yapılan türler platformda gösterilmez</p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditActive((v) => !v)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${editActive ? 'bg-green-500' : 'bg-gray-600'}`}
                >
                  <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${editActive ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>

            {/* Alt butonlar */}
            <div className="px-6 pb-6 flex items-center justify-between gap-3 border-t border-gray-800 pt-4">
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 text-sm font-medium transition-colors"
              >
                Sil
              </button>
              <div className="flex gap-2">
                <button
                  onClick={closeEdit}
                  className="px-4 py-2 rounded-lg bg-gray-700 text-gray-300 text-sm hover:bg-gray-600"
                >
                  İptal
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-5 py-2 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 disabled:opacity-50 transition-colors"
                >
                  {saving ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Kullanıcı öneri tam düzenleme modal ── */}
      {propEditTarget && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-800">
              <h2 className="text-white font-semibold text-lg">Öneriyi Düzenle</h2>
              <button onClick={closePropEdit} className="text-gray-500 hover:text-white text-xl leading-none">✕</button>
            </div>

            <div className="px-6 py-5 space-y-5">
              {/* İkon */}
              <div>
                <label className="block text-gray-400 text-xs font-medium mb-2 uppercase tracking-wide">İkon</label>
                <div className="flex items-center gap-4">
                  {propIconPreview || propEditTarget.iconUrl ? (
                    <img
                      src={propIconPreview ?? propEditTarget.iconUrl!}
                      alt=""
                      width={64}
                      height={64}
                      className="rounded-xl bg-gray-800 p-1.5 object-contain border border-gray-700"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-gray-800 border border-dashed border-gray-600 flex items-center justify-center text-gray-600 text-2xl">?</div>
                  )}
                  <div>
                    <button type="button" onClick={() => propFileRef.current?.click()}
                      className="px-3 py-1.5 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 text-xs font-medium">
                      {propEditTarget.iconUrl ? 'İkonu değiştir' : 'İkon yükle'}
                    </button>
                    {propIconFile && <p className="text-xs text-green-400 mt-1">✓ {propIconFile.name}</p>}
                    <p className="text-xs text-gray-600 mt-1">PNG, JPG veya WEBP</p>
                    <input ref={propFileRef} type="file" accept="image/*" className="hidden" onChange={handlePropIconSelect} />
                  </div>
                </div>
                {/* AI üretim */}
                <AIGenerateSection
                  targetId={propEditTarget.id}
                  targetType="proposal"
                  defaultSubject={propEditTarget.customTypeName}
                  onGenerated={(url) => setPropIconPreview(url)}
                />
              </div>

              {/* Tür adı */}
              <div>
                <label className="block text-gray-400 text-xs font-medium mb-1.5 uppercase tracking-wide">Tür Adı</label>
                <input
                  type="text"
                  value={propEditName}
                  onChange={(e) => setPropEditName(e.target.value)}
                  maxLength={50}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500"
                />
              </div>

              {/* Açıklama */}
              <div>
                <label className="block text-gray-400 text-xs font-medium mb-1.5 uppercase tracking-wide">Açıklama</label>
                <textarea
                  value={propEditDesc}
                  onChange={(e) => setPropEditDesc(e.target.value)}
                  maxLength={200}
                  rows={3}
                  placeholder="Bu aktivite türü hakkında kısa bir açıklama..."
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500 resize-none"
                />
              </div>

              {/* Kategori */}
              <div>
                <label className="block text-gray-400 text-xs font-medium mb-1.5 uppercase tracking-wide">Kategori</label>
                <select
                  value={propEditCategory}
                  onChange={(e) => setPropEditCategory(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500"
                >
                  {CATEGORY_OPTIONS.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>

              {/* Durum */}
              <div>
                <label className="block text-gray-400 text-xs font-medium mb-2 uppercase tracking-wide">Karar</label>
                <div className="flex gap-2">
                  {(['pending', 'approved', 'rejected'] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setPropEditStatus(s)}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium border-2 transition-colors ${
                        propEditStatus === s
                          ? s === 'approved' ? 'bg-green-500/20 border-green-500 text-green-300'
                          : s === 'rejected' ? 'bg-red-500/20 border-red-500 text-red-300'
                          : 'bg-yellow-500/20 border-yellow-500 text-yellow-300'
                          : 'bg-transparent border-gray-700 text-gray-500 hover:border-gray-500'
                      }`}
                    >
                      {PROPOSAL_STATUS_LABELS[s]}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Alt butonlar */}
            <div className="px-6 pb-6 border-t border-gray-800 pt-4">
              {propSaveError && (
                <p className="text-red-400 text-xs mb-3 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                  ✗ {propSaveError}
                </p>
              )}
              <div className="flex items-center justify-between gap-3">
                <button
                  onClick={handlePropDelete}
                  className="px-4 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 text-sm font-medium transition-colors"
                >
                  Sil
                </button>
                <div className="flex gap-2">
                  <button onClick={closePropEdit}
                    className="px-4 py-2 rounded-lg bg-gray-700 text-gray-300 text-sm hover:bg-gray-600">
                    İptal
                  </button>
                  <button onClick={savePropEdit} disabled={propSaving}
                    className="px-5 py-2 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 disabled:opacity-50 transition-colors">
                    {propSaving ? 'Kaydediliyor...' : 'Kaydet'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect, useRef } from 'react';

type AdminUser = {
  uid: string; email: string; displayName: string; photoURL: string | null;
  disabled: boolean; createdAt: string; lastSignIn: string;
  onboarded: boolean; city: string; activityTypes: string[]; source: string;
  plan: string; planStartDate: string;
  activitiesOrganized: number; activitiesJoined: number; activitiesTotal: number;
  totalPayment: number;
};

type NewUserForm = { displayName: string; email: string; password: string; city: string };

const PLAN_LABELS: Record<string, string> = {
  free: 'Ücretsiz', active: 'Aktif Sporcu', social: 'Sosyal Sporcu', pro: 'Profesyonel',
};
const PLAN_COLORS: Record<string, string> = {
  free:   'bg-gray-500/10 text-gray-400',
  active: 'bg-violet-500/10 text-violet-400',
  social: 'bg-blue-500/10 text-blue-400',
  pro:    'bg-yellow-500/10 text-yellow-400',
};

function daysSince(iso: string) {
  if (!iso) return '—';
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days === 0) return 'Bugün';
  if (days === 1) return '1 gün';
  if (days < 30) return `${days} gün`;
  if (days < 365) return `${Math.floor(days / 30)} ay`;
  return `${Math.floor(days / 365)} yıl`;
}

export default function UsersPage() {
  const [users,      setUsers]      = useState<AdminUser[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');
  const [working,    setWorking]    = useState<string | null>(null);
  const [showAdd,    setShowAdd]    = useState(false);
  const [importing,  setImporting]  = useState(false);
  const [importMsg,  setImportMsg]  = useState('');
  const [newUser,    setNewUser]    = useState<NewUserForm>({ displayName: '', email: '', password: '', city: '' });
  const [addError,   setAddError]   = useState('');
  const [addLoading, setAddLoading] = useState(false);
  const [resetLink,  setResetLink]  = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const reload = () => {
    setLoading(true);
    fetch('/api/users').then((r) => r.json()).then(setUsers).finally(() => setLoading(false));
  };

  useEffect(() => { reload(); }, []);

  const filtered = users.filter(
    (u) => u.displayName.toLowerCase().includes(search.toLowerCase()) ||
           u.email.toLowerCase().includes(search.toLowerCase()) ||
           u.city.toLowerCase().includes(search.toLowerCase())
  );

  const handleAction = async (uid: string, action: 'ban' | 'unban' | 'delete' | 'reset-password') => {
    if (action !== 'reset-password') {
      const label = action === 'delete' ? 'silmek' : action === 'ban' ? 'banlamak' : 'banı kaldırmak';
      if (!confirm(`Bu kullanıcıyı ${label} istediğinize emin misiniz?`)) return;
    }
    setWorking(uid);
    if (action === 'delete') {
      await fetch(`/api/users/${uid}`, { method: 'DELETE' });
      setUsers((prev) => prev.filter((u) => u.uid !== uid));
    } else if (action === 'reset-password') {
      const res  = await fetch(`/api/users/${uid}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action }) });
      const data = await res.json();
      if (data.link) setResetLink(data.link);
    } else {
      await fetch(`/api/users/${uid}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action }) });
      setUsers((prev) => prev.map((u) => u.uid === uid ? { ...u, disabled: action === 'ban' } : u));
    }
    setWorking(null);
  };

  const handlePlanChange = async (uid: string, plan: string) => {
    await fetch(`/api/users/${uid}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'update-plan', plan }) });
    setUsers((prev) => prev.map((u) => u.uid === uid ? { ...u, plan, planStartDate: new Date().toISOString() } : u));
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddLoading(true); setAddError('');
    const res  = await fetch('/api/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newUser) });
    const data = await res.json();
    if (!res.ok) { setAddError(data.error); setAddLoading(false); return; }
    setShowAdd(false);
    setNewUser({ displayName: '', email: '', password: '', city: '' });
    reload();
    setAddLoading(false);
  };

  const handleCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true); setImportMsg('');
    const text  = await file.text();
    const lines = text.trim().split('\n').slice(1);
    const rows  = lines.map((line) => {
      const [email, displayName, password, city] = line.split(',').map((s) => s.trim().replace(/^"|"$/g, ''));
      return { email, displayName, password, city };
    }).filter((r) => r.email);
    const res  = await fetch('/api/users/import', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ rows }) });
    const data = await res.json();
    setImportMsg(`✓ ${data.success} kullanıcı eklendi${data.failed > 0 ? `, ${data.failed} hatalı` : ''}.`);
    reload();
    setImporting(false);
    if (fileRef.current) fileRef.current.value = '';
  };

  const downloadTemplate = () => {
    const csv  = 'email,displayName,password,city\nornek@email.com,Ad Soyad,Sifre123!,Istanbul';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a'); a.href = url; a.download = 'kullanici_sablonu.csv'; a.click();
  };

  return (
    <div className="p-8">
      {/* Başlık */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-white font-bold text-2xl mb-1">Kullanıcılar</h1>
          <p className="text-gray-500 text-sm">{users.length} toplam kullanıcı</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={downloadTemplate} className="px-3 py-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 text-xs transition-colors">📥 CSV Şablon</button>
          <label className={`px-3 py-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 text-xs transition-colors cursor-pointer ${importing ? 'opacity-50' : ''}`}>
            {importing ? 'Yükleniyor...' : '📂 CSV Import'}
            <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleCSV} disabled={importing} />
          </label>
          <button onClick={() => setShowAdd(true)} className="px-3 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold transition-colors">+ Kullanıcı Ekle</button>
        </div>
      </div>

      {importMsg && <div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm">{importMsg}</div>}

      <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
        placeholder="İsim, e-posta veya şehir ara..."
        className="w-full max-w-sm bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500 mb-6" />

      {/* Şifre reset link modal */}
      {resetLink && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-lg">
            <h2 className="text-white font-bold text-lg mb-2">Şifre Sıfırlama Bağlantısı</h2>
            <p className="text-gray-400 text-sm mb-4">Bu bağlantıyı kullanıcıya gönderin. 1 saat geçerlidir.</p>
            <div className="bg-gray-800 rounded-lg p-3 break-all text-xs text-violet-300 mb-4 select-all">{resetLink}</div>
            <div className="flex gap-2">
              <button onClick={() => { navigator.clipboard.writeText(resetLink); }} className="flex-1 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm">Kopyala</button>
              <button onClick={() => setResetLink(null)} className="flex-1 px-4 py-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 text-sm">Kapat</button>
            </div>
          </div>
        </div>
      )}

      {/* Manuel ekle modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-white font-bold text-lg mb-4">Yeni Kullanıcı Ekle</h2>
            <form onSubmit={handleAddUser} className="space-y-3">
              {addError && <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{addError}</div>}
              {([['displayName','Ad Soyad','text'],['email','E-posta','email'],['password','Şifre','password'],['city','Şehir','text']] as [keyof NewUserForm,string,string][]).map(([field,label,type]) => (
                <div key={field}>
                  <label className="block text-xs text-gray-400 mb-1">{label}</label>
                  <input type={type} required={field !== 'city'} value={newUser[field]}
                    onChange={(e) => setNewUser((p) => ({ ...p, [field]: e.target.value }))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500" />
                </div>
              ))}
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowAdd(false)} className="flex-1 px-4 py-2 rounded-lg bg-gray-800 text-gray-300 text-sm">İptal</button>
                <button type="submit" disabled={addLoading} className="flex-1 px-4 py-2 rounded-lg bg-violet-600 text-white text-sm font-semibold disabled:opacity-50">
                  {addLoading ? 'Ekleniyor...' : 'Ekle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-x-auto">
          <table className="w-full text-sm min-w-[1100px]">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Kullanıcı</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Plan</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Planda</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Aktiviteler</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Toplam Ödeme</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Durum</th>
                <th className="text-right px-4 py-3 text-gray-500 font-medium">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr key={user.uid} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                  {/* Kullanıcı */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center text-violet-400 font-bold text-xs shrink-0">
                        {user.displayName?.[0]?.toUpperCase() ?? '?'}
                      </div>
                      <div>
                        <p className="text-white font-medium">{user.displayName}</p>
                        <p className="text-gray-500 text-xs">{user.email}</p>
                        <p className="text-gray-600 text-xs">{user.city || '—'}</p>
                      </div>
                    </div>
                  </td>

                  {/* Plan — dropdown ile değiştir */}
                  <td className="px-4 py-3">
                    <select
                      value={user.plan}
                      onChange={(e) => handlePlanChange(user.uid, e.target.value)}
                      className={`text-xs px-2 py-1 rounded-full border-0 font-medium focus:outline-none cursor-pointer ${PLAN_COLORS[user.plan] ?? 'bg-gray-700 text-gray-300'}`}
                      style={{ backgroundColor: 'transparent' }}
                    >
                      {Object.entries(PLAN_LABELS).map(([v, l]) => <option key={v} value={v} className="bg-gray-900 text-white">{l}</option>)}
                    </select>
                  </td>

                  {/* Plan süresi */}
                  <td className="px-4 py-3 text-gray-400 text-xs">{daysSince(user.planStartDate)}</td>

                  {/* Aktiviteler */}
                  <td className="px-4 py-3">
                    <div className="space-y-0.5">
                      <p className="text-gray-300 text-xs">
                        <span className="text-white font-semibold">{user.activitiesJoined}</span> katıldı
                      </p>
                      <p className="text-gray-300 text-xs">
                        <span className="text-white font-semibold">{user.activitiesOrganized}</span> organize etti
                      </p>
                    </div>
                  </td>

                  {/* Toplam ödeme */}
                  <td className="px-4 py-3">
                    {user.totalPayment > 0
                      ? <span className="text-green-400 font-semibold">${user.totalPayment}</span>
                      : <span className="text-gray-600 text-xs">Stripe bekliyor</span>
                    }
                  </td>

                  {/* Durum */}
                  <td className="px-4 py-3">
                    {user.disabled
                      ? <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 text-xs font-medium">Banlı</span>
                      : <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 text-xs font-medium">Aktif</span>
                    }
                  </td>

                  {/* İşlemler */}
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5 flex-wrap">
                      <button onClick={() => handleAction(user.uid, 'reset-password')} disabled={working === user.uid || user.source === 'firestore'}
                        title={user.source === 'firestore' ? 'Seed kullanıcısı — Auth hesabı yok' : 'Şifre sıfırlama bağlantısı oluştur'}
                        className="px-2 py-1 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 text-xs disabled:opacity-30 disabled:cursor-not-allowed">
                        🔑 Şifre
                      </button>
                      {user.disabled ? (
                        <button onClick={() => handleAction(user.uid, 'unban')} disabled={working === user.uid}
                          className="px-2 py-1 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 text-xs disabled:opacity-50">
                          Banı Kaldır
                        </button>
                      ) : (
                        <button onClick={() => handleAction(user.uid, 'ban')} disabled={working === user.uid}
                          className="px-2 py-1 rounded-lg bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 text-xs disabled:opacity-50">
                          Banla
                        </button>
                      )}
                      <button onClick={() => handleAction(user.uid, 'delete')} disabled={working === user.uid}
                        className="px-2 py-1 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs disabled:opacity-50">
                        Sil
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <p className="text-center text-gray-600 py-12">Kullanıcı bulunamadı.</p>}
        </div>
      )}
    </div>
  );
}

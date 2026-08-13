'use client';

import { useState, useEffect } from 'react';
import { apiPath } from '@/lib/apiPath';

type AdminActivity = {
  id: string; title: string; activityType: string; organizerName: string;
  startTime: string; status: string; currentParticipants: number;
  maxParticipants: number; location: { address: string; city: string };
};

const STATUS_LABELS: Record<string, string> = {
  scheduled: 'Planlandı', ongoing: 'Devam Ediyor',
  completed: 'Tamamlandı', cancelled: 'İptal', archived: 'Arşiv',
};
const STATUS_COLORS: Record<string, string> = {
  scheduled: 'bg-blue-500/10 text-blue-400',
  ongoing:   'bg-green-500/10 text-green-400',
  completed: 'bg-gray-500/10 text-gray-400',
  cancelled: 'bg-red-500/10 text-red-400',
  archived:  'bg-yellow-500/10 text-yellow-400',
};

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<AdminActivity[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');
  const [filter,     setFilter]     = useState('all');

  useEffect(() => {
    fetch(apiPath('/api/activities')).then((r) => r.json()).then(setActivities).finally(() => setLoading(false));
  }, []);

  const filtered = activities.filter((a) => {
    const matchSearch = a.title.toLowerCase().includes(search.toLowerCase()) ||
                        a.organizerName.toLowerCase().includes(search.toLowerCase()) ||
                        a.location.address.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || a.status === filter;
    return matchSearch && matchFilter;
  });

  const handleCancel = async (id: string) => {
    if (!confirm('Bu aktiviteyi iptal etmek istediğinize emin misiniz?')) return;
    await fetch(apiPath(`/api/activities/${id}`), { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'cancel' }) });
    setActivities((prev) => prev.map((a) => a.id === id ? { ...a, status: 'cancelled' } : a));
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu aktiviteyi kalıcı olarak silmek istediğinize emin misiniz?')) return;
    await fetch(apiPath(`/api/activities/${id}`), { method: 'DELETE' });
    setActivities((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-white font-bold text-2xl mb-1">Aktiviteler</h1>
          <p className="text-gray-500 text-sm">{activities.length} toplam aktivite</p>
        </div>
      </div>

      <div className="flex gap-3 mb-6 flex-wrap">
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Başlık, organizatör veya konum ara..."
          className="flex-1 min-w-[200px] bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500" />
        <select value={filter} onChange={(e) => setFilter(e.target.value)}
          className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500">
          <option value="all">Tüm Durumlar</option>
          {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Aktivite</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Şehir</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Organizatör</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Tarih</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Katılım</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Durum</th>
                <th className="text-right px-4 py-3 text-gray-500 font-medium">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-white font-medium">{a.title}</p>
                    <p className="text-gray-500 text-xs">{a.activityType} · {a.location.address || a.location.city}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{a.location.city}</td>
                  <td className="px-4 py-3 text-gray-400">{a.organizerName}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {a.startTime ? new Date(a.startTime).toLocaleDateString('tr-TR') : '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-400">
                    <span className={a.currentParticipants >= a.maxParticipants ? 'text-red-400' : 'text-green-400'}>
                      {a.currentParticipants}
                    </span>/{a.maxParticipants}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[a.status] ?? 'bg-gray-700 text-gray-300'}`}>
                      {STATUS_LABELS[a.status] ?? a.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      {a.status === 'scheduled' && (
                        <button onClick={() => handleCancel(a.id)}
                          className="px-2 py-1 rounded-lg bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 text-xs">
                          İptal Et
                        </button>
                      )}
                      <button onClick={() => handleDelete(a.id)}
                        className="px-2 py-1 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs">
                        Sil
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <p className="text-center text-gray-600 py-12">Aktivite bulunamadı.</p>
          )}
        </div>
      )}
    </div>
  );
}

import { adminDb, adminAuth } from '@/lib/firebase-admin';

async function getStats() {
  const [usersResult, activitiesSnap, firestoreUsersSnap] = await Promise.all([
    adminAuth.listUsers(1000),
    adminDb.collection('activities').get(),
    adminDb.collection('users').get(),
  ]);

  const authTotal    = usersResult.users.length;
  const fsTotal      = firestoreUsersSnap.size;
  const totalUsers   = Math.max(authTotal, fsTotal);
  const banned       = usersResult.users.filter((u) => u.disabled).length;
  const activities   = activitiesSnap.size;

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const newThisWeek = usersResult.users.filter(
    (u) => new Date(u.metadata.creationTime) > weekAgo
  ).length;

  // Spor bazlı aktivite sayısı ve katılımcı toplamı
  const sportCount:        Record<string, number> = {};
  const sportParticipants: Record<string, number> = {};

  activitiesSnap.docs.forEach((doc) => {
    const d     = doc.data();
    const sport = d.activityType ?? 'diger';
    sportCount[sport]        = (sportCount[sport]        ?? 0) + 1;
    sportParticipants[sport] = (sportParticipants[sport] ?? 0) + (d.currentParticipants ?? 0);
  });

  const topByActivity     = Object.entries(sportCount).sort((a, b) => b[1] - a[1]).slice(0, 10);
  const topByParticipants = Object.entries(sportParticipants).sort((a, b) => b[1] - a[1]).slice(0, 10);

  return { totalUsers, banned, activities, newThisWeek, topByActivity, topByParticipants };
}

export default async function DashboardPage() {
  const stats = await getStats();

  return (
    <div className="p-8">
      <h1 className="text-white font-bold text-2xl mb-1">Dashboard</h1>
      <p className="text-gray-500 text-sm mb-8">Platform genel durumu</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard label="Toplam Kullanıcı"  value={stats.totalUsers}   icon="👥" color="violet" />
        <StatCard label="Bu Hafta Yeni"     value={stats.newThisWeek}  icon="📈" color="green"  />
        <StatCard label="Toplam Aktivite"   value={stats.activities}   icon="🏃" color="blue"   />
        <StatCard label="Banlı Kullanıcı"   value={stats.banned}       icon="🚫" color="red"    />
      </div>

      {(stats.topByActivity.length > 0 || stats.topByParticipants.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Aktivite sayısına göre */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-white font-semibold mb-1">En Popüler Aktiviteler</h2>
            <p className="text-gray-500 text-xs mb-4">Aktivite türüne göre oluşturulan aktivite sayısı</p>
            <div className="space-y-3">
              {stats.topByActivity.map(([sport, count]) => (
                <div key={sport} className="flex items-center gap-3">
                  <span className="text-gray-400 text-sm w-28 capitalize">{sport}</span>
                  <div className="flex-1 bg-gray-800 rounded-full h-2">
                    <div className="bg-violet-500 h-2 rounded-full"
                      style={{ width: `${Math.round((count / stats.activities) * 100)}%` }} />
                  </div>
                  <span className="text-gray-400 text-sm w-20 text-right">{count} aktivite</span>
                </div>
              ))}
            </div>
          </div>

          {/* Katılımcı sayısına göre */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-white font-semibold mb-1">En Fazla Katılımcı</h2>
            <p className="text-gray-500 text-xs mb-4">Aktivite türüne göre toplam katılımcı sayısı</p>
            <div className="space-y-3">
              {stats.topByParticipants.map(([sport, count]) => {
                const maxCount = stats.topByParticipants[0][1];
                return (
                  <div key={sport} className="flex items-center gap-3">
                    <span className="text-gray-400 text-sm w-28 capitalize">{sport}</span>
                    <div className="flex-1 bg-gray-800 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${Math.round((count / maxCount) * 100)}%` }} />
                    </div>
                    <span className="text-gray-400 text-sm w-24 text-right">{count} katılımcı</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon, color }: {
  label: string; value: number; icon: string; color: string;
}) {
  const colors: Record<string, string> = {
    violet: 'bg-violet-500/10 border-violet-500/20 text-violet-400',
    green:  'bg-green-500/10  border-green-500/20  text-green-400',
    blue:   'bg-blue-500/10   border-blue-500/20   text-blue-400',
    red:    'bg-red-500/10    border-red-500/20    text-red-400',
  };
  return (
    <div className={`rounded-2xl border p-5 ${colors[color]}`}>
      <p className="text-2xl mb-3">{icon}</p>
      <p className="text-3xl font-bold text-white mb-1">{value}</p>
      <p className="text-xs opacity-70">{label}</p>
    </div>
  );
}

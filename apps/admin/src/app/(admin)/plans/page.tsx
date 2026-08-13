export default function PlansPage() {
  const plans = [
    { name: 'Ücretsiz',        price: 0,   currency: 'USD', features: ['3 aktivite/ay', 'Temel keşif', 'Topluluk erişimi'],           users: 0, color: 'gray'   },
    { name: 'Aktif Sporcu',    price: 11,  currency: 'USD', features: ['Sınırsız aktivite', 'Harita görünümü', 'Öncelikli destek'],   users: 0, color: 'violet' },
    { name: 'Sosyal Sporcu',   price: 22,  currency: 'USD', features: ['Tüm özellikler', 'Grup yönetimi', 'İstatistikler'],           users: 0, color: 'blue'   },
    { name: 'Profesyonel',     price: 0,   currency: 'USD', features: ['Özel fiyatlandırma', 'API erişimi', 'Dedike destek'],          users: 0, color: 'gold'   },
  ];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-white font-bold text-2xl mb-1">Planlar</h1>
          <p className="text-gray-500 text-sm">Fiyatlandırma ve abonelik yönetimi</p>
        </div>
        <div className="px-3 py-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs">
          Stripe entegrasyonu Sprint 6&apos;da eklenecek
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {plans.map((plan) => {
          const borderColor = {
            gray: 'border-gray-700', violet: 'border-violet-500/30',
            blue: 'border-blue-500/30', gold: 'border-yellow-500/30',
          }[plan.color];
          const badgeColor = {
            gray: 'text-gray-400', violet: 'text-violet-400',
            blue: 'text-blue-400', gold: 'text-yellow-400',
          }[plan.color];

          return (
            <div key={plan.name} className={`bg-gray-900 border ${borderColor} rounded-2xl p-5`}>
              <p className={`font-bold text-lg mb-1 ${badgeColor}`}>{plan.name}</p>
              <p className="text-white text-2xl font-bold mb-4">
                {plan.price === 0 ? (plan.name === 'Profesyonel' ? 'Özel' : 'Ücretsiz') : `$${plan.price}/ay`}
              </p>
              <ul className="space-y-2 mb-4">
                {plan.features.map((f) => (
                  <li key={f} className="text-gray-400 text-sm flex items-center gap-2">
                    <span className="text-green-400 text-xs">✓</span> {f}
                  </li>
                ))}
              </ul>
              <div className="pt-3 border-t border-gray-800">
                <p className="text-gray-500 text-xs">Aktif kullanıcı</p>
                <p className="text-white font-bold text-xl">{plan.users}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <h2 className="text-white font-semibold mb-2">Stripe Entegrasyonu</h2>
        <p className="text-gray-500 text-sm mb-4">
          Gerçek abonelik yönetimi, otomatik fatura ve plan geçişleri Stripe ile Sprint 6&apos;da entegre edilecek.
        </p>
        <div className="flex gap-3 flex-wrap">
          {['Abonelik Yönetimi', 'Otomatik Fatura', 'Plan Yükseltme/Düşürme', 'İptal & Geri Ödeme'].map((f) => (
            <span key={f} className="px-3 py-1 rounded-full bg-gray-800 text-gray-400 text-xs">{f}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
